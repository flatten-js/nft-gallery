const { MongoClient } = require('mongodb')
const axios = require('axios')

const {
  MONGO_HOST,
  MONGO_PORT,
  MONGO_USERNAME,
  MONGO_PASSWORD
} = process.env

const mongo_url = `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`
exports.mongo = new MongoClient(mongo_url)

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
