import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import tseslint from "typescript-eslint";

const staticRestrictions = (group, message) => [
  "error",
  { patterns: [{ group, message }] },
];

const dynamicRestriction = (selector, message) => [
  "error",
  { selector, message },
];

export default tseslint.config(
  {
    ignores: ["dist", "dist-electron", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "no-undef": "off",
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
  {
    files: ["src/features/**/ui/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": staticRestrictions(
        ["desktop", "desktop/**", "**/desktop", "**/desktop/**"],
        "Feature UI must not import feature desktop code.",
      ),
      "no-restricted-syntax": dynamicRestriction(
        'ImportExpression[source.value=/^(?:desktop|.*\\/desktop)(?:\\/.*)?$/]',
        "Feature UI must not dynamically import feature desktop code.",
      ),
    },
  },
  {
    files: ["src/features/**/desktop/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": staticRestrictions(
        ["ui", "ui/**", "**/ui", "**/ui/**"],
        "Feature desktop code must not import feature UI.",
      ),
      "no-restricted-syntax": dynamicRestriction(
        'ImportExpression[source.value=/^(?:ui|.*\\/ui)(?:\\/.*)?$/]',
        "Feature desktop code must not dynamically import feature UI.",
      ),
    },
  },
  {
    files: ["src/features/**/contract/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": staticRestrictions(
        [
          "ui", "ui/**", "**/ui", "**/ui/**",
          "desktop", "desktop/**", "**/desktop", "**/desktop/**",
          "platform", "platform/**", "**/platform", "**/platform/**",
        ],
        "Feature contracts must be independent of UI, desktop, and platform code.",
      ),
      "no-restricted-syntax": dynamicRestriction(
        'ImportExpression[source.value=/^(?:ui|desktop|platform|.*\\/(?:ui|desktop|platform))(?:\\/.*)?$/]',
        "Feature contracts must not dynamically import UI, desktop, or platform code.",
      ),
    },
  },
);
