const express = require('express')
const session = require('express-session')

const { mongo } = require('./src/client.js')

const app = express()

app.get('/assets/js/*.js', (req, res, next) => {
  req.url += '.gz'
  res.set('Content-Encoding', 'gzip')
  res.set('Content-Type', 'text/javascript')
  next()
})

app.use(express.json())
app.use(session({ secret: process.env.SESSION_SECRET }))

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

app.use('/api/auth', require('./routes/auth.js'))
app.use('/api', require('./routes/api.js'))

app.locals.db_connect = async () => { await mongo.connect(); return await mongo.db('nft-gallery') }
app.locals.db_connect().then(db => {
  app.locals.db = db
  const port = process.env.PORT || 8080
  app.listen(port, () => console.log('running...'))
})
