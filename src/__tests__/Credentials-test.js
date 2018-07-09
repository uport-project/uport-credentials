import Credentials from '../Credentials'
import { SimpleSigner, createJWT, verifyJWT, decodeJWT } from 'did-jwt'
import MockDate from 'mockdate'
import { registerMethod } from 'did-resolver'

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
    describe('ethereum `address` configured', () => {
      expect(new Credentials({address})).toThrowError()
    })

    describe('mnid `address` configured', () => {
      expect(new Credentials({address: mnid}).settings.did).toEqual(`did:uport:${mnid}`)
    })
  })

  describe('sets signer', () => {
    describe('always uses signer if passed in', () => {
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
      const jwt = await credentials.signJWT({hello: 1})
      const { header } = decodeJWT(jwt)
      expect(header.alg).toEqual('ES256K')
    })
  })

})

describe('createRequest()', () => {
  beforeAll(() => mockresolver())
  async function createAndVerify (params={}) {
    const jwt = await uport.createRequest(params)
    return await verifyJWT(jwt)
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
    return await verifyJWT(jwt)
  }
  it('creates a valid JWT for a request', async () => {
    const response = await createAndVerify({requested: ['name', 'phone']})
    return expect(response).toMatchSnapshot()
  })
})

describe('createVerificationRequest', () => {
  it('creates a valid JWT for a request', async () => {
    const jwt = await uport.createVerificationRequest({claim: { test: {prop1: 1, prop2: 2}}}, 'did:uport:223ab45')
    return expect(await verifyJWT(jwt, {audience: did})).toMatchSnapshot()
  })
})

describe('attest()', () => {
  beforeAll(() => mockresolver())
  it('has correct payload in JWT for an attestation', () => {
    return uport.attest({sub: 'did:uport:223ab45', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133 + 1}).then((jwt) => {
      return expect(verifyJWT(jwt)).toMatchSnapshot()
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
    return uport.disclose({...payload, req})
  }

  async function createShareRespWithVerifiedCredential (payload = {}) {
    const req = await uport.createRequest({requested: ['name', 'phone']})
    const attestation = await uport.attest(claim)
    return uport.disclose({...payload, verified: [attestation], req})
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
    const jwt = await uport.disclose({own: {name: 'bob'}})
    expect(uport.authenticate(jwt)).rejects.toMatchSnapshot()
  })
})

describe('LEGACY receive()', () => {
  beforeAll(() => mockresolver({
    name: 'Bob Smith',
    country: 'NI'
  }))
  it('returns profile mixing public and private claims', async () => {
    const req = await uport.requestDisclosure({requested: ['name', 'phone']})
    const jwt = await uport.disclose({own: {name: 'Davie', phone: '+15555551234'}, req})
    const profile = await uport.receive(jwt)
    expect(profile).toMatchSnapshot()
  })
})
