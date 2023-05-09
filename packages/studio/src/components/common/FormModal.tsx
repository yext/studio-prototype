import { ChangeEvent, useCallback, useMemo, useState } from "react";
import Modal from "./Modal";

type Form = {
  [field: string]: string;
};

interface FormModalProps<T extends Form> {
  isOpen: boolean;
  title: string;
  formDescriptions: T;
  errorMessage: string;
  handleClose: () => void | Promise<void>;
  handleSave: (form: T) => boolean | Promise<boolean>;
}

export default function FormModal<T extends Form>({
  isOpen,
  title,
  formDescriptions,
  errorMessage,
  handleClose: customHandleClose,
  handleSave: customHandleSave,
}: FormModalProps<T>) {
  const [isValidForm, setIsValidForm] = useState<boolean>(false);
  const [formValue, setFormValue] = useState<T>(resetForm(formDescriptions));

  const handleClose = useCallback(async () => {
    setFormValue((prev) => resetForm(prev));
    setIsValidForm(true);
    await customHandleClose();
  }, [customHandleClose]);

  const handleSave = useCallback(async () => {
    if (await customHandleSave(formValue)) {
      await handleClose();
    } else {
      setIsValidForm(false);
    }
  }, [formValue, customHandleSave, handleClose]);

  const updateFormField = useCallback((field: string, value: string) => {
    setFormValue((prev) => ({ ...prev, [field]: value }));
    setIsValidForm(true);
  }, []);

  const modalBodyContent = useMemo(() => {
    return (
      <>
        {Object.entries(formValue).map(([field, val]) => (
          <FormField
            key={field}
            field={field}
            description={formDescriptions[field]}
            value={val}
            updateFormField={updateFormField}
          />
        ))}
      </>
    );
  }, [formDescriptions, formValue, updateFormField]);

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      errorMessage={!isValidForm ? errorMessage : undefined}
      handleClose={handleClose}
      handleConfirm={handleSave}
      body={modalBodyContent}
      confirmButtonText="Save"
      isConfirmButtonDisabled={!isValidForm || !getIsFormFilled(formValue)}
    />
  );
}

function resetForm<T extends Form>(form: T): T {
  const entries = Object.keys(form).map((field) => [field, ""]);
  return Object.fromEntries(entries);
}

function getIsFormFilled(form: Form): boolean {
  return Object.values(form).every((val) => val);
}

function FormField({
  field,
  description,
  value,
  updateFormField,
}: {
  field: string;
  description: string;
  value: string;
  updateFormField: (field: string, value: string) => void;
}): JSX.Element {
  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value.trim();
      updateFormField(field, value);
    },
    [field, updateFormField]
  );
  const inputId = `${field}-input`;

  return (
    <>
      <label htmlFor={inputId}>{description}</label>
      <input
        id={inputId}
        type="text"
        className="border border-gray-500 rounded-lg mt-2 mb-4 px-2 py-1 w-full"
        value={value}
        onChange={handleChange}
      />
    </>
  );
}
