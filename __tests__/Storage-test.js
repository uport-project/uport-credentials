import Storage from '../src/Storage'
import redisMock from 'redis-mock'

describe('Storage', () => {
  const challenge = 'db2ad7a398dfdd897f5b7ebac6e5995d482a824917c8251cfe30c86926510fa8'
  const pairId = '6d98e4827b8912cf4b061d0d16ac68577b6e0632ff2a4ce89ed70c537334f0ac'
  const response = JSON.stringify({res: 'a response payload', err: null})
  const challengeKeyPrefix = `challenge`
  const responseKeyPrefix = `response`

  describe('Writes', () => {
    let storage
    let redis

    beforeAll(() => {
      storage = new Storage()
      storage.client = redisMock.createClient()
      redis = storage.client
    })

    it('writes challenges to storage with key "challenge:<pairId>"', () => {
      return storage.writeChallenge(pairId, challenge).then((res)=> {
        redis.get(`${challengeKeyPrefix}:${pairId}`, (err, val) =>{
          expect(val).toEqual(challenge)
        })
      }).catch(err => {
        fail()
      })
    })

    it('writes responses to storage with key "response:<pairId>"', () => {
      return storage.writeResponse(pairId, response).then((res)=> {
        redis.get(`${responseKeyPrefix}:${pairId}`, (err, val) =>{
          expect(val).toEqual(response)
        })
      }).catch(err => {
        fail()
      })
    })
  })

  describe('Reads', () => {
    let storage
    let redis

    beforeAll((done) => {
      storage = new Storage()
      storage.client = redisMock.createClient()
      redis = storage.client

      redis.set(`${responseKeyPrefix}:${pairId}`, response, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        redis.set(`${challengeKeyPrefix}:${pairId}`, challenge, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            done()
        })
      })
    })

    it('reads challenges from storage', () => {
      return storage.readChallenge(pairId).then((res)=> {
        expect(res).toEqual(challenge)
      }).catch(err => {
        fail()
      })
    })

    it('reads responses from storage', () => {
      return storage.readResponse(pairId).then((res)=> {
        expect(res).toEqual(response)
      }).catch(err => {
        fail()
      })
    })
  })

  describe('Deletes', () => {
    let storage
    let redis

    beforeAll((done) => {
      storage = new Storage()
      storage.client = redisMock.createClient()
      redis = storage.client

      redis.set(`${responseKeyPrefix}:${pairId}`, response, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        redis.set(`${challengeKeyPrefix}:${pairId}`, challenge, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            done()
        })
      })
    })

    afterAll ((done) => {
      redis.get(`${responseKeyPrefix}:${pairId}`, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        expect(res).toEqual(null)
        redis.get(`${challengeKeyPrefix}:${pairId}`, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            expect(res).toEqual(null)
            done()
        })
      })
    })

    it('deletes challenge with key "challenge:<pairId>"', () => {
      return storage.deleteChallenge(pairId).then((res)=> {
      }).catch(err => {
        fail()
      })
    })

    it('deletes response with key "response:<pairId>"', () => {
      return storage.deleteResponse(pairId, response).then((res)=> {
      }).catch(err => {
        fail()
      })
    })
  })

})
