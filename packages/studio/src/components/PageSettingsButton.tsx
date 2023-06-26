import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Gear } from "../icons/gear.svg";
import { useCallback, useMemo } from "react";
import ButtonWithModal, { renderModalFunction } from "./common/ButtonWithModal";
import FormModal, { FormData } from "./common/FormModal";
import { Tooltip } from "react-tooltip";
import { GetPathVal, PropValueKind, StreamScope } from "@yext/studio-plugin";
import TemplateExpressionFormatter from "../utils/TemplateExpressionFormatter";
import StreamScopeFormatter, { StreamScopeForm } from "../utils/StreamScopeFormatter";
import PropValueHelpers from "../utils/PropValueHelpers";

type PageSettings = {
  url: string;
};

const formData: FormData<PageSettings> = {
  url: { description: "URL slug:" },
};

const entityFormData: FormData<PageSettings & StreamScopeForm> = {
  url: {
    description: formData.url.description,
    optional: true,
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
};

interface PageSettingsButtonProps {
  pageName: string;
}

/**
 * Renders a button for editing the page-level settings for a PagesJS repo.
 * When the button is clicked, a modal is displayed where the information can
 * be edited.
 */
export default function PageSettingsButton({
  pageName,
}: PageSettingsButtonProps): JSX.Element {
  const [
    currGetPathValue,
    updateGetPathValue,
    streamScope,
    updateStreamScope,
  ] = useStudioStore((store) => [
    store.pages.pages[pageName].pagesJS?.getPathValue,
    store.pages.updateGetPathValue,
    store.pages.pages[pageName].pagesJS?.streamScope,
    store.pages.updateStreamScope,
  ]);
  const isEntityPage = !!streamScope;

  const initialFormValue: PageSettings & StreamScopeForm = useMemo(
    () => (isEntityPage ? { 
      url: getUrlDisplayValue(currGetPathValue, isEntityPage),
      entityIds: StreamScopeFormatter.displayStreamScopeField(streamScope["entityIds"]),
      entityTypes: StreamScopeFormatter.displayStreamScopeField(streamScope["entityTypes"]),
      savedFilterIds: StreamScopeFormatter.displayStreamScopeField(streamScope["savedFilterIds"]),
    } 
    : { url: getUrlDisplayValue(currGetPathValue, isEntityPage) }),
    [currGetPathValue, isEntityPage, streamScope]
  );

  const handleModalSave = useCallback(
    (form: PageSettings & StreamScopeForm) => {
      const getPathValue: GetPathVal = isEntityPage
        ? {
            kind: PropValueKind.Expression,
            value: TemplateExpressionFormatter.getRawValue(form.url),
          }
        : {
            kind: PropValueKind.Literal,
            value: form.url,
          };
      if(currGetPathValue) {
        updateGetPathValue(pageName, getPathValue);
      }
      if(isEntityPage) {
        updateStreamScope(pageName, StreamScopeFormatter.readStreamScope(form));
      }
      return true;
    },
    [updateGetPathValue, updateStreamScope, pageName, isEntityPage, currGetPathValue]
  );

  const renderModal: renderModalFunction = useCallback(
    (isOpen, handleClose) => {
      if(isEntityPage) {
        entityFormData.url.hidden = !currGetPathValue;
      }
      return (
        <FormModal
          isOpen={isOpen}
          title="Page Settings"
          instructions="Changing the scope of the stream (entity IDs, entity types, and saved filter IDs) may cause entity data to be undefined."
          formData={isEntityPage ? entityFormData : formData}
          initialFormValue={
            initialFormValue
          }
          requireChangesToSubmit={true}
          handleClose={handleClose}
          handleConfirm={handleModalSave}
          transformOnChangeValue={
            isEntityPage
              ? TemplateExpressionFormatter.convertCurlyBracesToSquareBrackets
              : undefined
          }
        />
      );
    },
    [handleModalSave, initialFormValue, isEntityPage, currGetPathValue]
  );

  const disabled = !currGetPathValue && !isEntityPage;
  const tooltipAnchorID = `PageSettingsButton-${pageName}`;

  return (
    <div id={tooltipAnchorID}>
      <ButtonWithModal
        buttonContent={<Gear />}
        renderModal={renderModal}
        ariaLabel={`Edit ${pageName} Page Settings`}
        disabled={disabled}
        buttonClassName="text-gray-800 disabled:text-gray-400"
      />
      {disabled && (
        <Tooltip
          anchorId={tooltipAnchorID}
          content="No settings available to edit via the UI."
        />
      )}
    </div>
  );
}

function getUrlDisplayValue(
  getPathValue: GetPathVal | undefined,
  isEntityPage: boolean
): string {
  if (!isEntityPage) {
    return getPathValue?.value ?? "";
  }

  const getPathExpression = PropValueHelpers.getTemplateExpression(
    getPathValue ?? { kind: PropValueKind.Literal, value: "" }
  );
  return TemplateExpressionFormatter.getTemplateStringDisplayValue(
    getPathExpression
  );
}
