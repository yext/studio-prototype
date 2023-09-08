import {
  ComponentState,
  ComponentStateKind,
  TypeGuards,
} from "@yext/studio-plugin";
import {
  createElement,
  Dispatch,
  Fragment,
  SetStateAction,
  useMemo,
} from "react";
import usePreviewProps from "../hooks/usePreviewProps";
import { ImportType } from "../store/models/ImportType";
import useStudioStore from "../store/useStudioStore";
import { ExpressionSources } from "../utils/getPropsForPreview";
import RepeaterPreview from "./RepeaterPreview";
import ErrorComponentPreview from "./ErrorComponentPreview";
import ModulePreview from "./ModulePreview";
import { ITooltip } from "react-tooltip";

interface ComponentPreviewProps {
  componentState: ComponentState;
  expressionSources: ExpressionSources;
  childElements?: (JSX.Element | null)[];
  parentItem?: unknown;
  setTooltipProps: Dispatch<SetStateAction<ITooltip>>;
}

/**
 * Renders the preview for a component.
 */
export default function ComponentPreview({
  componentState,
  expressionSources,
  childElements = [],
  setTooltipProps,
  parentItem,
}: ComponentPreviewProps): JSX.Element | null {
  const previewProps = usePreviewProps(
    componentState,
    expressionSources,
    parentItem
  );
  const element = useElement(componentState, (type) =>
    createElement(type, previewProps, ...childElements)
  );

  if (TypeGuards.isModuleState(componentState)) {
    return (
      <ModulePreview
        previewProps={previewProps}
        expressionSources={expressionSources}
        moduleState={componentState}
        setTooltipProps={setTooltipProps}
      />
    );
  } else if (TypeGuards.isRepeaterState(componentState)) {
    return (
      <RepeaterPreview
        repeaterState={componentState}
        expressionSources={expressionSources}
        setTooltipProps={setTooltipProps}
      />
    );
  } else if (componentState.kind === ComponentStateKind.Error) {
    return (
      <ErrorComponentPreview
        element={element}
        errorComponentState={componentState}
        setTooltipProps={setTooltipProps}
      />
    );
  }
  return element;
}

function useElement(
  c: ComponentState,
  createElement: (type: string | ImportType) => JSX.Element
): JSX.Element | null {
  const UUIDToImportedComponent = useStudioStore(
    (store) => store.fileMetadatas.UUIDToImportedComponent
  );

  const element: string | ImportType | undefined = useMemo(() => {
    if (TypeGuards.isRepeaterState(c) || TypeGuards.isModuleState(c)) {
      return undefined;
    } else if (c.kind === ComponentStateKind.Fragment) {
      return Fragment;
    } else if (c.kind === ComponentStateKind.BuiltIn) {
      return c.componentName;
    } else {
      const importedComponent = UUIDToImportedComponent[c.metadataUUID];
      if (!importedComponent) {
        console.warn(
          `Expected to find component loaded for ${c.componentName} but none found - possibly due to a race condition.`
        );
        return undefined;
      }
      return importedComponent;
    }
  }, [c, UUIDToImportedComponent]);

  return element ? createElement(element) : null;
}