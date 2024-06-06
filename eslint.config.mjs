import globals from 'globals'
import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // General
      'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      'semi': ['error', 'never'],
      'object-curly-spacing': ['error', 'always'],

      // TypeScript
      '@typescript-eslint/consistent-type-imports': 'error',

    }
  }
]
