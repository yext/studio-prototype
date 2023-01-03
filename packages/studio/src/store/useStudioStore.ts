import create, { StateCreator } from "zustand";
import { withLenses, lens } from "@dhmk/zustand-lens";
import { immer } from "zustand/middleware/immer";
import { enableMapSet } from "immer";
import { temporal } from "zundo";
import { throttle, isEqual } from "lodash";

import { StudioStore } from "./models/store";
import createFileMetadataSlice from "./slices/createFileMetadataSlice";
import createPageSlice from "./slices/createPageSlice";
import createSiteSettingSlice from "./slices/createSiteSettingsSlice";
import { getUserUpdatableStore } from "./utils";

enableMapSet();

/**
 * Middleware used for the Studio store, specifically immer and Zundo.
 */
function storeMiddleware(
  storeCreator: StateCreator<StudioStore>
): ReturnType<
  typeof temporal<StudioStore, [], [["zustand/immer", never]], StudioStore>
> {
  return temporal(immer(storeCreator), {
    equality: (currStore, pastStore) =>
      isEqual(
        getUserUpdatableStore(currStore),
        getUserUpdatableStore(pastStore)
      ),
    handleSet: (handleSet) => throttle(handleSet, 500),
  });
}

/**
 * Studio's state manager in form of a hook to access and update states.
 */
const useStudioStore = create<StudioStore>()(
  storeMiddleware(
    withLenses(() => ({
      fileMetadatas: lens(createFileMetadataSlice),
      pages: lens(createPageSlice),
      siteSettings: lens(createSiteSettingSlice),
    }))
  )
);
export default useStudioStore;
