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

export function verifyJWT ({registry, address}, jwt) {
  return new Promise((resolve, reject) => {
    const {payload} = decodeToken(jwt)
    registry(payload.iss).then(profile => {
      if (!profile) return reject(new Error('No profile found, unable to verify JWT'))
      const publicKey = profile.publicKey.match(/^0x/) ? profile.publicKey.slice(2) : profile.publicKey
      const verifier = new TokenVerifier('ES256K', publicKey)
      if (verifier.verify(jwt)) {
        if (payload.exp && payload.exp <= new Date().getTime()) {
          return reject(new Error('JWT has expired'))
        }
        if (payload.aud && payload.aud !== address) {
          return reject(new Error('JWT audience does not match your address'))
        }
        resolve({payload, profile})
      } else {
        return reject(new Error('Signature invalid for JWT'))
      }
    }).catch(reject)
  })
}
