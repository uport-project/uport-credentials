const express = require('express');
const uport = require('uport');
const jsontokens = require('jsontokens')

var express = require('express');
var uport = require('../lib/index.js');
var decodeJWT = require('did-jwt').decodeJWT

var app = express();

var credentials = new uport.Credentials({
  did: 'did:ethr:0xbc3ae59bc76f894822622cdef7a2018dbe353840',
  privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
})

app.get('/', function (req, res) {
  credentials.attest({
    sub: 'did:uport:2omWsSGspY7zhxaG6uHyoGtcYxoGeeohQXz',
    exp: 1552046024,
    claim: {'My Title' : {'KeyOne' : 'ValueOne', 'KeyTwo' : 'Value2', 'Last Key' : 'Last Value'} }
    // Note, the above is a complex claim. Also supported are simple claims:
    // claim: {'Key' : 'Value'}
  }).then(function (att) {
    console.log(att)
    console.log(decodeJWT(att))
    var uri = 'me.uport:add?attestations=' + att + '%26callback_type=post'
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    var mobileUrl = 'https://id.uport.me/add?attestations=' + att + '&callback_type=post'
    console.log(uri)
    res.send('<div><img src=' + qrurl + '></img></div><div><a href=' + mobileUrl + '>Click here if on mobile</a></div>')
  })
})

var server = app.listen(8088, function () {
  console.log("Tutorial app running...")
})
