import {
  ComponentStateHelpers,
  ModuleState,
  RepeaterState,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import { ReactComponent as EditModuleIcon } from "../../icons/editmodule.svg";
import useStudioStore from "../../store/useStudioStore";
import ActionIconWrapper from "./ActionIconWrapper";

export default function EditModuleButton({
  state,
}: {
  state: ModuleState | RepeaterState;
}) {
  const [setModuleUUIDBeingEdited, setActiveComponentUUID] = useStudioStore(
    (store) => [
      store.pages.setModuleUUIDBeingEdited,
      store.pages.setActiveComponentUUID,
    ]
  );

  const handleClick = useCallback(() => {
    setModuleUUIDBeingEdited(state.uuid);
    setActiveComponentUUID(undefined);
  }, [state.uuid, setModuleUUIDBeingEdited, setActiveComponentUUID]);

  const moduleName =
    ComponentStateHelpers.extractStandardOrModuleComponentState(
      state
    ).componentName;

  return (
    <button onClick={handleClick} aria-label={`Edit Module ${moduleName}`}>
      <ActionIconWrapper tooltip="Edit">
        <EditModuleIcon />
      </ActionIconWrapper>
    </button>
  );
}
