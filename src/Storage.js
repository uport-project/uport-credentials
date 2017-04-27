import redis from 'redis'

class Storage {

  // options.host options.port
  constructor(options){
    const opts = options || {}
    this.client = redis.createClient(opts)
    this.client.on("error", err => {console.log("Error " + err)})
    this.challengeKeyPrefix = opts.challengeKeyPrefix || `challenge`
    this.responseKeyPrefix = opts.responseKeyPrefix || `response`
    this.challengeKey = pairId => (`${this.challengeKeyPrefix}:${pairId}`)
    this.responseKey = pairId => (`${this.responseKeyPrefix}:${pairId}`)
  }

  writeChallenge(pairId, challenge) {
  return this.set(this.challengeKey(pairId), challenge)
  }

  readChallenge(pairId) {
    return this.get(this.challengeKey(pairId))
  }

  writeResponse(pairId, response) {
    return this.set(this.responseKey(pairId), response)
  }

  readResponse(pairId) {
    return this.get(this.responseKey(pairId))
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, res) => {
        if (err) reject(err)
        return resolve(res)
      })
    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.set(key, value, (err, res) => {
        if (err) reject(err)
        return resolve(res)
      })
    })
  }
}

export default Storage
