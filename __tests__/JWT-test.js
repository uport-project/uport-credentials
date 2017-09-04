import { createJWT, verifyJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
import MockDate from 'mockdate'
MockDate.set(1485321133 * 1000)

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

it('throws an error if no signer is configured', () => {
  return createJWT({address: '0x001122'}, { requested: ['name', 'phone'] }).catch(error => {
    return expect(error.message).toEqual('No Signer functionality has been configured')
  })
})

it('throws an error if no address is configured', () => {
  return createJWT({signer}, { requested: ['name', 'phone'] }).catch(error => {
    return expect(error.message).toEqual('No application identity address has been configured')
  })
})

const incomingJwt = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1ZXN0ZWQiOlsibmFtZSIsInBob25lIl0sImlzcyI6IjB4MDAxMTIyIiwiaWF0IjoxNDg1MzIxMTMzfQ.OGgdP_rDix6YRKoSpFVgM_myCTv1ObJE7DaAMG8WIlHulReX8-dr0vqDo7XfQwKGSBqV-MnLg0u7z8J5C2Qgjg'


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

it('accepts a valid iat', () => {
  return createJWT({address: '0x001122', signer}, {iat: 1485321133}).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).then(({payload}) =>
      expect(payload).toMatchSnapshot()
    )
  )
})

it('rejects an iat in the future', () => {
  return createJWT({address: '0x001122', signer}, {iat: 1485321133 + 1}).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).catch(error =>
      expect(error.message).toEqual('JWT not valid yet (issued in the future)')
    ).then((p) => expect(p).toBeFalsy())
  )
})


it('accepts a valid exp', () => {
  return createJWT({address: '0x001122', signer}, {exp: 1485321133+1}).then(jwt =>
    verifyJWT({registry, address: '0x001122'}, jwt).then(({payload}) =>
      expect(payload).toMatchSnapshot()
    )
  )
})

it('rejects an expired JWT', () => {
  return createJWT({address: '0x001122', signer}, {exp: 1485321133 - 1}).then(jwt =>
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
  return createJWT({ address: '0x001122', signer }, { aud: 'http://pututu.uport.me/unique' }).then(jwt =>
    verifyJWT({ registry }, jwt, 'http://pututu.uport.me/unique').then(({payload}) =>
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

it('rejects an invalid audience using callback_url where callback is wrong', () => {
  return createJWT({ address: '0x001122', signer }, { aud: 'http://pututu.uport.me/unique' }).then(jwt =>
    verifyJWT({ registry }, jwt, 'http://pututu.uport.me/unique/1').catch(error =>
      expect(error.message).toEqual('JWT audience does not match the callback url')
    )
  )
})

it('rejects an invalid audience using callback_url where callback is missing', () => {
  return createJWT({ address: '0x001122', signer }, { aud: 'http://pututu.uport.me/unique' }).then(jwt =>
    verifyJWT({ registry }, jwt).catch(error =>
      expect(error.message).toEqual('JWT audience matching your callback url is required but one wasn\'t passed in')
    )
  )
})

it('rejects invalid audience as no address is present', () => {
  return createJWT({ address: '0x001122', signer }, { aud: '0x001123' }).then(jwt =>
    verifyJWT({ registry }, jwt).catch(error =>
      expect(error.message).toEqual('JWT audience is required but your app address has not been configured')
    ).then((p) => expect(p).toBeFalsy())
  )
})
