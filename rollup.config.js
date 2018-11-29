import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import bundleSize from 'rollup-plugin-filesize';
import resolve from 'rollup-plugin-node-resolve';
import pkg from './package.json';
import serve from 'rollup-plugin-serve'

const external = Object.keys(pkg.dependencies);
const extensions = ['.js', '.vue'];
const isProduction = !process.env.ROLLUP_WATCH;
const globals = { vue: 'Vue' };

const lintOpts = {
  extensions,
  exclude: ['**/*.json'],
  cache: true,
  throwOnError: true
};

const plugins = [
  resolve(),
//  eslint(lintOpts),
  bundleSize(),
  vue({
    template: {
      isProduction,
      compilerOptions: { preserveWhitespace: false }
    },
    css: true,
  }),
  babel(),
  serve()
];

export default {
  external,
  plugins,
  input: 'src/main.js',
  output: {
    globals,
    file: 'dist/bundle.js',
    format: 'umd'
  },
};
