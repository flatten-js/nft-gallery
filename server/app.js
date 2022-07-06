const express = require('express')
const session = require('express-session')

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

app.use(express.json())
app.use(session({ secret: process.env.SESSION_SECRET }))

app.use(express.static('./client/public'))

app.use('/api/auth', require('./routes/auth.js'))
app.use('/api', require('./routes/api.js'))

app.listen(8080, () => console.log('running...'))
