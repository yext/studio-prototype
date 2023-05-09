import ParsingOrchestrator, {
  createTsMorphProject,
} from "../src/ParsingOrchestrator";
import getUserPaths from "../src/parsers/getUserPaths";
import path from "path";
import {
  ComponentStateKind,
  FileMetadataKind,
  PageState,
  PluginConfig,
  StudioData,
  UserPaths,
} from "../src/types";
import { Project } from "ts-morph";
import sampleComponentPluginConfig from "./__fixtures__/PluginConfig/SampleComponent";
import fs from "fs";
import getLocalDataMapping from "../src/parsers/getLocalDataMapping";
import prettyPrintError from "../src/errors/prettyPrintError";

jest.mock("../src/errors/prettyPrintError");

const mockGetPathToModuleResponse = path.join(
  process.cwd(),
  "tests/__fixtures__/PluginConfig"
);
const mockGetPathToModule = jest
  .fn()
  .mockReturnValue(mockGetPathToModuleResponse);
jest.mock("../src/parsers/helpers/NpmLookup", () => {
  return jest.fn().mockImplementation(() => {
    return { getRootPath: mockGetPathToModule };
  });
});

const projectRoot = path.resolve(
  __dirname,
  "./__fixtures__/ParsingOrchestrator"
);
const userPaths = getUserPaths(projectRoot);

const basicPageState: PageState = {
  componentTree: [
    expect.objectContaining({
      componentName: "div",
      kind: ComponentStateKind.BuiltIn,
    }),
    expect.objectContaining({
      componentName: "Card",
      kind: ComponentStateKind.Standard,
    }),
    expect.objectContaining({
      componentName: "Card",
      kind: ComponentStateKind.Standard,
    }),
  ],
  filepath: expect.anything(),
  cssImports: [],
};

const pageWithModulesState: PageState = {
  componentTree: [
    expect.objectContaining({
      componentName: "NestedBanner",
      kind: ComponentStateKind.Standard,
    }),
    expect.objectContaining({
      componentName: "NestedModule",
      kind: ComponentStateKind.Module,
    }),
  ],
  filepath: expect.anything(),
  cssImports: [],
};

describe("aggregates data as expected", () => {
  const orchestrator = createParsingOrchestrator();
  let studioData: StudioData;

  beforeAll(() => {
    studioData = orchestrator.getStudioData();
  });

  it("UUIDToFileMetadata", () => {
    const fileMetadataArray = Object.values(studioData.UUIDToFileMetadata);
    expect(fileMetadataArray).toHaveLength(4);
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/Card.tsx"),
        kind: FileMetadataKind.Component,
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/NestedBanner.tsx"),
        kind: FileMetadataKind.Component,
        acceptsChildren: true,
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("modules/BannerWithCard.tsx"),
        kind: FileMetadataKind.Module,
        componentTree: [
          expect.objectContaining({ componentName: "NestedBanner" }),
          expect.objectContaining({ componentName: "Card" }),
        ],
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("modules/a/b/NestedModule.tsx"),
        kind: FileMetadataKind.Module,
        componentTree: [
          expect.objectContaining({ kind: ComponentStateKind.Fragment }),
          expect.objectContaining({ componentName: "BannerWithCard" }),
          expect.objectContaining({ componentName: "BannerWithCard" }),
        ],
      })
    );
  });

  it("pageNameToPageState", () => {
    expect(studioData.pageNameToPageState).toEqual({
      basicPage: basicPageState,
      pageWithModules: pageWithModulesState,
    });
  });

  it("siteSettings", () => {
    expect(studioData.siteSettings).toEqual({
      shape: expect.anything(),
      values: expect.anything(),
    });
  });

  describe("localDataMapping", () => {
    it("aggregates pageNameToPageState as expected when receives a localDataMapping", async () => {
      const localDataMapping = await getLocalDataMapping(userPaths.localData);
      const orchestrator = createParsingOrchestrator({
        localDataMapping,
        isPagesJS: true,
      });
      const studioData = orchestrator.getStudioData();
      expect(studioData.pageNameToPageState).toEqual({
        basicPage: {
          ...basicPageState,
          pagesJS: { entityFiles: ["basicpage-stream.json"] },
        },
        pageWithModules: pageWithModulesState,
      });
    });
  });
});

