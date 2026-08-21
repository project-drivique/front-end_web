import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Estos efectos inicializan estado a partir de almacenamiento, rutas o
      // respuestas asíncronas; son sincronizaciones deliberadas de la app.
      'react-hooks/set-state-in-effect': 'off',
      // LandingContext exporta el Provider y su hook de consumo juntos.
      'react-refresh/only-export-components': 'off',
    },
  },
])
