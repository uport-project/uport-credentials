const express = require('express');
const uport = require('../lib/index.js')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json({ type: '*/*' }))
const signer = uport.SimpleSigner('955d253bca62bf380e34a36ed3802895e4adc297fa861e22bb7ee3e66714592b')

const authCredentials = new uport.AuthCredentials({
  appName: 'Credential Tutorial',
  address: '0x15bcc15904f2317365cdb6beaf473b2315405763',
  signer: signer
})

app.get('/authrequest', (req, res) => {
    // Browser requests to start authentication and receives a request token in response
    credentials.createRequest({
      request: ['name'],
      // A reachable ip address
      callbackUrl: 'http://192.168.1.101:8081/authResponse'
    }).then( (requestToken) => {
      const uri = 'me.uport:me?requestToken=' + requestToken
      const.log(uri)
      res.send(uri);
    })
})

app.post('/authresponse', (req, res) => {
  // Mobile app posts response to challenge here
  const jwt = req.body.access_token
  const response = 'Successful Authentication'
  receive(jwt, response).then( credentials => {
    console.log(response)
  }).catch(err => {
    console.log('Authentication Failed')
  })
})

app.get('/authresponse/:pairID', (req, res) => {
  // Browser polling for a response
  const pairID = req.params.pairId
  authResponse(pairId).then(res => {
    res.send(res)
  }).catch(err => {
    res.status(500)
  })
})

const server = app.listen(8081, () => {
  console.log("AuthServer example app running...")
})
