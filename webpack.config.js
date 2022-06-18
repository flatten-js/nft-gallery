module.exports = {
  mode: 'development',

  devServer: {
    static: {
      directory: __dirname + '/client/public'
    }
  },
  entry: {
    app: [__dirname + '/client/src']
  },
  output: {
    path: __dirname + '/client/public/assets/js',
    filename: `[name].js`,
    publicPath: '/assets/js/'
  },

  resolve: {
    alias: {}
  },
  plugins: [],
}
