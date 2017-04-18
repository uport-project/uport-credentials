
var express = require('express');
var uport = require('../lib/index.js');
var jsontokens = require('jsontokens')
var bodyParser = require('body-parser')

var signer = uport.SimpleSigner('4d8f5b6ba9298038b6cde46e5fa36d7b7a5846cdcd1c63ad9f5dea4384f9e650')


var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '0x982024e3540fb5ba26b7e169dcd98503f10686f5',
  signer: signer
})

var app = express();

app.use(bodyParser.json({ type: '*/*' }))

app.get('/', function (req, res) {

  credentials.createRequest({
    verified: ['Custom Attestation'],
    callbackUrl: 'http://192.168.1.101:8081/callback'
  }).then( function(requestToken) {
    var uri = 'me.uport:me?requestToken=' + requestToken
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    console.log(uri)
    res.send('<img src=' + qrurl + '></img>');
  })

})

app.post('/callback', function (req, res) {

  var jwt = req.body.access_token
  console.log(jwt)

  credentials.receive(jwt).then( function(creds) {
    if (creds.address == creds.verified[0].sub && 
       creds.verified[0].iss == '0x15bcc15904f2317365cdb6beaf473b2315405763' &&
       creds.verified[0].claim['Custom Attestation'] === 'Custom Value')
    {
      console.log('Credential verified.');
    } else {
      console.log('Verification failed.');
    }
  })

})

var server = app.listen(8081, function () {
  
  console.log("Tutorial app running...")
})
