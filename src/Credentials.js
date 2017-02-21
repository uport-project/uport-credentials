import { createJWT, verifyJWT } from './JWT'
import UportLite from 'uport-lite'
import nets from 'nets'

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
  createRequest (params = {}) {
    const payload = {}
    if (params.requested) {
      payload.requested = params.requested
    }
    if (params.notifications) {
      payload.permissions = ['notifications']
    }
    if (params.callbackUrl) {
      payload.callback = params.callbackUrl
    }
    return createJWT(this.settings, {...payload, type: 'shareReq'})
  }

  // Receive response token from user and return data to promise
  receive (token, callbackUrl = null) {
    return verifyJWT(this.settings, token, callbackUrl).then(({payload, profile}) => (
      {...profile, ...(payload.own || {}), ...(payload.capabilities && payload.capabilities.length === 1 ? {pushToken: payload.capabilities[0]} : {}), address: payload.iss}
    ))
  }

  push (token, {url}) {
    return new Promise((resolve, reject) => {
      if (!token) {
        return reject(new Error('Missing push notification token'))
      }
      if (!url) {
        return reject(new Error('Missing payload url for sending to users device'))
      }

      nets({
        uri: 'https://chasqui.uport.me/api/v1/sns',
        json: {url},
        method: 'POST',
        withCredentials: false,
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      (error, res, body) => {
        if (error) return reject(error)
        if (res.statusCode === 200) {
          resolve(body)
        }
        if (res.statusCode === 403) {
          return reject(new Error('Error sending push notification to user: Invalid Token'))
        }
        reject(new Error(`Error sending push notification to user: ${res.statusCode} ${body.toString()}`))
      })
    })
  }

  // Create attestation
  attest ({sub, claim, exp}) {
    return createJWT(this.settings, {sub, claim, exp})
  }

  // Lookup public uport address of any user
  lookup (address) {
    return this.settings.registry(address)
  }
}
