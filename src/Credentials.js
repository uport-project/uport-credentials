import { SimpleSigner, decodeJWT } from 'did-jwt'
import { createJWT, verifyJWT } from './JWT'
const MNID = require('mnid')
import { ec as EC } from 'elliptic'
const secp256k1 = new EC('secp256k1')

import UportDIDResolver from 'uport-did-resolver'
import MuportDIDResolver from 'muport-did-resolver'
import EthrDIDResolver from 'ethr-did-resolver'

import UportLite from 'uport-lite'
import nets from 'nets'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'

/**
*    The Credentials class allows you to easily create the signed payloads used in uPort inlcuding
*    credentials and signed mobile app requests (ex. selective disclosure requests
*    for private data). It also provides signature verification over signed payloads and
*    allows you to send push notifications to users.
*/
class Credentials {

  /**
   * Instantiates a new uPort Credentials object
   *
   * @example
   * import { Credentials, SimpleSigner } from 'uport'
   * const networks = {  '0x94365e3b': { rpcUrl: 'https://private.chain/rpc', registry: '0x0101.... }}
   * const setttings = { networks, address: '5A8bRWU3F7j3REx3vkJ...', signer: new SimpleSigner(process.env.PRIVATE_KEY)}
   * const credentials = new Credentials(settings)
   *
   * @example
   * import { Credentials } from 'uport'
   * const credentials = new Credentials()
   *
   * @param       {Object}            [settings]             setttings
   * @param       {Object}            settings.networks      networks config object, ie. {  '0x94365e3b': { rpcUrl: 'https://private.chain/rpc', address: '0x0101.... }}
   * @param       {UportLite}         settings.registry      a registry object from UportLite
   * @param       {SimpleSigner}      settings.signer        a signer object, see SimpleSigner.js
   * @param       {Address}           settings.address       your uPort address (may be the address of your application's uPort identity)
   * @return      {Credentials}                              self
   */
  constructor ({networks, registry, signer, address, ethrConfig, muportConfig} = {}) {
    this.settings = {}
    if (signer) this.settings.signer = signer

    if (address) {
      if (/did/.test(address)) throw new Error('Only MNID/hex app identities supported')
      // legacy hex app ids are on ropsten, but need mnid here for did jwt
      this.settings.address = MNID.isMNID(address) ? address : MNID.encode({network: '0x3', address })
    }

    this.signJWT = (payload, expiresIn) => createJWT({ issuer: this.settings.address, signer: this.settings.signer, expiresIn }, payload)

    // backwards compatibility
    this.settings.networks = networks ? configNetworks(networks) : {}
    if (!this.settings.registry) {
      const registry = UportLite({networks: this.settings.networks})
      this.settings.registry = (address) => new Promise((resolve, reject) => {
        registry(address, (error, profile) => {
          if (error) return reject(error)
          resolve(profile)
        })
      })
    }
    UportDIDResolver(registry || UportLite({networks: networks ? configNetworks(networks) : {}}))
    EthrDIDResolver(ethrConfig || {})
    MuportDIDResolver(muportConfig || {})
  }

/**
 *  Creates a signed request token (JWT) given a request params object.
 *
 *  @example
 *  const req = { requested: ['name', 'country'],
 *                callbackUrl: 'https://myserver.com',
 *                notifications: true }
 *  credentials.createRequest(req).then(jwt => {
 *      ...
 *  })
 requested: ['name','phone','identity_no'],
    callbackUrl: 'https://....' // URL to send the response of the request to
    notifications: true

 *
 *  @param    {Object}             [params={}]           request params object
 *  @param    {Array}              params.requested      an array of attributes for which you are requesting credentials to be shared for
 *  @param    {Array}              params.verified       an array of attributes for which you are requesting verified credentials to be shared for
 *  @param    {Boolean}            params.notifications  boolean if you want to request the ability to send push notifications
 *  @param    {String}             params.callbackUrl    the url which you want to receive the response of this request
 *  @param    {String}             params.network_id     network id of Ethereum chain of identity eg. 0x4 for rinkeby
 *  @param    {String}             params.accountType    Ethereum account type: "general", "segregated", "keypair", "devicekey" or "none"
 *  @return   {Promise<Object, Error>}                   a promise which resolves with a signed JSON Web Token or rejects with an error
 */
  createRequest (params = {}, expiresIn = 600) {
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
    if (params.network_id) {
      payload.net = params.network_id
    }
    if (params.accountType) {
      if (['general', 'segregated', 'keypair', 'devicekey', 'none'].indexOf(params.accountType) >= 0) {
        payload.act = params.accountType
      } else {
        return Promise.reject(new Error(`Unsupported accountType ${params.accountType}`))
      }
    }

    if (params.exp) { // checks for expiration on requests, if none is provided the default is 10 min
      payload.exp = params.exp
    }
    return createJWT({address: this.settings.address, signer: this.settings.signer}, {...payload, type: 'shareReq'})
    //return this.signJWT({...payload, type: 'shareReq'}, params.exp ? undefined : expiresIn)
  }

/**
 *  Creates a signed request for the user to attest a list of claims.
 *
 *  @example
 *  const unsignedClaim = {
 *    claim: {
 *      "Citizen of city X": {
 *        "Allowed to vote": true,
 *        "Document": "QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW"
 *      }
 *    },
 *    sub: "2oTvBxSGseWFqhstsEHgmCBi762FbcigK5u"
 *  }
 *  credentials.createVerificationRequest(unsignedClaim).then(jwt => {
 *    ...
 *  })
 *
 *  @param    {Object}              unsignedClaim       an object that is an unsigned claim which you want the user to attest
 *  @param    {String}             sub                  the DID of the identity you want to sign the attestation
 *  @return   {Promise<Object, Error>}                  a promise which resolves with a signed JSON Web Token or rejects with an error
 */
  createVerificationRequest (unsignedClaim, sub) {
    return createJWT({address: this.settings.address, signer: this.settings.signer}, {unsignedClaim, sub, type: 'verReq'})
  }

/**
  *  Receive signed response token from mobile app. Verifies and parses the given response token.
  *
  *  @example
  *  const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
  *  credentials.receive(resToken).then(res => {
  *      const credentials = res.verified
         const name =  res.name
  *      ...
  *  })
  *
  *  @param    {String}                  token                 a response token
  *  @param    {String}                  [callbackUrl=null]    callbackUrl
  *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
  */
  receive (token, callbackUrl = null) {
    return this.authenticate(token, callbackUrl)
  }

