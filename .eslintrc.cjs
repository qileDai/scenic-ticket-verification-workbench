module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['@typescript-eslint', 'solid'],
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', 'plugin:solid/typescript'],
  settings: {
    solid: {
      version: 'detect'
    }
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'solid/prefer-for': 'off',
    'solid/reactivity': 'off'
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx']
    }
  ]
}
