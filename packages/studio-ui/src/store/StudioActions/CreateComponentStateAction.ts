import {
  ComponentStateKind,
  FileMetadataKind,
  StandardOrModuleComponentState,
  ValidFileMetadata,
} from "@yext/studio-plugin";
import path from "path-browserify";
import { v4 } from "uuid";
import PropValueHelpers from "../../utils/PropValueHelpers";

export default class CreateComponentStateAction {
  createComponentState = (
    metadata: ValidFileMetadata
  ): StandardOrModuleComponentState => {
    const componentName = path.basename(metadata.filepath, ".tsx");
    const componentState: StandardOrModuleComponentState = {
      kind:
        metadata.kind === FileMetadataKind.Module
          ? ComponentStateKind.Module
          : ComponentStateKind.Standard,
      componentName,
      props: {
        ...PropValueHelpers.getDefaultPropValues(metadata.propShape ?? {}),
        ...metadata.initialProps,
      },
      uuid: v4(),
      metadataUUID: metadata.metadataUUID,
    };
    return componentState;
  };
}