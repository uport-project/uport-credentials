import { createJWT, verifyJWT } from './JWT'

const INFURA_ROPSTEN = 'https://ropsten.infura.io'
const UPORT_REGISTRY_ADDRESS = '0xb9C1598e24650437a3055F7f66AC1820c419a679'

export default class Uport {
  constructor (settings) {
    this.settings = settings
  }

  // Create request token
  request (payload) {
    return createJWT(this.settings, {...payload, type: 'shareReq'})
  }

  // Receive response token from user and return data to callback
  receive (token, callback) {
    // verifyJWT
  }

  // Create attestation
  attest ({sub, claim, exp}) {
    return createJWT(this.settings, {sub, claim, exp})
  }

  // send push 
  pushTo (pushToken, data, callback) {

  }
}
