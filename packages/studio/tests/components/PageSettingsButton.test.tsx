import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";
import PageSettingsButton from "../../src/components/PageSettingsButton/PageSettingsButton";
import { PageState, PropValueKind } from "@yext/studio-plugin";

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
  const textbox = screen.getByRole("textbox", { name: "URL slug:" });
  expect(textbox).toHaveValue("index");
});

it("disables the Save button if new getPath value is blank or matches original", async () => {
  render(<PageSettingsButton pageName="universal" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const textbox = screen.getByRole("textbox", { name: "URL slug:" });
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
  const textbox = screen.getByRole("textbox", { name: "URL slug:" });
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
  const textbox = screen.getByRole("textbox", { name: "URL slug:" });
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
  const entityIDsTextbox = screen.getByRole("textbox", { name: "Entity IDs:" });
  const entityTypesTextbox = screen.getByRole("textbox", {
    name: "Entity Types:",
  });
  const savedFilterIDsTextbox = screen.getByRole("textbox", {
    name: "Saved Filter IDs:",
  });
  expect(entityIDsTextbox).toHaveValue("apple,orange");
  expect(entityTypesTextbox).toHaveValue("");
  expect(savedFilterIDsTextbox).toHaveValue("banana");
});

it("updates the stream scope with user input when entity page's getPath value is undefined", async () => {
  const updateStreamScopeSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateStreamScope"
  );
  render(<PageSettingsButton pageName="fruits" />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const entityTypesTextbox = screen.getByRole("textbox", {
    name: "Entity Types:",
  });
  const savedFilterIDsTextbox = screen.getByRole("textbox", {
    name: "Saved Filter IDs:",
  });
  await userEvent.type(entityTypesTextbox, "kiwi");
  await userEvent.type(savedFilterIDsTextbox, ",pineapple");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateStreamScopeSpy).toBeCalledWith("fruits", {
    entityIds: ["apple", "orange"],
    entityTypes: ["kiwi"],
    savedFilterIds: ["banana", "pineapple"],
  });
  await userEvent.click(pageSettingsButton);
  expect(entityTypesTextbox).toHaveValue("kiwi");
  expect(savedFilterIDsTextbox).toHaveValue("banana,pineapple");
});

async function editUndefinedURL(pageName: string, isEntityPage: boolean) {
  const updateGetPathValueSpy = jest.spyOn(
    useStudioStore.getState().pages,
    "updateGetPathValue"
  );
  render(<PageSettingsButton pageName={pageName} />);
  const pageSettingsButton = screen.getByRole("button");
  await userEvent.click(pageSettingsButton);
  const urlTextbox = screen.getByPlaceholderText(
    "URL slug is defined by developer"
  );
  await userEvent.type(urlTextbox, "test-url");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(updateGetPathValueSpy).toBeCalledWith(pageName, {
    kind: isEntityPage ? PropValueKind.Expression : PropValueKind.Literal,
    value: "test-url",
  });
  await userEvent.click(pageSettingsButton);
  expect(urlTextbox).toHaveValue("test-url");
}

it("displays URL placeholder and can edit URL when static page's getPath value is undefined", async () => {
  await editUndefinedURL("index", false);
});

it("displays URL placeholder and can edit URL when entity page's getPath value is undefined", async () => {
  await editUndefinedURL("fruits", true);
});
