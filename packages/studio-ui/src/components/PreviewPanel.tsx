import { Dispatch, SetStateAction, useMemo } from "react";
import useStudioStore from "../store/useStudioStore";
import usePreviewProps from "../hooks/usePreviewProps";
import ComponentTreePreview from "./ComponentTreePreview";
import useRawSiteSettings from "../hooks/useRawSiteSettings";
import { ComponentStateHelpers, TypeGuards } from "@yext/studio-plugin";
import { get } from "lodash";
import { ITooltip } from "react-tooltip";

export default function PreviewPanel(props: {
  setTooltipProps: Dispatch<SetStateAction<ITooltip>>;
}) {
  const { setTooltipProps } = props;
  const [componentTree, moduleUUIDBeingEdited, getComponentState] =
    useStudioStore((store) => [
      store.actions.getComponentTree(),
      store.pages.moduleUUIDBeingEdited,
      store.actions.getComponentState,
    ]);

  const pageExpressionSources = usePageExpressionSources();

  const state = moduleUUIDBeingEdited
    ? getComponentState(componentTree, moduleUUIDBeingEdited)
    : undefined;
  const list =
    state && TypeGuards.isRepeaterState(state)
      ? get(pageExpressionSources, state.listExpression)
      : undefined;
  const item = Array.isArray(list) ? list[0] : undefined;

  const extractedState =
    state && TypeGuards.isEditableComponentState(state)
      ? ComponentStateHelpers.extractRepeatedState(state)
      : undefined;
  const parentPreviewProps = usePreviewProps(
    extractedState,
    pageExpressionSources,
    item
  );

  const expressionSources = useMemo(
    () => ({
      ...pageExpressionSources,
      ...(moduleUUIDBeingEdited && { props: parentPreviewProps }),
    }),
    [pageExpressionSources, moduleUUIDBeingEdited, parentPreviewProps]
  );

  if (!componentTree) {
    return null;
  }

  return (
    <ComponentTreePreview
      componentTree={componentTree}
      expressionSources={expressionSources}
      setTooltipProps={setTooltipProps}
    />
  );
}

function usePageExpressionSources() {
  const activeEntityData = useStudioStore((store) =>
    store.pages.getActiveEntityData()
  );
  const rawSiteSettings = useRawSiteSettings();
  const pageExpressionSources = useMemo(
    () => ({
      document: activeEntityData,
      siteSettings: rawSiteSettings,
    }),
    [activeEntityData, rawSiteSettings]
  );

  return pageExpressionSources;
}