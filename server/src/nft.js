const Web3 = require('web3')

const { axios, etherscan } = require('./client.js')

class NFT {
  static ETHEREUM = 'mainnet'

  static ERC721 = 'ERC721'
  static ERC1155 = 'ERC1155'

  static mapping = {
    method: {
      [NFT.ERC721]: 'tokenURI',
      [NFT.ERC1155]: 'uri'
    },
    abi: {
      [NFT.ERC721]: [{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"tokenURI","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}],
      [NFT.ERC1155]: [{"inputs":[{"internalType":"uint256","name":"id","type":"uint256"}],"name":"uri","outputs":[{"internalType":"string","name":"","type":"string"}],"stateMutability":"view","type":"function"}]
    }
  }

  constructor(network, address) {
    this.web3 = new Web3(`https://${network}.infura.io/v3/${process.env.INFURA_PROJECTID}`)
    this.address = address
  }

  async _nft(token = NFT.ERC721) {
    try {
      const mapping = { [NFT.ERC721]: 'nft', [NFT.ERC1155]: '1155' }
      const action = `token${mapping[token]}tx`
      const { data } = await etherscan.get({ module: 'account', action, address: this.address })
      return data.result.reduce((acc, cur) => {
        const address = cur.contractAddress
        return { ...acc, [address]: [...(acc[address] || []), { from: cur.from, id: cur.tokenID }] }
      }, {})
    } catch (e) {
      console.error(e)
      return []
    }
  }

  async tokenURI(contract, id, token = NFT.ERC721) {
    try {
      const method = NFT.mapping.method[token]
      const uri = await contract.methods[method](id).call()
      return uri.replace('ipfs://', 'https://ipfs.io/ipfs/')
    } catch (e) {
      console.error(e)
      return ''
    }
  }

  async _metadata(contract, id, token = NFT.ERC721) {
    try {
      const uri = await this.tokenURI(contract, id, token)
      const { data: metadata } = await axios.get(uri)
      return { ...metadata, image: metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/') }
    } catch (e) {
      console.error(e)
      return {}
    }
  }

  async metadata(token = NFT.ERC721) {
    const _nft = await this._nft(token)
    return await Object.keys(_nft).reduce(async (acc, cur) => {
      const contract = new this.web3.eth.Contract(NFT.mapping.abi[token], cur)
      const metadata = await Promise.all(_nft[cur].map(async data => ({
        ...(await this._metadata(contract, data.id, token)),
        creator_address: data.from,
        contract_address: cur,
        token_id: data.id
      })))
      return [...(await acc), ...metadata]
    }, [])
  }
}

module.exports = NFT
