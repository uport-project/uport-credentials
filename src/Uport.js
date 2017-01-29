import { createJWT, verifyJWT } from './JWT'
import UportLite from 'uport-lite'

export default class Uport {
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
  requestCredentials (payload) {
    return createJWT(this.settings, {...payload, type: 'shareReq'})
  }

  // Receive response token from user and return data to promise
  receiveCredentials (token) {
    return verifyJWT(this.settings, token).then(({payload, profile}) => (
      {...profile, ...(payload.own || {})}
    ))
  }

  // Create attestation
  attestCredentials ({sub, claim, exp}) {
    return createJWT(this.settings, {sub, claim, exp})
  }

}
