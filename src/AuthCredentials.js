import Credentials from './Credentials.js'
import Storage from './Storage.js'
import crypto from 'crypto'
import { createJWT } from './JWT'

// Generate random 128 byte hex string
const random  = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(32, (err, buf) => {
      if (err) reject(error)
      resolve(buf.toString('hex'))
    })
  })
}

class AuthCredentials extends Credentials {
  constructor (settings = {}) {
    super(settings)
    this.storage = settings.storage || new Storage()
    this.random = settings.random || random
  }

  // Create request token
  createRequest (params = {}) {
    const payload = {}
    if (params.requested) {
      payload.requested = params.requested
    }
    if (params.verified) {
      payload.verified = params.verified
    }
    if (params.notifications) {
      payload.permissions = ['notifications']
    }
    if (params.callbackUrl) {
      payload.callback = params.callbackUrl
    }

    return Promise.all([this.random(), this.random()]).then(rand => {
      payload.challenge = rand[0]
      payload.pairId = rand[1]
    }).then(() => this.storage.writeChallenge(payload.pairId, payload.challenge)
    ).then(res => createJWT(this.settings, {...payload, type: 'shareReq'}))
  }

  receive (token, response = '', callbackUrl = null) {
    // Verify sig and check challenge equivalence
    let credentials
    return super.receive(token, callbackUrl).then(res => {
      credentials = res
      return this.storage.readChallenge(credentials.pairId)
    }).then(val => {
      const challenge = val
      if (challenge === credentials.challenge) {
        return this.storage.writeResponse(credentials.pairId, response)
      }
      this.storage.writeResponse(credentials.pairId, 'Error')
      throw new Error('Authentication Failed: receive() Challenge did not match')
    }).then(res => credentials)
  }

  authResponse(pairId) {
    return this.storage.readResponse(pairId)
  }
}

export default AuthCredentials
