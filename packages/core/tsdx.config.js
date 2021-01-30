const postcss = require('rollup-plugin-postcss');
const autoprefixer = require('autoprefixer');

module.exports = {
  rollup(config, options) {
    config.treeshake.moduleSideEffects = false;
    config.plugins.push(
      postcss({
        plugins: [
          autoprefixer(),
        ],
        inject: true
      })
    );
    return config;
  },
};