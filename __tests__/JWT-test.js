import { createJWT, verifyJWT } from '../src/JWT'
import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client, TokenVerifier } from 'jsontokens'

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.privateKeyToPublicKey(privateKey)
const signer = SimpleSigner(privateKey)
const verifier = new TokenVerifier('ES256K', publicKey)

it('creates a valid JWT', () => {
  return createJWT({address: '0x001122', signer}, {requested: ['name', 'phone']}).then((jwt) => {
    return expect(verifier.verify(jwt)).toBeTruthy()
  })
})
