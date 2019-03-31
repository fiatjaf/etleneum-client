/** @format */

import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
  input: 'contract.js',
  output: [
    {
      file: 'etleneum.esm.js',
      format: 'esm'
    },
    {
      file: 'etleneum.cjs.js',
      format: 'cjs'
    }
  ],
  plugins: [resolve(), commonjs()]
}
