export interface CliArgs {
  // The port to run studio on.
  port?: string;
  // The project root for studio.
  root?: string;
  // Whether or not to run Studio in React Strict Mode
  strict?: boolean;
  // Any arguments present after double dashes when invoking studio, e.g.
  // `npx studio -- args like these` will result in ['args', 'like', 'these']
  // Not currently used for anything but always provided by the cac package
  "--"?: string[];
}
