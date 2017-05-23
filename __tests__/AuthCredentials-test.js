import AuthCredentials from '../src/AuthCredentials'
import { createJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
const sinon = require('sinon')
import nock from 'nock'
import redisMock from 'redis-mock'
import MockDate from 'mockdate'
MockDate.set(1485321133996)

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.privateKeyToPublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)
const profileA = {publicKey, name: 'David Chaum'}
const registry = (address) => new Promise((resolve, reject) => resolve(address === '0x001122' ? profileA : null))
const uport = new AuthCredentials({signer, address: '0x001122', registry})
const rand1 = 'db2ad7a398dfdd897f5b7ebac6e5995d482a824917c8251cfe30c86926510fa8'
const rand2 = '6d98e4827b8912cf4b061d0d16ac68577b6e0632ff2a4ce89ed70c537334f0ac'
const challenge = rand1
const pairId = rand2
const response = 'word'
const invalidChallenge = rand1
const challengeKeyPrefix = `challenge`
const responseKeyPrefix = `response`

describe('createRequest', () => {

  let uport, rRedis, cRedis

  beforeEach(() => {
    uport = new AuthCredentials({signer, address: '0x001122', registry})

    const random = sinon.stub()
    random.onCall(0).returns(rand1);
    random.onCall(1).returns(rand2);

    uport.random = random
    uport.challengeStorage.client = redisMock.createClient()
    uport.responseStorage.client = redisMock.createClient()
    rRedis = uport.responseStorage.client
    cRedis = uport.responseStorage.client
  })

  it('creates a valid JWT for a request', () => {
    return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
      return expect(verifier.verify(jwt)).toBeTruthy()
    })
  })

  it('has correct payload in JWT for a plain request for public details', () => {
    return uport.createRequest().then((jwt) => {
      console.log(jwt)
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

  it('inlcudes a challenge and pairId in the payload in the JWT', () => {
    return uport.createRequest({ requested: ['name', 'phone']}).then((jwt) => {
      const decodedJWT = decodeToken(jwt)
      expect(decodedJWT.payload.challenge).toEqual(challenge)
      expect(decodedJWT.payload.pairId).toEqual(pairId)
    })
  })

  it('stores a challenge with the pairId in storage', (done) => {
    uport.createRequest({ requested: ['name', 'phone']}).then((jwt) => {
      cRedis.get(`${challengeKeyPrefix}:${pairId}`, (err, res) => {
          if (err) throw new Error('Redis client could not get value')
          expect(res).toEqual(challenge)
          done()
      })
    })
  })
})

describe('receive', () => {

  let uport, rRedis, cRedis

  beforeEach((done) => {
    uport = new AuthCredentials({signer, address: '0x001122', registry})

    uport.challengeStorage.client = redisMock.createClient()
    uport.responseStorage.client = redisMock.createClient()
    rRedis = uport.responseStorage.client
    cRedis = uport.responseStorage.client

    cRedis.set(`${challengeKeyPrefix}:${pairId}`, challenge, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        done()
    })
  })

  function createShareResp (payload = {}) {
    return createJWT({address: '0x001122', signer}, {...payload, challenge, pairId, type: 'shareResp'})
  }

  function createInvalidShareResp (payload = {}) {
    return createJWT({address: '0x001122', signer}, {...payload, challenge: '123456789101121314151617181920', pairId, type: 'shareResp'})
  }

  function createShareRespWithVerifiedCredential (payload = {}, verifiedClaim = {sub: '0x112233', claim: {email: 'bingbangbung@email.com'}, exp: 1485321133996 + 1000}) {
    return uport.attest(verifiedClaim).then(jwt => {
      return createShareResp({...payload, challenge, pairId, verified: [jwt]})
    })
  }

  // All tests only return if the challenge is valid, otherwise they would fail

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

  it('returns pushToken if available', () => {
    return createShareResp({capabilities: ['PUSHTOKEN']}).then(jwt => uport.receive(jwt)).then(profile =>
      expect(profile.pushToken).toEqual('PUSHTOKEN')
    )
  })

  it('throws an error if the challenge is not valid', () => {
    return createInvalidShareResp().then(jwt => uport.receive(jwt)).then(profile =>
      fail()
    ).catch(err => {
      expect(err).toEqual(expect.stringMatching('Authentication Failed'))
    })
  })

  it('deletes the challenge from storage if a valid response is given', () => {
    return createShareResp().then(jwt => uport.receive(jwt)).then(profile =>
      cRedis.get(`${challengeKeyPrefix}:${pairId}`, (err, res) => {
          if (err) throw new Error('Redis client could not set value')
          expect(res).toEqual(null)
      })
    )
  })
})

describe('authResponse', () => {

  let uport, cRedis, rRedis

  beforeEach((done) => {
    uport = new AuthCredentials({signer, address: '0x001122', registry})

    uport.challengeStorage.client = redisMock.createClient()
    uport.responseStorage.client = redisMock.createClient()
    rRedis = uport.responseStorage.client
    cRedis = uport.responseStorage.client

    rRedis.set(`${responseKeyPrefix}:${pairId}`, response, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        done()
    })
  })

  it('it returns the response for a given pairId', () => {
    return uport.authResponse(pairId).then(res => {
      expect(res).toEqual(response)
    })
  })

  it('it returns null if there is no key for a given pairId', () => {
    return uport.authResponse(pairId + '1').then(res => {
      expect(res).toEqual(null)
    })
  })

  it('if requested key is set, it is deleted upon being returned', (done) => {
    uport.authResponse(pairId).then(res => {
      rRedis.get(`${responseKeyPrefix}:${pairId}`, (err, res) => {
          if (err) throw new Error('Redis client could not set value')
          expect(res).toEqual(null)
          done()
      })
    })
  })
})
