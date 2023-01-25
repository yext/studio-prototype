import { useCallback, useRef, useState } from "react";
import { ReactComponent as AddIcon } from "../icons/addcomponent.svg";
import useRootClose from "@restart/ui/useRootClose";
import useStudioStore from "../store/useStudioStore";
import AddElementMenu from "./AddElementMenu/AddElementMenu";
import classNames from "classnames";

/**
 * AddElementButton is a button that when clicked, renders a dropdown menu for
 * adding elements to the page.
 */
export default function AddElementButton(): JSX.Element | null {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useRootClose(containerRef, () => {
    setIsOpen(false);
  });
  const handleClick = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  const activePageState = useStudioStore((store) => {
    return store.pages.getActivePageState();
  });
  const activeModuleState = useStudioStore(
    (store) => store.pages.activeModuleState
  );

  if (!activePageState && !activeModuleState) {
    return null;
  }

  const className = classNames(
    "rounded-md text-gray-700 shadow-md hover:bg-gray-50",
    {
      "bg-gray-200": !isOpen,
      "bg-white": isOpen,
    }
  );

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        className={className}
        onClick={handleClick}
        aria-label="Open Add Element Menu"
      >
        <AddIcon />
      </button>
      {isOpen && <AddElementMenu />}
    </div>
  );
}
