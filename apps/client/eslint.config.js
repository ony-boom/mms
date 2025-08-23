import globals from "globals";
import base from "@repo/eslint-config/base";
import tsEslint from "typescript-eslint";

import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tsEslint.config([
  {
    extends: [
      base,
      reactRefresh.configs.vite,
      reactHooks.configs["recommended-latest"],
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
]);
