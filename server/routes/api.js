const express = require('express')

const router = express.Router()

router.get('/textures', (req, res) => {
  const textures = [
    { name: 'Art001', url: 'https://ipfs.io/ipfs/QmUmVe5izyyquk71JE7o9y7NRhWCSd7nqBFNqf3U4YnNMk' },
    { name: 'Art002', url: 'https://ipfs.io/ipfs/Qmac1MRbAC83ge4t6g81jfyUbj45jQmnL2PcBcQqv95YaX' }
  ]
  res.json(textures)
})

module.exports = router
