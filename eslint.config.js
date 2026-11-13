import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'coverage', 'src/types/openapi.ts'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    files: [
      'src/components/features/CommandPalette.tsx',
      'src/context/AuthContext.tsx',
      'src/context/ConfirmContext.tsx',
      'src/context/NotificationContext.tsx',
      'src/context/ThemeContext.tsx',
    ],
    rules: {
      // These modules intentionally colocate their provider/component and hook APIs.
      'react-refresh/only-export-components': 'off',
    },
  },
)
