# uport-credentials

**Required Upgrade to uport-credentials@1.0.0 or uport@^0.6.3**

**^0.6.3 (uport) to support new both new uPort Mobile Clients and legacy uPort Mobile Clients - [View Details](https://github.com/uport-project/uport-js/releases/tag/v0.6.3)**

**v1.0.0 (uport-credentials) to support only new uPort Mobile Clients and to use new features and fixes. In the future only v1.0.0 onwards will be supported.**

:bangbang: :warning: **v1.0.0** is released at the npm next tag at **uport-credentials@next**. While **^0.6.3** remains at **uport** on npm.  Only the newest uPort Mobile Client release will work with **v1.0.0**. It will become the default release once the newest uPort Mobile Client release is widely adopted (~ 2 weeks). Reference master branch for docs and info on current default release **^0.6.3**. Documentation for **v1.0.0** can only be found here and in the docs folder. The [developer site](https://developer.uport.me) will not contain **v1.0.0** documentation until it is the default release :warning: :bangbang:

## Integrate uPort in your javascript application

uPort provides a set of tools for creating and managing identities that conform to the [decentralized identifier (DID) specification](), and requesting and exchanging verified data between them.  This library simplifies the process of identity creation within javascript applications, and allows apps to easily sign pieces of data and verify data signed by other identities to facilitate secure communication between parties.  These pieces of data take the form of *signed [JSON web tokens](https://jwt.io/introduction/) (JWTs)* with specific fields designed for use with uPort clients, and described in the uPort [specifications](https://github.com/uport-project/specs), collectively referred to as *verifications*.

To allow maximum flexibility, this library only deals with creation and validation of verifications.  To pass verifications between a javascript application and a user via the uPort mobile app, we have also developed the [uport-transports](https://github.com/uport-project/uport-transports) library, which may be used in conjunction with this one.  For a simpler, out-of-the-box solution for interacting with a uPort mobile wallet from a web application, we have an easy to use browser library [uport-connect](https://github.com/uport-project/uport-connect).

### What is a uPort identity?

An identity in uPort is really just someone or something that can sign data or transactions and also receive signed data about itself.

An identity can:

- Sign JWTs (JSON Web Tokens)
- Authenticate themselves to a third party
- Disclose private information about themselves
- Receive requests for disclosure about themselves
- Receive and store signed third party verifications about themselves
- Sign Ethereum transactions

When interacting privately with a user you will be interchanging signed JWT([JSON Web Token](https://jwt.io/)). To verify the signature of the JWT you and your users will be fetching your public key from the public profile.  

For details on uPort's underlying architecture, read our [spec repo](https://github.com/uport-project/specs) or check out the [uPort identity contracts](https://github.com/uport-project/uport-identity).

## Configure your application

In your application you must first configure your uPort object with an identifier and a private key (or signer function).  There are several ways to instantiate a credentials object.  The most common approach is to save a DID and private key on a server for your application, and create a credentials instance from your application's unique private key.  Signed JWTs for requests and verifications can then be passed to a client-side application, and presented to a user as a QR code, or sent via a [transport](http://github.com/uport-project/uport-transports).

```javascript
import { Credentials } from 'uport-credentials'

// For ethereum based addresses (ethr-did)
const credentials = new Credentials({
  appName: 'App Name',
  did: 'did:ethr:0x....',
  privateKey: process.env.PRIVATE_KEY
})
```

There may also be cases where you want identities to be created dynamically, either in the browser or on a server.  This can be accomplished with the static `Credentials.createIdentity()` method, which generates an ethereum keypair, and returns an object containing the associated did and private key.
```javascript
// Create a credentials object for a brand new identity
const {did, privateKey} = Credentials.createIdentity()
const credentials = new Credentials({
  appName: 'App Name', did, privateKey
})
```

Finally, we continue to support older uport identities described by an [MNID](http://github.com/uport-project/mnid)-encoded ethereum address.  These identifiers can be expressed as a did via the 'uport' did method: `did:uport:<mnid>`
```javascript
// For legacy application identity created on App Manager
const credentials = new Credentials({
  appName: 'App Name',
  address: '2nQtiQG...', // MNID Encoded uPort Address For Your App
  privateKey: process.env.PRIVATE_KEY
})
```

## Requesting information from your users

To request information from your user you create a Selective Disclosure Request JWT.  When this is presented to a user via a QR code or other [transport](https://github.com/uport-project/uport-transports), they will be prompted to approve sharing the request attributes.  All requests will return a user's `did`.

```javascript
credentials.createDisclosureRequest().then(requestToken => {
  // send requestToken to browser or transport
})
```

A selective disclosure request JWT can ask for specific private data, and/or provide a URL to which a mobile app should send a response.

```javascript
credentials.createDisclosureRequest().then({
  requested: ['name', 'phone', 'identity_no'],
  callbackUrl: 'https://....' // URL to send the response of the request to
}).then(requestToken => {
  // send requestToken to browser or transport
})
```

If you need to know the users address on a specific ethereum network, specify it's `networkId` (currently defaults to mainnet `0x1`). In this case be aware that the `address` returned will be the address on the public network (currently mainnet) for the users profile. The requested network address will be in the `networkAddress` field and will be MNID encoded.

```javascript
// Request an address on Rinkeby
credentials.requestDisclosure({networkId: '0x4'}).then(requestToken => {
  // send requestToken to browser or transport
})
```

When a response JWT is received, it can be parsed and verified via the `verifyDisclosureResponse()` method, which checks the validity of the signature on the JWT, as well as validity of the original dislcosure request, which is expected as part of the response.  

```javascript
credentials.verifyDisclosureResponse(responseToken).then(verifiedData => {
  // Do stuff with verified data or transport
})
```

### Stateless Challenge/Response

To ensure that the response received was created as a response to your selective disclosure request above, the original request is included in the response from the mobile app.

The verification rule for the Selective Disclosure Response is that the issuer of the embedded request must match the did in your Credentials object and that the original request has not yet expired.  This is to be sure that when requesting data from a user, only a response to your initial request will be accepted as valid.  If you would like to consume an arbitrary signed JWT that is not part of a particular selective disclosure flow, you can use the `verifyDisclosure()` method to skip the challenge/response check.

### Requesting Push notification tokens from your users

As part of the selective disclosure request you can also ask for permission from your users to communicate directly with their app.  With a push token, you can configure a [transport](https://github.com/uport-project/uport-transports) to send JWTs via push.

```javascript
credentials.createRequest({
  requested:[...],
  notifications: true
}).then(requestToken => {
  // send to browser
})
```
If the user approves the use of push notifications, the selective disclosure response will contain a `pushToken` field, which can be saved when the response is received and verified.

```javascript
credentials.verifyDisclosureResponse(responseToken).then(verifiedData => {
  // Store push token securely
  doSomethingWith(verifiedData.pushToken)
})
```

## Attesting information about your users
In addition to requesting and verifying information, you can also sign new data on behalf of your application and share it with your users in the form of _attestations_, also known as _verifications_.  By presenting an attestation to a user, you are making a claim about them, and are _attesting_ to its truth with your application's signature.  Exactly what information your app should attest to depends the context -- If you're a financial institution you may be able to attest to KYC related information such as national identity numbers. If you're an educational application you may want to attest to your users achievements in a way that they can securely share.  Anyone with access to your application's `did` can verify that a particular attestation came from your app.

Attesting to information about your users helps add real value to your application, and your users will use uPort to build up their own digital identity.

### Creating an attestation

```javascript
credentials.createVerification({
  sub: '0x...', // uport address of user
  exp: <future timestamp>, // If your information is not permanent make sure to add an expires timestamp
  claims: {name: 'John Smith'}
}).then(attestation => {
  // send attestation to user
})
```
As with a verification request, you will want to send this JWT to your user. You can do this in the browser via QR, using push with a previously requested pushToken, or via another [transport](https://github.com/uport-project/uport-transports) of your choosing.

## Asking users to sign Ethereum transactions

Finally, as uPort is based in the Ethereum blockchain, uPort Credentials can be used to request that a user call a particular Ethereum smart contract function.  Smart contracts live on the blockchain at a certain address, and expose public functions that can be called according to their ABI.  Using the `Credentials.contract` method, you can create an object from a contract abi that will create transaction request JWTs for each contract method, that can be presented to a user's mobile application like any other JWT described above.  This is just a wrapper around `Credentials.createTxRequest()`, which generates the txObject for a particular contract method call.

```javascript
import abi from './myContractAbi.json'
const myContract = Credentials.contract(abi).at(contractAddress)
// creates a request for the user to call the transfer() function on the smart contract
const txRequest = myContract.transfer(...).then(txRequestToken => {
  // send tx request token to user
})
```
---------------------------------------------------

This library is part of a suite of tools maintained by the uPort Project, a Consensys formation.  For more information on the project, visit [uport.me](https://uport.me)
