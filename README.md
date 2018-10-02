[![npm](https://img.shields.io/npm/dt/ethr-did.svg)](https://www.npmjs.com/package/uport-credentials)
[![npm](https://img.shields.io/npm/v/ethr-did.svg)](https://www.npmjs.com/package/uport-credentials)
[![Join the chat at](https://img.shields.io/badge/Riot-Join%20chat-green.svg)](https://chat.uport.me/#/login)
[![Twitter Follow](https://img.shields.io/twitter/follow/uport_me.svg?style=social&label=Follow)](https://twitter.com/uport_me)

[DID Specification](https://w3c-ccg.github.io/did-spec/) | [Getting Started](https://github.com/uport-project/uport-credentials/blob/develop/docs/guides/index.md)

# uPort Credentials Library

**Required Upgrade to uport-credentials@1.0.0 or uport@^0.6.3**

**^0.6.3 (uport) to support new both new uPort Mobile Clients and legacy uPort Mobile Clients - [View Details](https://github.com/uport-project/uport-js/releases/tag/v0.6.3)**

**v1.0.0 (uport-credentials) to support only new uPort Mobile Clients and to use new features and fixes. In the future only v1.0.0 onwards will be supported.**

:bangbang: :warning: **v1.0.0** is released at the npm next tag at **uport-credentials@next**. While **^0.6.3** remains at **uport** on npm.  Only the newest uPort Mobile Client release will work with **v1.0.0**. It will become the default release once the newest uPort Mobile Client release is widely adopted (~ 2 weeks). Reference master branch for docs and info on current default release **^0.6.3**. Documentation for **v1.0.0** can only be found here and in the docs folder. The [developer site](https://developer.uport.me) will not contain **v1.0.0** documentation until it is the default release :warning: :bangbang:



## Integrate uPort Into Your Application 


uPort provides a set of tools for creating and managing identities that conform to the decentralized identifier (DID) specification and for requesting and exchanging verified data between identities. 

uPort Credentials simplifies the process of identity creation within JavaScript applications and allows apps to easily sign pieces of data and verify data — signed by other identities to facilitate secure communication between parties. These pieces of data take the form of signed JSON Web Tokens (JWTs), they have specific fields designed for use with uPort clients, described in the uPort specifications, collectively referred to as verifications.
 
To allow for maximum flexibility, uPort Credential’s only deals with creation and validation of verifications. To pass verifications between a JavaScript application and a user via the uPort mobile app, we have developed the uPort Transports library, use it in conjunction with uPort Credentials when necessary.


## Configure Your Application
 
In your application, you must first configure your uPort object with an identifier and a private key (or signer function). There are several ways to instantiate a credentials object. The most common approach is to save a DID and private key on a server for your application and create a credentials instance from your application's unique private key. Signed JWTs for requests and verifications can then be passed to a client-side application, and presented to a user as a QR code, or sent via a [transport](http://github.com/uport-project/uport-transports).
 
```javascript
import { Credentials } from 'uport-credentials'
 
// For ethereum based addresses (ethr-did)
const credentials = new Credentials({
  appName: 'App Name',
  did: 'did:ethr:0x....',
  privateKey: process.env.PRIVATE_KEY
})
```
 
At times, you might want identities to be created dynamically, either on the browser or a server. This can be accomplished with the static `Credentials.createIdentity()` method, which generates an Ethereum keypair and returns an object containing the associated DID and private key.
```javascript
// Create a credentials object for a new identity
const {did, privateKey} = Credentials.createIdentity()
const credentials = new Credentials({
  appName: 'App Name', did, privateKey
})
```
 
Finally, we continue to support older uPort identities described by an [MNID](http://github.com/uport-project/mnid)-encoded Ethereum address. These identifiers can be expressed as a DID via the 'uport' DID method: `did:uport:<mnid>`
```javascript
// For legacy application identity created on App Manager
const credentials = new Credentials({
  appName: 'App Name',
  address: '2nQtiQG...', // MNID Encoded uPort Address For Your App
  privateKey: process.env.PRIVATE_KEY
})
```
---------------------------------------------------


For details on uPort's underlying architecture, read our [spec repo](https://github.com/uport-project/specs) or check out the [uPort identity contracts](https://github.com/uport-project/uport-identity).

This library is part of a suite of tools maintained by the uPort Project, a ConsenSys formation.  For more information on the project, visit [uport.me](https://uport.me)
