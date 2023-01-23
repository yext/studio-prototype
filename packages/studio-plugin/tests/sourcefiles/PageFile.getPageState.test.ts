import PageFile from "../../src/sourcefiles/PageFile";
import { ComponentStateKind } from "../../src/types/State";
import { PropValueType } from "../../src/types/PropValues";
import { getPagePath } from "../__utils__/getFixturePath";
import { FileMetadata, FileMetadataKind, PropShape } from "../../src";
import {
  componentTree,
  fragmentComponent,
  nestedBannerComponentTree,
} from "../__fixtures__/componentStates";
import { createTsMorphProject } from "../../src/ParsingOrchestrator";
import { mockUUID } from "../__utils__/spies";

jest.mock("uuid");

function mockGetFileMetadata(filepath: string): FileMetadata {
  let propShape: PropShape = {};
  if (filepath?.includes("ComplexBanner")) {
    propShape = {
      title: { type: PropValueType.string, doc: "jsdoc" },
      num: { type: PropValueType.number },
      bool: { type: PropValueType.boolean },
      bgColor: { type: PropValueType.HexColor },
    };
  } else if (filepath?.includes("NestedBanner")) {
    propShape = {};
  }

  return {
    kind: FileMetadataKind.Component,
    metadataUUID: filepath,
    propShape,
    filepath,
  };
}

const mockGetFileMetadataByUUID = mockGetFileMetadata;

function createPageFile(pageName: string): PageFile {
  return new PageFile(
    getPagePath(pageName),
    mockGetFileMetadata,
    mockGetFileMetadataByUUID,
    createTsMorphProject()
  );
}

describe("getPageState", () => {
  beforeEach(() => {
    mockUUID();
  });

  it("correctly parses page with top-level React.Fragment", async () => {
    const pageFile = createPageFile("reactFragmentPage");
    const result = await pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level Fragment", async () => {
    const pageFile = createPageFile("fragmentPage");
    const result = await pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level Fragment in short syntax", async () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = await pageFile.getPageState();

    expect(result.componentTree).toEqual([fragmentComponent, ...componentTree]);
  });

  it("correctly parses page with top-level div component and logs warning", async () => {
    const consoleWarnSpy = jest
      .spyOn(global.console, "warn")
      .mockImplementation();
    const pageFile = createPageFile("divPage");
    const result = await pageFile.getPageState();

    expect(result.componentTree).toEqual([
      {
        kind: ComponentStateKind.BuiltIn,
        componentName: "div",
        props: {},
        uuid: "mock-uuid-0",
      },
      ...componentTree,
    ]);

    expect(consoleWarnSpy).toBeCalledWith(
      "Props for builtIn element: 'div' are currently not supported."
    );
  });

  it("correctly parses page with nested banner components", async () => {
    const pageFile = createPageFile("nestedBannerPage");
    const result = await pageFile.getPageState();

    expect(result.componentTree).toEqual(nestedBannerComponentTree);
  });

  it("correctly parses page with variable statement and no parentheses around return statement", async () => {
    const pageFile = createPageFile("noReturnParenthesesPage");
    const result = await pageFile.getPageState();

    expect(result.componentTree).toEqual([
      fragmentComponent,
      {
        ...componentTree[1],
        uuid: "mock-uuid-1",
      },
    ]);
  });

  it("correctly parses CSS imports", async () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = await pageFile.getPageState();

    expect(result.cssImports).toEqual([
      "./index.css",
      "@yext/search-ui-react/index.css",
    ]);
  });

  it("correctly gets filepath", async () => {
    const pageFile = createPageFile("shortFragmentSyntaxPage");
    const result = await pageFile.getPageState();

    expect(result.filepath).toEqual(getPagePath("shortFragmentSyntaxPage"));
  });

  it("returns empty component tree when parses a page without return statement", async () => {
    const pageFile = createPageFile("noReturnStatementPage");
    const result = await pageFile.getPageState();
    expect(result.componentTree).toEqual([]);
  });

  describe("throws errors", () => {
    it("throws an error when the return statement has no top-level Jsx node", async () => {
      const pageFile = createPageFile("noTopLevelJsxPage");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        /^Unable to find top-level JSX element or JSX fragment type in the default export at path: /
      );
    });

    it("throws an error when a JsxSpreadAttribute is found on the page", async () => {
      const pageFile = createPageFile("jsxSpreadAttributePage");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        "Error parsing `{...props}`: JsxSpreadAttribute is not currently supported."
      );
    });

    it("throws an error when JsxText is found on the page", async () => {
      const pageFile = createPageFile("jsxTextPage");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        'Found JsxText with content "\n      Text\n      ". JsxText is not currently supported.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", async () => {
      const pageFile = createPageFile("jsxExpressionPage");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });

    it("throws an error when a JsxExpression is found on the page", async () => {
      const pageFile = createPageFile("jsxExpressionPage");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        'Jsx nodes of kind "JsxExpression" are not supported for direct use in page files.'
      );
    });

    it("throws when an ObjectLiteralExpression is returned by the page", async () => {
      const pageFile = createPageFile("returnsObject");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });

    it("throws when an ArrayLiteralExpression is returned by the page", async () => {
      const pageFile = createPageFile("returnsArray");

      await expect(pageFile.getPageState()).rejects.toThrowError(
        /^Unable to find top-level JSX element or JSX fragment/
      );
    });
  });
});
