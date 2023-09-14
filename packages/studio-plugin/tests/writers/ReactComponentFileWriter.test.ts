import {
  StandardComponentState,
  ComponentStateKind,
} from "../../src/types/ComponentState";
import { getComponentPath, getPagePath } from "../__utils__/getFixturePath";
import fs from "fs";
import { Project } from "ts-morph";
import {
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import ReactComponentFileWriter from "../../src/writers/ReactComponentFileWriter";
import { addFilesToProject } from "../__utils__/addFilesToProject";
import { PropValueKind, PropValueType } from "../../src/types";
import StudioSourceFileWriter from "../../src/writers/StudioSourceFileWriter";
import StudioSourceFileParser from "../../src/parsers/StudioSourceFileParser";
import { createTestProject } from "../__utils__/createTestSourceFile";

function createReactComponentFileWriter(
  tsMorphProject: Project,
  filepath: string,
  componentName: string
): ReactComponentFileWriter {
  const sourceFileWriter = new StudioSourceFileWriter(filepath, tsMorphProject);
  const sourceFileParser = new StudioSourceFileParser(filepath, tsMorphProject);
  return new ReactComponentFileWriter(
    componentName,
    sourceFileWriter,
    sourceFileParser
  );
}

jest.mock("uuid");

describe("updateFile", () => {
  let tsMorphProject: Project;
  beforeEach(() => {
    jest.spyOn(fs, "writeFileSync").mockImplementation();
    tsMorphProject = createTestProject();
  });

  describe("React component return statement", () => {
    it("adds top-level sibling component", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const filepath = getPagePath("updatePageFile/PageWithAComponent");
      const commonComplexBannerState: Omit<StandardComponentState, "uuid"> = {
        kind: ComponentStateKind.Standard,
        componentName: "ComplexBanner",
        props: {},
        metadataUUID: "mock-metadata-uuid",
      };
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          { ...commonComplexBannerState, uuid: "mock-uuid-0" },
          { ...commonComplexBannerState, uuid: "mock-uuid-1" },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithSiblingComponents"),
          "utf-8"
        )
      );
    });

    it("nests component with new sibling and children components", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("ComplexBanner"),
        getComponentPath("NestedBanner"),
      ]);

      const filepath = getPagePath("updatePageFile/PageWithAComponent");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: nestedBannerComponentTree,
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithAComponent.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithNestedComponents"),
          "utf-8"
        )
      );
    });

    it("can write object props", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("BannerUsingObject"),
      ]);

      const filepath = getPagePath("updatePageFile/PageWithObjectProp");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "BannerUsingObject",
            props: {
              objProp: {
                kind: PropValueKind.Literal,
                valueType: PropValueType.Object,
                value: {
                  title: {
                    kind: PropValueKind.Literal,
                    valueType: PropValueType.string,
                    value: 'double quote -> " ',
                  },
                  subtitle: {
                    kind: PropValueKind.Literal,
                    valueType: PropValueType.string,
                    value: "the subtitle",
                  },
                  templateString: {
                    kind: PropValueKind.Expression,
                    valueType: PropValueType.string,
                    value: "`Hello ${document.world}`",
                  },
                  expression: {
                    kind: PropValueKind.Expression,
                    valueType: PropValueType.string,
                    value: "document.name",
                  },
                },
              },
            },
            uuid: "mock-uuid-0",
            metadataUUID: getComponentPath("BannerUsingObject"),
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithObjectProp.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithObjectProp"),
          "utf-8"
        )
      );
    });

    it("can write array props", () => {
      addFilesToProject(tsMorphProject, [
        getComponentPath("BannerUsingArrays"),
      ]);

      const filepath = getPagePath("updatePageFile/PageWithArrayProps");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "BannerUsingArrays",
            props: {
              arrProp: {
                kind: PropValueKind.Expression,
                valueType: PropValueType.Array,
                value: "document.services",
              },
              typeArr: {
                kind: PropValueKind.Literal,
                valueType: PropValueType.Array,
                value: [
                  {
                    kind: PropValueKind.Literal,
                    valueType: PropValueType.number,
                    value: 1,
                  },
                  {
                    kind: PropValueKind.Expression,
                    valueType: PropValueType.number,
                    value: "document.num",
                  },
                ],
              },
              optionalArr: {
                kind: PropValueKind.Expression,
                valueType: PropValueType.Array,
                value: "",
              },
            },
            uuid: "mock-uuid-0",
            metadataUUID: getComponentPath("BannerUsingArrays"),
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithArrayProps.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithArrayProps"),
          "utf-8"
        )
      );
    });

    it("remove components that are not part of the new component tree", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("ComplexBanner")]);
      const filepath = getPagePath("updatePageFile/PageWithNestedComponents");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "ComplexBanner",
            props: {},
            uuid: "mock-uuid-0",
            metadataUUID: "mock-metadata-uuid",
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithNestedComponents.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithAComponent"),
          "utf-8"
        )
      );
    });
  });

  describe("imports", () => {
    it("adds css imports", () => {
      const filepath = getPagePath("updatePageFile/EmptyPage");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [fragmentComponent],
        cssImports: ["../index.css", "./App.css"],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithCssImports"),
          "utf-8"
        )
      );
    });

    it("adds missing imports", () => {
      addFilesToProject(tsMorphProject, [getComponentPath("SimpleBanner")]);
      const filepath = getPagePath("updatePageFile/EmptyPage");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [
          fragmentComponent,
          {
            kind: ComponentStateKind.Standard,
            componentName: "SimpleBanner",
            props: {},
            uuid: "mock-uuid-1",
            parentUUID: "mock-uuid-0",
            metadataUUID: "mock-standard-metadata-uuid",
          },
        ],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyPage.tsx"),
        fs.readFileSync(
          getPagePath("updatePageFile/PageWithComponentImports"),
          "utf-8"
        )
      );
    });

    it("removes unused imports", () => {
      const filepath = getPagePath("updatePageFile/PageWithUnusedImports");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        "IndexPage"
      ).updateFile({
        componentTree: [fragmentComponent],
        cssImports: [],
      });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("PageWithUnusedImports.tsx"),
        fs.readFileSync(getPagePath("updatePageFile/EmptyPage"), "utf-8")
      );
    });
  });

  describe("reactComponentNameSanitizer", () => {
    function testComponentNameSanitation(
      inputName: string,
      outputName: string
    ) {
      const filepath = getPagePath("updatePageFile/EmptyFile");
      createReactComponentFileWriter(
        tsMorphProject,
        filepath,
        inputName
      ).updateFile({ componentTree: [] });
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining("EmptyFile"),
        expect.stringContaining(`export default function ${outputName}() {}`)
      );
    }

    it("removes all special characters in name", () => {
      const inputName = "~'!@#%^&*()+={}[]|\\/:;\"`<>,.?- \t\r\n\f";
      const outputName = "PageDefaultFromInvalidInput";
      testComponentNameSanitation(inputName, outputName);
    });

    it("removes all leading digits in name and uppercases first letter", () => {
      const inputName = "0123456789te9st";
      const outputName = "Te9St";
      testComponentNameSanitation(inputName, outputName);
    });

    it("removes all leading non-letter unicode chars and uppercases first letter", () => {
      const inputName = "àÀصʱapple";
      const outputName = "Apple";
      testComponentNameSanitation(inputName, outputName);
    });
  });
});
