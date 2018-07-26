import Credentials from '../Credentials'
import { createJWT, verifyJWT } from '../JWT'
import { SimpleSigner, decodeJWT } from 'did-jwt'
import MockDate from 'mockdate'
import { registerMethod } from 'did-resolver'
import nacl from 'tweetnacl'
import naclutil from 'tweetnacl-util'
import nock from 'nock'
MockDate.set(1485321133 * 1000)

const privateKey = '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
const signer = SimpleSigner(privateKey)
const address = '0xbc3ae59bc76f894822622cdef7a2018dbe353840'
const mnid = '2nQtiQG6Cgm1GYTBaaKAgr76uY7iSexUkqX'
const did = `did:ethr:${mnid}`

const claim = {sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133 + 1}

const uport = new Credentials({signer: signer, address: mnid})
const uport2 = new Credentials({})

function mockresolver (profile) {
  registerMethod('uport', async (id, parsed) => {
    const doc = {
      '@context': 'https://w3id.org/did/v1',
      id,
      publicKey: [{
        id: `${id}#owner`,
        type: 'Secp256k1VerificationKey2018',
        publicKeyHex: '048f71f156f9b489d8c566c9943585d4c255aa5d22924abe3b9f7997de46a378ac89a668eacb9053ceac72f6a0abdeee025d61984059a6732e6cb4f106ed281ffe',
        owner: id,
        ethereumAddress: parsed.id
      }],
      authentication: [{
        type: 'Secp256k1SignatureAuthentication2018',
        publicKey: `${id}#owner`
      }]
    }
    if (profile) {
      doc.uportProfile = profile
    }
    return doc
  })
}