  async processDisclosurePayload ({doc, payload}) {
    const credentials = {...doc.uportProfile || {}, ...(payload.own || {}), ...(payload.capabilities && payload.capabilities.length === 1 ? {pushToken: payload.capabilities[0]} : {}), address: payload.iss, did: payload.iss}
    if (payload.nad) {
      credentials.networkAddress = payload.nad
    }
    if (payload.dad) {
      credentials.deviceKey = payload.dad
    }

    // Backwards support
    try {
      if (doc.publicKey[0].publicKeyHex) credentials.publicKey = '0x' + doc.publicKey[0].publicKeyHex
      if (doc.publicKey[1].publicKeyBase64) credentials.publicEncKey = doc.publicKey[1].publicKeyBase64
    } catch (err) {}

    if (!credentials.publicEncKey) credentials.publicEncKey = payload.publicEncKey

    if (payload.verified) {
      const verified = await Promise.all(payload.verified.map(token => verifyJWT({adress: this.settings.address, signer: this.settings.signer}, token)))
      return {...credentials, verified: verified.map(v => ({...v.payload, jwt: v.jwt}))}
    } else {
      return credentials
    }
  }

  /**
  *  Authenticates [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md) from mobile
  *  app as part of the [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md).
  *
  *  It Verifies and parses the given response token and verifies the challenge response flow.
  *
  *  @example
  *  const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
  *  credentials.authenticate(resToken).then(res => {
  *      const credentials = res.verified
  *       const name =  res.name
  *      ...
  *  })
  *
  *  @param    {String}                  token                 a response token
  *  @param    {String}                  [callbackUrl=null]    callbackUrl
  *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
  */
  async authenticate (token, callbackUrl = null) {
    const { payload, doc } = await verifyJWT({ address: this.settings.address }, token, callbackUrl)

    if (payload.req) {
      const challenge = await verifyJWT({ address: this.settings.address }, payload.req, callbackUrl)
      if (challenge.payload.iss === this.settings.address && challenge.payload.type === 'shareReq') {
        return this.processDisclosurePayload({payload, doc})
      }
    } else {
      return this.processDisclosurePayload({payload, doc})
    }
  }

/**
  *  Send a push notification to a user, consumes a token which allows you to send push notifications
  *  and a url/uri request you want to send to the user.
  *
  *  @param    {String}                  token              a push notification token (get a pn token by requesting push permissions in a request)
  *  @param    {Object}                  payload            push notification payload
  *  @param    {String}                  payload.url        a uport request url
  *  @param    {String}                  payload.message    a message to display to the user
  *  @param    {String}                  pubEncKey          the public encryption key of the receiver, encoded as a base64 string
  *  @return   {Promise<Object, Error>}              a promise which resolves with successful status or rejects with an error
  */
  push (token, pubEncKey, payload) {
    return new Promise((resolve, reject) => {
      if (!token) {
        reject(new Error('Missing push notification token'))
      }
      if (!pubEncKey || pubEncKey.url) {
        reject(new Error('Missing public encryption key of the receiver'))
      }
      if (!payload || !payload.url) {
        reject(new Error('Missing payload url for sending to users device'))
      }
      const iss = decodeJWT(token).payload.iss
      const PUTUTU_URL = 'https://api.uport.me'
      let endpoint = '/pututu/sns'
      const plaintext = padMessage(JSON.stringify(payload))
      const enc = encryptMessage(plaintext, pubEncKey)
      payload = { message: JSON.stringify(enc) }

      nets({
        uri: PUTUTU_URL + endpoint,
        json: payload,
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

/**
  *  Create a credential (a signed JSON Web Token)
  *
  *  @example
  *  credentials.attest({
  *   sub: '5A8bRWU3F7j3REx3vkJ...', // uPort address of user, likely a MNID
  *   exp: <future timestamp>,
  *   claim: { name: 'John Smith' }
  *  }).then( credential => {
  *   ...
  *  })
  *
  * @param    {Object}            [credential]           a unsigned credential object
  * @param    {String}            credential.sub         subject of credential (a uPort address)
  * @param    {String}            credential.claim       claim about subject single key value or key mapping to object with multiple values (ie { address: {street: ..., zip: ..., country: ...}})
  * @param    {String}            credential.exp         time at which this claim expires and is no longer valid (seconds since epoch)
  * @return   {Promise<Object, Error>}                   a promise which resolves with a credential (JWT) or rejects with an error
  */
  attest ({sub, claim, exp}) {
    return createJWT({address: this.settings.address, signer: this.settings.signer}, {sub: sub, claim, exp})
  }

/**
  *  Look up a profile in the registry for a given uPort address. Address must be MNID encoded.
  *
  *  @example
  *  credentials.lookup('5A8bRWU3F7j3REx3vkJ...').then(profile => {
  *     const name = profile.name
  *     const pubkey = profile.pubkey
  *     ...
  *   })
  *
  * @param    {String}            address             a MNID encoded address
  * @return   {Promise<Object, Error>}                a promise which resolves with parsed profile or rejects with an error
  */
  lookup (address) {
    return this.settings.registry(address)
  }

  // createJWT ({address, signer}, payload) {
  //   return createJWT(
  //     payload, { issuer: address,
  //       signer: signer})
  // }

  // verifyJWT ({registry, address}, jwt, callbackUrl = null) {
  //   return verifyJWT(jwt, {audience: address, callbackUrl: callbackUrl})
  // }
}

const configNetworks = (nets) => {
  Object.keys(nets).forEach((key) => {
    const net = nets[key]
    if (typeof net === 'object') {
      ['registry', 'rpcUrl'].forEach((key) => {
        if (!net.hasOwnProperty(key)) throw new Error(`Malformed network config object, object must have '${key}' key specified.`)
      })
    } else {
      throw new Error(`Network configuration object required`)
    }
  })
  return nets
}

/**
 *  Adds padding to a string
 *
 *  @param      {String}        the message to be padded
 *  @return     {String}        the padded message
 *  @private
 */
const padMessage = (message) => {
  const INTERVAL_LENGTH = 50
  const padLength = INTERVAL_LENGTH - message.length % INTERVAL_LENGTH

  return message + ' '.repeat(padLength)
}

/**
 *  Encrypts a message
 *
 *  @param      {String}        the message to be encrypted
 *  @param      {String}        the public encryption key of the receiver, encoded as base64
 *  @return     {String}        the encrypted message, encoded as base64
 *  @private
 */
const encryptMessage = (message, receiverKey) => {
  const tmpKp = nacl.box.keyPair()
  const decodedKey = naclutil.decodeBase64(receiverKey)
  const decodedMsg = naclutil.decodeUTF8(message)
  const nonce = nacl.randomBytes(24)

  const ciphertext = nacl.box(decodedMsg, nonce, decodedKey, tmpKp.secretKey)
  return {
    from: naclutil.encodeBase64(tmpKp.publicKey),
    nonce: naclutil.encodeBase64(nonce),
    ciphertext: naclutil.encodeBase64(ciphertext)
  }
}

export default Credentials
