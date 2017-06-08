import Credentials from './Credentials.js'
import Storage from './Storage.js'
import crypto from 'crypto'
import { createJWT } from './JWT'

// Generate random 16 byte hex string
const random  = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(16, (err, buf) => {
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

    let pairId, challenge

    return Promise.all([this.random(), this.random()]).then(rand => {
      pairId = rand[0]
      challenge = rand[1]
      payload.challenge = `${pairId}.${challenge}`
    }).then(() => this.challengeStorage.set(pairId, challenge)
    ).then(res => createJWT(this.settings, {...payload, type: 'shareReq'}))
  }

  receive(token, callbackUrl = null) {
    // Verify sig and check challenge equivalence
    let credentials, pairId, challenge
    return super.receive(token, callbackUrl).then(res => {
      credentials = res
      if (!credentials.challenge) {
        throw new Error('Authentication Failed: receive() Not a valid auth response')
      }
      [pairId, challenge] = credentials.challenge.split('.')
      return this.challengeStorage.get(pairId)
    }).then(val => {
      const storedChallenge = val
      if (storedChallenge === challenge) {
        this.challengeStorage.del(pairId)
        return credentials
      }
      throw new Error('Authentication Failed: receive() Challenge did not match')
    }).then(res => credentials)
  }

  getAuthResponse(pairId) {
    return this.responseStorage.get(pairId).then(res => {
      if (res) {
        this.responseStorage.del(pairId)
      }
      return res
    })
  }

  setAuthResponse(res) {
    const token = res.access_token
    const decodedToken = decodeToken(token)
    const pairId = decodedToken.payload.challenge.split('.')[0]
    const response = { message: res }
    return this.responseStorage.set(pairId, JSON.stringify(response))
  }
}

export default AuthCredentials
