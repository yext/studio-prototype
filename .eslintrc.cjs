module.exports = {
  root: true,
  extends: ["@yext/eslint-config/typescript-react@dev/upgrade-babel-traverse"],
  ignorePatterns: [
    "**/lib",
    "**/build",
    "e2e-tests/tests/__fixtures__/**/*.tsx",
    "packages/studio-plugin/tests/__fixtures__/**/*.tsx",
    "packages/studio-plugin/tests/__fixtures__/StudioConfigs/malformed/studio.config.js",
    ".eslintrc.cjs",
    "**/coverage",
    "*.d.ts",
  ],
  parserOptions: {
    project: ["tsconfig.json"],
  },
  plugins: ["unused-imports"],
  rules: {
    "@typescript-eslint/require-await": "error",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: false,
      },
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/await-thenable": "error",
    "unused-imports/no-unused-imports": "error",
  },
  overrides: [
    {
      files: [
        "**/*.{test,stories}.*",
        "./e2e-tests/**/*",
        "./apps/test-site/**/*",
      ],
      rules: {
        "react-perf/jsx-no-new-array-as-prop": "off",
        "react-perf/jsx-no-new-function-as-prop": "off",
        "react-perf/jsx-no-new-object-as-prop": "off",
        "no-template-curly-in-string": "off",
      },
    },
    {
      files: [
        "**/__fixtures__/**/*.{j,t}s",
        "**/src/siteSettings.ts",
        "**/studio.config.js",
      ],
      rules: {
        "import/no-anonymous-default-export": "off",
        "no-template-curly-in-string": "off",
      },
    },
    {
      files: ["./e2e-tests/**/*"],
      rules: {
        "testing-library/prefer-screen-queries": "off",
      },
    },
    {
      files: ["**/*.js"],
      rules: {
        "tsdoc/syntax": "off",
      },
    },
    {
      files: ["packages/studio-plugin/**/*.ts"],
      rules: {
        "no-restricted-imports": ["warn", "path"],
      },
    },
  ],
};
