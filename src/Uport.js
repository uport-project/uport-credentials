import { createJWT, verifyJWT } from './JWT'
import UportRegistry from 'uport-registry'

const INFURA_ROPSTEN = 'https://ropsten.infura.io'
const UPORT_REGISTRY_ADDRESS = '0xb9C1598e24650437a3055F7f66AC1820c419a679'

export default class Uport {
  constructor (settings) {
    this.settings = settings
    if (!this.settings.registry) {
      const registry = new UportRegistry()
      // The only function we're really interested from uport registry is getAttributes
      this.settings.registry = registry.getAttributes.bind(registry)
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
