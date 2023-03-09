/**
 * @license
 * Copyright 2019 Ludan Stoecklé
 * SPDX-License-Identifier: Apache-2.0
 */

import commonjs from '@rollup/plugin-commonjs';

export default {
  input: 'dist/index.js',
  inlineDynamicImports: true,
  treeshake: false,
  //external: ['fs', 'path'],
  output: {
    file: 'dist/rosaenlg-packager-bundle.js',
    format: 'umd',
    //exports: 'named',
    name: 'rosaenlgPackager',
    /*
    globals: {
      fs: 'fs',
      path: 'path',
    },
    */
  },
  plugins: [commonjs()],
};
