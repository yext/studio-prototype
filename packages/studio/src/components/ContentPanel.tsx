import { PropMetadata, PropValueType } from "@yext/studio-plugin";
import Divider from "./common/Divider";
import useActiveComponentWithProps from "../hooks/useActiveComponentWithProps";
import RepeaterEditor from "./RepeaterEditor";
import useStudioStore from "../store/useStudioStore";
import filterEntityData from "../utils/filterEntityData";
import ActiveComponentPropEditors from "./ActiveComponentPropEditors";

/**
 * Renders prop editors for the active component selected by the user.
 *
 * Filters by {@link PropValueType} to only render strings.
 *
 * Interprets all prop values as {@link PropValueKind.Expression}s, even if
 * the value could be represented by a string literal.
 */
export default function ContentPanel(): JSX.Element | null {
  const hasArrayEntityData = useStudioStore((store) => {
    const filteredData = filterEntityData(
      "array",
      store.pages.activeEntityData
    );
    return Object.keys(filteredData).length > 0;
  });

  const activeComponentWithProps = useActiveComponentWithProps();
  if (!activeComponentWithProps) {
    return null;
  }
  const { activeComponentState, extractedComponentState, propShape } =
    activeComponentWithProps;

  return (
    <div>
      <ActiveComponentPropEditors
        activeComponentState={extractedComponentState}
        propShape={propShape}
        shouldRenderProp={shouldRenderProp}
      />
      <Divider />
      {/** TODO: remove hasArrayEntityData check once other arrays are supported. */}
      {hasArrayEntityData && (
        <>
          <RepeaterEditor componentState={activeComponentState} />
          <Divider />
        </>
      )}
    </div>
  );
}

function shouldRenderProp(metadata: PropMetadata) {
  return metadata.type === PropValueType.string;
}
