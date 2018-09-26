
var express = require('express');
var uport = require('../lib/index.js');
var bodyParser = require('body-parser')

var credentials = new uport.Credentials({
  did: 'did:ethr:0xbc3ae59bc76f894822622cdef7a2018dbe353840',
  privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
})

var app = express();

app.use(bodyParser.json({ type: '*/*' }))

app.get('/', function (req, res) {

  credentials.createDisclosureRequest({
    verified: ['My Title'],
    callbackUrl: 'http://192.168.44.162:8081/callback',
    exp: Math.floor(new Date().getTime()/1000) + 300
  }).then( function(requestToken) {
    var uri = 'me.uport:me?requestToken=' + requestToken + '%26callback_type=post'
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    var mobileUrl = 'https://id.uport.me/me?requestToken=' + requestToken + '&callback_type=post'
    console.log(uri)
    res.send('<div><img src=' + qrurl + '></img></div><div><a href=' + mobileUrl + '>Click here if on mobile</a></div>');
  })

})

app.post('/callback', function (req, res) {

  var jwt = req.body.access_token
  console.log(jwt)

  credentials.authenticateDisclosureResponse(jwt).then( function(creds) {
    console.log(creds)
    if (creds.address == creds.verified[0].sub && 
       creds.verified[0].iss == '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92' &&
       creds.verified[0].claim['My Title']['KeyOne'] === 'ValueOne' &&
       creds.verified[0].claim['My Title']['KeyTwo'] === 'Value2' &&
       creds.verified[0].claim['My Title']['Last Key'] === 'Last Value')
    {
      console.log('Credential verified.');
    } else {
      console.log('Verification failed.');
    }
  })

})

var server = app.listen(8088, function () {
  
  console.log("Tutorial app running...")
})
