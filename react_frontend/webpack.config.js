module.exports = {
  module: {
    rules: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader"
        }
      }
    ]
  },

  resolve: {
    extensions: ['*', '.js', '.jsx', '.css'],  
  }
};
