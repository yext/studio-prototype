import { useState, useCallback } from "react";
import ElementSelector from "./ElementSelector";
import renderIconForType from "../common/renderIconForType";

export enum ElementType {
  Components = "Components",
  Containers = "Containers",
  Layouts = "Layouts",
}
/**
 * A menu for adding elements to the page.
 */
export default function AddElementMenu({
  closeMenu,
}: {
  closeMenu: () => void;
}): JSX.Element {
  const [activeType, setType] = useState<ElementType>(ElementType.Components);

  return (
    <div className="absolute z-20 rounded bg-white text-sm text-gray-700 shadow-lg">
      <ElementTypeSwitcher activeType={activeType} setType={setType} />
      <ElementSelector activeType={activeType} afterSelect={closeMenu} />
    </div>
  );
}

function ElementTypeSwitcher(props: {
  activeType: ElementType;
  setType: (elementType: ElementType) => void;
}) {
  const { activeType, setType } = props;
  return (
    <div className="flex px-4 pt-2 border-b">
      {Object.values(ElementType).map((elementType) => {
        return (
          <ElementTypeButton
            key={elementType}
            elementType={elementType}
            isActiveType={elementType === activeType}
            handleClick={setType}
          />
        );
      })}
    </div>
  );
}

function ElementTypeButton(props: {
  isActiveType: boolean;
  elementType: ElementType;
  handleClick: (type: ElementType) => void;
}) {
  const { isActiveType, elementType, handleClick } = props;
  const onClick = useCallback(() => {
    handleClick(elementType);
  }, [elementType, handleClick]);
  return (
    <button
      className="p-2 mx-2 flex items-center border-b-2 border-transparent disabled:border-blue-600"
      onClick={onClick}
      disabled={isActiveType}
    >
      <span className="mr-2 pt-0.5">{renderIconForType(elementType)}</span>
      <span>{elementType}</span>
    </button>
  );
}
