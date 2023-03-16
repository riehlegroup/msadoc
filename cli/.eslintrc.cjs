module.exports = {
  extends: '@jvalue/eslint-config-jvalue',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2022,
    tsconfigRootDir: __dirname,
  },

  overrides: [
    {
      files: ['*.ts'],

      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['commander'],
                message: `Import from '@commander-js/extra-typings' instead.`,
              },
            ],
          },
        ],
      },
    },
  ],
};
