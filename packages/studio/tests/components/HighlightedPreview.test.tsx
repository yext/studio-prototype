import { within, screen, render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import HighlightedPreview from "../../src/components/HighlightedPreview";
import useStudioStore from "../../src/store/useStudioStore";
import {
  nestedComponentTree,
  componentState,
  mockUUIDToFileMetadata,
} from "../__fixtures__/mockStoreNestedComponents";
import mockStore from "../__utils__/mockStore";
import {
  ComponentState,
  ComponentStateKind,
  ModuleState,
  PropValueKind,
  PropValueType,
  RepeaterState,
} from "@yext/studio-plugin";

const moduleState: ModuleState = {
  kind: ComponentStateKind.Module,
  componentName: "Panel",
  props: {
    text: {
      kind: PropValueKind.Literal,
      value: "This is Panel module",
      valueType: PropValueType.string,
    },
  },
  uuid: "panel-uuid",
  metadataUUID: "panel-metadata-uuid",
};

const repeaterState: RepeaterState = {
  kind: ComponentStateKind.Repeater,
  uuid: "panel-uuid",
  listExpression: "document.favs",
  repeatedComponent: moduleState,
};

beforeEach(() => {
  jest.spyOn(console, "warn").mockImplementation();
});

describe("renders preview", () => {
  it("renders component tree with nested Component(s)", async () => {
    mockPreviewState(nestedComponentTree);
    render(<HighlightedPreview />);
    const container1 = await screen.findByText(/Container 1/);
    const container2 = await within(container1).findByText(/Container 2/);
    const banner1 = await within(container1).findByText(/Banner 1/);
    const banner2 = await within(container2).findByText(/Banner 2/);
    expect(container1).toBeDefined();
    expect(container2).toBeDefined();
    expect(banner1).toBeDefined();
    expect(banner2).toBeDefined();
  });

  it("renders component tree with Module component type", async () => {
    const tree = [moduleState];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const panel = await screen.findByText(/This is Panel module/);
    const banner = await screen.findByText(/This is Banner/);
    expect(panel).toBeDefined();
    expect(banner).toBeDefined();
  });

  it("renders component tree with Repeater component over a module", async () => {
    const tree = [repeaterState];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const panels = await screen.findAllByText(/This is Panel module/);
    const banners = await screen.findAllByText(/This is Banner/);
    expect(panels).toHaveLength(3);
    expect(banners).toHaveLength(3);
  });

  it("does not render Repeater if list expression is not found", async () => {
    const tree = [{ ...repeaterState, listExpression: "document.services" }];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const panels = screen.queryByText(/This is Panel module/);
    const banners = screen.queryByText(/This is Banner/);
    expect(panels).toBeNull();
    expect(banners).toBeNull();
  });

  it("renders component with transformed props", async () => {
    const tree: ComponentState[] = [
      {
        ...componentState,
        props: {
          title: {
            kind: PropValueKind.Expression,
            value: "siteSettings.apiKey",
            valueType: PropValueType.string,
          },
          num: {
            kind: PropValueKind.Expression,
            value: "document.employeeCount",
            valueType: PropValueType.number,
          },
        },
      },
      {
        ...moduleState,
        props: {
          text: {
            kind: PropValueKind.Expression,
            value: "siteSettings.someText",
            valueType: PropValueType.string,
          },
        },
      },
    ];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const siteSettingsExpressionProp = await screen.findByText(/mock-api-key/);
    expect(siteSettingsExpressionProp).toBeDefined();
    const documentExpressionProp = await screen.findByText(/123/);
    expect(documentExpressionProp).toBeDefined();
    const moduleExpressionProp = await screen.findByText(/mock-text/);
    expect(moduleExpressionProp).toBeDefined();
  });

  it("can render component using nested siteSettings expression", async () => {
    const tree: ComponentState[] = [
      {
        ...componentState,
        props: {
          title: {
            kind: PropValueKind.Expression,
            value: 'siteSettings.["Global Colors"].primary',
            valueType: PropValueType.HexColor,
          },
        },
      },
    ];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const siteSettingsExpressionProp = await screen.findByText(/#AABBCC/);
    expect(siteSettingsExpressionProp).toBeDefined();
  });

  it("can render component using prop of PropValueType.Object", async () => {
    const tree: ComponentState[] = [
      {
        ...componentState,
        props: {
          nestedProp: {
            kind: PropValueKind.Literal,
            value: {
              egg: {
                kind: PropValueKind.Literal,
                valueType: PropValueType.string,
                value: "eggyweggy",
              },
            },
            valueType: PropValueType.Object,
          },
        },
      },
    ];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const nestedPropUsage = await screen.findByText(/eggyweggy/);
    expect(nestedPropUsage).toBeDefined();
  });

  it("can render repeated module using item expression", async () => {
    const tree: ComponentState[] = [
      {
        ...repeaterState,
        repeatedComponent: {
          ...moduleState,
          props: {
            text: {
              kind: PropValueKind.Expression,
              value: "item",
              valueType: PropValueType.string,
            },
          },
        },
      },
    ];
    mockPreviewState(tree);
    render(<HighlightedPreview />);
    const catItemProp = await screen.findByText(/cat/);
    expect(catItemProp).toBeDefined();
    const dogItemProp = await screen.findByText(/dog/);
    expect(dogItemProp).toBeDefined();
    const sleepItemProp = await screen.findByText(/sleep/);
    expect(sleepItemProp).toBeDefined();
  });
});

it("clicking a component in the preview updates the activeComponentUUID", async () => {
  mockPreviewState(nestedComponentTree);
  render(<HighlightedPreview />);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    undefined
  );
  const container1 = await screen.findByText(/Container 1/);
  await userEvent.click(container1);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    "container-uuid"
  );
  const banner1 = await within(container1).findByText(/Banner 1/);
  await userEvent.click(banner1);
  expect(useStudioStore.getState().pages.activeComponentUUID).toEqual(
    "banner-uuid"
  );
});

function mockPreviewState(componentTree: ComponentState[]) {
  mockStore({
    pages: {
      pages: {
        universalPage: {
          componentTree,
          cssImports: [],
          entityFiles: ["entityFile.json"],
          filepath: "mock/file/path",
        },
      },
    },
    fileMetadatas: {
      UUIDToFileMetadata: mockUUIDToFileMetadata,
    },
    siteSettings: {
      values: {
        apiKey: {
          kind: PropValueKind.Literal,
          value: "mock-api-key",
          valueType: PropValueType.string,
        },
        someText: {
          kind: PropValueKind.Literal,
          value: "mock-text",
          valueType: PropValueType.string,
        },
        "Global Colors": {
          kind: PropValueKind.Literal,
          valueType: PropValueType.Object,
          value: {
            primary: {
              kind: PropValueKind.Literal,
              valueType: PropValueType.HexColor,
              value: "#AABBCC",
            },
          },
        },
      },
    },
  });
  useStudioStore.getState().actions.updateActivePage("universalPage");
}