describe('configuration', () => {

  describe('sets did', () => {
    it('ethereum `address` configured', () => {
      expect(() => new Credentials({address: `did:uport:${mnid}`})).toThrowError('Only MNID/hex app identities supported')
    })
  })

  describe('sets signer', () => {
    it('always uses signer if passed in', () => {
      const signer = SimpleSigner(privateKey)
      expect(new Credentials({signer, mnid}).settings.signer).toEqual(signer)
    })
  })

  describe('configNetworks', () => {
    it('should accept a valid network setting', () => {
      const networks = {'0x94365e3b': { rpcUrl: 'https://private.chain/rpc', registry: '0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c' }}
      const credentials =  new Credentials({networks})
      // What is the opposite of toThrow()??
      expect(true).toBeTruthy()
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
})

describe('signJWT', () => {
  describe('uport method', () => {
    it('uses ES256K algorithm', async () => {
      const credentials = new Credentials({address: mnid, signer: signer})
      const jwt = await createJWT({address: address, signer: signer}, {hello: 1})
      const { header } = decodeJWT(jwt)
      expect(header.alg).toEqual('ES256K')
    })
  })

})

describe('createRequest()', () => {
  beforeAll(() => mockresolver())
  async function createAndVerify (params={}) {
    const jwt = await uport.createRequest(params)
    return await verifyJWT({address: mnid, signer: signer}, jwt)
  }
  it('creates a valid JWT for a request', async () => {
    const response = await createAndVerify({requested: ['name', 'phone']})
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT for a plain request for public details', async () => {
    const response = await createAndVerify()
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT requesting a specific network_id', async () => {
    const response = await createAndVerify({network_id: '0x4'})
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT requesting a specific network_id', async () => {
    const response = await createAndVerify({network_id: '0x4'})
    return expect(response).toMatchSnapshot()
  })

  for (let accountType of ['general', 'segregated', 'keypair', 'devicekey', 'none']) {
    it(`has correct payload in JWT requesting accountType of ${accountType}`, async () => {
      const response = await createAndVerify({accountType})
      return expect(response).toMatchSnapshot()
    })
  }

  it(`has correct payload in JWT requesting unsupported accountType`, async () => {
    expect(createAndVerify({accountType: 'gold'})).rejects.toMatchSnapshot()
  })

  it('ignores unsupported request parameters', async () => {
    const response = await createAndVerify({signing: true, sellSoul: true})
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT for a request', async () => {
    const response = await createAndVerify({requested: ['name', 'phone']})
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT for a request asking for verified credentials', async () => {
    const response = await createAndVerify({requested: ['name', 'phone'], verified: ['name']})
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT for a request with callbackUrl', async () => {
    const response = await createAndVerify({requested: ['name', 'phone'], callbackUrl: 'https://myserver.com'})
    return expect(response).toMatchSnapshot()
  })

  it('has correct payload in JWT for a request for push notifications', async () => {
    const response = await createAndVerify({requested: ['name', 'phone'], notifications: true})
    return expect(response).toMatchSnapshot()
  })
})

describe('LEGACY createRequest()', () => {
  beforeAll(() => mockresolver())
  async function createAndVerify (params={}) {
    const jwt = await uport.createRequest(params)
    return await verifyJWT({}, jwt)
  }
  it('creates a valid JWT for a request', async () => {
    const response = await createAndVerify({requested: ['name', 'phone']})
    return expect(response).toMatchSnapshot()
  })
})

describe('createVerificationRequest', () => {
  it('creates a valid JWT for a request', async () => {
    const jwt = await uport.createVerificationRequest({claim: { test: {prop1: 1, prop2: 2}}}, 'did:uport:223ab45')
    return expect(await verifyJWT({audience: did}, jwt)).toMatchSnapshot()
  })
})

describe('attest()', () => {
  beforeAll(() => mockresolver())
  it('has correct payload in JWT for an attestation', () => {
    return uport.attest({sub: 'did:uport:223ab45', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133 + 1}).then((jwt) => {
      return expect(verifyJWT({audience: did}, jwt)).toMatchSnapshot()
    })
  })
})

describe('authenticate()', () => {
  beforeAll(() => mockresolver({
    name: 'Super Developer',
    country: 'NI'
  }))

  async function createShareResp (payload = {}) {
    const req = await uport.createRequest({requested: ['name', 'phone']})
    return createJWT({address: mnid, signer: signer}, {...payload, req})
  }

  async function createShareRespWithVerifiedCredential (payload = {}) {
    const req = await uport.createRequest({requested: ['name', 'phone']})
    const attestation = await uport.attest(claim)
    return createJWT({address: mnid, signer: signer}, {...payload, verified: [attestation], req})
  }

  it('returns profile mixing public and private claims', async () => {
    const jwt = await createShareResp({own: {name: 'Davie', phone: '+15555551234'}})
    const profile = await uport.authenticate(jwt)
    expect(profile).toMatchSnapshot()
  })

  it('returns profile mixing public and private claims and verified credentials', async () => {
    const jwt = await createShareRespWithVerifiedCredential({own: {name: 'Davie', phone: '+15555551234'}})
    const profile = await uport.authenticate(jwt)
    expect(profile).toMatchSnapshot()
  })

  it('returns profile with only public claims', async () => {
    const jwt = await createShareResp()
    const profile = await uport.authenticate(jwt)
    expect(profile).toMatchSnapshot()
  })

  it('returns profile with private chain network id claims', async () => {
    const jwt = await createShareResp({nad: '34wjsxwvduano7NFC8ujNJnFjbacgYeWA8m'})
    const profile = await uport.authenticate(jwt)
    expect(profile).toMatchSnapshot()
  })

  it('returns profile with device key claims', async () => {
    const jwt = await createShareResp({dad: '0xdeviceKey'})
    const profile = await uport.authenticate(jwt)
    expect(profile).toMatchSnapshot()
  })

  it('returns pushToken if available', async () => {
    const jwt = await createShareResp({capabilities: ['PUSHTOKEN']})
    const profile = await uport.authenticate(jwt)
    expect(profile).toMatchSnapshot()
  })

  it('handles response with missing challenge', async () => {
    const jwt = await createJWT({address: mnid, signer: signer}, {own: {name: 'bob'}})
    expect(uport.authenticate(jwt)).toMatchSnapshot()
  })
})

describe('LEGACY receive()', () => {
  beforeAll(() => mockresolver({
    name: 'Bob Smith',
    country: 'NI'
  }))
  it('returns profile mixing public and private claims', async () => {
    const req = await uport.createRequest({requested: ['name', 'phone']})
    const jwt = await createJWT({address: mnid, signer: signer}, {own: {name: 'Davie', phone: '+15555551234'}, req})
    const profile = await uport.receive(jwt)
    expect(profile).toMatchSnapshot()
  })
})

describe('receive', () => {

  function createShareResp (payload = {}) {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return createJWT({address: mnid, signer: signer}, {...payload, type: 'shareResp', req: jwt})
    })
  }

  function createShareRespMissingRequest (payload = {}) {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return createJWT({address: mnid, signer: signer}, {...payload, type: 'shareResp'})
    })
  }

  function createShareRespWithExpiredRequest (payload = {}) {
    return uport.createRequest({requested: ['name', 'phone'], exp: Date.now() - 1}).then((jwt) => {
      return createJWT({address: mnid, signer: signer}, {...payload, type: 'shareResp', req: jwt})
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
    return createShareResp({capabilities: ['PUSHTOKEN']}).then(jwt => uport.receive(jwt)).then(profile => {
      expect(profile.pushToken).toEqual('PUSHTOKEN')
    }
    )
  })
})

describe('push', () => {
  const PUTUTU_URL = 'https://api.uport.me'//'https://pututu.uport.space' // TODO - change to .me
  const API_v1_PATH = '/api/v1/sns'
  const API_v2_PATH = '/pututu/sns'
  const lambda = '/pututu/sns'
  const PUSHTOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1MzExOTcwMzgsImV4cCI6MTUzMjQ5MzAzOCwiYXVkIjoiMzVERFh3RjZIZHI2ZFFRbzFCUndRcnU3VzNkNTRhdnpCd2siLCJ0eXBlIjoibm90aWZpY2F0aW9ucyIsInZhbHVlIjoiYXJuOmF3czpzbnM6dXMtd2VzdC0yOjExMzE5NjIxNjU1ODplbmRwb2ludC9BUE5TL3VQb3J0LzVmMTA4YjZlLTk3NTItM2IwZC05NWM2LWYyZTU3MTM4ZWNlNSIsImlzcyI6ImRpZDpldGhyOjB4YjA2ZDJjZWY5ZDJjYTA3MjU2NmU3Y2RlZDMyYWI0OWY1OTFlNDRlOCJ9.0qZE3N2m7rTn8JaNVfp5LhICmzEWCqTBBh9_gn4ZGD19PCfhInX7XTav0JBRBtSKkJXx03nik9k4jZ3qvQ6CigE'
  const token = PUSHTOKEN
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
    .post(lambda, (body) => {
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

  it('handles missing pubEncKey', () => {
    nock('https://pututu.uport.space', {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post(API_v1_PATH, (body) => {
      return body.message === payload.message && body.url === payload.url
    })
    .reply(200, { status: 'success', message: 'd0b2bd07-d49e-5ba1-9b05-ec23ac921930' })

    console.error = jest.fn(msg => {
      expect(msg).toEqual('WARNING: Calling push without a public encryption key is deprecated')
    })
    return uport.push(PUSHTOKEN, null, payload).catch(error => expect(error.message).toEqual('Missing public encryption key of the receiver'))
  })

  it('handles missing payload', () => {
    return uport.push(PUSHTOKEN, pubEncKey, {}).catch(error => expect(error.message).toEqual('Missing payload url for sending to users device'))
  })

  it('handles invalid token', () => {
    nock(PUTUTU_URL, {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post(lambda, (body) => {
      let encObj = JSON.parse(body.message)
      const box = naclutil.decodeBase64(encObj.ciphertext)
      const nonce = naclutil.decodeBase64(encObj.nonce)
      const from = naclutil.decodeBase64(encObj.from)
      const decrypted = nacl.box.open(box, nonce, from, secEncKey)
      const result = JSON.parse(naclutil.encodeUTF8(decrypted))

      return result.url === payload.url && result.message === payload.message
    })
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
