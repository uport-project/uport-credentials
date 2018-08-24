import { ec as EC } from 'elliptic'

import { createJWT, verifyJWT, SimpleSigner } from 'did-jwt'
import { toEthereumAddress } from 'did-jwt/lib/Digest'
import UportDIDResolver from 'uport-did-resolver'
import MuportDIDResolver from 'muport-did-resolver'
import EthrDIDResolver from 'ethr-did-resolver'
import UportLite from 'uport-lite'
import { isMNID } from 'mnid'

import { ContractFactory } from './Contract.js'

const secp256k1 = new EC('secp256k1')

const Types = {
  SHARE_REQ: 'shareReq',
  SHARE_RESP: 'shareResp',
  VER_REQ: 'verReq',
  ETH_TX: 'ethtx'
}

/**
 * The Credentials class allows you to easily create the signed payloads used in uPort including
 * credentials and signed mobile app requests (ex. selective disclosure requests
 * for private data). It also provides signature verification over signed payloads.
 */
class Credentials {
  /**
   * Instantiates a new uPort Credentials object
   *
   * The following example is just for testing purposes. *You should never store a private key in source code.*
   *
   * @example
   * import { Credentials } from 'uport-credentials'
   * const credentials = new Credentials({
   *   privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
   * })
   *
   * The above example derives the public key used to generate the did, so only a private key is needed.
   * Generating a public key from a private key is slow. It is recommended to configure the `did` option as well.
   *
   * @example
   * import { Credentials } from 'uport-credentials'
   * const credentials = new Credentials({
   *   did: 'did:ethr:0xbc3ae59bc76f894822622cdef7a2018dbe353840',
   *   privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
   * })
   *
   * It is recommended to store the address and private key in environment variables for your server application
   *
   * @example
   * import { Credentials, SimpleSigner } from 'uport-credentials'
   * const credentials = new Credentials({
   *   did: process.env.APPLICATION_DID,
   *   signer: SimpleSigner(process.env.PRIVATE_KEY)
   * })
   *
   * Instead of a private key you can pass in a [Signer Functions](https://github.com/uport-project/did-jwt#signer-functions) to
   * present UX or call a HSM.
   *
   * @example
   * import { Credentials } from 'uport-credentials'
   *
   * function mySigner (data) {
   *   return new Promise((resolve, reject) => {
   *     const signature = /// sign it
   *     resolve(signature)
   *   })
   * }
   *
   * const credentials = new Credentials({
   *   did: process.env.APPLICATION_DID,
   *   signer: mySigner
   * })
   *
   * @param       {Object}            [settings]             setttings
   * @param       {DID}               settings.did           Application [DID](https://w3c-ccg.github.io/did-spec/#decentralized-identifiers-dids) (unique identifier) for your application
   * @param       {String}            settings.privateKey    A hex encoded 32 byte private key
   * @param       {SimpleSigner}      settings.signer        a signer object, see [Signer Functions](https://github.com/uport-project/did-jwt#signer-functions)
   * @param       {Object}            settings.ethrConfig    Configuration object for ethr did resolver. See [ethr-did-resolver](https://github.com/uport-project/ethr-did-resolver)
   * @param       {Object}            settings.muportConfig  Configuration object for muport did resolver. See [muport-did-resolver](https://github.com/uport-project/muport-did-resolver)
   * @param       {Address}           settings.address       DEPRECATED your uPort address (may be the address of your application's uPort identity)
   * @param       {Object}            settings.networks      DEPRECATED networks config object, ie. {  '0x94365e3b': { rpcUrl: 'https://private.chain/rpc', address: '0x0101.... }}
   * @param       {UportLite}         settings.registry      DEPRECATED a registry object from UportLite
   * @return      {Credentials}                              self
   */
  constructor ({did, address, privateKey, signer, networks, registry, ethrConfig, muportConfig} = {}) {
    if (signer) {
      this.signer = signer
    } else if (privateKey) {
      this.signer = SimpleSigner(privateKey)
    }

    if (did) {
      this.did = did
    } else if (address) {
      if (isMNID(address)) {
        this.did = `did:uport:${address}`
      }
      if (address.match('^0x[0-9a-fA-F]{40}$')) {
        this.did = `did:ethr:${address}`
      }
    } else if (privateKey) {
      const kp = secp256k1.keyFromPrivate(privateKey)
      const address = toEthereumAddress(kp.getPublic('hex'))
      this.did = `did:ethr:${address}`
    }

    this.signJWT = (payload, expiresIn) => createJWT(payload, {issuer: this.did, signer: this.signer, alg: this.did.match('^did:uport:') ? 'ES256K' : 'ES256K-R', expiresIn })

    UportDIDResolver(registry || UportLite({networks: networks ? configNetworks(networks) : {}}))
    EthrDIDResolver(ethrConfig || {})
    MuportDIDResolver(muportConfig || {})
  }

