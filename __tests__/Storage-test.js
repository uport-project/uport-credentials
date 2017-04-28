import Storage from '../src/Storage'

// TODO stub with
// https://www.npmjs.com/package/redis-mock

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
      redis = storage.client
    })

    it('writes challenges to storage with key "challenge:<pairId>"', (done) => {
      storage.writeChallenge(pairId, challenge).then((res)=> {
        redis.get(`${challengeKeyPrefix}:${pairId}`, (err, val) =>{
          expect(val).toEqual(challenge)
          done()
        })
      }).catch(err => {
        fail()
        done()
      })
    })

    it('writes responses to storage with key "response:<pairId>"', (done) => {
      storage.writeResponse(pairId, response).then((res)=> {
        redis.get(`${responseKeyPrefix}:${pairId}`, (err, val) =>{
          expect(val).toEqual(response)
          done()
        })
      }).catch(err => {
        fail()
        done()
      })
    })
  })

  describe('Reads', () => {
    let storage
    let redis

    beforeAll((done) => {
      storage = new Storage()
      redis = storage.client

      redis.set(`${responseKeyPrefix}:${pairId}`, response, (err, res) => {
        if (err) throw new Error('Redis client could not set value')
        redis.set(`${challengeKeyPrefix}:${pairId}`, challenge, (err, res) => {
            if (err) throw new Error('Redis client could not set value')
            done()
        })
      })
    })

    it('reads challenges from storage', (done) => {
      storage.readChallenge(pairId).then((res)=> {
        expect(res).toEqual(challenge)
        done()
      }).catch(err => {
        fail()
        done()
      })
    })

    it('reads responses from storage', (done) => {
      storage.readResponse(pairId).then((res)=> {
        expect(res).toEqual(response)
        done()
      }).catch(err => {
        fail()
        done()
      })
    })
  })
})
