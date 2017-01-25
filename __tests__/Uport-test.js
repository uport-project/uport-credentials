import Uport from '../src/Uport'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier, decodeToken } from 'jsontokens'
import MockDate from 'mockdate'

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.privateKeyToPublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)
const uport = new Uport({signer, address: '0x001122'})

MockDate.set(1485321133996)

it('creates a valid JWT for a request', () => {
  return uport.request({requested: ['name', 'phone']}).then((jwt) => {
    return expect(verifier.verify(jwt)).toBeTruthy()
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
