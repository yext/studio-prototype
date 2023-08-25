import { ConfigEnv, Plugin } from "vite";
import { simpleGit } from "simple-git";
import getStudioConfig from "./parsers/getStudioConfig";
import ParsingOrchestrator, {
  createTsMorphProject,
} from "./ParsingOrchestrator";
import FileSystemManager from "./FileSystemManager";
import { FileSystemWriter } from "./writers/FileSystemWriter";
import { CliArgs, UserPaths } from "./types";
import createConfigureStudioServer from "./configureStudioServer";
import GitWrapper from "./git/GitWrapper";
import VirtualModuleID from "./VirtualModuleID";
import { readdirSync, existsSync, lstatSync } from "fs";
import upath from "upath";
import lodash from "lodash";
import { STUDIO_PROCESS_ARGS_OBJ } from "./constants";
import LocalDataMappingManager from "./LocalDataMappingManager";
import getStudioViteOptions from "./viteconfig/getStudioViteOptions";
import { createDevServer } from "@yext/pages";
import ManagementApiService from "./http/ManagementApiService";

/**
 * Handles server-client communication.
 *
 * This includes providing a vite virtual module so that server side data can be passed to the front end
 * for the initial load, and messaging using the vite HMR API.
 */
export default async function createStudioPlugin(
  args: ConfigEnv
): Promise<Plugin> {
  const cliArgs: CliArgs = JSON.parse(
    process.env[STUDIO_PROCESS_ARGS_OBJ] as string
  );
  const pathToUserProjectRoot = getProjectRoot(cliArgs);
  const studioConfig = await getStudioConfig(pathToUserProjectRoot, cliArgs);
  const shouldSpawnPagesDevServer =
    !process.env.YEXT_CBD_BRANCH && studioConfig.isPagesJSRepo;
  const pagesDevPortPromise =
    shouldSpawnPagesDevServer && createDevServer(false, false, 5173);

  const gitWrapper = new GitWrapper(
    simpleGit({
      baseDir: pathToUserProjectRoot,
      config: [
        'user.name="Yext Studio"',
        'user.email="studio-placeholder@yext.com"',
      ],
    })
  );
  await gitWrapper.setup();

  /** The ts-morph Project instance for the entire app. */
  const tsMorphProject = createTsMorphProject();
  const localDataMappingManager = studioConfig.isPagesJSRepo
    ? new LocalDataMappingManager(studioConfig.paths.localData)
    : undefined;
  // TODO: Remove false-gate and pass real API key once we get it
  const managementApiService =
    false && studioConfig.isPagesJSRepo
      ? new ManagementApiService("apiKey")
      : undefined;
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    studioConfig,
    localDataMappingManager?.getMapping
  );
  const fileSystemManager = new FileSystemManager(
    studioConfig.paths,
    new FileSystemWriter(orchestrator, tsMorphProject)
  );

  await pagesDevPortPromise;
  return {
    name: "yext-studio-vite-plugin",
    buildStart() {
      const watchDir = (dirPath: string) => {
        if (existsSync(dirPath)) {
          readdirSync(dirPath).forEach((filename) => {
            const filepath = upath.join(dirPath, filename);
            if (lstatSync(filepath).isDirectory()) {
              watchDir(filepath);
            } else {
              this.addWatchFile(filepath);
            }
          });
        }
      };
      const watchUserFiles = (userPaths: UserPaths) => {
        watchDir(userPaths.pages);
        watchDir(userPaths.components);
        watchDir(userPaths.modules);
        this.addWatchFile(userPaths.siteSettings);
      };
      watchUserFiles(studioConfig.paths);
    },
    config(config) {
      const studioViteOptions = getStudioViteOptions(
        args,
        studioConfig,
        pathToUserProjectRoot,
        orchestrator.getStudioData().isWithinCBD
      );
      return lodash.merge({}, config, studioViteOptions);
    },
    resolveId(id) {
      if (id === VirtualModuleID.StudioData || id === VirtualModuleID.GitData) {
        return "\0" + id;
      }
    },
    load(id) {
      if (id === "\0" + VirtualModuleID.StudioData) {
        return `export default ${JSON.stringify(orchestrator.getStudioData())}`;
      } else if (id === "\0" + VirtualModuleID.GitData) {
        return `export default ${JSON.stringify(gitWrapper.getStoredData())}`;
      }
    },
    configureServer: createConfigureStudioServer(
      fileSystemManager,
      gitWrapper,
      orchestrator,
      localDataMappingManager,
      pathToUserProjectRoot,
      studioConfig.paths,
      managementApiService
    ),
  };
}

function getProjectRoot(cliArgs: CliArgs) {
  if (!cliArgs.root) {
    return upath.normalize(process.cwd());
  } else if (upath.isAbsolute(cliArgs.root)) {
    return upath.normalize(cliArgs.root);
  }
  return upath.join(process.cwd(), cliArgs.root);
}
