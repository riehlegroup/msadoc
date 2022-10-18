module.exports = {
  extends: '@jvalue/eslint-config-jvalue/react',
  parserOptions: {
    tsconfigRootDir: __dirname,
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],

      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                group: ['@mui/icons-material', '@mui/icons-material/*'],
                message: `Use the 'Icons' export from 'src/icons.ts' instead.`,
              },
            ],
          },
        ],
      },
    },
  ],
};
