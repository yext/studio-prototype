import ComponentTree from "./ComponentTree";
import Divider from "./common/Divider";
import AddPageButton from "./AddPageButton";
import useStudioStore from "../store/useStudioStore";
import { ReactComponent as Check } from "../icons/check.svg";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import RemovePageButton from "./RemovePageButton";

/**
 * Renders the left panel of Studio, which lists all pages, indicates which
 * page is active, and displays the component tree for that active page. Allows
 * the user to change which page is active and to rearrange the components and
 * modules in the component tree of the active page.
 */
export default function ActivePagePanel(): JSX.Element {
  const { pages, setActivePageName, activePageName, setActiveModuleState } =
    useStudioStore((store) => {
      const { pages, setActivePageName, activePageName, setActiveModuleState } =
        store.pages;
      return { pages, setActivePageName, activePageName, setActiveModuleState };
    });
  const pageNames = useMemo(() => Object.keys(pages), [pages]);

  const renderPageList = useCallback(
    (pageNames: string[]) => {
      return (
        <div className="flex flex-col pb-2 items-stretch">
          {pageNames.map((pageName) => {
            const isActivePage = activePageName === pageName;
            const checkClasses = classNames({
              invisible: !isActivePage,
            });
            function handleSelectPage() {
              setActivePageName(pageName);
              setActiveModuleState(undefined);
            }
            return (
              <div key={pageName} className="flex justify-between pb-4 px-2">
                <div className="flex items-center">
                  <Check className={checkClasses} />
                  <button
                    disabled={isActivePage}
                    onClick={handleSelectPage}
                    className="ml-2"
                  >
                    {pageName}
                  </button>
                </div>
                <RemovePageButton pageName={pageName} />
              </div>
            );
          })}
        </div>
      );
    },
    [activePageName, setActiveModuleState, setActivePageName]
  );

  return (
    <div className="flex flex-col w-1/4 px-4">
      <div className="flex flex-row font-bold py-4 pr-2 justify-between items-center">
        Pages
        <AddPageButton />
      </div>
      {renderPageList(pageNames)}
      <Divider />
      <div className="font-bold mb-3">Layers</div>
      <ComponentTree />
    </div>
  );
}
