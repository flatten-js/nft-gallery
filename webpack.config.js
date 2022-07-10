const CompressionPlugin = require("compression-webpack-plugin")

module.exports = {
  mode: 'development',

  devServer: {
    static: {
      directory: __dirname + '/client/public'
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080'
      }
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
  plugins: [
    new CompressionPlugin()
  ]
}
