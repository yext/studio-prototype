import type { Config } from "tailwindcss";
import {
  StudioTailwindConfig,
  StudioTailwindTheme,
  STUDIO_PROCESS_ARGS_OBJ,
  CliArgs,
} from "@yext/studio-plugin";
import path from "path";
import fs from "fs";

const getRootDir = (): string => {
  const cliArgs: CliArgs = JSON.parse(
    process.env[STUDIO_PROCESS_ARGS_OBJ] as string
  );
  return cliArgs.root ?? process.cwd();
};
const rootDir = getRootDir();

/**
 * The user's StudioTailwindTheme.
 */
const userTailwindConfig: StudioTailwindConfig | undefined = (() => {
  try {
    const tailwindConfigPath = path.resolve(rootDir, "tailwind.config.ts");
    if (fs.existsSync(tailwindConfigPath)) {
      // We have to use require() instead of a dynamic import because
      // tailwind does not support async config.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tailwindConfig: StudioTailwindConfig = require(tailwindConfigPath);
      return tailwindConfig;
    }
  } catch (e) {
    console.error(e);
  }
})();
const userTailwindTheme: StudioTailwindTheme =
  userTailwindConfig?.theme?.extend ?? {};

/**
 * Generates a safelist for custom test colors, background colors, and font sizes.
 */
const generateSafelist = (theme: StudioTailwindTheme): string[] => {
  const customColors = Object.keys(theme?.colors ?? {});
  const customFontSizes = Object.keys(theme?.fontSize ?? {});
  return [
    ...customFontSizes.map((size) => `text-${size}`),
    ...customColors.flatMap((color) => [`bg-${color}`, `text-${color}`]),
  ];
};

/**
 * The portion of the content array that gets styles from the user's repo.
 * If the user did not specify a tailwind config, default to all styles under the src dir.
 */
const transformedUserContent = (
  userTailwindConfig?.content ?? [path.resolve(rootDir, "src/**/*.{ts,tsx}")]
).map((filepath) => {
  if (path.isAbsolute(filepath)) {
    return filepath;
  }
  return path.join(rootDir, filepath);
});

export default {
  content: [
    path.resolve(__dirname, "src/**/*.{ts,tsx}"),
    path.resolve(__dirname, "index.html"),
    ...transformedUserContent,
  ],
  safelist: generateSafelist(userTailwindTheme),
  theme: {
    extend: userTailwindTheme,
  },
} satisfies Config;
