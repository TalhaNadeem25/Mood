import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Disable specific rules here
      //"@typescript-eslint/no-unused-vars": "warn", // Change from error to warn
      "@typescript-eslint/no-explicit-any": "off", // Disable any warnings
      "no-var": "off", // Allow var declarations

      'react/no-unescaped-entities': 'off',
      '@next/next/no-page-custom-font': 'off',
      
      // Next.js specific rules
      "@next/next/no-html-link-for-pages": "off",
      "react/no-unescaped-entities": "off",
      
      // Add any other custom rules you want to modify
    },
  },
];

export default eslintConfig;