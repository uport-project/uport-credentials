import { ec as EC } from 'elliptic'

import { createJWT, verifyJWT, SimpleSigner, DIDDocument } from 'did-jwt'
import { toEthereumAddress } from 'did-jwt/lib/Digest'
import UportDIDResolver from 'uport-did-resolver'
import EthrDIDResolver from 'ethr-did-resolver'
import HttpsDIDResolver from 'https-did-resolver'
import UportLite from 'uport-lite'
import { isMNID, decode as mnidDecode } from 'mnid'

import {
  ContractFactory,
  TransactionRequest,
  AbiParam,
  ContractABI,
  ContractInterface,
  Factory
} from './Contract'
import { PublicKey } from 'did-resolver'

const secp256k1 = new EC('secp256k1')

enum Types {
  DISCLOSURE_REQUEST = 'shareReq',
  DISCLOSURE_RESPONSE = 'shareResp',
  TYPED_DATA_SIGNATURE_REQUEST = 'eip712Req',
  VERIFICATION_SIGNATURE_REQUEST = 'verReq',
  ETH_TX_REQUEST = 'ethtx',
  PERSONAL_SIGN_REQUEST = 'personalSigReq'
}

interface Network {
  registry: string
  rpcUrl: string
}
interface Networks {
  [net: string]: Network
}

interface EcdsaSignature {
  r: string
  s: string
  recoveryParam: number
}
type Signer = (data: string) => Promise<EcdsaSignature>

interface Settings {
  did?: string
  address?: string
  privateKey?: string
  signer?: Signer
  networks?: Networks
  registry?: (mnid: string) => Promise<object>
  ethrConfig?: any
}

interface Identity {
  did: string
  privateKey: string
}

interface JWTPayload {
  iss?: string
  sub?: string
  aud?: string
  iat?: number
  type?: string
  exp?: number
}

interface ClaimSpec {
  essential?: boolean
  reason?: string
}

interface IssuerSpec {
  did: string
  url?: string
}

interface VerifiableClaimSpec extends ClaimSpec {
  iss: IssuerSpec[]
}

interface VerifiableClaimsSpec {
  [claimType: string]: VerifiableClaimSpec
}


interface UserInfoSpec {
  [claimType: string]: ClaimSpec|null
}

interface ClaimsSpec {
  verifiable: VerifiableClaimsSpec
  user_info: UserInfoSpec
}
interface DisclosureRequestParams {
  claims?: ClaimsSpec,
  requested?: string[]
  verified?: string[]
  notifications?: boolean
  callbackUrl?: string
  networkId?: string
  rpcUrl?: string
  vc?: string[]
  exp?: number
  accountType?: 'none' | 'segregated' | 'keypair' | 'none',
}

interface DisclosureRequestPayload extends JWTPayload{
  claims?: ClaimsSpec,
  requested?: string[]
  verified?: string[]
  permissions?: string[]
  callback?: string
  net?: string
  rpc?: string
  vc?: string[]
  act?: 'none' | 'segregated' | 'keypair' | 'none'
}

interface DisclosureResponsePayload extends JWTPayload {
  req?: string
  own?: any
  verified?: string[]
  nad?: string
  dad?: string
  boxPub?: string
  capabilities?: string[]
}

interface DisclosurePayload {
  payload: DisclosureResponsePayload
  doc: DIDDocument
}

interface DisclosureResponse {
  own: any
  capabilities: string[]
  aud?: string
  req?: string
  iat: number
  exp?: number
  type: Types.DISCLOSURE_RESPONSE
  mnid?: string
  address?: string
  pushToken?: string
  deviceKey?: string
  did: string
  verified?: Verification[]
  invalid?: string[]
  boxPub?: string
}

interface VerifiedJWT {
  payload: any
  doc: DIDDocument
  issuer: string
  signer: PublicKey
  jwt: string
}
interface Verification extends JWTPayload {
  claims: any
  jwt?: string
}

interface VerificationParam {
  sub: string
  claim: any
  exp?: number
  vc?: string[]
  callbackUrl?: string
}

interface VerificationRequest {
  aud?: string
  sub: string
  riss?: string
  expiresIn?: number
  vc?: string[]
  callbackUrl?: string
}

interface EIP712Domain {
  name: string
  version: string
  chainId?: number
  verifyingContract?: string
  salt?: string
}

interface EIP712Types {
  EIP712Domain: AbiParam[]
  [name: string]: AbiParam[]
}

