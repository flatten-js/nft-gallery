const { MongoClient } = require('mongodb')
const axios = require('axios')

exports.mongo = new MongoClient(process.env.MONGO_URL)

exports.axios = axios.create({})

exports.etherscan = {
  _: axios.create({
    baseURL: 'https://api.etherscan.io/api',
    params: {
      apiKey: process.env.ETHERSCAN_APIKEY
    }
  }),
  get(params) {
    return this._.get('', { params })
  }
}

exports.polygonscan = {
  _: axios.create({
    baseURL: 'https://api.polygonscan.com/api',
    params: {
      apiKey: process.env.POLYGONSCAN_APIKEY
    }
  }),
  get(params) {
    return this._.get('', { params })
  }
}
