const express = require('express')

const { mongo } = require('../src/client.js')

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
  }
})

router.use((req, res, next) => {
  if (req.session.owned) next()
  else res.status(401).send('Unauthorized')
})

router.get('/assets', async (req, res) => {
  const assets = [
    {
      "url": "https://ipfs.io/ipfs/QmUmVe5izyyquk71JE7o9y7NRhWCSd7nqBFNqf3U4YnNMk",
      "data": {
          "name": "Bride Girls#1",
          "creator_address": "0xeB044ADCF51D2Ffe5AE4a4c6e62c4e38eFd06a47",
          "contract_address": "0x2E98069b38C4d8e5c5D995f3fB78D0407Fb8b154",
          "token_id": "1",
          "description": "\"Bride Girls Collection\". Illustrator Nae Nae's first generative collection. Meet your own fabulous brides!"
      }
    },
    {
      "url": "https://ipfs.io/ipfs/Qmac1MRbAC83ge4t6g81jfyUbj45jQmnL2PcBcQqv95YaX",
      "data": {
          "name": "Bride Girls#31",
          "creator_address": "0xeB044ADCF51D2Ffe5AE4a4c6e62c4e38eFd06a47",
          "contract_address": "0x2E98069b38C4d8e5c5D995f3fB78D0407Fb8b154",
          "token_id": "31",
          "description": "\"Bride Girls Collection\". Illustrator Nae Nae's first generative collection. Meet your own fabulous brides!"
      }
    }
  ]

  res.json(assets)
})

module.exports = router
