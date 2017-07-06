
var express = require('express');
var uport = require('../lib/index.js');
var jsontokens = require('jsontokens')

var app = express();
var signer = uport.SimpleSigner('28cefd149967e661b38495d2b5ab3964ffa0055912512d7125896646102c025b')


var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',
  signer: signer,
  networks: {'0x4': {'registry' : '0x2cc31912b2b0f3075a87b3640923d45a26cef3ee', 'rpcUrl' : 'https://rinkeby.infura.io'}}
})

app.get('/', function (req, res) {
  credentials.attest({
    sub: '2oyKmsRTSk251bJTxzwLQaKsBSMeoky7VZP',
    exp: 1552046024213,
    claim: {'Custom Attestation' : 'Custom Value'}
  }).then(function (att) {
    console.log(att)
    console.log(jsontokens.decodeToken(att))
    var uri = 'me.uport:add?attestations=' + att
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    console.log(uri)
    res.send('<img src=' + qrurl + '></img>');
  })
})

var server = app.listen(8081, function () {  
  console.log("Tutorial app running...")
})
