import js from "@eslint/js";
import prettierPlugin from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tsEslint from "typescript-eslint";
import { globalIgnores } from "eslint/config";
import onlyWarn from "eslint-plugin-only-warn";

export default tsEslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
    },
    plugins: {
      prettier: prettierPlugin,
      turbo: turboPlugin,
      onlyWarn,
    },
    extends: [js.configs.recommended, tsEslint.configs.recommended],
  },
  prettierConfig,
]);
