import {createJWT as createJwt, verifyJWT as verifyJwt} from 'did-jwt'

/**  @module uport-js/JWT */

/**
*  Creates a signed JWT given an address which becomes the issuer, a signer, and a payload for which the signature is over.
*
*  @example
*  const signer = SimpleSigner(process.env.PRIVATE_KEY)
*  createJWT({address: '5A8bRWU3F7j3REx3vkJ...', signer}, {key1: 'value', key2: ..., ... }).then(jwt => {
*      ...
*  })
*
*  @param    {Object}            [config]           an unsigned credential object
*  @param    {String}            config.address     address, typically the uPort address of the signer which becomes the issuer
*  @param    {SimpleSigner}      config.signer      a signer, reference our SimpleSigner.js
*  @param    {Object}            payload            payload object
*  @return   {Promise<Object, Error>}               a promise which resolves with a signed JSON Web Token or rejects with an error
*/
export function createJWT ({address, signer}, payload) {
  return new Promise((resolve, reject) => {
    if (!address) { return reject(new Error('No application identity address has been configured')) }
    if (!signer) { return reject(new Error('No Signer functionality has been configured')) }
    return createJwt(
      payload, { issuer: address,
        signer: signer}).then(jwt => {
          resolve(jwt)
        })
  })
}

/**
*  Verifies given JWT. Registry is used to resolve uPort address to public key for verification.
*  If the JWT is valid, the promise returns an object including the JWT, the payload of the JWT,
*  and the profile of the issuer of the JWT.
*
*  @example
*  const registry =  new UportLite()
*  verifyJWT({registry, address: '5A8bRWU3F7j3REx3vkJ...'}, 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....').then(obj => {
*      const payload = obj.payload
*      const profile = obj.profile
*      const jwt = obj.jwt
*      ...
*  })
*
*  @param    {Object}            [config]           an unsigned credential object
*  @param    {String}            config.address     address, typically the uPort address of the signer which becomes the issuer
*  @param    {UportLite}         config.registry    a uPort registry, reference our uport-lite library
*  @param    {String}            jwt                a JSON Web Token to verify
*  @param    {String}            callbackUrl        callback url in JWT
*  @return   {Promise<Object, Error>}               a promise which resolves with a response object or rejects with an error
*/
export function verifyJWT ({registry, address}, jwt, callbackUrl = null) {
  return new Promise((resolve, reject) => {
    return verifyJwt(jwt, {audience: address, callbackUrl: callbackUrl}).then(verifiedObj => {
      const obj = {}
      if (verifiedObj.doc) obj.profile = verifiedObj.doc
      resolve({...obj, ...verifiedObj})
    })
  })
}

export default { createJWT, verifyJWT }
