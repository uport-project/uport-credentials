# uport-node

## WORK IN PROGRESS

## Integrate uport in your node application

Uport provides a simple way for your users to login to your website and provide private information such as identity information and contact details to you.

You can also “attest” information they provide to you or that you yourself have about them. This can be shared back to your customers so you can help them build their digitial identity.

Uport.js provides a simple way for you to integrate uport.js into your server side node application. You can also interact with your uport users directly in the browser. We have a browser library uport-lib which can help you do so.

## Setup your uport application identity

First make sure you have your uport app installed and you've setup your own uport identity.

### What is a uport identity?

A uport identity is a special kind of ethereum Smart Contract known as a proxy contract. It has an ethereum address, can hold value and can interact with any other Ethereum smart contracts.

The identity is controlled by a Controller Contract, which is basically an access control layer. You can develop your own custom access control layers and replace them, while keeping the primary identity intact (or permanent as we like to call it).

Our default uport controller contract is controlled by a single device, but you can add multiple recovery contacts to help retain control if you lose that device. Feel free to replace the controller contract with your own contract.

### The uport registry

A uport identity also optionally has a public profile stored on ipfs and linked to your identity through the uport registry. This profile consists of JSON using the [Schema.org](http://schema.org/) conventions.

When interacting privately with a user you will be interchanging signed JWT. To verify the signature of the JWT you and your users will be fetching your public key from the public profile.


### Creating your app uport identity

Open the file `./manager/index.html` in your browser.

It will ask you to login by scanning a QR code using your uport app.

Once you've logged in. Hit the “Create new application” button, which will take you through the process of creating a new uport identity for your app.

You will see an address which is your apps identity address on the blockchain.

Now fill in a few basic details like your App's name. Company Name. URL, logo etc.

Create your server keypair. This is for signing JWT tokens from within your server.

```
openssl ecparam -name secp256k1 -genkey -noout -out keypair.pem
```

Paste in the public key generated from the step above.

Hit the button “Save Attributes” and a QR code will appear for signing by your mobile app.

## Configure your application

In your application you must first configure your Uport object.

```javascript
import { Uport, SimpleSigner } from 'uport-node'

const signer = SimpleSigner(process.env.PRIVATE_KEY)
const uport = new Uport({
  appName: "App Name",
  appUport: "UPORT ADDRESS FOR YOUR APP",
  signer: signer,
  json_rpc: "https://ropsten.infura.io",
})
```

## Requesting information from your users

To request information from your user you create a Selective Disclosure Request JWT and present it to your user in the web browser.

The most basic request to get a users public uport identity details:

```javascript
uport.request().then(requestToken => {
  // send requestToken to browser
})
```

You can ask for specific private data like this:

```javascript
uport.request({
  requested: ['name','phone','identity_no']
}).then(requestToken => {
  // send requestToken to browser
  })
```

In your front end use 'uport-browser' to present it to your user either as a QR code or as a uport-button depending on whether they are on a desktop or mobile browser.

```javascript
window.uport.request(requestToken).then(response => {
  // send response back to server
})
```

Back in your server code you receive the token:

```javascript
uport.receive(responseToken).then(profile => {
  // Store user profile
})
```

For more information about the contents of the profile object see the uport-persona documentation.

### Requesting Push notification tokens from your users

As part of the selective disclosure request you can ask for permission from your users to communicate directly with their app.

```javascript
uport.request({
  requested:[...],
  capabilities: ['push']
}).then(requestToken => {
  // send to browser
})
```

Present it to the user like before. On the server you can receive the push token like this:

```javascript
uport.receive(responseToken).then(profile => {
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
uport.attest({
  sub: '0x...', // uport address of user
  exp: <future timestamp>, // If your information is not permanent make sure to add an expires timestamp
  claims: {name:'John Smith'}
}).then(attestation => {
  // send attestation to user
})
```

As before you will want to send this to your user. You can do this in the browser

```javascript
window.uport.request(attestation).then(response => {

})
```

If you requested a push notification token in the above selective disclosure step you can also send attestations directly to your users app in real time.

```javascript
uport.pushTo(pushToken, attestation).then(response => {

})
```

## Asking users to sign Ethereum transactions

```javascript
import { Uport, Contract } from 'uport-node'

const tokenContract = new Contract(address, abi)
const txRequest = tokenContract.transfer(....)
```

In your front end use 'uport-browser' to present it to your user either as a QR code or as a uport-button depending on whether they are on a desktop or mobile browser.

```javascript
window.uport.request(txRequest).then(txResponse => {
  // send response back to server
})
```


Back in your server code you receive the `txResponse`. This is a standard ethereum transaction object that you can verify.

## Creating Custom Signers for integrating with HSM

You can easily create custom signers that integrates into your existing signing infrastructure.

```javascript
function sign(data, callback) {
    const signature = '' // send your data to your back end signer and return DER signed data
    callback(null, signature)
}
```