interface EIP712Object {
  types: EIP712Types
  domain: EIP712Domain
  primaryType: string
  message: any
}

interface NetworkRequest {
  from?: string
  net?: string
  callback?: string
}

interface TxReqOptions {
  callbackUrl?: string
  exp?: number
  networkId?: string
  label?: string
}

interface TxReqPayload {
  callback?: string
  net?: string
  label?: string
}

interface PersonalSignPayload {
  callback?: string
  from?: string
  net?: string
  data: string
}

/**
 * The Credentials class allows you to easily create the signed payloads used in uPort including
 * credentials and signed mobile app requests (ex. selective disclosure requests
 * for private data). It also provides signature verification over signed payloads.
 */
class Credentials {
  /**
   * Generate a DID and private key, effectively creating a new identity that can sign and verify data
   *
   * ```javascript
   * const {did, privateKey} = Credentials.createIdentity()
   * const credentials = new Credentials({did, privateKey, ...})
   * ```
   *
   * @returns {Object} keypair
   */
  static createIdentity(): Identity {
    const kp = secp256k1.genKeyPair()
    const publicKey = <string>kp.getPublic('hex')
    const privateKey = <string>kp.getPrivate('hex')
    const address = toEthereumAddress(publicKey)
    const did = `did:ethr:${address}`
    return { did, privateKey }
  }

  readonly did?: string
  readonly signer?: Signer

  /**
   * Instantiates a new uPort Credentials object
   *
   * The following example is just for testing purposes. *You should never store a private key in source code.*
   *
   * ```javascript
   * import { Credentials } from 'uport-credentials'
   * const credentials = new Credentials({
   *   privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
   * })
   * ```
   *
   * The above example derives the public key used to generate the did, so only a private key is needed.
   * Generating a public key from a private key is slow. It is recommended to configure the `did` option as well.
   *
   * ```javascript
   * import { Credentials } from 'uport-credentials'
   * const credentials = new Credentials({
   *   did: 'did:ethr:0xbc3ae59bc76f894822622cdef7a2018dbe353840',
   *   privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
   * })
   * ```
   *
   * It is recommended to store the address and private key in environment variables for your server application
   *
   * ```javascript
   * import { Credentials, SimpleSigner } from 'uport-credentials'
   * const credentials = new Credentials({
   *   did: process.env.APPLICATION_DID,
   *   signer: SimpleSigner(process.env.PRIVATE_KEY)
   * })
   * ```
   *
   * Instead of a private key you can pass in a [Signer Functions](https://github.com/uport-project/did-jwt#signer-functions) to
   * present UX or call a HSM.
   *
   * ```javascript
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
   * ```
   *
   * @param       {Object}            [settings]               optional setttings
   * @param       {DID}               [settings.did]           Application
   * [DID](https://w3c-ccg.github.io/did-spec/#decentralized-identifiers-dids) (unique identifier) for your application
   * @param       {String}            [settings.privateKey]    A hex encoded 32 byte private key
   * @param       {SimpleSigner}      [settings.signer]        a signer object, see
   * [Signer Functions](https://github.com/uport-project/did-jwt#signer-functions)
   * @param       {Object}            [settings.ethrConfig]    Configuration object for ethr did resolver. See
   * [ethr-did-resolver](https://github.com/uport-project/ethr-did-resolver)
   * @param       {Address}           [settings.address]       DEPRECATED your uPort address (may be the address of your
   * application's uPort identity)
   * @param       {Object}            [settings.networks]      DEPRECATED networks config object, ie. {  '0x94365e3b': {
   * rpcUrl: 'https://private.chain/rpc', address: '0x0101.... }}
   * @param       {UportLite}         [settings.registry]      DEPRECATED a registry object from UportLite
   * @return      {Credentials}                                self
   */
  constructor({
    did,
    address,
    privateKey,
    signer,
    networks,
    registry,
    ethrConfig
  }: Settings) {
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
    UportDIDResolver(
      registry ||
        UportLite({ networks: networks ? configNetworks(networks) : {} })
    )
    EthrDIDResolver(ethrConfig || {})
    HttpsDIDResolver()
  }

  signJWT(payload: object, expiresIn?: number) {
    if (!(this.did && this.signer))
      return Promise.reject(new Error('No Signing Identity configured'))
    return createJWT(payload, {
      issuer: this.did,
      signer: this.signer,
      alg:
        this.did.match('^did:uport:') || isMNID(this.did)
          ? 'ES256K'
          : 'ES256K-R',
      expiresIn
    })
  }

