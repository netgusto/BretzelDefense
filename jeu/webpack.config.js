var path = require('path');

module.exports = {
  node: { fs: "empty" },
  resolve: { fallback: path.join(__dirname, "node_modules") },          // works around webpack's npm link'd modules problem
  resolveLoader: { fallback: path.join(__dirname, "node_modules") },    // works around webpack's npm link'd modules problem
  entry: {
    app: [__dirname + '/src/index.js']
  },
  output: {
    filename: 'bundle.js',
    path: __dirname + '/dist'
  },
  devtool: 'source-map',
  plugins: [],
  module: {
    preLoaders: [{
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    }],
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
    ]
  }
};
