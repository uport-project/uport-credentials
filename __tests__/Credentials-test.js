import Credentials from '../src/Credentials'
import { createJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
import nock from 'nock'
import MockDate from 'mockdate'
MockDate.set(1485321133996)

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.privateKeyToPublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)
const profileA = {publicKey, name: 'David Chaum'}
const registry = (address) => new Promise((resolve, reject) => resolve(address === '0x001122' ? profileA : null))
const uport = new Credentials({signer, address: '0x001122', registry})

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

describe('attest', () => {
  it('creates a valid JWT for an attestation', () => {
    return uport.attest({sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133996 + 1000}).then((jwt) => {
      return expect(verifier.verify(jwt)).toBeTruthy()
    })
  })

  it('has correct payload in JWT for an attestation', () => {
    return uport.attest({sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133996 + 1000}).then((jwt) => {
      return expect(decodeToken(jwt)).toMatchSnapshot()
    })
  })
})

describe('receive', () => {
  function createShareResp (payload = {}) {
    return createJWT({address: '0x001122', signer}, {...payload, type: 'shareResp'})
  }

  function createShareRespWithVerifiedCredential (payload = {}, verifiedClaim = {sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133996 + 1000}) {
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

  it('returns pushToken if available', () => {
    return createShareResp({capabilities: ['PUSHTOKEN']}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile.pushToken).toEqual('PUSHTOKEN')
    )
  })
})

describe('push', () => {
  const PUSHTOKEN = 'SECRETPUSHTOKEN'
  const payloadUrl = 'me.uport:me'

  beforeEach(() => {
    nock.disableNetConnect()
  })

  afterEach(() => {
    nock.enableNetConnect()
  })

  it('pushes url to pututu', () => {
    nock('https://pututu.uport.me', {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post('/api/v1/sns', {url: payloadUrl})
    .reply(200, { status: 'success', message: 'd0b2bd07-d49e-5ba1-9b05-ec23ac921930' })

    return uport.push(PUSHTOKEN, {url: payloadUrl}).then(response => {
      return expect(response).toEqual({ status: 'success', message: 'd0b2bd07-d49e-5ba1-9b05-ec23ac921930' })
    })
  })

  it('handles missing token', () => {
    return uport.push(null, {url: payloadUrl}).catch(error => expect(error.message).toEqual('Missing push notification token'))
  })

  it('handles missing payload', () => {
    return uport.push(PUSHTOKEN, {}).catch(error => expect(error.message).toEqual('Missing payload url for sending to users device'))
  })

  it('handles invalid token', () => {
    nock('https://pututu.uport.me', {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post('/api/v1/sns', {url: payloadUrl})
    .reply(403, 'Not allowed')

    return uport.push(PUSHTOKEN, {url: payloadUrl}).catch(error => expect(error.message).toEqual('Error sending push notification to user: Invalid Token'))
  })

  it('handles random error', () => {
    nock('https://pututu.uport.me', {
      reqheaders: {
        'authorization': `Bearer ${PUSHTOKEN}`
      }
    })
    .post('/api/v1/sns', {url: payloadUrl})
    .reply(500, 'Server Error')

    return uport.push(PUSHTOKEN, {url: payloadUrl}).catch(error => expect(error.message).toEqual('Error sending push notification to user: 500 Server Error'))
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
