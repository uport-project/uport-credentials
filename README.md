# uport-js

## Integrate uport in your javascript application

Uport provides a simple way for your users to login to your website and provide private credentials such as identity information and contact details to you.

You can also “attest” credentials they provide to you or that you yourself have about them. This can be shared back to your customers so you can help them build their digitial identity.

Uport.js provides a simple way for you to integrate uport.js into your javscript application. You can also interact with your uport users directly in the browser.

We have an easy to use browser library [uport-connect](https://github.com/uport-project/uport-connect) which can help you do so.

## Setup your uport application identity

First make sure you have your uport app installed and you've setup your own uport identity.

### The uPort protocol

When interacting privately with a user you will be interchanging signed JWT([JSON Web Token](https://jwt.io/)). To verify the signature of the JWT you and your users will be fetching your public key from the public profile.

## Configure your application

In your application you must first configure your Uport object.

```javascript
import { Credentials } from 'uport'

// For new ethereum based addresses
const credentials = new Credentials({
  appName: 'App Name',
  did: 'did:ethr:0x....',
  privateKey: process.env.PRIVATE_KEY
})

// You can create a new identity

console.log(Credentials.createIdentity())

// For legacy application identity created on App Manager
const credentials = new Credentials({
  appName: 'App Name',
  address: 'MNID Encoded uPort Address For Your App',
  privateKey: process.env.PRIVATE_KEY
})


```

## Requesting information from your users

To request information from your user you create a Selective Disclosure Request JWT and present it to your user in the web browser.

The most basic request to get a users public uport identity details:

```javascript
credentials.requestDisclosure().then(requestToken => {
  // send requestToken to browser
})
```

You can ask for specific private data like this:

```javascript
credentials.requestDisclosure({
    requested: ['name','phone','identity_no'],
    callbackUrl: 'https://....' // URL to send the response of the request to
  }.then(requestToken => {
  // send requestToken to browser
  })
```

If you need to know the users address on a specific ethereum network, specify it's `network_id` (currently defaults to ropsten `0x3`). In this case be aware that the `address` returned will be the address on the public network (currently ropsten) for the users profile. The requested network address will be in the `networkAddress` field and will be MNID encoded.

```javascript
credentials.requestDisclosure({network_id: '0x4'}).then(requestToken => {
  // send requestToken to browser
})
```

Back in your server code you receive the token:

```javascript
credentials.authenticate(responseToken).then(profile => {
  // Store user profile
})
```

### Stateless Challenge/Response

To ensure that the response received was created as a response to your selective disclosure request above, the original request is included in the response from the mobile app.

The default verification rule is that the issuer of the embedded request must match the clientId in your Credentials object and that the original request has not yet expired.

Some applications that exclusively live in the browser are unable to sign the original request. In those cases the request token verification is ignored.

### Requesting Push notification tokens from your users

As part of the selective disclosure request you can ask for permission from your users to communicate directly with their app.

```javascript
credentials.createRequest({
  requested:[...],
  notifications: true
}).then(requestToken => {
  // send to browser
})
```

Present it to the user like before. On the server you can receive the push token like this:

```javascript
credentials.receive(responseToken).then(profile => {
  // Store user profile
  // Store push token securely
  console.log(profile.pushToken)
})
```

## Attesting information about your users

Attesting information about your users helps add real value to your application. Your users will use uport to build up their own digital identity and your business is an important part of this.

If you're a financial institution you may be able to attest to KYC related information such as national identity numbers. If you're an educational application you may want to attest to your users achievements in a way that they can securely share.

### What are attestations

Attestations are shareable private information that one party can sign about another party. They are designed to be shared privately by you to your users and by them to other users.

### Creating an attestation

```javascript
credentials.attest({
  sub: '0x...', // uport address of user
  exp: <future timestamp>, // If your information is not permanent make sure to add an expires timestamp
  claims: {name:'John Smith'}
}).then(attestation => {
  // send attestation to user
})
```

As before you will want to send this to your user. You can do this in the browser

```javascript
const connect = new uportconnect.Connect('app name')
connect.showRequest(attestation) // no response is needed for an attestation
```

If you requested a push notification token in the above selective disclosure step you can also send attestations directly to your users app in real time.

```javascript
// Coming soon, not yet implemented
credentials.push(pushToken, `me.uport:add?attestation=${attestationjwt}`, message).then(response => {

})
```

## Asking users to sign Ethereum transactions

Ethereum smart contracts live on the blockchain and at a certain address. The application interface is known as the abi and can be created by the Solidity compiler.

Our Contract class will let you create a javascript object modelling the SmartContract allowing you to create uport uri's that you can send to the user.

```javascript
import { Contract } from 'uport'
const abi = // import from json or have directly in code
const contract = Contract(abi).at(contractAddress)
// creates a request for the user to call the transfer() function on the smart contract
const txRequest = tokenContract.transfer(....)
```

In your front end use 'uport-connect' to present it to your user either as a QR code or as a uport-button depending on whether they are on a desktop or mobile browser.

```javascript
const connect = new uportconnect.Connect('app name')
connect.sendTransaction(txRequest).then(txResponse => {
  // send response back to server
})
```

Back in your server code you receive the `txResponse`. This is a standard ethereum transaction object that you can verify.

