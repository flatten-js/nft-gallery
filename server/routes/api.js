const express = require('express')

const { mongo } = require('../src/client.js')

const router = express.Router()

router.get('/textures', async (req, res) => {
  try {
    await mongo.connect()
    const db = mongo.db('nft-gallery')
    const collection = db.collection('textures')
    const textures = await collection.find().toArray()
    res.json(textures)
  } finally {
    await mongo.close()
  }
})

router.use((req, res, next) => {
  if (req.session.owned) next()
  else res.status(401).send('Unauthorized')
})

router.get('/assets', async (req, res) => {
  // Do
  res.json({})
})

module.exports = router
