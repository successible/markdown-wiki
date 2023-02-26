const path = require('path')

/** @typedef {import('webpack').Configuration} WebpackConfig **/
/** @type WebpackConfig */
const extensionConfig = {
  devtool: 'nosources-source-map',
  entry: './src/extension.ts',
  externals: {
    vscode: 'commonjs vscode',
  },
  infrastructureLogging: {
    level: 'log',
  },
  mode: 'none',
  module: {
    rules: [
      {
        exclude: /node_modules/,
        test: /\.ts$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
      },
    ],
  },
  output: {
    filename: 'extension.js',
    libraryTarget: 'commonjs2',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  target: 'node',
}

module.exports = [extensionConfig]