  /**
   *  Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)
   *
   *  ```javascript
   *  const req = { claims: {
   *      verifiable: {
   *        email: {
   *          iss: [
   *            {
   *              did: 'did:web:uport.claims',
   *              url: 'https://uport.claims/email'
   *            },
   *            {
   *              did: 'did:web:sobol.io',
   *              url: 'https://sobol.io/verify'
   *            }
   *          ],
   *          reason: 'Whe need to be able to email you'
   *        },
   *        nationalIdentity: {
   *          essential: true,
   *          iss: [
   *            {
   *              did: 'did:web:idverifier.claims',
   *              url: 'https://idverifier.example'
   *            }
   *          ],
   *          reason: 'To legally be able to open your account'
   *        }
   *      },
   *      user_info: {
   *        name: { essential: true, reason: "Show your name to other users"},
   *        country: null
   *      }
   *    },
   *    callbackUrl: 'https://myserver.com',
   *    notifications: true }
   *  credentials.createDisclosureRequest(req).then(jwt => {
   *      ...
   *  })
   * `
   * 
   *
   *  @param    {Object}             [params={}]           request params object
   * 
   *  @param    {Array}              params.requested      DEPRECATED an array of attributes for which you are requesting credentials to be shared for
   *  @param    {Array}              params.verified       DEPRECATED an array of attributes for which you are requesting verified credentials to be shared for
   *  @param    {Object}             params.claims         Claims spec Object
   *  @param    {Boolean}            params.notifications  boolean if you want to request the ability to send push notifications
   *  @param    {String}             params.callbackUrl    the url which you want to receive the response of this request
   *  @param    {String}             params.networkId      network id of Ethereum chain of identity eg. 0x4 for rinkeby
   *  @param    {String}             params.rpcUrl         JSON RPC url for use with account connecting to non standard
   * (private or permissioned chain). The JSON-RPC url must match the `networkId`
   *  @param    {String[]}           params.vc            An array of JWTs about the requester, signed by 3rd parties
   *  @param    {String}             params.accountType    Ethereum account type: "general", "segregated", "keypair", or "none"
   *  @param    {Number}             expiresIn             Seconds until expiry
   *  @return   {Promise<Object, Error>}                   a promise which resolves with a signed JSON Web Token or rejects with an error
   */
  createDisclosureRequest(
    params: DisclosureRequestParams = {},
    expiresIn = 600
  ) {
    const payload: DisclosureRequestPayload = {}
    if (params.requested) payload.requested = params.requested
    if (params.verified) payload.verified = params.verified
    if (params.claims) payload.claims = params.claims
    if (params.notifications) payload.permissions = ['notifications']
    if (params.callbackUrl) payload.callback = params.callbackUrl
    if (params.networkId) payload.net = params.networkId
    if (params.rpcUrl) {
      if (params.networkId) {
        payload.rpc = params.rpcUrl
      } else {
        return Promise.reject(
          new Error(`rpcUrl was specified but no networkId`)
        )
      }
    }
    if (params.vc) payload.vc = params.vc
    if (params.exp) payload.exp = params.exp

    if (params.accountType) {
      if (
        ['general', 'segregated', 'keypair', 'none'].indexOf(
          params.accountType
        ) >= 0
      ) {
        payload.act = params.accountType
      } else {
        return Promise.reject(
          new Error(`Unsupported accountType ${params.accountType}`)
        )
      }
    }

    return this.signJWT(
      { ...payload, type: Types.DISCLOSURE_REQUEST },
      params.exp ? undefined : expiresIn
    )
  }

  /**
   *  Create a credential (a signed JSON Web Token)
   *
   *  ```javascript
   *  credentials.createVerification({
   *   sub: '5A8bRWU3F7j3REx3vkJ...', // uPort address of user, likely a MNID
   *   exp: <future timestamp>,
   *   claim: { name: 'John Smith' }
   *  }).then( credential => {
   *   ...
   *  })
   * ```
   *
   * @param    {Object}            [credential]           a unsigned claim object
   * @param    {String}            credential.sub         subject of credential (a valid DID)
   * @param    {String}            credential.claim       claim about subject single key value or key mapping to object with multiple values (ie { address: {street: ..., zip: ..., country: ...}})
   * @param    {String}            credential.exp         time at which this claim expires and is no longer valid (seconds since epoch)
   * @return   {Promise<Object, Error>}                   a promise which resolves with a credential (JWT) or rejects with an error
   */
  createVerification({ sub, claim, exp, vc, callbackUrl }: VerificationParam) {
    return this.signJWT({ sub, claim, exp, vc, callbackUrl })
  }

