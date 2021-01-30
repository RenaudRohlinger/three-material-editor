module.exports = {
  rollup(config, options) {
    config.treeshake.moduleSideEffects = false;
    return config;
  },
};