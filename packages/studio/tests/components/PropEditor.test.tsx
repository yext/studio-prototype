import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import PropEditor from "../../src/components/PropEditor";
import { PropValueKind, PropValueType } from "@yext/studio-plugin";
import userEvent from "@testing-library/user-event";

jest.useFakeTimers();

describe("trigger onChange from input interaction", () => {
  it("constructs expression PropVal type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Expression}
        propName="age"
        propMetadata={{ type: PropValueType.number, required: false }}
        onPropChange={onPropChange}
      />
    );
    const inputValue = "doc.age";
    void userEvent.type(screen.getByLabelText("age"), inputValue);
    await screen.findByDisplayValue("doc.age");
    jest.advanceTimersByTime(500); //debounce time
    expect(onPropChange).toBeCalledWith("age", {
      kind: PropValueKind.Expression,
      valueType: PropValueType.number,
      value: "`" + inputValue + "`",
    });
  });

  it("constructs string PropVal on type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Literal}
        propName="title"
        propMetadata={{ type: PropValueType.string, required: false }}
        onPropChange={onPropChange}
      />
    );
    void userEvent.type(screen.getByLabelText("title"), "y");
    await screen.findByDisplayValue("y");
    jest.advanceTimersByTime(500); //debounce time
    expect(onPropChange).toBeCalledWith("title", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.string,
      value: "y",
    });
  });

  it("constructs number PropVal on type", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Literal}
        propName="age"
        propMetadata={{ type: PropValueType.number, required: false }}
        onPropChange={onPropChange}
      />
    );
    void userEvent.type(screen.getByLabelText("age"), "4");
    await screen.findByDisplayValue("4");
    jest.advanceTimersByTime(500); //debounce time
    expect(onPropChange).toBeCalledWith("age", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.number,
      value: 4,
    });
  });

  it("constructs boolean PropVal on click", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Literal}
        propName="is Yext employee?"
        propMetadata={{ type: PropValueType.boolean, required: false }}
        onPropChange={onPropChange}
      />
    );
    void userEvent.click(screen.getByLabelText("is Yext employee?"));
    await waitFor(() => expect(screen.getByRole("checkbox")).toBeChecked());
    jest.advanceTimersByTime(500); //debounce time
    expect(onPropChange).toBeCalledWith("is Yext employee?", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.boolean,
      value: true,
    });
  });

  it("constructs HexColor PropVal on select", async () => {
    const onPropChange = jest.fn();
    render(
      <PropEditor
        propKind={PropValueKind.Literal}
        propName="background color"
        propMetadata={{ type: PropValueType.HexColor, required: false }}
        onPropChange={onPropChange}
      />
    );
    // userEvent doesn't support interaction with input of type "color"
    fireEvent.input(screen.getByLabelText("background color"), {
      target: { value: "#abcdef" },
    });
    await screen.findByDisplayValue("#abcdef");
    jest.advanceTimersByTime(500); //debounce time
    expect(onPropChange).toBeCalledWith("background color", {
      kind: PropValueKind.Literal,
      valueType: PropValueType.HexColor,
      value: "#abcdef",
    });
  });
});
