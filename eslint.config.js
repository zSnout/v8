// @ts-check

import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

export default [
  { files: ["**/*.{js,mjs,cjs,ts,astro,tsx,jsx}"] },
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  pluginJs.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        /* @ts-expect-error dirname isn't typed for some reason */ /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "error",
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
      "dot-notation": "off",
      "@typescript-eslint/dot-notation": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        {
          checksVoidReturn: {
            arguments: false,
          },
        },
      ],
    },
  },
]
