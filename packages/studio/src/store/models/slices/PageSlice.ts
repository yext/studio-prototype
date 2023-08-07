import {
  ComponentState,
  ErrorPageState,
  GetPathVal,
  ModuleMetadata,
  PageState,
  StreamScope,
} from "@yext/studio-plugin";
import DOMRectProperties from "../DOMRectProperties";

export interface PagesRecord {
  [pageName: string]: PageState;
}

export interface PageSliceStates {
  /** All constructed pages that can be preview in Studio. */
  pages: PagesRecord;
  /** All pages that cannot be previewed in Studio due to some parsing error. */
  errorPages: Record<string, ErrorPageState>;
  /** The name of the current page display in Studio. */
  activePageName: string | undefined;
  /** The uuid of the current component display in Studio. */
  activeComponentUUID?: string;
  /** The entity file whose data is seeding the active preview page. */
  activeEntityFile?: string;
  /**
   * A map of the file name to entity data for the entities that can be used
   * to seed the active preview page.
   */
  activePageEntities?: Record<string, Record<string, unknown>>;
  /** The uuids of the currently selected components in Studio (including the active component). */
  selectedComponentUUIDs: string[];
  /** The DOMRects of the currently selected components in Studio (including the active component). */
  selectedComponentRects: DOMRectProperties[];
  /**
   * The part of state that tracks which pages have been interacted with from
   * the UI and have changes pending on commit.
   */
  pendingChanges: {
    /** The names of pages that need to be removed from the user's file system. */
    pagesToRemove: Set<string>;
    /**
     * The names of pages (new or existing) that need to be updated in the
     * user's file system.
     */
    pagesToUpdate: Set<string>;
  };
  /**
   * The {@link ComponentState.uuid} for the module currently being edited, if it exists.
   */
  moduleUUIDBeingEdited?: string;
}

interface PageSliceActions {
  addPage: (pageName: string, page: PageState) => void;
  removePage: (filepath: string) => void;

  setActivePage: (pageName: string | undefined) => void;
  getActivePageState: () => PageState | undefined;
  setComponentTreeInPage: (
    pageName: string,
    componentTree: ComponentState[]
  ) => void;
  updateGetPathValue: (pageName: string, getPathValue: GetPathVal) => void;
  updateStreamScope: (pageName: string, newStreamScope: StreamScope) => void;
  updateEntityFiles: (pageName: string, entityFiles: string[]) => void;

  setActiveComponentUUID: (activeComponentUUID: string | undefined) => void;
  setModuleUUIDBeingEdited: (moduleStateUUID: string | undefined) => void;

  setActiveEntityFile: (activeEntityFile?: string) => void;
  updateActivePageEntities: (parentFolder: string) => Promise<void>;
  getActiveEntityData: () => Record<string, unknown> | undefined;

  addSelectedComponentUUID: (selectedUUID: string) => void;
  addSelectedComponentRect: (rect: DOMRectProperties) => void;
  clearSelectedComponents: () => void;
  addShiftSelectedComponentUUIDs: (selectedComponent: ComponentState) => void;

  clearPendingChanges: () => void;
  detachAllModuleInstances: (metadata: ModuleMetadata) => void;
}

/**
 * Maintains information about pages and components parsed by Studio plugin
 * and composed by user through Studio, including the active page and component
 * state on preview.
 */
type PageSlice = PageSliceStates & PageSliceActions;
export default PageSlice;
