module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin', 'prettier'],
  extends: [
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    "sort-imports": [
      true,
      {
        "import-sources-order": "case-insensitive",
        "named-imports-order": "case-insensitive",
        "grouped-imports": true,
        "module-source-path": "basename",
        "groups": [
          { "match": "^@user", "order": 30 },
          { "name": "parent_dir", "match": "^[.][.]", "order": 40 },
          { "name": "current dir", "match": "^[.\/].*", "order": 50 },
          {
            "name": "node_modules",
            "match": ".*|^@(nestjs)",
            "order": 1
          }
        ]
      }
    ],
    "max-line-length": [true, 150],
    "member-ordering": [false],
    "interface-name": [false],
    "arrow-parens": false,
    "object-literal-sort-keys": false
  },
  overrides: [
    {
      files: ['*.js'],
      parser: 'babel-eslint',
      rules: {
        '@typescript-eslint/no-var-requires': 0,
        // '@typescript-eslint/explicit-member-accessibility': 0,
      },
    },
  ],
};
