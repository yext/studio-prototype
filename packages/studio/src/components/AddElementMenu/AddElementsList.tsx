import {
  ComponentStateKind,
  FileMetadata,
  FileMetadataKind,
} from "@yext/studio-plugin";
import { useCallback } from "react";
import { v4 } from "uuid";
import useStudioStore from "../../store/useStudioStore";
import path from "path-browserify";
import { ElementType } from "./AddElementMenu";

/**
 * The list of available, addable elements for the current activeType.
 */
export default function AddElementsList({
  activeType,
}: {
  activeType: ElementType;
}) {
  const UUIDToFileMetadata = useStudioStore((store) => {
    return store.fileMetadatas.UUIDToFileMetadata;
  });

  const addableElements = Object.values(UUIDToFileMetadata).filter(
    (metadata) => {
      if (activeType === ElementType.Components) {
        return (
          metadata.kind === FileMetadataKind.Component &&
          !metadata.acceptsChildren
        );
      } else if (activeType === ElementType.Containers) {
        return (
          metadata.kind === FileMetadataKind.Component &&
          metadata.acceptsChildren
        );
      } else {
        return metadata.kind === FileMetadataKind.Module;
      }
    }
  );

  if (addableElements.length === 0) {
    return (
      <div className="flex flex-col items-start py-3 pl-6 opacity-50">
        Nothing to see here!
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start py-1">
      {addableElements.map((metadata) => {
        return <Option metadata={metadata} key={metadata.metadataUUID} />;
      })}
    </div>
  );
}

function Option({ metadata }: { metadata: FileMetadata }) {
  const componentName = path.basename(metadata.filepath, ".tsx");
  const moduleStateBeingEdited = useStudioStore((store) =>
    store.pages.getModuleStateBeingEdited()
  );
  const [addComponent, getActiveComponentState, getComponentMetadata] =
    useStudioStore((store) => {
      return [
        store.actions.addComponent,
        store.actions.getActiveComponentState,
        store.fileMetadatas.getComponentMetadata,
      ];
    });

  const addElement = useCallback(
    (componentName: string) => {
      const activeComponentState = getActiveComponentState();
      const activeComponentMetadata =
        activeComponentState?.kind === ComponentStateKind.Standard
          ? getComponentMetadata(activeComponentState.metadataUUID)
          : undefined;
      const parentUUID =
        activeComponentMetadata?.acceptsChildren ||
        activeComponentState?.kind === ComponentStateKind.Fragment ||
        activeComponentState?.kind === ComponentStateKind.BuiltIn
          ? activeComponentState?.uuid
          : activeComponentState?.parentUUID;
      const componentState = {
        kind:
          metadata.kind === FileMetadataKind.Module
            ? ComponentStateKind.Module
            : ComponentStateKind.Standard,
        componentName,
        props: metadata.initialProps ?? {},
        uuid: v4(),
        metadataUUID: metadata.metadataUUID,
        parentUUID,
      };
      addComponent(componentState);
    },
    [
      addComponent,
      metadata.initialProps,
      metadata.kind,
      metadata.metadataUUID,
      getActiveComponentState,
      getComponentMetadata,
    ]
  );
  const handleClick = useCallback(() => {
    addElement(componentName);
  }, [addElement, componentName]);

  // Prevent users from adding infinite looping modules.
  const isSameAsActiveModule =
    moduleStateBeingEdited?.metadataUUID === metadata.metadataUUID;

  return (
    <button
      className="px-6 py-1 cursor-pointer hover:opacity-75 disabled:opacity-25"
      onClick={handleClick}
      aria-label={`Add ${componentName} Element`}
      disabled={isSameAsActiveModule}
    >
      {componentName}
    </button>
  );
}
