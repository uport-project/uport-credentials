import { createUnsignedToken, TokenVerifier, decodeToken } from 'jsontokens' 

const JOSE_HEADER = {typ: 'JWT', alg: 'ES256K'}

export function createJWT ({address, signer}, payload) {
  const signingInput = createUnsignedToken(
    JOSE_HEADER,
    {...payload, iss: address, iat: new Date().getTime()}
  )
  return new Promise((resolve, reject) =>
    signer(signingInput, (error, signature) => {
      if (error) return reject(error)
      resolve([signingInput, signature].join('.'))
    })
  )
}

export function verifyJWT (jwt, callback) {
  // 1. decode jwt
  const {payload} = decodeToken(jwt)
  // 2. Fetch uport-registry profile for iss
  // 3. verify signature using public key
  // 4. return payload in callback
  callback(null, payload)
  // 5. return error in callback on any failure of the above
}
