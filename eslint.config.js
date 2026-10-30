const js = require("@eslint/js");
const { fixupConfigRules, fixupPluginRules } = require("@eslint/compat");
const globals = require("globals");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const checkFile = require("eslint-plugin-check-file");
const shopify = require("@shopify/eslint-plugin");
const importPlugin = require("eslint-plugin-import");
const react = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");
const prettier = require("eslint-plugin-prettier/recommended");

const PASCAL_CASE = "*([A-Z]*([a-z0-9]))";
const CAMEL_CASE = "+([a-z])*([a-z0-9])*([A-Z]*([a-z0-9]))";
const SHARED_MODULES = [
  "./shared",
  "./test",
  "./ticket-fields",
  "./flash-notifications",
];

module.exports = [
  { ignores: ["assets/**"] },
  js.configs.recommended,
  ...tseslint.configs["flat/recommended"],
  ...fixupConfigRules([
    importPlugin.flatConfigs.recommended,
    importPlugin.flatConfigs.typescript,
    react.configs.flat.recommended,
    react.configs.flat["jsx-runtime"],
    reactHooks.configs.flat.recommended,
  ]),
  prettier,
  {
    languageOptions: {
      parser: tsParser,
      globals: { ...globals.browser },
    },
    plugins: {
      "check-file": fixupPluginRules(checkFile),
      "@shopify": fixupPluginRules(shopify),
    },
    settings: {
      "import/resolver": {
        typescript: true,
        node: true,
      },
      react: {
        version: "19",
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",
      "check-file/folder-naming-convention": [
        "error",
        { "src/**/": "KEBAB_CASE" },
      ],
      "check-file/filename-naming-convention": [
        "error",
        {
          "src/**/*.{js,ts,tsx}": `@(${CAMEL_CASE}|${PASCAL_CASE})`,
        },
        {
          ignoreMiddleExtensions: true,
        },
      ],
      "@shopify/jsx-no-hardcoded-content": [
        "warn",
        {
          checkProps: ["title", "aria-label"],
          modules: {
            "@zendeskgarden/react-tooltips": {
              Tooltip: { checkProps: ["content"] },
            },
            "react-i18next": {
              Trans: { allowStrings: true },
            },
          },
        },
      ],
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/modules/approval-requests",
              from: "./src/modules",
              except: ["./approval-requests", ...SHARED_MODULES],
            },
            {
              target: "./src/modules/new-request-form",
              from: "./src/modules",
              except: ["./new-request-form", ...SHARED_MODULES],
            },
            {
              target: "./src/modules/service-catalog",
              from: "./src/modules",
              except: ["./service-catalog", ...SHARED_MODULES],
            },
            ...SHARED_MODULES.map((module) => ({
              target: `./src/modules/${module.slice(2)}`,
              from: "./src/modules",
              except: SHARED_MODULES,
            })),
          ],
        },
      ],
      // eslint-plugin-react-hooks v5's rewritten `recommended` config (needed for
      // the eslint 8->9 upgrade) added several new React Compiler-era rules as
      // errors. Most of the codebase already passes them, but these two catch
      // real, pre-existing patterns (19 + 8 call sites) that aren't safe to
      // silently rewrite in a dependency-upgrade PR. Downgraded to warn pending a
      // dedicated cleanup pass; see PLAN.md.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
    },
  },
];
