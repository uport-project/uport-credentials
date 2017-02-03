import { createJWT, verifyJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
import MockDate from 'mockdate'
MockDate.set(1485321133996)

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.privateKeyToPublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)
const profileA = {publicKey: `0x${publicKey}`, name: 'David Chaum'}
const registry = (address) => new Promise((resolve, reject) => resolve(address === '0x001122' ? profileA : null))

it('creates a valid JWT', () => {
  return createJWT({address: '0x001122', signer}, {requested: ['name', 'phone']}).then((jwt) => {
    return expect(verifier.verify(jwt)).toBeTruthy()
  })
})

it('creates a JWT with correct format', () => {
  return createJWT({address: '0x001122', signer}, {requested: ['name', 'phone']}).then((jwt) => {
    return expect(decodeToken(jwt)).toMatchSnapshot()
  })
})

const incomingJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIl0sImlzcyI6IjB4MDAxMTIyIiwiaWF0IjoxNDg1MzIxMTMzOTk2fQ.zxGLQKo2WjgefrxEQWfwm_oago8Qr4YctBJoqNAm2XKE-48bADjolSo2T_tED9LnSikxqFIM9gNGpNgcY8JPdg'

it('verifies the JWT and return correct payload', () => {
  return verifyJWT({registry, address: '0x001122'}, incomingJwt).then(({payload}) => {
    return expect(payload).toMatchSnapshot()
  })
})

it('verifies the JWT and return correct profile', () => {
  return verifyJWT({registry, address: '0x001122'}, incomingJwt).then(({profile}) => {
    return expect(profile).toEqual(profileA)
  })
})

it('rejects a JWT with missing publicKey', () => {
  return createJWT({address: '0x001123', signer}).then(jwt =>
    verifyJWT({registry, address: '0x001123'}, jwt).catch(error =>
      expect(error.message).toEqual('No profile found, unable to verify JWT')
    ).then((p) => expect(p).toBeFalsy())
  )
})

const badJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIl0sImlzcyI6IjB4MDAxMTIyIiwiaWF0IjoxNDg1MzIxMTMzOTk2fQ.zxGLQKo2WjgefrxEQWfwm_oago8Qr4YctBJoqNAm2XKE-48bADjolSo2T_tED9LnSikxqFIM9gNGpNgcY8JPdf'
it('rejects a JWT with bad signature', () => {
  return verifyJWT({registry, address: '0x001122'}, badJwt).catch(error =>
    expect(error.message).toEqual('Signature invalid for JWT')
  ).then((p) => expect(p).toBeFalsy())
})

it('accepts a valid exp', () => {
  return createJWT({address: '0x001122', signer}, {exp: 1485321133996+1}).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).then(({payload}) =>
      expect(payload).toMatchSnapshot()
    )
  )
})

it('rejects an expired JWT', () => {
  return createJWT({address: '0x001122', signer}, {exp: 1485321133996 - 1}).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).catch(error =>
      expect(error.message).toEqual('JWT has expired')
    ).then((p) => expect(p).toBeFalsy())
  )
})

it('accepts a valid audience', () => {
  return createJWT({address: '0x001122', signer}, {aud: '0x001122'}).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).then(({payload}) =>
      expect(payload).toMatchSnapshot()
    )
  )
})

it('accepts a valid audience using callback_url', () => {
  return createJWT({ address: '0x001122', signer }, { aud: 'http://chasqui.uport.me/unique' }).then(jwt =>
    verifyJWT({ registry }, jwt, 'http://chasqui.uport.me/unique').then(({payload}) =>
      expect(payload).toMatchSnapshot()
    )
  )
})

it('rejects invalid audience', () => {
  return createJWT({address: '0x001122', signer}, {aud: '0x001123' }).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).catch(error =>
      expect(error.message).toEqual('JWT audience does not match your address')
    ).then((p) => expect(p).toBeFalsy())
  )
})
