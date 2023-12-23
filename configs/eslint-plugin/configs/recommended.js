module.exports = {
  env: {
    es2020: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:prettier/recommended',
    'plugin:eslint-comments/recommended',
    'plugin:import/recommended',
    'plugin:mocha/recommended',
    'plugin:promise/recommended',
    'plugin:sonarjs/recommended',
  ],
  overrides: [
    {
      files: ['.eslintrc.js'],
      rules: {
        'filenames/match-regex': 'off',
      }
    },
    {
      files: ['*.spec.js', '*.spec.ts'],
      rules: {
        'sonarjs/no-identical-functions': 'off',
        'sonarjs/no-duplicate-string': 'off',
        'filenames/match-regex': 'off',
      }
    }
  ],
  plugins: [
    'eslint-comments',
    'filenames',
    'import',
    'mocha',
    'prettier',
    'promise',
    'sonarjs',
  ],
  rules: {
    'no-console': 'error',
    'no-eval': 'error',
    'no-duplicate-imports': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-template': 'error',
    'sort-imports': 'error',
    'yoda': 'error',
    'filenames/match-regex': ['error', '^[a-z0-9-]+$'],
    'promise/prefer-await-to-callbacks': 'error',
    'promise/prefer-await-to-then': 'error',
    'mocha/no-exclusive-tests': 'error',
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.ts'],
      },
    },
  }
}
