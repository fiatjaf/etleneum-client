/** @format */

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
  input: 'index.js',
  output: [
    {
      file: 'lib/etleneum.esm.js',
      format: 'esm'
    },
    {
      file: 'lib/etleneum.cjs.js',
      format: 'cjs'
    }
  ],
  plugins: [resolve(), commonjs()]
}
