import { ChangeEvent, useCallback, useState } from "react";
import { FlowStepModalProps } from "./FlowStep";
import useStudioStore from "../../store/useStudioStore";
import DialogModal from "../common/DialogModal";
import { selectCssClasses } from "../UnionPropInput";
import { twMerge } from "tailwind-merge";

/**
 * This modal allows the user to select a layout for their 
 * new page.  If no layout is selected, then no layout will
 * be applied.
 */
export default function LayoutSelector({
  isOpen,
  handleClose,
  handleConfirm,
}: FlowStepModalProps) {
  const layouts = useStudioStore(
    (store) => store.layouts.layoutNameToLayoutState
  );
  const [selectedLayout, setSelectedLayout] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>();

  const onConfirm = useCallback(async () => {
    const layoutState = layouts[selectedLayout];

    try {
      await handleConfirm(layoutState);
      await handleClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        throw err;
      }
    }
  }, [handleClose, handleConfirm, layouts, selectedLayout]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      setSelectedLayout(e.target.value);
    },
    [setSelectedLayout]
  );

  const selectClasses = twMerge(selectCssClasses, "w-full mb-6");
  const body = (
    <label>
      <select className={selectClasses} onChange={handleChange}>
        <option key="" value="">
          No layout selected
        </option>
        {Object.keys(layouts).map((layoutName) => (
          <option key={layoutName} value={layoutName}>
            {layoutName}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <DialogModal
      isOpen={isOpen}
      handleClose={handleClose}
      handleConfirm={onConfirm}
      title="Select Layout"
      body={body}
      confirmButtonText="Save"
      errorMessage={errorMessage}
    />
  );
}
