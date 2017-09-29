
var express = require('express');
var uport = require('../lib/index.js');
var jsontokens = require('jsontokens')

var app = express();
var signer = uport.SimpleSigner('28cefd149967e661b38495d2b5ab3964ffa0055912512d7125896646102c025b')


var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',
  signer: signer
  //networks: {'0x4': {'registry' : '0x2cc31912b2b0f3075a87b3640923d45a26cef3ee', 'rpcUrl' : 'https://rinkeby.infura.io'}}
  // Note: we use Rinkeby by default, the above is the explicit format for selecting a network
})

app.get('/', function (req, res) {
  credentials.attest({
    sub: '2ovkMrL4jxwRbr1ia9CUUMN5TddtBx9zKmN',
    exp: 1552046024,
    claim: {'Custom Attestation' : 'Custom Value'}
  }).then(function (att) {
    console.log(att)
    console.log(jsontokens.decodeToken(att))
    var uri = 'me.uport:add?attestations=' + att
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    var mobileUrl = 'https://id.uport.me/add?attestations=' + att + '&callback_url=https://www.google.com'
    console.log(uri)
    res.send('<div><img src=' + qrurl + '></img></div><div><a href=' + mobileUrl + '>Click here if on mobile (Not implemented yet!)</a></div>')
  })
})

var server = app.listen(8081, function () {
  console.log("Tutorial app running...")
})
