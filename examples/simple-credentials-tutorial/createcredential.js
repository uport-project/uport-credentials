var express = require('express');
var uport = require('uport');
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
    sub: '2omWsSGspY7zhxaG6uHyoGtcYxoGeeohQXz',       //replace this with your MNID identifier
    exp: 1552046024,
    claim: {'My Title' : {'KeyOne' : 'ValueOne', 'KeyTwo' : 'Value2', 'Last Key' : 'Last Value'} }
    // Note, the above is a complex claim. Also supported are simple claims:
    // claim: {'Key' : 'Value'}
  }).then(function (att) {
    console.log(att)
    console.log(jsontokens.decodeToken(att))
    var uri = 'me.uport:add?attestations=' + att + '%26callback_type=post'
    var qrurl = 'http://chart.apis.google.com/chart?cht=qr&chs=400x400&chl=' + uri
    var mobileUrl = 'https://id.uport.me/add?attestations=' + att + '&callback_type=post'
    console.log(uri)
    res.send('<div><img src=' + qrurl + '></img></div><div><a href=' + mobileUrl + '>Click here if on mobile</a></div>')
  })
})

var server = app.listen(8081, function () {
  console.log("\n\nCredential Creation service up and running!");
  console.log("Open your browser to http://localhost:8081 to test the service. \n");
  console.log("Watch this console for results from the service. \n")
  console.log("Service Output: \n")
})