  /**
   * Generate a DID and private key, effectively creating a new identity that can sign and verify data
   *
   * @example
   * const {did, privateKey} = Credentials.createIdentity()
   * const credentials = new Credentials({did, privateKey, ...})
   *
   * @returns {Object} keypair
   *           - {String} keypair.did         An ethr-did string for the new identity
   *           - {String} keypair.privateKey  The identity's private key, as a string
   */
  static createIdentity () {
    const kp = secp256k1.genKeyPair()
    const publicKey = kp.getPublic('hex')
    const privateKey = kp.getPrivate('hex')
    const address = toEthereumAddress(publicKey)
    const did = `did:ethr:${address}`
    return {did, privateKey}
  }

  /**
   *  Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)
   *
   *  @example
   *  const req = { requested: ['name', 'country'],
   *                callbackUrl: 'https://myserver.com',
   *                notifications: true }
   *  credentials.requestDisclosure(req).then(jwt => {
   *      ...
   *  })
   *
   *  @param    {Object}             [params={}]           request params object
   *  @param    {Array}              params.requested      an array of attributes for which you are requesting credentials to be shared for
   *  @param    {Array}              params.verified       an array of attributes for which you are requesting verified credentials to be shared for
   *  @param    {Boolean}            params.notifications  boolean if you want to request the ability to send push notifications
   *  @param    {String}             params.callbackUrl    the url which you want to receive the response of this request
   *  @param    {String}             params.network_id     network id of Ethereum chain of identity eg. 0x4 for rinkeby
   *  @param    {String}             params.accountType    Ethereum account type: "general", "segregated", "keypair", "devicekey" or "none"
   *  @param    {Number}             expiresIn             Seconds until expiry
   *  @return   {Promise<Object, Error>}                   a promise which resolves with a signed JSON Web Token or rejects with an error
   */
  createDisclosureRequest (params = {}, expiresIn = 600) {
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
    if (params.exp) {
      payload.exp = params.exp
    }
    return this.signJWT({...payload, type: Types.SHARE_REQ}, params.exp ? undefined : expiresIn)
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
  createVerification ({sub, claim, exp}) {
    return this.signJWT({sub: sub, claim, exp})
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
   *  @param    {Object}      unsignedClaim     an object that is an unsigned claim which you want the user to attest
   *  @param    {String}      aud               the DID of the identity you want to sign the attestation
   *  @param    {String}      sub               the DID which the unsigned claim is about
   *  @param    {String}      callbackUrl       the url which you want to receive the response of this request
   *  @return   {Promise<Object, Error>}        a promise which resolves with a signed JSON Web Token or rejects with an error
   */
  createSignVerificationRequest(unsignedClaim, sub, callbackUrl, aud) {
    return this.signJWT({unsignedClaim, sub, aud, callback: callbackUrl, type: Types.VER_REQ})
  }

  /**
   *  Given a transaction object, similarly defined as the web3 transaction object,
   *  it creates a JWT transaction request and appends addtional request options.
   *
   *  @example
   *  const txobject = {
   *    to: '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347',
   *    value: '0.1',
   *    fn: "setStatus(string 'hello', bytes32 '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347')",
   *  }
   *  connect.createTxRequest(txObject, {callbackUrl: 'http://mycb.domain'}).then(jwt => {
   *    ...
   *  })
   *
   *  @param    {Object}    txObj
   *  @param    {String}    [id='addressReq']    string to identify request, later used to get response
   *  @return   {String}                         a transaction request jwt
   */
  createTxRequest(txObj, { callbackUrl, exp = 600, network_id, label } = {}) {
    const payload = {}
    if (callbackUrl) payload.callback = callbackUrl
    if (network_id) payload.net = network_id
    if (label) payload.label = label
    return this.signJWT({...payload, ...txObj, type: Types.ETH_TX}, exp )
  }

  /**
   * Creates a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).
   *
   * This can either be used to share information about the signing identity or as the response to a
   * [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md), where it can be used to verifyAuthentication the identity.
   *
   *  @example
   *  credentials.createDisclosureResponse({own: {name: 'Lourdes Valentina Gomez'}}).then(jwt => {
   *      ...
   *  })
   *
   *  @param    {Object}             [payload={}]           request params object
   *  @param    {JWT}                payload.req            A selective disclosure Request JWT if this is returned as part of an authentication flow
   *  @param    {Object}             payload.own            An object of self attested claims about the signer (eg. name etc)
   *  @param    {Array}              payload.verified       An array of attestation JWT's to include
   *  @param    {MNID}               payload.nad            An ethereum address encoded as an [MNID](https://github.com/uport-project/mnid)
   *  @param    {Array}              payload.capabilities   An array of capability JWT's to include
   *  @return   {Promise<Object, Error>}                    a promise which resolves with a signed JSON Web Token or rejects with an error
   */
  async createDisclosureResponse (payload = {}, expiresIn = 600 ) {
    if (payload.req) {
      const verified = await verifyJWT(payload.req)
      if (verified.issuer) {
        payload.aud = verified.issuer
      }
    }
    return this.signJWT({...payload, type: Types.SHARE_RESP}, expiresIn)
  }

  /**
   * Parse a selective disclosure response, and verify signatures on each included signed claim ("verification")
   *  
   * @param     {Object}             response       A selective disclosure response payload, with associated did doc
   * @param     {Object}             response.doc   
   */
  async processDisclosurePayload ({doc, payload}) {
    const credentials = {...doc.uportProfile || {}, ...(payload.own || {}), ...(payload.capabilities && payload.capabilities.length === 1 ? {pushToken: payload.capabilities[0]} : {}), address: payload.iss}
    if (payload.nad) {
      credentials.networkAddress = payload.nad
    }
    if (payload.dad) {
      credentials.deviceKey = payload.dad
    }
    if (payload.verified) {
      const verified = await Promise.all(payload.verified.map(token => verifyJWT(token, {audience: this.did})))
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
   *  credentials.verifyAuthentication(resToken).then(res => {
   *      const credentials = res.verified
   *       const name =  res.name
   *      ...
   *  })
   *
   *  @param    {String}                  token                 a response token
   *  @param    {String}                  [callbackUrl=null]    callbackUrl
   *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
   */
  async verifyAuthentication (token, callbackUrl = null) {
    const { payload, doc } = await verifyJWT(token, {audience: this.did, callbackUrl, auth: true})

    if (payload.req) {
      const challenge = await verifyJWT(payload.req)
      if (challenge.payload.iss !== this.did) {
        throw new Error(`Challenge issuer does not match current identity: ${challenge.payload.iss} !== ${this.did}`)
      } else if (challenge.payload.type !== Types.SHARE_REQ) {
        throw new Error(`Challenge payload type invalid: ${challenge.payload.type}`)
      } else {
        return this.processDisclosurePayload({payload, doc})
      }
    } else {
      throw new Error('Challenge was not included in response')
    }
  }

  /**
   *  Receive signed response token from mobile app. Verifies and parses the given response token.
   *
   *  @example
   *  const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
   *  credentials.receive(resToken).then(res => {
   *      const credentials = res.verified
   *      const name =  res.name
   *      ...
   *  })
   *
   *  @param    {String}                  token                 a response token
   *  @param    {String}                  [callbackUrl=null]    callbackUrl
   *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
   *  @deprecated
   */
  receive (token, callbackUrl = null) {
    return this.verifyAuthentication(token, callbackUrl)
  }

  /**
   *  Verify and return profile from a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).
   *
   *  The main difference between this and `verifyAuthentication()` is that it does not verify the challenge. This can be used to verify user profiles that have been shared
   *  through other methods such as QR codes and messages.
   *
   *  @example
   *  const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
   *  credentials.verifyProfile(resToken).then(profile => {
   *      const credentials = profile.verified
   *      const name =  profile.name
   *      ...
   *  })
   *
   *  @param    {String}                  token                 a response token
   *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
   */
  async verifyProfile (token) {
    const { payload, doc } = await verifyJWT(token, {audience: this.did})
    return this.processDisclosurePayload({ payload, doc })
  }

  /**
   *  Builds and returns a contract object which can be used to interact with
   *  a given contract. Similar to web3.eth.contract but with promises. Once specifying .at(address)
   *  you can call the contract functions with this object. Each call will create a request.
   *
   *  @param    {Object}       abi                                   contract ABI
   *  @return   {Object}                                             contract object
   */
  contract (abi) {
    const txObjHandler = (txObj, opts) => {
      if (txObj.function) txObj.fn = txObj.function
      delete txObj['function']
      return this.createTxRequest(txObj, opts)
    }
    return ContractFactory(txObjHandler.bind(this))(abi)
  }
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


export default Credentials
