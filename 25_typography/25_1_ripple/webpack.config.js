const path = require("path");

module.exports = {
  mode: 'production',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public")
  },
  performance: {
    maxEntrypointSize: 800000,
    maxAssetSize: 800000,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
  },
};