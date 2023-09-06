import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import PageSettingsButton from "../../src/components/PageSettingsButton/PageSettingsButton";
import { PageState, PropValueKind, ResponseType } from "@yext/studio-plugin";
import { checkTooltipFunctionality } from "../__utils__/helpers";
import * as sendMessageModule from "../../src/messaging/sendMessage";
import { StudioStore } from "../../src/store/models/StudioStore";

const basePageState: PageState = {
  componentTree: [],
  cssImports: [],
  filepath: "mock-filepath",
};

beforeEach(() => {
  const originalStudioConfig = useStudioStore.getState().studioConfig;
  mockStore({
    pages: {
      pages: {
        universal: {
          ...basePageState,
          pagesJS: {
            getPathValue: { kind: PropValueKind.Literal, value: "index" },
          },
        },
        product: {
          ...basePageState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "document.slug",
            },
            streamScope: {},
          },
        },
        index: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
          },
        },
        fruits: {
          ...basePageState,
          pagesJS: {
            getPathValue: undefined,
            streamScope: {
              entityIds: ["apple", "orange"],
              savedFilterIds: ["banana"],
            },
          },
        },
        invalid_slug: {
          ...basePageState,
          pagesJS: {
            getPathValue: {
              kind: PropValueKind.Expression,
              value: "iaminvalid<>||||$|{document.no}",
            },
            streamScope: {},
          },
        },
      },
    },
    studioConfig: {
      ...originalStudioConfig,
      isPagesJSRepo: true,
    },
  });
});

it("displays the original getPath value when the modal is opened", async () => {
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  expect(textbox).toHaveValue("index");
});

it("disables the Save button if new getPath value is blank or matches original", async () => {
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  await userEvent.clear(textbox);
  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toBeDisabled();
  await userEvent.type(textbox, "in");
  expect(saveButton).toBeEnabled();
  await userEvent.type(textbox, "dex");
  expect(saveButton).toBeDisabled();
});

it("closes the modal when the getPath value is updated", async () => {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  await userEvent.type(textbox, ".html");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateGetPathValueSpy).toBeCalledWith("universal", {
    kind: PropValueKind.Literal,
    value: "index.html",
  });
  expect(screen.queryByText("Save")).toBeNull();
});

it("updates getPath value with square and curly bracket expression", async () => {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName="product" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL Slug" });
  expect(textbox).toHaveValue("[[slug]]");
  // userEvent treats `[` and `{` as special characters. To type each in the
  // input, the character must be doubled in the string.
  await userEvent.type(textbox, "-[[[[services[[0]]]-${{document.id}");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateGetPathValueSpy).toBeCalledWith("product", {
    kind: PropValueKind.Expression,
    value: "`${document.slug}-${document.services[0]}-${document.id}`",
  });
});

it("displays the correct stream scope when modal opens", async () => {
  render(<PageSettingsButton pageName="fruits" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const entityIDsTextbox = screen.getByRole("textbox", { name: "Entity IDs" });
  const entityTypesTextbox = screen.getByRole("textbox", {
    name: "Entity Type IDs",
  });
  const savedFilterIDsTextbox = screen.getByRole("textbox", {
    name: "Saved Filter IDs",
  });
  expect(entityIDsTextbox).toHaveValue("apple,orange");
  expect(entityTypesTextbox).toHaveValue("");
  expect(savedFilterIDsTextbox).toHaveValue("banana");
});

it("updates stream scope with user input and regenerates test data for entity page with undefined getPath", async () => {
  const updateStreamScopeSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateStreamScope"
  );
  render(<PageSettingsButton pageName="fruits" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const entityTypesTextbox = screen.getByRole("textbox", {
    name: "Entity Type IDs",
  });
  const savedFilterIDsTextbox = screen.getByRole("textbox", {
    name: "Saved Filter IDs",
  });
  await userEvent.type(entityTypesTextbox, "kiwi");
  await userEvent.type(savedFilterIDsTextbox, ",pineapple");

  function getEntityFiles(store: StudioStore) {
    return store.pages.pages["fruits"].pagesJS?.entityFiles;
  }
  expect(getEntityFiles(useStudioStore.getState())).toBeUndefined();
  jest.spyOn(sendMessageModule, "default").mockImplementation(() => {
    return new Promise((resolve) =>
      resolve({
        msg: "msg",
        type: ResponseType.Success,
        mappingJson: {
          fruits: ["mockLocalData.json"],
        },
      })
    );
  });
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateStreamScopeSpy).toBeCalledWith("fruits", {
    entityIds: ["apple", "orange"],
    entityTypes: ["kiwi"],
    savedFilterIds: ["banana", "pineapple"],
  });
  expect(useStudioStore.getState().pages.activeEntityFile).toBeUndefined();
  expect(getEntityFiles(useStudioStore.getState())).toEqual([
    "mockLocalData.json",
  ]);

  await userEvent.click(pageSettingsButton);
  expect(entityTypesTextbox).toHaveValue("kiwi");
  expect(savedFilterIDsTextbox).toHaveValue("banana,pineapple");
});

it("shows a tooltip when hovering over the label", async () => {
  const entityIdsMessage =
    "In the Yext platform, navigate to Content > Entities";
  const entityTypesMessage =
    "In the Yext platform, navigate to Content > Configuration > Entity Types";
  const savedFilterIdsMessage =
    "In the Yext platform, navigate to Content > Configuration > Saved Filters";
  render(<PageSettingsButton pageName="fruits" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  await checkTooltipFunctionality(
    entityIdsMessage,
    screen.getByText("Entity IDs")
  );
  await checkTooltipFunctionality(
    entityTypesMessage,
    screen.getByText("Entity Type IDs")
  );
  await checkTooltipFunctionality(
    savedFilterIdsMessage,
    screen.getByText("Saved Filter IDs")
  );
});

async function cannotEditURL(pageName: string) {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName={pageName} />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const urlTextbox = screen.getByPlaceholderText(
    "<URL slug is not editable in Studio. Consult a developer>"
  );
  expect(urlTextbox).toBeDisabled();
  const saveButton = screen.getByRole("button", { name: "Save" });
  expect(saveButton).toBeDisabled();
  expect(updateGetPathValueSpy).toBeCalledTimes(0);
}

it("displays URL placeholder and cannot edit URL when static page's getPath value is undefined", async () => {
  await cannotEditURL("index");
});

it("displays URL placeholder and cannot edit URL when entity page's getPath value is undefined", async () => {
  await cannotEditURL("fruits");
});

it("displays URL placeholder and cannot edit URL when entity page's getPath value is invalid", async () => {
  await cannotEditURL("invalid_slug");
});

it("throws an error when user enters an invalid URL slug and allows user to fix", async () => {
  render(<PageSettingsButton pageName="product" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const urlTextbox = screen.getByRole("textbox", { name: "URL Slug" });
  expect(urlTextbox).toHaveValue("[[slug]]");
  await userEvent.type(urlTextbox, "{backspace}");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(saveButton).toBeDisabled();
  expect(
    screen.getByText("URL slug contains invalid characters: []")
  ).toBeDefined();
  await userEvent.type(urlTextbox, "]-[[field]]");
  expect(
    screen.queryByText("URL slug contains invalid characters: []")
  ).toBeNull();
  expect(saveButton).toBeEnabled();
});