import js from '@eslint/js';
import google from 'eslint-config-google';
import react from 'eslint-plugin-react/configs/recommended.js';
import reactJSXRuntime from 'eslint-plugin-react/configs/jsx-runtime.js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default [
  {ignores: ['dist/']},
  js.configs.recommended,
  google,
  react,
  reactJSXRuntime,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    files: [
      '**/*.js',
      '**/*.jsx',
    ],
    rules: {
      ...reactHooks.configs.recommended.rules,
      'max-len': ['error', {'code': 120}],
    },
  },
];
