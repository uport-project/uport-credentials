const express = require('express');
const uport = require('./lib/index.js')
const bodyParser = require('body-parser')
const decodeToken = require('jsontokens').decodeToken

const redisOpts = 'your-redis-host:port'

const app = express()
app.use(bodyParser.json({ type: '*/*' }))
const signer = uport.SimpleSigner('955d253bca62bf380e34a36ed3802895e4adc297fa861e22bb7ee3e66714592b')

const authCredentials = new uport.AuthCredentials({
  appName: 'Credential Tutorial',
  address: '0x15bcc15904f2317365cdb6beaf473b2315405763',
  signer: signer,
  challengeStorage: new uport.Storage('challenge', redisOpts),
  responseStorage: new uport.Storage('response', redisOpts)
})

app.get('/authrequest', (req, res) => {
    // Browser requests to start authentication and receives a request token in response
    authCredentials.createRequest({
      request: ['name'],
      // A reachable ip address
      callbackUrl: 'your-callback-url-to-receive-responses'
    }).then( (requestToken) => {
      const token = decodeToken(requestToken)
      const challenge = token.payload.challenge
      res.send({message: requestToken, error:'', pairId: challenge.split('.')[0] });
    })
})

app.use('/auth', express.static('./examples/AuthPage.html'))

app.post('/auth', (req, res) => {
  // Mobile app posts response to challenge here
  const jwt = req.body.access_token
  const token = decodeToken(jwt)
  const response = {message: {status: 'Authentication Succesful'}, error: '' }
  return authCredentials.receive(jwt, response).then(credentials => {
    console.log('Authentication Success')
    res.send(credentials)
  }).catch(err => {
    console.log('Authentication Failed')
  })
})

app.get('/authresponse/:pairId', (req, res) => {
  // Browser polling for a response
  const pairId = req.params.pairId
  authCredentials.authResponse(pairId).then(response => {
    if (response === null ) { res.status(404) }
    res.send(response)
  }).catch(err => {
    console.log(err)
    res.status(500)
  })
})

const server = app.listen(process.env.PORT || 8081, () => {
  console.log("AuthServer example app running...")
})
