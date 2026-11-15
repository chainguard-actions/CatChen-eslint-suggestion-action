// Alternate config used via the config-path input: turns every rule off so
// even bad.js passes. Proves config-path overrides eslint.config.mjs.
export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
    },
    rules: {},
  },
];
