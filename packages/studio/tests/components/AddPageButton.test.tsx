import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AddPageButton from "../../src/components/AddPageButton";
import useStudioStore from "../../src/store/useStudioStore";
import mockStore from "../__utils__/mockStore";

beforeEach(() => {
  mockStore({
    pages: {
      pages: {
        universal: {
          componentTree: [],
          cssImports: [],
          filepath: "mock-filepath",
        },
      },
    },
  });
});

it("closes the modal when a page name is successfully added", async () => {
  const addPageSpy = jest.spyOn(useStudioStore.getState().pages, "addPage");
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  await userEvent.click(saveButton);
  expect(addPageSpy).toBeCalledWith("test", {
    componentTree: [],
    cssImports: [],
    filepath: expect.stringContaining("test.tsx"),
  });
  expect(screen.queryByText("Save")).toBeNull();
});

it("gives an error if the page name is already used", async () => {
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "universal");
  const saveButton = screen.getByRole("button", { name: "Save" });
  const consoleErrorSpy = jest
    .spyOn(global.console, "error")
    .mockImplementation();
  await userEvent.click(saveButton);
  expect(
    screen.getByText(
      'Error adding page: page name "universal" is already used.'
    )
  ).toBeDefined();
  expect(consoleErrorSpy).toBeCalledTimes(1);
  expect(consoleErrorSpy).toBeCalledWith(
    'Error adding page: page name "universal" is already used.'
  );
});

it("gives an error if the page path is invalid", async () => {
  render(<AddPageButton />);
  const addPageButton = screen.getByRole("button");
  await userEvent.click(addPageButton);
  const textbox = screen.getByRole("textbox");
  await userEvent.type(textbox, "../test");
  const saveButton = screen.getByRole("button", { name: "Save" });
  const consoleErrorSpy = jest
    .spyOn(global.console, "error")
    .mockImplementation();
  await userEvent.click(saveButton);
  expect(
    screen.getByText("Error adding page: pageName is invalid: ../test")
  ).toBeDefined();
  expect(consoleErrorSpy).toBeCalledTimes(1);
  expect(consoleErrorSpy).toBeCalledWith(
    "Error adding page: pageName is invalid: ../test"
  );
});
