import { render, screen, within } from "@testing-library/react";
import PagePreview from "../../src/components/PagePreview";
import mockStore, { MockStudioStore } from "../__utils__/mockStore";
import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PageState,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import path from "path";

const UUIDToFileMetadata: Record<string, FileMetadata> = {
  "banner-metadata-uuid": {
    kind: FileMetadataKind.Component,
    metadataUUID: "banner-metadata-uuid",
    filepath: path.resolve(__dirname, "../__mocks__/Banner.tsx"),
  },
};
const mockStoreNestedComponentState: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "Container",
            props: {
              text: {
                kind: PropValueKind.Literal,
                value: "Container 1",
                valueType: PropValueType.string,
              },
            },
            uuid: "container-uuid",
            metadataUUID: "container-metadata-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Literal,
                value: "Banner 1",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid",
            metadataUUID: "banner-metadata-uuid",
            parentUUID: "container-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Container",
            props: {
              text: {
                kind: PropValueKind.Literal,
                value: "Container 2",
                valueType: PropValueType.string,
              },
            },
            uuid: "container-uuid-2",
            metadataUUID: "container-metadata-uuid",
            parentUUID: "container-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Literal,
                value: "Banner 2",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid-2",
            metadataUUID: "banner-metadata-uuid",
            parentUUID: "container-uuid-2",
          },
        ],
        cssImports: [],
      },
    },
    activePageName: "universalPage",
  },
  fileMetadatas: {
    UUIDToFileMetadata: {
      ...UUIDToFileMetadata,
      "container-metadata-uuid": {
        kind: FileMetadataKind.Component,
        metadataUUID: "container-metadata-uuid",
        filepath: path.resolve(__dirname, "../__mocks__/Container.tsx"),
      },
    },
  },
};

const mockStoreModuleState: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
          {
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
          },
        ],
        cssImports: [],
      },
    },
    activePageName: "universalPage",
  },
  fileMetadatas: {
    UUIDToFileMetadata: {
      ...UUIDToFileMetadata,
      "panel-metadata-uuid": {
        kind: FileMetadataKind.Module,
        metadataUUID: "panel-metadata-uuid",
        filepath: path.resolve(__dirname, "../__mocks__/Panel.tsx"),
        componentTree: [
          {
            kind: ComponentStateKind.Fragment,
            uuid: "fragment-uuid",
          },
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            uuid: "internal-banner-uuid",
            props: {
              title: {
                kind: PropValueKind.Expression,
                valueType: PropValueType.string,
                value: "props.text",
              },
            },
            metadataUUID: "banner-metadata-uuid",
            parentUUID: "fragment-uuid",
          },
          {
            kind: ComponentStateKind.BuiltIn,
            componentName: "button",
            props: {},
            uuid: "button-uuid",
            parentUUID: "fragment-uuid",
          },
        ],
      },
    },
  },
};

const mockStoreWithPropExpression: MockStudioStore = {
  pages: {
    pages: {
      universalPage: {
        componentTree: [
          {
            kind: ComponentStateKind.Standard,
            componentName: "Banner",
            props: {
              title: {
                kind: PropValueKind.Expression,
                value: "siteSettings.apiKey",
                valueType: PropValueType.string,
              },
            },
            uuid: "banner-uuid",
            metadataUUID: "banner-metadata-uuid",
          },
        ],
        cssImports: [],
      },
    },
    activePageName: "universalPage",
  },
  fileMetadatas: {
    UUIDToFileMetadata,
  },
  siteSettings: {
    values: {
      apiKey: {
        kind: PropValueKind.Literal,
        value: "mock-api-key",
        valueType: PropValueType.string,
      },
    },
  },
};

it("renders active page's component tree with nested Component(s)", async () => {
  mockStore(mockStoreNestedComponentState);
  const pageState = mockStoreNestedComponentState.pages?.pages?.[
    "universalPage"
  ] as PageState;
  render(<PagePreview pageState={pageState} />);
  const container1 = await screen.findByText(/Container 1/);
  const container2 = await within(container1).findByText(/Container 2/);
  const banner1 = await within(container1).findByText(/Banner 1/);
  const banner2 = await within(container2).findByText(/Banner 2/);
  expect(container1).toBeDefined();
  expect(container2).toBeDefined();
  expect(banner1).toBeDefined();
  expect(banner2).toBeDefined();
});

it("renders active page's component tree with Module component type", async () => {
  mockStore(mockStoreModuleState);
  const pageState = mockStoreModuleState.pages?.pages?.[
    "universalPage"
  ] as PageState;
  render(<PagePreview pageState={pageState} />);
  const panel = await screen.findByText(/This is Panel module/);
  const button = await within(panel).findByText(/This is button/);
  const banner = await within(panel).findByText(/This is Banner/);
  expect(panel).toBeDefined();
  expect(button).toBeDefined();
  expect(banner).toBeDefined();
});

it("render component with transformed props", async () => {
  mockStore(mockStoreWithPropExpression);
  const pageState = mockStoreWithPropExpression.pages?.pages?.[
    "universalPage"
  ] as PageState;
  render(<PagePreview pageState={pageState} />);
  const siteSettingsExpressionProp = await screen.findByText(/mock-api-key/);
  expect(siteSettingsExpressionProp).toBeDefined();
});
