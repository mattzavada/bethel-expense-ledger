const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js",
  output: {
    // Need to use the path module to ensure we provide it a full path and not a relative path (e.g. entry)
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  watch: true,
};
