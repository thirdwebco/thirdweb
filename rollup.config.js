import typescript from 'rollup-plugin-typescript2';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import injectProcessEnv from 'rollup-plugin-inject-process-env';
import { terser } from "rollup-plugin-terser";

const pkg = require('./package.json');

// The virtual id for our shared "process" mock. We prefix it with \0 so that other plugins ignore it
const INJECT_PROCESS_MODULE_ID = '\0inject-process';

export default {
    input: './src/thirdweb.ts',
    output: [{
      name: `thirdweb`,
      file: `dist/thirdweb-${pkg.version}.es.js`,
      format: 'es',
      sourcemap: true
    }, {
      name: `thirdweb`,
      file: `dist/thirdweb-${pkg.version}.js`,
      format: 'umd',
      sourcemap: true
    }, {
      name: `thirdweb`,
      file: `dist/thirdweb-${pkg.version}.min.js`,
      format: 'umd',
      sourcemap: false
    }, {
      name: `thirdweb`,
      file: `example/js/thirdweb.js`,
      format: 'umd',
      sourcemap: true
    }],
    watch: {
      include: 'src/**',
    },
    plugins: [
        typescript(),
        resolve({
          main: true,
          browser: true,
        }),
        commonjs(),
        injectProcessEnv({ 
          NODE_ENV: 'production',
        }),
        terser({
          include: [/^.+\.min\.js$/],
        }),
    ]
}