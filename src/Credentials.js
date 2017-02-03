import { createJWT, verifyJWT } from './JWT'
import UportLite from 'uport-lite'

export default class Credentials {
  constructor (settings = {}) {
    this.settings = settings
    if (!this.settings.registry) {
      const registry = UportLite()
      this.settings.registry = (address) => new Promise((resolve, reject) => {
        registry(address, (error, profile) => {
          if (error) return reject(error)
          resolve(profile)
        })
      })
    }
  }

  // Create request token
  createRequest (payload) {
    return createJWT(this.settings, {...payload, type: 'shareReq'})
  }

  // Receive response token from user and return data to promise
  receive (token, callbackUrl = null) {
    return verifyJWT(this.settings, token, callbackUrl).then(({payload, profile}) => (
      {...profile, ...(payload.own || {}), address: payload.iss}
    ))
  }

  // Create attestation
  attest ({sub, claim, exp}) {
    return createJWT(this.settings, {sub, claim, exp})
  }

}
