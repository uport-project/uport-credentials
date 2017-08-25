import { SECP256K1Client } from 'jsontokens'

/**
*  The SimpleSigner returns a configured function for signing data. It also defines
*  an interface that you can also implement yourself and use in our other modules.
*
*  @example
*  const signer = SimpleSigner(process.env.PRIVATE_KEY)
*  signer(data, (err, signature) => {
*    ...
*  })
*
*  @param    {String}         privateKey    a private key
*  @return   {Function}                     a configured signer function
*/

export default function SimpleSigner (privateKey) {
  return (data, callback) => {
    const hash = SECP256K1Client.createHash(data)
    const signature = SECP256K1Client.signHash(hash, privateKey)
    callback(null, signature)
  }
}
