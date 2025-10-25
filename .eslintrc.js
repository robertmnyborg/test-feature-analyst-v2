module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  env: {
    browser: true,
    node: true,
    es2022: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // TypeScript specific rules
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-non-null-assertion': 'warn',

    // General rules
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'error',
    'no-var': 'error',
  },
  overrides: [
    {
      // Frontend-specific rules
      files: ['frontend/src/**/*.{ts,tsx}'],
      env: {
        browser: true,
        node: false,
      },
      rules: {
        'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
      },
    },
    {
      // Backend-specific rules
      files: ['backend/src/**/*.ts'],
      env: {
        browser: false,
        node: true,
      },
      rules: {
        'no-console': 'off', // Console allowed in backend
      },
    },
  ],
};
