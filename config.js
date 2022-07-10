const env = process.env.NODE_ENV == 'production' ? '.env.prod' : '.env'
require('dotenv').config({ path: `${__dirname}/${env}` })