describe("includes plugins in aggregate data as expected", () => {
  const orchestrator = createParsingOrchestrator({
    plugins: [sampleComponentPluginConfig],
  });
  let studioData: StudioData;

  beforeAll(() => {
    studioData = orchestrator.getStudioData();
  });

  it("properly installs @yext/sample-component plugin.", () => {
    const fileMetadataArray = Object.values(studioData.UUIDToFileMetadata);
    expect(fileMetadataArray).toHaveLength(7);
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/AceComponent.tsx"),
        kind: FileMetadataKind.Component,
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/BevComponent.tsx"),
        kind: FileMetadataKind.Component,
      })
    );
    expect(fileMetadataArray).toContainEqual(
      expect.objectContaining({
        filepath: expect.stringContaining("components/ChazComponent.tsx"),
        kind: FileMetadataKind.Component,
      })
    );
  });
});

it("throws an error when the page imports components from unexpected folders", () => {
  const userPaths = getUserPaths("thisFolderDoesNotExist");
  userPaths.pages = path.resolve(
    __dirname,
    "./__fixtures__/ParsingOrchestrator/src/pages"
  );
  createParsingOrchestrator({ paths: userPaths }).getStudioData();
  expect(prettyPrintError).toHaveBeenCalledTimes(2);
  expect(prettyPrintError).toHaveBeenCalledWith(
    expect.stringMatching(/^Failed to get PageState/),
    expect.stringMatching(/^Error: Could not get FileMetadata for/)
  );
});

it("throws when the pages folder does not exist", () => {
  const userPaths = getUserPaths(
    path.resolve(__dirname, "./__fixtures__/ParsingOrchestrator")
  );
  userPaths.pages = "thisFolderDoesNotExist";
  expect(() => createParsingOrchestrator({ paths: userPaths })).toThrow(
    /^The pages directory does not exist/
  );
});

describe("reloadFile", () => {
  const userPaths = getUserPaths(
    path.resolve(__dirname, "./__fixtures__/ParsingOrchestrator.reloadFile")
  );
  const modulePath = path.join(userPaths.modules, "BannerModule.tsx");
  const originalFile = fs.readFileSync(modulePath, "utf-8");
  const orchestrator = createParsingOrchestrator({ paths: userPaths });

  afterEach(() => {
    fs.writeFileSync(modulePath, originalFile);
  });

  it("reloadFile can reload a module file", () => {
    const updatedModuleFile = `
    import Banner from "../components/Banner";

    export default function NestedModule() {
      return (
        <Banner />
      );
    }
  `;
    const originalTree = orchestrator
      .getModuleFile(modulePath)
      .getModuleMetadata().componentTree;
    expect(originalTree).toEqual([
      expect.objectContaining({
        kind: ComponentStateKind.Fragment,
      }),
      expect.objectContaining({
        componentName: "Banner",
      }),
      expect.objectContaining({
        componentName: "Banner",
      }),
    ]);

    fs.writeFileSync(modulePath, updatedModuleFile);
    orchestrator.reloadFile(modulePath);
    const updatedTree = orchestrator
      .getModuleFile(modulePath)
      .getModuleMetadata().componentTree;
    expect(updatedTree).toEqual([
      expect.objectContaining({
        componentName: "Banner",
      }),
    ]);
  });
});

function createParsingOrchestrator(opts?: {
  localDataMapping?: Record<string, string[]>;
  plugins?: Required<PluginConfig>[];
  paths?: UserPaths;
  isPagesJS?: boolean;
}) {
  const { localDataMapping, plugins, paths, isPagesJS } = opts ?? {};
  const tsMorphProject: Project = createTsMorphProject();
  const orchestrator = new ParsingOrchestrator(
    tsMorphProject,
    {
      paths: paths ?? userPaths,
      plugins: plugins ?? [],
      isPagesJSRepo: isPagesJS ?? false,
    },
    localDataMapping
  );
  return orchestrator;
}
