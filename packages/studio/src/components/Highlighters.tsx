import { CSSProperties, useMemo } from "react";
import { useComponentNames } from "../hooks/useActiveComponentName";
import useStudioStore from "../store/useStudioStore";
import { ComponentStateKind } from "@yext/studio-plugin";
import DOMRectProperties from "../store/models/DOMRectProperties";

/**
 * Generates Highlighters for all selected components.
 */
export default function Highlighters(props: {
  iframeEl: HTMLIFrameElement | null;
}): JSX.Element {
  const { iframeEl } = props;
  const [selectedComponentUUIDs, selectedComponentRects] = useStudioStore(
    (store) => {
      return [
        store.pages.selectedComponentUUIDs,
        store.pages.selectedComponentRects,
      ];
    }
  );
  return (
    <div>
      {selectedComponentUUIDs.map((uuid, index) => (
        <Highlighter
          key={`${uuid}-key`}
          uuid={uuid}
          rect={selectedComponentRects[index]}
          iframeEl={iframeEl}
        />
      ))}
    </div>
  );
}

/**
 * Highlights the component in the page preview.
 */
function Highlighter({
  uuid,
  rect,
  iframeEl,
}: {
  uuid: string;
  rect: DOMRectProperties;
  iframeEl: HTMLIFrameElement | null;
}) {
  const componentTree = useStudioStore((store) =>
    store.actions.getComponentTree()
  );
  const isErrorState = useStudioStore(
    (store) =>
      store.actions.getComponentState(componentTree, uuid)?.kind ===
      ComponentStateKind.Error
  );
  const [componentName] = useComponentNames([uuid]);

  const red300 = "rgb(252 165 165)";
  const skyBlueFromMocks = "rgb(88,146,255)";
  const color = isErrorState ? red300 : skyBlueFromMocks;

  const style: CSSProperties = useMemo(() => {
    if (!rect) {
      return {};
    }
    return {
      position: "absolute",
      zIndex: "10",
      left: `${(iframeEl?.contentWindow?.scrollX ?? 0) + rect.left}px`,
      top: `${(iframeEl?.contentWindow?.scrollY ?? 0) + rect.top}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
      boxSizing: "border-box",
      border: `1px solid ${color}`,
      pointerEvents: "none",
    };
  }, [rect, color, iframeEl]);

  const tagStyle: CSSProperties = useMemo(() => {
    if (!rect) {
      return {};
    }
    return {
      position: "absolute",
      top: `${rect.height - 1}px`,
      backgroundColor: color,
      color: "white",
      padding: "0px 10px",
    };
  }, [rect, color]);

  if (!rect) {
    return null;
  }

  return (
    <div style={style}>
      <div style={tagStyle}>{componentName}</div>
    </div>
  );
}