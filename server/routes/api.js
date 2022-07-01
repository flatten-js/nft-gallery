const express = require('express')

const router = express.Router()

router.get('/textures', (req, res) => {
  const textures = [
    {
      target: 'Art001',
      url: 'https://ipfs.io/ipfs/QmUmVe5izyyquk71JE7o9y7NRhWCSd7nqBFNqf3U4YnNMk',
      data: {
        name: 'Bride Girls#1',
        creator_address: '0xeB044ADCF51D2Ffe5AE4a4c6e62c4e38eFd06a47',
        contract_address: '0x2E98069b38C4d8e5c5D995f3fB78D0407Fb8b154',
        token_id: '1',
        description: '"Bride Girls Collection". Illustrator Nae Nae\'s first generative collection. Meet your own fabulous brides!'
      }
    },
    {
      target: 'Art002',
      url: 'https://ipfs.io/ipfs/Qmac1MRbAC83ge4t6g81jfyUbj45jQmnL2PcBcQqv95YaX',
      data: {
        name: 'Bride Girls#31',
        creator_address: '0xeB044ADCF51D2Ffe5AE4a4c6e62c4e38eFd06a47',
        contract_address: '0x2E98069b38C4d8e5c5D995f3fB78D0407Fb8b154',
        token_id: '31',
        description: '"Bride Girls Collection". Illustrator Nae Nae\'s first generative collection. Meet your own fabulous brides!'
      }
    }
  ]
  res.json(textures)
})

module.exports = router
