import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import betterTailwindcss from 'eslint-plugin-better-tailwindcss';
import tseslint from 'typescript-eslint';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'better-tailwindcss': betterTailwindcss,
    },
    settings: {
      'better-tailwindcss': { entryPoint: 'src/index.css' },
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      'better-tailwindcss/no-deprecated-classes': 'warn',
      'better-tailwindcss/no-conflicting-classes': 'warn',
    },
  },
]);
