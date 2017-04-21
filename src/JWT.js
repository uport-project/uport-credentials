import { createUnsignedToken, TokenVerifier, decodeToken } from 'jsontokens'
import { isMNID, decode} from 'mnid'

const JOSE_HEADER = {typ: 'JWT', alg: 'ES256K'}

export function createJWT ({address, signer}, payload) {
  const signingInput = createUnsignedToken(
    JOSE_HEADER,
    {...payload, iss: address, iat: new Date().getTime()}
  )
  return new Promise((resolve, reject) => {
    if (!signer) return reject(new Error('No Signer functionality has been configured'))
    if (!address) return reject(new Error('No application identity address has been configured'))
    return signer(signingInput, (error, signature) => {
      if (error) return reject(error)
      resolve([signingInput, signature].join('.'))
    })
  })
}

export function verifyJWT ({registry, address}, jwt, callbackUrl = null) {
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
        if (payload.aud) {
          if (payload.aud.match(/^0x[0-9a-fA-F]+$/) || isMNID(payload.aud)) {
            if (!address) {
              return reject(new Error('JWT audience is required but your app address has not been configured'))
            }

            const addressHex = isMNID(address) ? decode(address).address : address
            const audHex = isMNID(payload.aud) ? decode(payload.aud).address : payload.aud
            if (audHex !== addressHex) {
              return reject(new Error('JWT audience does not match your address'))
            }
          } else {
            if (!callbackUrl) {
              return reject(new Error('JWT audience matching your callback url is required but one wasn\'t passed in'))
            }
            if (payload.aud !== callbackUrl) {
              return reject(new Error('JWT audience does not match the callback url'))
            }
          }
        }
        resolve({payload, profile, jwt})
      } else {
        return reject(new Error('Signature invalid for JWT'))
      }
    }).catch(reject)
  })
}

