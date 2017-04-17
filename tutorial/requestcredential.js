
var express = require('express');
var uport = require('../../lib/index.js');
var jsontokens = require('jsontokens')
var bodyParser = require('body-parser')

var signer = uport.SimpleSigner('4894506ba6ed1a2d21cb11331620784ad1ff9adf1676dc2720de5435dcf76ac2');

var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '0xe2fef711a5988fbe84b806d4817197f033dde050',
  signer: signer
})

var app = express();

app.use(bodyParser.json({ type: '*/*' }))

app.get('/', function (req, res) {

  credentials.createRequest({
    verified: ['Custom Attestation'],
    callbackUrl: 'http://192.168.1.34:8081/callback'
  }).then( function(requestToken) {
    var uri = 'me.uport:me?requestToken=' + requestToken
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    console.log(uri)
    res.send('<img src=' + qrurl + '></img>');
  })

})

app.post('/callback', function (req, res) {

  var jwt = req.body.access_token

  credentials.receive(jwt).then( function(creds) {
    if (creds.address == creds.verified[0].sub && 
       creds.verified[0].iss == '0xe2fef711a5988fbe84b806d4817197f033dde050' &&
       creds.verified[0].claim['Custom Attestation'] === 'Custom Value')
    {
      console.log('Credential verified.');
    }
  })

})

var server = app.listen(8081, function () {
  
  console.log("Tutorial app running...")
})
