const express = require('express')
const Web3 = require('web3')
const { v4: uuidv4 } = require('uuid')

const router = express.Router()

const web3 = new Web3()
let nonce = uuidv4()

router.get('/nonce', (req, res) => {
  const address = web3.utils.toChecksumAddress(req.query.address)
  if (address == req.app.locals.address) res.json(nonce)
  else res.end()
})

router.get('/verify', async (req, res) => {
  const address = web3.eth.accounts.recover(`Nonce: ${nonce}`, req.query.sign)
  if (address == req.app.locals.address) {
    req.session.owned = true
    nonce = uuidv4()
    res.json(true)
  } else {
    res.status(401).send('Verification failed')
  }
})

router.get('/signout', (req, res) => {
  req.session.destroy()
  res.end()
})

module.exports = router
