import { SECP256K1Client } from 'json-tokens'

export default function SimpleSigner (privateKey) {
  return (data, callback) => {
    const hash = SECP256K1Client.createHash(data)
    const signature = SECP256K1Client.signHash(hash, privateKey)
    callback(null, signature)
  }
}