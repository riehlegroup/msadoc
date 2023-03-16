import rollupCommonjs from '@rollup/plugin-commonjs';
import rollupJson from '@rollup/plugin-json';
import rollupResolve from '@rollup/plugin-node-resolve';
import rollupTypescript from '@rollup/plugin-typescript';

const packageJson = require('./package.json');

function getFieldFromPackageJson(fieldName) {
  const entry = packageJson[fieldName];
  if (entry === undefined) {
    throw Error(`Failed to read field "${fieldName}" from package.json.`);
  }

  return entry;
}

export default [
  {
    input: 'src/cli.ts',
    output: [
      {
        file: getFieldFromPackageJson('module'),
        format: 'esm',
        sourcemap: true,
        // This is necessary for the script to become executable.
        banner: '#!/usr/bin/env node',
      },
    ],
    plugins: [
      rollupCommonjs(),
      rollupJson(),
      rollupResolve({
        preferBuiltins: true,

        // See https://github.com/chalk/chalk/issues/578
        exportConditions: ['node'],
      }),
      rollupTypescript(),
    ],
  },
];
