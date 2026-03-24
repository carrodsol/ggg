// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config')
const expoConfig = require('eslint-config-expo/flat')
const prettierPlugin = require('eslint-plugin-prettier')
const prettierConfig = require('eslint-config-prettier')

module.exports = defineConfig([
  ...expoConfig,
  prettierConfig,
  {
    files: ['**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx'],
    plugins: {
      prettier: prettierPlugin
    },
    rules: {
      'prettier/prettier': 'error',
      'import/no-unresolved': ['error', { ignore: ['^@env$'] }],
      'react/prop-types': 'off',
      'react-hooks/exhaustive-deps': 'off'
    }
  },
  {
    ignores: ['dist/*', 'node_modules/*', 'web-build/*']
  }
])
