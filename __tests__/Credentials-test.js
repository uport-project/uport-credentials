import Credentials from '../src/Credentials'
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
const uport = new Credentials({signer, address: '0x001122', registry})

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

it('has correct payload in JWT for a request', () => {
  return uport.createRequest({requested: ['name', 'phone']}).then((jwt) => {
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

it('has a default registry that looks up profile', () => {
  return new Credentials().settings.registry('0x3b2631d8e15b145fd2bf99fc5f98346aecdc394c').then(profile =>
    expect(profile.publicKey).toEqual('0x0482780d59037778ea03c7d5169dd7cf47a835cb6d57a606b4e6cf98000a28d20d6d6bfae223cc76fd2f63d8a382a1c054788c4fafb1062ee89e718b96e0896d40')
  )
})
