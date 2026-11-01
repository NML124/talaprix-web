import baseConfig from '../../eslint.config.mjs';

// The facade only owns src/; each sub-library is linted by its own project.
export default [
  ...baseConfig,
  { ignores: ['data-access/**', 'domain/**', 'feature-auth/**'] },
];
