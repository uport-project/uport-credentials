import Credentials from './Credentials.js'
import Storage from './Storage.js'
import crypto from 'crypto'
import { createJWT } from './JWT'

// Generate random 18 byte hex string
const random  = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(18, (err, buf) => {
      if (err) reject(error)
      resolve(buf.toString('hex'))
    })
  })
}

class AuthCredentials extends Credentials {
  constructor (settings = {}) {
    super(settings)
    this.challengeStorage = settings.challengeStorage || new Storage('challenge')
    this.responseStorage = settings.responseStorage || new Storage('response')
    this.random = settings.random || random
  }

  // Create request token

  // TODO the callback doesn't include the pair id
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
    }).then(() => this.challengeStorage.set(payload.pairId, payload.challenge)
    ).then(res => createJWT(this.settings, {...payload, type: 'shareReq'}))
  }


  //TODO  Make response optional? then it doesn't write the response to the server
  receive (token, response = '', callbackUrl = null) {
    // Verify sig and check challenge equivalence
    let credentials
    return super.receive(token, callbackUrl).then(res => {
      credentials = res
      return this.challengeStorage.get(credentials.pairId)
    }).then(val => {
      const challenge = val
      if (challenge === credentials.challenge) {
        this.challengeStorage.del(credentials.pairId)
        return this.responseStorage.set(credentials.pairId, response)
      }
      this.responseStorage.set(credentials.pairId, 'Error')
      throw new Error('Authentication Failed: receive() Challenge did not match')
    }).then(res => credentials)
  }

  authResponse(pairId) {
    return this.responseStorage.get(pairId).then(res => {
      if (res) {
        this.responseStorage.del(pairId)
      }
      return res
    })
  }
}

export default AuthCredentials
