const express = require('express')

const app = express()

if (process.env.NODE_ENV == 'development') {
  const webpack = require('webpack')
  const webpackDevMiddleware = require('webpack-dev-middleware')
  const webpackHotMiddleware = require('webpack-hot-middleware')

  const config = require('../webpack.config.js')
  config.entry.app.unshift('webpack-hot-middleware/client?reload=true&timeout=1000')
  config.plugins.push(new webpack.HotModuleReplacementPlugin())

  const compiler = webpack(config)
  app.use(webpackDevMiddleware(compiler))
  app.use(webpackHotMiddleware(compiler))
}

app.use(express.static('./client/public'))

app.listen(8080, () => console.log('running...'))