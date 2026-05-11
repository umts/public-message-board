import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist']),
  {languageOptions: { globals: globals.browser }},
  js.configs.recommended,
  reactHooks.configs.flat.recommended,
  reactRefresh.configs.recommended,
])
