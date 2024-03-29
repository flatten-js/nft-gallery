const Web3 = require('web3')

const { axios, etherscan, polygonscan } = require('./client.js')

class NFT {
  static ETHEREUM = 'mainnet'
  static POLYGON = 'polygon-mainnet'

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

  static IPFS_GATEWAY = 'cloudflare-ipfs.com'

  constructor(network, address) {
    this.network = network
    this.address = address.toLowerCase()

    const { url, client } = this._network(network)
    this.web3 = new Web3(url)
    this.client = client
  }

  _network(network) {
    switch (network) {
      case NFT.POLYGON:
        return {
          url: 'https://polygon-rpc.com/',
          client: polygonscan
        }

      default:
        return {
          url: `https://${network}.infura.io/v3/${process.env.INFURA_PROJECTID}`,
          client: etherscan
        }
    }
  }

  _owned_nft(txs, _data = {}) {
    if (!txs.length) return _data

    const [tx] = txs
    const { contractAddress, tokenID } = tx

    const { in: _in, out, _tx, _txs } = txs.reduce((acc, cur) => {
      if (cur.contractAddress != contractAddress || cur.tokenID != tokenID) return { ...acc, _txs: [...acc._txs, cur] }
      if (cur.to != this.address) return { ...acc, out: acc.out + 1 }
      return { ...acc, in: acc.in + 1, _tx: cur }
    }, { in: 0, out: 0, _tx: {}, _txs: [] })

    if (out < _in) {
      _data = { ..._data, [contractAddress]: [...(_data[contractAddress] || []), _tx] }
    }

    return this._owned_nft(_txs, _data)
  }

  async _nft(token = NFT.ERC721) {
    try {
      const mapping = { [NFT.ERC721]: 'nft', [NFT.ERC1155]: '1155' }
      const action = `token${mapping[token]}tx`
      const { data } = await this.client.get({ module: 'account', action, address: this.address })
      return this._owned_nft(data.result)
    } catch (e) {
      console.error(e)
      return []
    }
  }

  _format_uri(uri) {
    return uri.replace('ipfs://', `https://${NFT.IPFS_GATEWAY}/ipfs/`)
  }

  async tokenURI(contract, id, token = NFT.ERC721) {
    try {
      const method = NFT.mapping.method[token]
      const uri = await contract.methods[method](id).call()
      return this._format_uri(uri).replace('0x{id}', id)
    } catch (e) {
      console.error(e)
      return ''
    }
  }

  async _metadata(contract, id, token = NFT.ERC721) {
    try {
      const uri = await this.tokenURI(contract, id, token)
      const { data: metadata } = await axios.get(uri)
      return { ...metadata, image: this._format_uri(metadata.image) }
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
        ...(await this._metadata(contract, data.tokenID, token)),
        creator_address: data.from,
        contract_address: cur,
        token_id: data.tokenID
      })))
      return [...(await acc), ...metadata]
    }, [])
  }
}

module.exports = NFT
