const path = require("path");
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: "./src/index.js",
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "public")
  },
  plugins: [
    new webpack.optimize.LimitChunkCountPlugin({
      // Make generated files only 1
      maxChunks: 1,
    }),
  ],
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