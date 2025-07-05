// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import vuePlugin from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default withNuxt([
  {
    ignores: ['.nuxt/**', 'dist/**', '.output/**', '*.min.js', 'coverage/**'],
    plugins: {
      vue: vuePlugin,
    },
    rules: {
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'vue/html-self-closing': 'error',
      'vue/attribute-hyphenation': 'error',
      'vue/no-multiple-template-root': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      'vue/max-attributes-per-line': [
        'error',
        {
          singleline: {
            max: 1,
          },
          multiline: {
            max: 1,
          },
        },
      ],
    },
  },
  prettier,
])
