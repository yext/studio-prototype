import { UserPaths } from "./UserPaths.js";

/**
 * User configurations for Studio. Expected to be defined in
 * "studio.config.js" file of the user's project root folder.
 */
export interface StudioConfig {
  /**
   * Indicates if the user's repo is a PagesJS repository.
   * Default to false.
   */
  isPagesJSRepo?: boolean;
  /**
   * Filepaths that Studio will use for parsing files.
   * Default to:
   * \{
   *  components:   `{pathToUserProjectRoot}/src/components`
   *  pages:        `{pathToUserProjectRoot}/src/pages`
   *  modules:      `{pathToUserProjectRoot}/src/modules`
   *  siteSettings: `{pathToUserProjectRoot}/src/siteSettings.ts`
   *  localData:    `{pathToUserProjectRoot}/localData`
   * \}
   */
  paths?: Partial<UserPaths>;
  /** The port number for studio to run on. Defaults to 8080. */
  port?: number;
}

/** The StudioConfig merged with defaults. */
export type StudioConfigWithDefaulting = StudioConfig & StudioConfigDefaults;

/** The default configuration we apply. */
export type StudioConfigDefaults = {
  isPagesJSRepo: boolean;
  paths: UserPaths;
  port: number;
};
