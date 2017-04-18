
var express = require('express');
var uport = require('../lib/index.js');
var jsontokens = require('jsontokens')

var app = express();
var signer = uport.SimpleSigner('0x955d253bca62bf380e34a36ed3802895e4adc297fa861e22bb7ee3e66714592b')


var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '0x15bcc15904f2317365cdb6beaf473b2315405763',
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