  /**
   *  Creates a request a for a DID to [sign a verification](https://github.com/uport-project/specs/blob/develop/messages/verificationreq.md)
   *
   *  ```javascript
   *  const unsignedClaim = {
   *    claim: {
   *      "Citizen of city X": {
   *        "Allowed to vote": true,
   *        "Document": "QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW"
   *      }
   *    },
   *    sub: "2oTvBxSGseWFqhstsEHgmCBi762FbcigK5u"
   *  }
   *  const aud = '0x123...'
   *  const sub = '0x456...'
   *  const callbackUrl = 'https://my.cool.site/handleTheResponse'
   *  credentials.createVerificationSignatureRequest(unsignedClaim, {aud, sub, callbackUrl}).then(jwt => {
   *    // ...
   *  })
   * ```
   *
   * @param    {Object}      unsignedClaim       Unsigned claim object which you want the user to attest
   * @param    {Object}      [opts]
   * @param    {String}      [opts.aud]          The DID of the identity you want to sign the attestation
   * @param    {String}      [opts.sub]          The DID which the unsigned claim is about
   * @param    {String}      [opts.riss]         The DID of the identity you want to sign the Verified Claim
   * @param    {String}      [opts.callbackUrl]  The url to receive the response of this request
   * @param    {Object[]}    [opts.vc]           An array of JWTs about the requester, signed by 3rd parties
   * @returns  {Promise<Object, Error>}          A promise which resolves with a signed JSON Web Token or rejects with an error
   */
  createVerificationSignatureRequest(
    unsignedClaim: object,
    { aud, sub, riss, callbackUrl, vc, expiresIn }: VerificationRequest
  ) {
    return this.signJWT(
      {
        unsignedClaim,
        sub,
        riss,
        aud,
        vc,
        callback: callbackUrl,
        type: Types.VERIFICATION_SIGNATURE_REQUEST
      },
      expiresIn
    )
  }

  /**
   * Create a JWT requesting a signature on a piece of structured/typed data conforming to
   * the ERC712 specification
   *
   * ```javascript
   * const data = { // A ERC712 Greeting Structure
   *   types: {
   *     EIP712Domain: [
   *       {name: 'name', type: 'string'},
   *       {name: 'version', type: 'string'},
   *       {name: 'chainId', type: 'uint256'},
   *       {name: 'verifyingContract', type: 'address'},
   *       {name: 'salt', type: 'bytes32'}
   *     ],
   *     Greeting: [
   *       {name: 'text', type: 'string'},
   *       {name: 'subject', type: 'string'},
   *     ]
   *   },
   *   domain: {
   *     name: 'My dapp',
   *     version: '1.0',
   *     chainId: 1,
   *     verifyingContract: '0xdeadbeef',
   *     salt: '0x999999999910101010101010'
   *   },
   *   primaryType: 'Greeting',
   *   message: {
   *     text: 'Hello',
   *     subject: 'World'
   *   }
   * }
   *
   * const from = '0xbeef4567' // Eth account you are asking to sign the claim
   * const net = '0x1' // The network on which this address exists
   * const callback = 'https://my.cool.site/handleTheResponse'
   * const signRequestJWT = credentials.createTypedDataSignatureRequest(data, {from, net, callback})
   * // Send the JWT to a client
   * // ...
   * ```
   *
   * @param {Object} typedData              the ERC712 data to sign
   * @param {Object} opts                   additional options for the jwt
   *   @param {String} opts.from            the ethereum address you want to sign the typed data
   *   @param {Number|String} opts.net      the id of the network on which the {from} address exists
   *   @param {String} opts.callback        callback URL to handle the response
   * @returns {Promise<Object, Error>}      a promise which resolves to a signed JWT or rejects with an error
   */
  async createTypedDataSignatureRequest(
    typedData: EIP712Object,
    { from, net, callback }: NetworkRequest = {}
  ) {
    // Check if the typedData is a valid ERC712 request
    for (const prop of ['types', 'primaryType', 'message', 'domain']) {
      if (!typedData[prop])
        throw new Error(`Invalid EIP712 Request, must include '${prop}'`)
    }

    return await this.signJWT({
      typedData,
      from,
      net,
      callback,
      type: Types.TYPED_DATA_SIGNATURE_REQUEST
    })
  }

