export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { module: 'readonly', require: 'readonly', console: 'readonly' },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-undef': 'error',
    },
  },
];
