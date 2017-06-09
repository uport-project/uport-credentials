import redis from 'redis'

class Storage {

  constructor(prefix, redisOpts){
    const opts = redisOpts || {}
    if (!redis.createClient) throw new Error('Storage: Redis is not available in this enviroment, use functionality which does not require persistent storage')
    this.client = redis.createClient(opts)
    this.client.on("error", err => {console.log("Error " + err)})
    this.prefix = prefix ? `${prefix}:` : ''
    this.key = pairId => (`${this.prefix}${pairId}`)
    this.expire = 120 //seconds
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(this.key(key), (err, res) => {
        if (err) reject(err)
        return resolve(res)
      })
    })
  }

  set(key, value) {
    return new Promise((resolve, reject) => {
      this.client.setex(this.key(key), this.expire, value, (err, res) => {
        if (err) reject(err)
        return resolve(res)
      })
    })
  }

  del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(this.key(key), (err, res) => {
        if (err) reject(err)
        return resolve(res)
      })
    })
  }
}

export default Storage
