import Uport from '../src/Uport'
import { createJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
import MockDate from 'mockdate'
MockDate.set(1485321133996)

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.privateKeyToPublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)
const profileA = {publicKey, name: 'David Chaum'}
const registry = (address) => new Promise((resolve, reject) => resolve(address === '0x001122' ? profileA : null))
const uport = new Uport({signer, address: '0x001122', registry})

it('creates a valid JWT for a request', () => {
  return uport.request({requested: ['name', 'phone']}).then((jwt) => {
    return expect(verifier.verify(jwt)).toBeTruthy()
  })
})

it('has correct payload in JWT for a plain request for public details', () => {
  return uport.request().then((jwt) => {
    return expect(decodeToken(jwt)).toMatchSnapshot()
  })
})

it('has correct payload in JWT for a request', () => {
  return uport.request({requested: ['name', 'phone']}).then((jwt) => {
    return expect(decodeToken(jwt)).toMatchSnapshot()
  })
})

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

function createShareResp (payload = {}) {
  return createJWT({address: '0x001122', signer}, {...payload, type: 'shareResp'})
}

it('returns profile mixing public and private claims', () => {
  return createShareResp({own: {name: 'Davie', phone: '+15555551234'}}).then(jwt => uport.receive(jwt)).then(profile =>
    expect(profile).toMatchSnapshot()
  )
})

it('returns profile with only public claims', () => {
  return createShareResp().then(jwt => uport.receive(jwt)).then(profile =>
    expect(profile).toMatchSnapshot()
  )
})
