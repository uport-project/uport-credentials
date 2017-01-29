import { createJWT, verifyJWT } from './JWT'
import UportLite from 'uport-lite'

export default class Uport {
  constructor (settings) {
    this.settings = settings
    if (!this.settings.registry) {
      this.settings.registry = UportLite()
    }
  }

  // Create request token
  request (payload) {
    return createJWT(this.settings, {...payload, type: 'shareReq'})
  }

  // Receive response token from user and return data to promise
  receive (token) {
    return verifyJWT(this.settings, token).then(({payload, profile}) => (
      {...profile, ...(payload.own || {})}
    ))
  }

  // Create attestation
  attest ({sub, claim, exp}) {
    return createJWT(this.settings, {sub, claim, exp})
  }

  // send push 
  pushTo (pushToken, data, callback) {

  }
}
