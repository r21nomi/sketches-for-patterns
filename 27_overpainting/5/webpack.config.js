const path = require("path")
const webpack = require('webpack')
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin')

module.exports = {
  mode: 'production',
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(vert|frag)$/i,
        use: ['raw-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin({configFile: './tsconfig.json'})]
  },
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
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 8080,
  },
}