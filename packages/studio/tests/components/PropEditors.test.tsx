import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import PropEditors from "../../src/components/PropEditors";
import {
  ComponentState,
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
  PropShape,
  PropValueKind,
  PropValues,
  PropValueType,
  StandardOrModuleComponentState,
  TypeGuards,
} from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";
import useStudioStore from "../../src/store/useStudioStore";
import mockStoreActiveComponent from "../__utils__/mockActiveComponentState";
import useActiveComponent from "../../src/hooks/useActiveComponent";

const activeComponentState: ComponentState = {
  kind: ComponentStateKind.Standard,
  componentName: "Banner",
  props: {},
  uuid: "banner-uuid",
  metadataUUID: "banner-metadata-uuid",
};

it("does not render a prop editor for component's prop of type ReactNode", () => {
  const propShape: PropShape = {
    titleNode: {
      type: PropValueType.ReactNode,
      required: false,
    },
  };
  const consoleWarnSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation();
  render(
    <PropEditors
      activeComponentState={activeComponentState}
      propShape={propShape}
      getPropValueKind={() => PropValueKind.Literal}
    />
  );
  expect(screen.queryByText("titleNode")).toBeNull();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "Found titleNode in component Banner with PropValueType.ReactNode. Studio does not support editing prop of type ReactNode."
  );
});

it("does not render a prop editor for component's prop of type Object", () => {
  const propShape: PropShape = {
    objProp: {
      type: PropValueType.Object,
      required: false,
      shape: {
        title: {
          type: PropValueType.string,
          required: false,
        },
      },
    },
  };
  const consoleWarnSpy = jest
    .spyOn(global.console, "warn")
    .mockImplementation();
  render(
    <PropEditors
      activeComponentState={activeComponentState}
      propShape={propShape}
      getPropValueKind={() => PropValueKind.Literal}
    />
  );
  expect(screen.queryByText("objProp")).toBeNull();
  expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "Found objProp in component Banner with PropValueType.Object. Studio does not support editing nested props."
  );
});

const activeComponentMetadata: FileMetadata = {
  kind: FileMetadataKind.Component,
  metadataUUID: "banner-metadata-uuid",
  filepath: "mock-filepath",
};

const propShape: PropShape = {
  title: { type: PropValueType.string, required: false },
  num: { type: PropValueType.number, required: false },
  bool: { type: PropValueType.boolean, required: false },
  bgColor: { type: PropValueType.HexColor, required: false },
};

describe("ComponentStateKind.Component", () => {
  testStandardOrModuleComponentState(
    activeComponentState,
    activeComponentMetadata
  );
});

describe("ComponentStateKind.Module", () => {
  const activeModuleState: ComponentState = {
    kind: ComponentStateKind.Module,
    componentName: "ModuleBanner",
    props: {},
    uuid: "modulebanner-uuid",
    metadataUUID: "modulebanner-metadata-uuid",
  };

  const activeModuleMetadata: FileMetadata = {
    kind: FileMetadataKind.Module,
    metadataUUID: "modulebanner-metadata-uuid",
    filepath: "mock-filepath",
    componentTree: [],
  };
  testStandardOrModuleComponentState(activeModuleState, activeModuleMetadata);
});

