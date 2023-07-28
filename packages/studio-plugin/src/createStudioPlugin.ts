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
import HmrManager from "./HmrManager";
import getLocalDataMapping from "./parsers/getLocalDataMapping";
import { readdirSync, existsSync, lstatSync } from "fs";
import upath from "upath";
import lodash from "lodash";
import { UserConfig } from "vite";
import { STUDIO_PROCESS_ARGS_OBJ } from "./constants";

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
  const localDataMapping = studioConfig.isPagesJSRepo
    ? await getLocalDataMapping(studioConfig.paths.localData)
    : undefined;
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    studioConfig,
    localDataMapping
  );
  const hmrManager = new HmrManager(
    orchestrator,
    pathToUserProjectRoot,
    studioConfig.paths
  );

  const fileSystemManager = new FileSystemManager(
    studioConfig.paths,
    new FileSystemWriter(orchestrator, tsMorphProject)
  );

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
      const serverConfig: UserConfig = {
        server: {
          port: studioConfig.port,
          open:
            args.mode === "development" &&
            args.command === "serve" &&
            studioConfig.openBrowser,
        },
      };
      return lodash.merge({}, config, serverConfig);
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
      orchestrator
    ),
    handleHotUpdate: (ctx) => hmrManager.handleHotUpdate(ctx),
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
