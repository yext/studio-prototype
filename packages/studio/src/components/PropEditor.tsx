import {
  NestedPropMetadata,
  PropMetadata,
  PropVal,
  PropValueKind,
  PropValueType,
} from "@yext/studio-plugin";
import { Tooltip } from "react-tooltip";
import PropInput from "./PropInput";
import useOnPropChange from "../hooks/useOnPropChange";

interface PropEditorProps {
  propName: string;
  propMetadata: Exclude<PropMetadata, NestedPropMetadata>;
  propValue?: string | number | boolean;
  propKind: PropValueKind;
  onPropChange: (propName: string, propVal: PropVal) => void;
  isNested?: boolean;
}

const tooltipStyle = { backgroundColor: "black" };

/**
 * Renders an input editor for a single prop of a component or module.
 */
export default function PropEditor({
  propName,
  propMetadata,
  propValue,
  propKind,
  onPropChange,
  isNested,
}: PropEditorProps) {
  const { type, doc, unionValues } = propMetadata;
  const onChange = useOnPropChange(propKind, propName, onPropChange, type);

  return (
    <div className="flex items-center mb-2 text-sm">
      {isNested && (
        <div className="mr-1 text-gray-200 -ml-0.5 tracking-tighter">--</div>
      )}
      <label className="flex h-10 items-center justify-self-start">
        <p className="pr-2">{propName}</p>
        <PropInput
          {...{
            propType:
              propKind === PropValueKind.Expression
                ? PropValueType.string
                : type,
            propValue,
            onChange,
            propKind,
          }}
          unionValues={unionValues}
        />
      </label>
      {doc && (
        <Tooltip
          style={tooltipStyle}
          anchorId={propName}
          content={doc}
          place="top"
        />
      )}
    </div>
  );
}