function testStandardOrModuleComponentState(
  state: StandardOrModuleComponentState,
  metadata: FileMetadata
) {
  const componentKindLabel =
    state.kind === ComponentStateKind.Standard ? "component" : "module";

  beforeEach(() => {
    mockStoreActiveComponent({
      activeComponent: state,
      activeComponentMetadata: {
        ...metadata,
        propShape,
      },
    });
  });

  it(`renders message when there are no editable props`, () => {
    render(
      <PropEditors
        activeComponentState={state}
        propShape={propShape}
        getPropValueKind={() => PropValueKind.Literal}
        shouldRenderProp={() => false}
      />
    );

    screen.getByText(
      `${state.componentName} has no Editable Properties in this Panel.`
    );
    expect(screen.queryByText("title")).toBeNull();
    expect(screen.queryByText("num")).toBeNull();
    expect(screen.queryByText("bool")).toBeNull();
    expect(screen.queryByText("bgColor")).toBeNull();
  });

  it(`renders prop editors for each of the active ${componentKindLabel}'s non string props`, () => {
    render(
      <PropEditors
        activeComponentState={state}
        propShape={propShape}
        getPropValueKind={() => PropValueKind.Literal}
      />
    );
    expect(screen.getByLabelText("title")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("num")).toHaveAttribute("type", "number");
    expect(screen.getByLabelText("bool")).toHaveAttribute("type", "checkbox");
    expect(screen.getByLabelText("bgColor")).toHaveAttribute("type", "color");
  });

  describe(`updates active ${componentKindLabel}'s prop state correctly through prop editors`, () => {
    function PropEditorsWithActiveState() {
      const { activeComponentMetadata, activeComponentState } =
        useActiveComponent();
      if (
        !activeComponentMetadata?.propShape ||
        !activeComponentState ||
        !TypeGuards.isStandardOrModuleComponentState(activeComponentState)
      ) {
        return null;
      }
      return (
        <PropEditors
          activeComponentState={activeComponentState}
          propShape={activeComponentMetadata.propShape}
          getPropValueKind={() => PropValueKind.Literal}
        />
      );
    }
    const getComponentProps = () =>
      (
        useStudioStore
          .getState()
          .actions.getActiveComponentState() as StandardOrModuleComponentState
      ).props;

    beforeEach(() => {
      jest.useFakeTimers();
    });

    it("string prop", async () => {
      render(<PropEditorsWithActiveState />);

      userEvent.type(screen.getByLabelText("title"), "test!");
      await screen.findByDisplayValue("test!");
      act(() => jest.advanceTimersByTime(500)); //debounce time

      expect(getComponentProps()).toEqual({
        title: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.string,
          value: "test!",
        },
      });
    });

    it("number prop", async () => {
      render(<PropEditorsWithActiveState />);

      userEvent.type(screen.getByLabelText("num"), "10");
      await screen.findByDisplayValue("10");
      act(() => jest.advanceTimersByTime(500)); //debounce time

      expect(getComponentProps()).toEqual({
        num: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.number,
          value: 10,
        },
      });
    });

    it("boolean prop", async () => {
      render(<PropEditorsWithActiveState />);

      userEvent.click(screen.getByLabelText("bool"));
      await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
      act(() => jest.advanceTimersByTime(500)); //debounce time

      expect(getComponentProps()).toEqual({
        bool: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.boolean,
          value: true,
        },
      });
    });

    it("hex color prop", async () => {
      render(<PropEditorsWithActiveState />);

      fireEvent.input(screen.getByLabelText("bgColor"), {
        target: { value: "#abcdef" },
      });
      await screen.findByDisplayValue("#abcdef");
      act(() => jest.advanceTimersByTime(500)); //debounce time

      expect(getComponentProps()).toEqual({
        bgColor: {
          kind: PropValueKind.Literal,
          valueType: PropValueType.HexColor,
          value: "#abcdef",
        },
      });
    });
  });
}

it("converts string literals to string expressions when propKind = Expression", () => {
  const props: PropValues = {
    title: {
      kind: PropValueKind.Literal,
      value: "myTitle",
      valueType: PropValueType.string,
    },
  };
  const propShape: PropShape = {
    title: {
      type: PropValueType.string,
      required: false,
    },
  };

  render(
    <PropEditors
      activeComponentState={{
        ...activeComponentState,
        props,
      }}
      propShape={propShape}
      getPropValueKind={() => PropValueKind.Expression}
    />
  );
  expect(screen.getByText("title")).toBeDefined();
});

it("converts non-template string expressions to template literals", () => {
  const props: PropValues = {
    title: {
      kind: PropValueKind.Expression,
      value: "siteSettings.siteName",
      valueType: PropValueType.string,
    },
  };
  const propShape: PropShape = {
    title: {
      type: PropValueType.string,
      required: false,
    },
  };

  render(
    <PropEditors
      activeComponentState={{
        ...activeComponentState,
        props,
      }}
      propShape={propShape}
      getPropValueKind={() => PropValueKind.Expression}
    />
  );
  expect(screen.getByText("title")).toBeDefined();
  // eslint-disable-next-line no-template-curly-in-string
  expect(screen.getByRole("textbox")).toHaveValue("${siteSettings.siteName}");
});
