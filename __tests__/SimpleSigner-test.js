import SimpleSigner from '../src/SimpleSigner'
import { SECP256K1Client } from 'jsontokens'

const privateKey = '278a5de700e29faae8e40e366ec5012b5ec63d36ec77e8a2417154cc1d25383f'
const publicKey = SECP256K1Client.derivePublicKey(privateKey)

const signer = SimpleSigner(privateKey)

it('signs data', () => {
  const plaintext = 'thequickbrownfoxjumpedoverthelazyprogrammer'
  return new Promise((resolve, reject) => {
    signer(plaintext, (error, signature) => {
      const hash = SECP256K1Client.createHash(plaintext)
      resolve(SECP256K1Client.verifyHash(hash, SECP256K1Client.loadSignature(signature), publicKey))
    })
  }).then(result => expect(result).toBeTruthy())
})