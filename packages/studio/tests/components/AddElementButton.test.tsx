import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import mockStore from "../__utils__/mockStore";
import AddElementButton from "../../src/components/AddElementButton";

it("renders the button when there is an active page state (but no menu)", () => {
  mockStore({
    pages: {
      getActivePageState: () => {
        return {
          componentTree: [],
          filepath: "",
          cssImports: [],
        };
      },
    },
  });

  render(<AddElementButton />);
  expect(screen.getByRole("button")).toBeDefined();
  expect(screen.queryByText("Components")).toBeNull();
  expect(screen.queryByText("Containers")).toBeNull();
  expect(screen.queryByText("Modules")).toBeNull();
});

it("does not render when there is no active page state", () => {
  mockStore({
    pages: {
      getActivePageState: () => {
        return undefined;
      },
    },
  });

  render(<AddElementButton />);
  expect(screen.queryByRole("button")).toBeNull();
});

it("clicking the button opens the menu", async () => {
  mockStore({
    pages: {
      getActivePageState: () => {
        return {
          componentTree: [],
          filepath: "",
          cssImports: [],
        };
      },
    },
  });

  render(<AddElementButton />);
  await userEvent.click(screen.getByRole("button"));
  expect(screen.getByText("Components")).toBeDefined();
  expect(screen.getByText("Containers")).toBeDefined();
  expect(screen.getByText("Modules")).toBeDefined();
});
