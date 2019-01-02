const path = require("path");
const SizePlugin = require("cds-size-plugin");

module.exports = function override(config, env) {
  config.plugins.push(new SizePlugin());
  return config;
};
