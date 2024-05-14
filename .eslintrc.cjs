module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: 'airbnb-base',
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'import/extensions': 'off',
    'object-curly-newline': 'off',
    strict: 'off',
    'no-plusplus': 'off',
    'import/no-extraneous-dependencies': 'off',
    // 'max-len': 'off',
    // endOfLine: 'auto',
  },
};
