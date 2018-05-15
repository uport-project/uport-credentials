var express = require('express');
var uport = require('uport');
var jsontokens = require('jsontokens')
var bodyParser = require('body-parser')

var signer = uport.SimpleSigner('5acea265dcbf01355956b36f82793a13caf1be650bb74ca7a40da74b412d44b5')
var endpoint = "https://015d00f4.ngrok.io";  // replace this with a public IP or HTTP tunnel

var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2opiNrGSxTW6sFo6ervHZnEeEXGNGAoupFN',
  signer: signer
//  networks: {'0x4': {'registry' : '0x2cc31912b2b0f3075a87b3640923d45a26cef3ee', 'rpcUrl' : 'https://rinkeby.infura.io'}}
  // Note: we use Rinkeby by default, the above is the explicit format for selecting a network
})

var app = express();

app.use(bodyParser.json({ type: '*/*' }))

app.get('/', function (req, res) {

  credentials.createRequest({
    verified: ['My Title'],
    callbackUrl: `${endpoint}/callback`,
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

  credentials.receive(jwt).then( function(creds) {
    console.log(creds)
    if (creds.address == creds.verified[0].sub) {
      console.log('\n\nCredential verified.');
    } else {
      console.log('\n\nVerification failed.');
    }
  })

})

var server = app.listen(8081, function () {
  console.log("\n\nCredential Verification service up and running!");
  console.log(`Open your browser to ${endpoint} to test the service. \n`);
  console.log("Watch this console for results from the service. \n")
  console.log("Service Output: \n")
})
