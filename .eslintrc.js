/* eslint-env node */
module.exports = {
  root: true,
  env: {
    browser: true,
    es6: true,
  },
  plugins: ['prettier'],
  extends: ['eslint:recommended', 'plugin:prettier/recommended', 'prettier'],
  rules: {
    quotes: [2, 'single', 'avoid-escape'],
    semi: [2],
    'no-extra-boolean-cast': 'off',
    'no-unused-vars': [
      1,
      {
        ignoreRestSiblings: true,
        argsIgnorePattern: 'res|next|^err',
      },
    ],
    'prettier/prettier': [
      'error',
      {
        trailingComma: 'all',
        singleQuote: true,
        tabWidth: 2,
        semi: true,
        printWidth: 100,
        endOfLine: 'auto',
      },
    ],
  },
  parserOptions: {
    parser: 'babel-eslint',
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
