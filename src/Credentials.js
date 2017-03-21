import { createJWT, verifyJWT } from './JWT'
import UportLite from 'uport-lite'
import nets from 'nets'
import { isMNID, encode, decode } from 'mnid'

const networks = {
  'mainnet':   {  id: '0x1',
                  registry: '0xab5c8051b9a1df1aab0149f8b0630848b7ecabf6',
                  rpcUrl: 'https://mainnet.infura.io' },
  'ropsten':   {  id: '0x3',
                  registry: '0x41566e3a081f5032bdcad470adb797635ddfe1f0',
                  rpcUrl: 'https://ropsten.infura.io' },
  'kovan':     {  id: '0x2a',
                  registry: '0x5f8e9351dc2d238fb878b6ae43aa740d62fc9758',
                  rpcUrl: 'https://kovan.infura.io' }
  // 'infuranet': {  id: '0x2a'
  //                 registry: '',
  //                 rpcUrl: 'https://infuranet.infura.io' }
}

const DEFAULTNETWORK = 'kovan'

const configNetwork = (net = DEFAULTNETWORK) => {
  if (typeof net === 'object') {
    ['id', 'registry', 'rpcUrl'].forEach((key) => {
      if (!net.hasOwnProperty(key)) throw new Error(`Malformed network config object, object must have '${key}' key specified.`)
    })
    return net
  } else if (typeof net === 'string') {
    if (!networks[net]) throw new Error(`Network configuration not available for '${net}'`)
    return networks[net]
  }

  throw new Error(`Network configuration object or network string required`)
}

export default class Credentials {
  constructor (settings = {}) {
  this.settings = settings
  this.settings.network = configNetwork(settings.network)
  this.net = this.settings.network
  if (settings.address) {
    this.settings.address = isMNID(settings.address) ? settings.address : encode({network: this.net.id, address: settings.address})
  }
  if (!this.settings.registry) {
    const registryNetwork = {[this.net.id]: {registry: this.net.registry, rpcUrl: this.net.rpcUrl}}
    const registry = UportLite({networks: registryNetwork})
    this.settings.registry = (address) => new Promise((resolve, reject) => {
      const addressMNID = isMNID(address) ? address : encode({network: this.net.id, address})
      registry(address, (error, profile) => {
        if (error) return reject(error)
        resolve(profile)
      })
    })
  }
}

  // Create request token
  createRequest (params = {}) {
    const payload = {}
    if (params.requested) {
      payload.requested = params.requested
    }
    if (params.verified) {
      payload.verified = params.verified
    }
    if (params.notifications) {
      payload.permissions = ['notifications']
    }
    if (params.callbackUrl) {
      payload.callback = params.callbackUrl
    }
    return createJWT(this.settings, {...payload, type: 'shareReq'})
  }

  // Receive response token from user and return data to promise
  receive (token, callbackUrl = null) {
    return verifyJWT(this.settings, token, callbackUrl).then(({payload, profile}) => {
      const credentials = {...profile, ...(payload.own || {}), ...(payload.capabilities && payload.capabilities.length === 1 ? {pushToken: payload.capabilities[0]} : {}), address: payload.iss}
      if (payload.verified) {
        return Promise.all(payload.verified.map(token => verifyJWT(this.settings, token))).then(verified => {
          return {...credentials, verified: verified.map(v => ({...v.payload, jwt: v.jwt}))}
        })
      } else {
        return credentials
      }
    })
  }

  push (token, {url}) {
    return new Promise((resolve, reject) => {
      if (!token) {
        return reject(new Error('Missing push notification token'))
      }
      if (!url) {
        return reject(new Error('Missing payload url for sending to users device'))
      }

      nets({
        uri: 'https://chasqui.uport.me/api/v1/sns',
        json: {url},
        method: 'POST',
        withCredentials: false,
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      (error, res, body) => {
        if (error) return reject(error)
        if (res.statusCode === 200) {
          resolve(body)
        }
        if (res.statusCode === 403) {
          return reject(new Error('Error sending push notification to user: Invalid Token'))
        }
        reject(new Error(`Error sending push notification to user: ${res.statusCode} ${body.toString()}`))
      })
    })
  }

  // Create attestation
  attest ({sub, claim, exp}) {
    const subMNID = isMNID(sub) ? sub : encode({network: this.net.id, address: sub})
    return createJWT(this.settings, {sub: subMNID, claim, exp})
  }

  // Lookup public uport address of any user
  lookup (address) {
    return this.settings.registry(address)
  }
}
