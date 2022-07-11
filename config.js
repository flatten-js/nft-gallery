const env = process.env.NODE_ENV == 'production' ? '.env.prod' : '.env'
const config = require('dotenv').config({ path: `${__dirname}/${env}` })
require('dotenv-expand').expand(config)