  /**
   * Create a JWT requesting an eth_sign/personal_sign from a user.
   * @param {String} data hex encoded data to sign
   * @param {Object} opts Additional options for request
   * @returns {Promise<Object, Error>}
   */
  createPersonalSignRequest(
    data: string,
    { from, net, callback }: NetworkRequest = {}
  ) {
    return this.signJWT({
      data,
      from,
      net,
      callback,
      type: Types.PERSONAL_SIGN_REQUEST
    })
  }

  /**
   *  Given a transaction object, similarly defined as the web3 transaction object,
   *  it creates a JWT transaction request and appends addtional request options.
   *
   *  ```javascript
   *  const txObject = {
   *    to: '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347',
   *    value: '0.1',
   *    fn: "setStatus(string 'hello', bytes32 '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347')",
   *  }
   *  connect.createTxRequest(txObject, {callbackUrl: 'http://mycb.domain'}).then(jwt => {
   *    ...
   *  })
   * ```
   *
   *  @param    {Object}    txObj               A web3 style transaction object
   *  @param    {Object}    [opts]
   *  @param    {String}    [opts.callbackUrl]  The url to receive the response of this request
   *  @param    {String}    [opts.exp]          Time at which this request expires and is no longer valid (seconds since epoch)
   *  @param    {String}    [opts.networkId]    Network ID for which this transaction request is for
   *  @param    {String}    [opts.label]
   *  @return   {String}                        a transaction request jwt
   */
  createTxRequest(
    txObj: TransactionRequest,
    { callbackUrl, exp = 600, networkId, label }: TxReqOptions = {}
  ) {
    const payload: TxReqPayload = {}
    if (callbackUrl) payload.callback = callbackUrl
    if (networkId) payload.net = networkId
    if (label) payload.label = label
    return this.signJWT(
      { ...payload, ...txObj, type: Types.ETH_TX_REQUEST },
      exp
    )
  }

  /**
   * Creates a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).
   *
   * This can either be used to share information about the signing identity or as the response to a
   * [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md),
   * where it can be used to authenticate the identity.
   *
   *  ```javascript
   *  credentials.createDisclosureResponse({own: {name: 'Lourdes Valentina Gomez'}}).then(jwt => {
   *      ...
   *  })
   * ```
   *
   *  @param    {Object}             [payload={}]           request params object
   *  @param    {JWT}                payload.req            A selective disclosure Request JWT if this is returned as part of an authentication flow
   *  @param    {Object}             payload.own            An object of self attested claims about the signer (eg. name etc)
   *  @param    {Array}              payload.verified       An array of attestation JWT's to include
   *  @param    {MNID}               payload.nad            An ethereum address encoded as an [MNID](https://github.com/uport-project/mnid)
   *  @param    {Array}              payload.capabilities   An array of capability JWT's to include
   *  @return   {Promise<Object, Error>}                    a promise which resolves with a signed JSON Web Token or rejects with an error
   */
  async createDisclosureResponse(
    payload: DisclosureResponsePayload = {},
    expiresIn = 600
  ) {
    if (payload.req) {
      const verified = await verifyJWT(payload.req)
      if (verified.issuer) {
        payload.aud = verified.issuer
      }
    }
    return this.signJWT(
      { ...payload, type: Types.DISCLOSURE_RESPONSE },
      expiresIn
    )
  }

