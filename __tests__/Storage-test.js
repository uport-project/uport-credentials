import Storage from '../src/Storage'
import redisMock from 'redis-mock'

describe('Storage', () => {
  const challenge = 'db2ad7a398dfdd897f5b7ebac6e5995d482a824917c8251cfe30c86926510fa8'
  const pairId = '6d98e4827b8912cf4b061d0d16ac68577b6e0632ff2a4ce89ed70c537334f0ac'
  const response = JSON.stringify({res: 'a response payload', err: null})
  const challengeKeyPrefix = `challenge`
  const responseKeyPrefix = `response`

  describe('Writes', () => {
    let rStorage, cStorage
    let rRedis, cRedis

    beforeAll(() => {
      cStorage = new Storage('challenge')
      rStorage = new Storage('response')
      cStorage.client = redisMock.createClient()
      rStorage.client = redisMock.createClient()
      rRedis = cStorage.client
      cRedis = rStorage.client
    })

    it('writes challenges to storage with key "challenge:<pairId>"', () => {
      return cStorage.set(pairId, challenge).then((res)=> {
        cRedis.get(`${challengeKeyPrefix}:${pairId}`, (err, val) =>{
          expect(val).toEqual(challenge)
        })
      }).catch(err => {
        fail()
      })
    })

    it('writes responses to storage with key "response:<pairId>"', () => {
      return rStorage.set(pairId, response).then((res)=> {
        rRedis.get(`${responseKeyPrefix}:${pairId}`, (err, val) =>{
          expect(val).toEqual(response)
        })
      }).catch(err => {
        fail()
      })
    })
  })

  describe('Reads', () => {
    let rStorage, cStorage
    let rRedis, cRedis

    beforeAll((done) => {
      cStorage = new Storage('challenge')
      rStorage = new Storage('response')
      cStorage.client = redisMock.createClient()
      rStorage.client = redisMock.createClient()
      rRedis = cStorage.client
      cRedis = rStorage.client

      rRedis.set(`${responseKeyPrefix}:${pairId}`, response, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        cRedis.set(`${challengeKeyPrefix}:${pairId}`, challenge, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            done()
        })
      })
    })

    it('reads challenges from storage', () => {
      return cStorage.get(pairId).then((res)=> {
        expect(res).toEqual(challenge)
      }).catch(err => {
        fail()
      })
    })

    it('reads responses from storage', () => {
      return rStorage.get(pairId).then((res)=> {
        expect(res).toEqual(response)
      }).catch(err => {
        fail()
      })
    })
  })

  describe('Deletes', () => {
    let rStorage, cStorage
    let rRedis, cRedis

    beforeAll((done) => {
      cStorage = new Storage('challenge')
      rStorage = new Storage('response')
      cStorage.client = redisMock.createClient()
      rStorage.client = redisMock.createClient()
      rRedis = cStorage.client
      cRedis = rStorage.client

      rRedis.set(`${responseKeyPrefix}:${pairId}`, response, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        cRedis.set(`${challengeKeyPrefix}:${pairId}`, challenge, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            done()
        })
      })
    })

    afterAll ((done) => {
      rRedis.get(`${responseKeyPrefix}:${pairId}`, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        expect(res).toEqual(null)
        cRedis.get(`${challengeKeyPrefix}:${pairId}`, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            expect(res).toEqual(null)
            done()
        })
      })
    })

    it('deletes challenge with key "challenge:<pairId>"', () => {
      return cStorage.del(pairId).then((res)=> {
      }).catch(err => {
        fail()
      })
    })

    it('deletes response with key "response:<pairId>"', () => {
      return rStorage.del(pairId, response).then((res)=> {
      }).catch(err => {
        fail()
      })
    })
  })

})
