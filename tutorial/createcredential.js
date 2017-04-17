
var express = require('express');
var uport = require('../lib/index.js');
var jsontokens = require('jsontokens')

var app = express();
var signer = uport.SimpleSigner('4894506ba6ed1a2d21cb11331620784ad1ff9adf1676dc2720de5435dcf76ac2');

var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '0xe2fef711a5988fbe84b806d4817197f033dde050',
  signer: signer
})

app.get('/', function (req, res) {
  credentials.attest({
    sub: '2oVV33jifY2nPBLowRS8H7Rkh7fCUDN7hNb',
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