  /**
   * Parse a selective disclosure response, and verify signatures on each signed claim ("verification") included.
   * This function renames and applies special handling to certain recognized key-value pairs, and preserves others
   * untouched.
   *
   * @private @deprecated
   * @param     {Object}             response           A selective disclosure response payload, with associated did doc
   * @param     {Object}             response.payload   A selective disclosure response payload, with associated did doc
   * @param     {Object}             response.doc
   */
  async processDisclosurePayload({
    doc,
    payload
  }: DisclosurePayload): Promise<DisclosureResponse> {
    // Extract known key-value pairs from payload
    const {
      own = {},
      capabilities = [],
      aud, // ignored
      req, // ignored
      iat, // ignored
      exp, // ignored
      type,
      nad: mnid,
      dad: deviceKey,
      iss: did,
      boxPub,
      verified,
      ...rest
    } = payload

    const { uportProfile = {} } = doc

    // Combine doc and payload into a single object, changing the names of some keys
    const processed: DisclosureResponse = {
      did,
      boxPub,
      ...own,
      ...uportProfile,
      ...rest
      // aud, req, iat, exp are intentionally left out
    }

    if (deviceKey) processed.deviceKey = deviceKey

    if (mnid) {
      processed.mnid = mnid
      processed.address = mnidDecode(mnid).address
    }

    // Push notifications are the only supported capability at the moment
    if (capabilities.length === 1) {
      processed.pushToken = capabilities[0]
    }

    // Verify and decode each jwt included in the `verified` array,
    // and return the verified property as an array of decoded objects.
    // Return invalid jwts in the `invalid` array
    if (verified) {
      const invalid: string[] = []
      const verifying: Array<Promise<undefined | VerifiedJWT>> = verified.map(
        token =>
          verifyJWT(token, { audience: this.did }).catch(() => {
            invalid.push(token)
            return Promise.resolve(undefined)
          })
      )

      // Format payloads and remove invalid JWTs
      const unfiltered = await Promise.all(verifying)
      const verifications: Verification[] = []
      unfiltered.forEach(item => {
        if (item) {
          verifications.push(<Verification>{ ...item.payload, jwt: item.jwt })
        }
      })
      processed.verified = verifications

      processed.invalid = invalid
    }

    return processed
  }

  /**
   *  Authenticates [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md) from uPort
   *  client as part of the [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md).
   *
   *  It Verifies and parses the given response token and verifies the challenge response flow.
   *
   *  ```javascript
   *  const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
   *  credentials.authenticateDisclosureResponse(resToken).then(res => {
   *      const credentials = res.verified
   *      const name =  res.name
   *      ...
   *  })
   * ```
   *
   *  @param    {String}                  token                 a response token
   *  @param    {String}                  [callbackUrl=null]    callbackUrl
   *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
   */
  async authenticateDisclosureResponse(token: string, callbackUrl?: string) {
    const { payload, doc }: DisclosurePayload = await verifyJWT(token, {
      audience: this.did,
      callbackUrl,
      auth: true
    })

    if (payload.req) {
      const challengeReq = await verifyJWT(payload.req, { audience: this.did })
      const request: DisclosureRequestPayload = challengeReq.payload
      if (request.type !== Types.DISCLOSURE_REQUEST) {
        throw new Error(`Challenge payload type invalid: ${request.type}`)
      } else {
        return this.processDisclosurePayload({ payload, doc })
      }
    } else {
      throw new Error('Challenge was not included in response')
    }
  }

  /**
   *  Verify and return profile from a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).
   *
   * The main difference between this and `authenticateDisclosureResponse()` is that it does not verify the challenge.
   * This can be used to verify user profiles that have been shared through other methods such as QR codes and messages.
   *
   * ```javascript
   *  const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
   *  credentials.verifyDisclosure(resToken).then(profile => {
   *      const credentials = profile.verified
   *      const name =  profile.name
   *      ...
   *  })
   * ```
   *
   *  @param    {String}                  token                 a response token
   *  @return   {Promise<Object, Error>}                        a promise which resolves with a parsed response or rejects with an error.
   */
  async verifyDisclosure(token: string) {
    const { payload, doc } = await verifyJWT(token, { audience: this.did })
    return this.processDisclosurePayload({ payload, doc })
  }

  /**
   *  Builds and returns a contract object which can be used to interact with
   *  a given contract. Similar to web3.eth.contract but with promises. Once specifying .at(address)
   *  you can call the contract functions with this object. Each call will create a request.
   *
   *  @param    {Object}       abi          contract ABI
   *  @return   {Object}                    contract object
   */
  contract(abi: ContractABI): Factory {
    const txObjHandler = (txObj: TransactionRequest, opts?: TxReqOptions) => {
      if (txObj.function) txObj.fn = txObj.function
      delete txObj['function']
      return this.createTxRequest(txObj, opts)
    }
    return ContractFactory(txObjHandler.bind(this))(abi)
  }
}

function configNetworks(nets: Networks) {
  Object.keys(nets).forEach(key => {
    const net = nets[key]
    if (typeof net === 'object') {
      ;['registry', 'rpcUrl'].forEach(key => {
        if (!net.hasOwnProperty(key)) {
          throw new Error(
            `Malformed network config object, object must have '${key}' key specified.`
          )
        }
      })
    } else {
      throw new Error(`Network configuration object required`)
    }
  })
  return nets
}

export default Credentials
