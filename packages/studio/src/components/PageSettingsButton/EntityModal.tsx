import useStudioStore from "../../store/useStudioStore";
import { useCallback, useMemo } from "react";
import FormModal, { FormData } from "../common/FormModal";
import { GetPathVal, PropValueKind } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../../utils/TemplateExpressionFormatter";
import StreamScopeFormatter, {
  StreamScopeForm,
} from "../../utils/StreamScopeParser";
import { PageSettingsModalProps } from "./PageSettingsButton";
import { StaticPageSettings } from "./StaticModal";
import { getUrlDisplayValue } from "./GetUrlDisplayValue";

type EntityPageSettings = StaticPageSettings & StreamScopeForm;

export default function EntityModal({
  pageName,
  isOpen,
  handleClose,
}: PageSettingsModalProps): JSX.Element {
  const [currGetPathValue, updateGetPathValue, streamScope, updateStreamScope] =
    useStudioStore((store) => [
      store.pages.pages[pageName].pagesJS?.getPathValue,
      store.pages.updateGetPathValue,
      store.pages.pages[pageName].pagesJS?.streamScope,
      store.pages.updateStreamScope,
    ]);

  const initialFormValue: EntityPageSettings = useMemo(
    () => ({
      url: getUrlDisplayValue(currGetPathValue, true),
      ...(streamScope && StreamScopeFormatter.displayStreamScope(streamScope)),
    }),
    [currGetPathValue, streamScope]
  );

  const entityFormData: FormData<EntityPageSettings> = useMemo(
    () => ({
      url: {
        description: "URL slug:",
        optional: !currGetPathValue,
        placeholder: currGetPathValue ? "" : "URL slug is defined by developer",
      },
      entityIds: {
        description: "Entity IDs:",
        optional: true,
      },
      entityTypes: {
        description: "Entity Types:",
        optional: true,
      },
      savedFilterIds: {
        description: "Saved Filter IDs:",
        optional: true,
      },
    }),
    [currGetPathValue]
  );

  const handleModalSave = useCallback(
    (form: EntityPageSettings) => {
      const getPathValue: GetPathVal = {
        kind: PropValueKind.Expression,
        value: TemplateExpressionFormatter.getRawValue(form.url),
      };
      if (form.url || currGetPathValue) {
        updateGetPathValue(pageName, getPathValue);
      }
      updateStreamScope(pageName, StreamScopeFormatter.parseStreamScope(form));
      return true;
    },
    [updateGetPathValue, updateStreamScope, currGetPathValue, pageName]
  );

  return (
    <FormModal
      isOpen={isOpen}
      title="Page Settings"
      instructions="Changing the scope of the stream (entity IDs, entity types, and saved filter IDs) may cause entity data to be undefined."
      formData={entityFormData}
      initialFormValue={initialFormValue}
      requireChangesToSubmit={true}
      handleClose={handleClose}
      handleConfirm={handleModalSave}
      transformOnChangeValue={
        TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets
      }
    />
  );
}