import Credentials from '../src/Credentials'
import { createJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
import nock from 'nock'
import MockDate from 'mockdate'
MockDate.set(1485321133 * 1000)

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.derivePublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)
const profileA = {publicKey, name: 'David Chaum'}
const registry = (address) => new Promise((resolve, reject) => resolve(address === '0x001122' ? profileA : null))
const uport = new Credentials({signer, address: '0x001122', registry})
const uport2 = new Credentials({registry})

describe('createRequest', () => {
  it('creates a valid JWT for a request', () => {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return expect(verifier.verify(jwt)).toBeTruthy()
    })
  })

  it('has correct payload in JWT for a plain request for public details', () => {
    return uport.createRequest().then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT requesting a specific network_id', () => {
    return uport.createRequest({network_id: '0x4'}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT requesting a specific accountType', () => {
    return uport.createRequest({accountType: 'devicekey'}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT requesting a bad accountType', () => {
    return uport.createRequest({accountType: 'bad_account_type'}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('ignores unsupported request parameters', () => {
    return uport.createRequest({signing: true, sellSoul: true}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT for a request', () => {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT for a request asking for verified credentials', () => {
    return uport.createRequest({requested: ['name', 'phone'], verified: ['name']}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT for a request with callbackUrl', () => {
    return uport.createRequest({ requested: ['name', 'phone'], callbackUrl: 'https://myserver.com'}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })

  it('has correct payload in JWT for a request for push notifications', () => {
    return uport.createRequest({ requested: ['name', 'phone'], notifications: true }).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })
})

describe('createVerificationRequest', () => {
  it('creates a valid JWT for a request', () => {
    return uport.createVerificationRequest({claim: { test: {prop1: 1, prop2: 2}}}, 'did:uport:223ab45').then((jwt) => {
      return expect(verifier.verify(jwt)).toBeTruthy()
    })
  })

  it('has correct payload in JWT for a request', () => {
    return uport.createVerificationRequest({claim: { test: {prop1: 1, prop2: 2}}}, 'did:uport:223ab45').then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })
})

describe('attest', () => {
  it('creates a valid JWT for an attestation', () => {
    return uport.attest({sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133 + 1}).then((jwt) => {
      return expect(verifier.verify(jwt)).toBeTruthy()
    })
  })

  it('has correct payload in JWT for an attestation', () => {
    return uport.attest({sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133 + 1}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })
})

describe('receive', () => {

  function createShareResp (payload = {}) {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return createJWT({address: '0x001122', signer}, {...payload, type: 'shareResp', req:jwt})
    })
  }

  function createShareRespMissingRequest (payload = {}) {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return createJWT({address: '0x001122', signer}, {...payload, type: 'shareResp'})
    })
  }

  function createShareRespWithExpiredRequest (payload = {}) {
    return uport.createRequest({requested: ['name', 'phone'], exp: Date.now() - 1}).then((jwt) => {
      return createJWT({address: '0x001122', signer}, {...payload, type: 'shareResp', req:jwt})
    })
  }

  function createShareRespWithVerifiedCredential (payload = {}, verifiedClaim = {sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133 + 1}) {
    return uport.attest(verifiedClaim).then(jwt => {
      return createShareResp({...payload, verified: [jwt]})
    })
  }

  it('returns profile mixing public and private claims', () => {
    return createShareResp({own: {name: 'Davie', phone: '+15555551234'}}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile mixing public and private claims and verified credentials', () => {
    return createShareRespWithVerifiedCredential({own: {name: 'Davie', phone: '+15555551234'}}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile with only public claims', () => {
    return createShareResp().then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile with private chain network id claims', () => {
    return createShareResp({nad: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile with device key claims', () => {
    return createShareResp({dad: '0xdeviceKey'}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns pushToken if available', () => {
    return createShareResp({capabilities: ['PUSHTOKEN']}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile.pushToken).toEqual('PUSHTOKEN')
    )
  })

  it('handles response to expired request', () => {
    return createShareRespWithExpiredRequest().then(jwt => uport.receive(jwt)).catch(error => expect(error.message).toEqual('JWT has expired: exp: 1485321132999 < now: 1485321133'))
  })

  it('handles response with missing challenge', () => {
    return createShareRespMissingRequest().then(jwt => uport.receive(jwt)).catch(error => expect(error.message).toEqual('Challenge was not included in response'))
  })

/////////////////////////////// no address in uport settings ///////////////////////////////

  it('returns profile mixing public and private claims', () => {
    return createShareResp({own: {name: 'Davie', phone: '+15555551234'}}).then(jwt => uport2.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile mixing public and private claims and verified credentials', () => {
    return createShareRespWithVerifiedCredential({own: {name: 'Davie', phone: '+15555551234'}}).then(jwt => uport2.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile with only public claims', () => {
    return createShareResp().then(jwt => uport2.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns profile with private chain network id claims', () => {
    return createShareResp({nad: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'}).then(jwt => uport2.receive(jwt)).then(profile =>
      expect(profile).toMatchSnapshot()
    )
  })

  it('returns pushToken if available', () => {
    return createShareResp({capabilities: ['PUSHTOKEN']}).then(jwt => uport2.receive(jwt)).then(profile =>
      expect(profile.pushToken).toEqual('PUSHTOKEN')
    )
  })

/////////////////////////////// no address in uport settings///////////////////////////////
})

describe('push', () => {
  const PUTUTU_URL = 'https://pututu.uport.space' // TODO - change to .me
  const API_v1_PATH = '/api/v1/sns'
  const API_v2_PATH = '/api/v2/sns'
  const PUSHTOKEN = 'SECRETPUSHTOKEN'
  const payload = { url: 'me.uport:me', message: 'a friendly message' }
  const kp = nacl.box.keyPair()
  const pubEncKey = naclutil.encodeBase64(kp.publicKey)
  const secEncKey = kp.secretKey

  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.enableNetConnect()
  })

  it('pushes url to pututu', () => {
    nock(PUTUTU_URL, {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post(API_v2_PATH, (body) => {
      let encObj = JSON.parse(body.message)
      const box = naclutil.decodeBase64(encObj.ciphertext)
      const nonce = naclutil.decodeBase64(encObj.nonce)
      const from = naclutil.decodeBase64(encObj.from)
      const decrypted = nacl.box.open(box, nonce, from, secEncKey)
      const result = JSON.parse(naclutil.encodeUTF8(decrypted))

      return result.url === payload.url && result.message === payload.message
    })
    .reply(200, { status: 'success', message: 'd0b2bd07-d49e-5ba1-9b05-ec23ac921930' })

    return uport.push(PUSHTOKEN, pubEncKey, payload).then(response => {
      return expect(response).toEqual({ status: 'success', message: 'd0b2bd07-d49e-5ba1-9b05-ec23ac921930' })
    })
  })

  it('handles missing token', () => {
    return uport.push(null, pubEncKey, payload).catch(error => expect(error.message).toEqual('Missing push notification token'))
  })

  it('handles missing payload', async () => {
    await uport.push(PUSHTOKEN, pubEncKey).catch(error => expect(error.message).toEqual('Missing payload url for sending to users device'))
    await uport.push(PUSHTOKEN, pubEncKey, {}).catch(error => expect(error.message).toEqual('Missing payload url for sending to users device'))
  })

  it('handles invalid token', () => {
    nock(PUTUTU_URL, {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post(API_v2_PATH, () => true)
    .reply(403, 'Not allowed')

    return uport.push(PUSHTOKEN, pubEncKey, payload).catch(error => expect(error.message).toEqual('Error sending push notification to user: Invalid Token'))
  })

  it('handles random error', () => {
    nock(PUTUTU_URL, {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post(API_v2_PATH, () => true)
    .reply(500, 'Server Error')

    return uport.push(PUSHTOKEN, pubEncKey, payload).catch(error => expect(error.message).toEqual('Error sending push notification to user: 500 Server Error'))
  })
})

describe('registry', () => {
  it('has a default registry that looks up profile', () => {
    return new Credentials().settings.registry('0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c').then(profile =>
      expect(profile.publicKey).toEqual('0x0482780d59037778ea03c7d5169dd7cf47a835cb6d57a606b4e6cf98000a28d20d6d6bfae223cc76fd2f63d8a382a1c054788c4fafb1062ee89e718b96e0896d40')
    )
  })

  it('has ability to lookup profile', () => {
    return new Credentials().lookup('0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c').then(profile =>
      expect(profile.publicKey).toEqual('0x0482780d59037778ea03c7d5169dd7cf47a835cb6d57a606b4e6cf98000a28d20d6d6bfae223cc76fd2f63d8a382a1c054788c4fafb1062ee89e718b96e0896d40')
    )
  })
})

describe('configNetworks', () => {
  it('should accept a valid network setting', () => {
    const networks = {'0x94365e3b': { rpcUrl: 'https://private.chain/rpc', registry: '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c' }}
    const credentials =  new Credentials({networks})
    expect(credentials.settings.networks).toEqual(networks)
  })

  it('should require a registry address', () => {
    const networks = {'0x94365e3b': { rpcUrl: 'https://private.chain/rpc' }}
    expect(() => new Credentials({networks})).toThrowErrorMatchingSnapshot()
  })

  it('should require a rpcUrl', () => {
    const networks = {'0x94365e3b': { registry: '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c' }}
    expect(() => new Credentials({networks})).toThrowErrorMatchingSnapshot()
  })

  it('if networks key is passed in it must contain configuration object', () => {
    const networks = {'0x94365e3b': 'hey'}
    expect(() => new Credentials({networks})).toThrowErrorMatchingSnapshot()
  })
})
