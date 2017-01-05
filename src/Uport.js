import { createJWT, verifyJWT } from './JWT'
export default class Uport {
  constructor (settings) {
    this.settings = settings
  }

  // Create request token
  request ( payload, callback ) { 
    createJWT(settings, {...payload, type:'shareReq'}, callback )
  }

  // Receive response token from user and return data to callback
  receive ( token, callback ) {

  }

  // Create attestation
  attest ( payload, callback ) { 

  }

  // send push 
  pushTo ( pushToken, data, callback ) { 

  }  
}