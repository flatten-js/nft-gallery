const express = require('express')

const { mongo } = require('../src/client.js')
const NFT = require('../src/nft.js')

const router = express.Router()

router.get('/owner', (req, res) => {
  res.json(process.env.WALLET_ADDRESS)
})

router.get('/textures', async (req, res) => {
  try {
    await mongo.connect()
    const db = mongo.db('nft-gallery')
    const collection = db.collection('textures')
    const textures = await collection.find().toArray()
    res.json(textures)
  } finally {
    await mongo.close()
    res.end()
  }
})

router.use((req, res, next) => {
  if (req.session.owned) next()
  else res.status(401).send('Unauthorized')
})

router.get('/assets', async (req, res) => {
  const nft = new NFT(NFT.ETHEREUM, process.env.WALLET_ADDRESS)
  const metadata = (await Promise.all([nft.metadata(NFT.ERC721), nft.metadata(NFT.ERC1155)])).flat()
  res.json(metadata)
})

router.post('/texture/add', async (req, res) => {
  try {
    await mongo.connect()
    const db = mongo.db('nft-gallery')
    const collection = db.collection('textures')
    await collection.updateOne({ target: req.body.target }, { $set: req.body }, { upsert: true })
  } finally {
    await mongo.close()
    res.end()
  }
})

router.get('/texture/delete', async (req, res) => {
  try {
    await mongo.connect()
    const db = mongo.db('nft-gallery')
    const collection = db.collection('textures')
    await collection.deleteOne({ target: req.query.target })
  } finally {
    await mongo.close()
    res.end()
  }
})

module.exports = router
