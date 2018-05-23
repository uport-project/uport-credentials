---
title: "Uport Credentials"
index: 4
category: "reference"
type: "content"
---



<a name="Credentials"></a>

## Credentials
The Credentials class allows you to easily create the signed payloads used in uPort inlcuding
   credentials and signed mobile app requests (ex. selective disclosure requests
   for private data). It also provides signature verification over signed payloads and
   allows you to send push notifications to users.

**Kind**: global class  

* [Credentials](#Credentials)
    * [new Credentials([settings])](#new_Credentials_new)
    * _instance_
        * [.requestDisclosure([params], expiresIn)](#Credentials+requestDisclosure) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * ~~[.createRequest([params])](#Credentials+createRequest) ⇒ <code>Promise.&lt;Object, Error&gt;</code>~~
        * [.disclose([params])](#Credentials+disclose) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.authenticate(token, [callbackUrl])](#Credentials+authenticate) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.createVerificationRequest(unsignedClaim, aud, sub, callbackUrl)](#Credentials+createVerificationRequest) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * ~~[.receive(token, [callbackUrl])](#Credentials+receive) ⇒ <code>Promise.&lt;Object, Error&gt;</code>~~
        * [.verifyProfile(token)](#Credentials+verifyProfile) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.attest([credential])](#Credentials+attest) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.contract(abi)](#Credentials+contract) ⇒ <code>Object</code>
        * [.txRequest(txObj, [id])](#Credentials+txRequest) ⇒ <code>String</code>
    * _static_
        * [.createIdentity()](#Credentials.createIdentity)

<a name="new_Credentials_new"></a>

### new Credentials([settings])
Instantiates a new uPort Credentials object

The following example is just for testing purposes. You should never store a private key in source code.


| Param | Type | Description |
| --- | --- | --- |
| [settings] | <code>Object</code> | setttings |
| settings.did | <code>DID</code> | Application [DID](https://w3c-ccg.github.io/did-spec/#decentralized-identifiers-dids) (unique identifier) for your application |
| settings.privateKey | <code>String</code> | A hex encoded 32 byte private key |
| settings.signer | <code>SimpleSigner</code> | a signer object, see [Signer Functions](https://github.com/uport-project/did-jwt#signer-functions) |
| settings.ethrConfig | <code>Object</code> | Configuration object for ethr did resolver. See [ethr-did-resolver](https://github.com/uport-project/ethr-did-resolver) |
| settings.muportConfig | <code>Object</code> | Configuration object for muport did resolver. See [muport-did-resolver](https://github.com/uport-project/muport-did-resolver) |
| settings.address | <code>Address</code> | DEPRECATED your uPort address (may be the address of your application's uPort identity) |
| settings.networks | <code>Object</code> | DEPRECATED networks config object, ie. {  '0x94365e3b': { rpcUrl: 'https://private.chain/rpc', address: '0x0101.... }} |
| settings.registry | <code>UportLite</code> | DEPRECATED a registry object from UportLite |

<a name="Credentials+requestDisclosure"></a>

### credentials.requestDisclosure([params], expiresIn) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>Object</code> | <code>{}</code> | request params object |
| params.requested | <code>Array</code> |  | an array of attributes for which you are requesting credentials to be shared for |
| params.verified | <code>Array</code> |  | an array of attributes for which you are requesting verified credentials to be shared for |
| params.notifications | <code>Boolean</code> |  | boolean if you want to request the ability to send push notifications |
| params.callbackUrl | <code>String</code> |  | the url which you want to receive the response of this request |
| params.network_id | <code>String</code> |  | network id of Ethereum chain of identity eg. 0x4 for rinkeby |
| params.accountType | <code>String</code> |  | Ethereum account type: "general", "segregated", "keypair", "devicekey" or "none" |
| expiresIn | <code>Number</code> |  | Seconds until expiry |

**Example**  
```js
const req = { requested: ['name', 'country'],
               callbackUrl: 'https://myserver.com',
               notifications: true }
 credentials.requestDisclosure(req).then(jwt => {
     ...
 })

 
```
<a name="Credentials+createRequest"></a>

### ~~credentials.createRequest([params]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>~~
***Deprecated***

Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>Object</code> | <code>{}</code> | request params object |
| params.requested | <code>Array</code> |  | an array of attributes for which you are requesting credentials to be shared for |
| params.verified | <code>Array</code> |  | an array of attributes for which you are requesting verified credentials to be shared for |
| params.notifications | <code>Boolean</code> |  | boolean if you want to request the ability to send push notifications |
| params.callbackUrl | <code>String</code> |  | the url which you want to receive the response of this request |
| params.network_id | <code>String</code> |  | network id of Ethereum chain of identity eg. 0x4 for rinkeby |
| params.accountType | <code>String</code> |  | Ethereum account type: "general", "segregated", "keypair", "devicekey" or "none" |

**Example**  
```js
const req = { requested: ['name', 'country'],
               callbackUrl: 'https://myserver.com',
               notifications: true }
 credentials.createRequest(req).then(jwt => {
     ...
 })

 
```
<a name="Credentials+disclose"></a>

### credentials.disclose([params]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Creates a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).

This can either be used to share information about the signing identity or as the response to a
[Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md), where it can be used to authenticate the identity.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [params] | <code>Object</code> | <code>{}</code> | request params object |
| params.req | <code>JWT</code> |  | A selective disclosure Request JWT if this is returned as part of an authentication flow |
| params.own | <code>Object</code> |  | An object of self attested claims about the signer (eg. name etc) |
| params.verified | <code>Array</code> |  | An array of attestation JWT's to include |
| params.nad | <code>MNID</code> |  | An ethereum address encoded as an [MNID](https://github.com/uport-project/mnid) |
| params.capabilities | <code>Array</code> |  | An array of capability JWT's to include |

**Example**  
```js
credentials.disclose({own: {name: 'Lourdes Valentina Gomez'}}).then(jwt => {
     ...
 })

 
```
<a name="Credentials+authenticate"></a>

### credentials.authenticate(token, [callbackUrl]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Authenticates [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md) from mobile
 app as part of the [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md).

 It Verifies and parses the given response token and verifies the challenge response flow.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a parsed response or rejects with an error.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| token | <code>String</code> |  | a response token |
| [callbackUrl] | <code>String</code> | <code></code> | callbackUrl |

**Example**  
```js
const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.authenticate(resToken).then(res => {
     const credentials = res.verified
      const name =  res.name
     ...
 })

 
```
<a name="Credentials+createVerificationRequest"></a>

### credentials.createVerificationRequest(unsignedClaim, aud, sub, callbackUrl) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Creates a signed request for the user to attest a list of claims.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  

| Param | Type | Description |
| --- | --- | --- |
| unsignedClaim | <code>Object</code> | an object that is an unsigned claim which you want the user to attest |
| aud | <code>String</code> | the DID of the identity you want to sign the attestation |
| sub | <code>String</code> | the DID which the unsigned claim is about |
| callbackUrl | <code>String</code> | the url which you want to receive the response of this request |

**Example**  
```js
const unsignedClaim = {
   claim: {
     "Citizen of city X": {
       "Allowed to vote": true,
       "Document": "QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW"
     }
   },
   sub: "2oTvBxSGseWFqhstsEHgmCBi762FbcigK5u"
 }
 credentials.createVerificationRequest(unsignedClaim).then(jwt => {
   ...
 })

 
```
<a name="Credentials+receive"></a>

### ~~credentials.receive(token, [callbackUrl]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>~~
***Deprecated***

Receive signed response token from mobile app. Verifies and parses the given response token.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a parsed response or rejects with an error.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| token | <code>String</code> |  | a response token |
| [callbackUrl] | <code>String</code> | <code></code> | callbackUrl |

**Example**  
```js
const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.receive(resToken).then(res => {
     const credentials = res.verified
         const name =  res.name
     ...
 })

 
```
<a name="Credentials+verifyProfile"></a>

### credentials.verifyProfile(token) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Verify and return profile from a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).

 The main difference between this and `authenticate()` is that it does not verify the challenge. This can be used to verify user profiles that have been shared
 through other methods such as QR codes and messages.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a parsed response or rejects with an error.  

| Param | Type | Description |
| --- | --- | --- |
| token | <code>String</code> | a response token |

**Example**  
```js
const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.verifyProfile(resToken).then(profile => {
     const credentials = profile.verified
         const name =  profile.name
     ...
 })

 
```
<a name="Credentials+attest"></a>

### credentials.attest([credential]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Create a credential (a signed JSON Web Token)

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a credential (JWT) or rejects with an error  

| Param | Type | Description |
| --- | --- | --- |
| [credential] | <code>Object</code> | a unsigned credential object |
| credential.sub | <code>String</code> | subject of credential (a uPort address) |
| credential.claim | <code>String</code> | claim about subject single key value or key mapping to object with multiple values (ie { address: {street: ..., zip: ..., country: ...}}) |
| credential.exp | <code>String</code> | time at which this claim expires and is no longer valid (seconds since epoch) |

**Example**  
```js
credentials.attest({
  sub: '5A8bRWU3F7j3REx3vkJ...', // uPort address of user, likely a MNID
  exp: <future timestamp>,
  claim: { name: 'John Smith' }
 }).then( credential => {
  ...
 })
```
<a name="Credentials+contract"></a>

### credentials.contract(abi) ⇒ <code>Object</code>
Builds and returns a contract object which can be used to interact with
 a given contract. Similar to web3.eth.contract but with promises. Once specifying .at(address)
 you can call the contract functions with this object. Each call will create a request.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Object</code> - contract object  

| Param | Type | Description |
| --- | --- | --- |
| abi | <code>Object</code> | contract ABI |

<a name="Credentials+txRequest"></a>

### credentials.txRequest(txObj, [id]) ⇒ <code>String</code>
Given a transaction object, similarly defined as the web3 transaction object,
 it creates a JWT transaction request and appends addtional request options.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>String</code> - a transaction request jwt  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| txObj | <code>Object</code> |  |  |
| [id] | <code>String</code> | <code>&#x27;addressReq&#x27;</code> | string to identify request, later used to get response |

**Example**  
```js
const txobject = {
   to: '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347',
   value: '0.1',
   fn: "setStatus(string 'hello', bytes32 '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347')",
 }
 connect.txRequest(txObject, {callbackUrl: 'http://mycb.domain'}).then(jwt => {
   ...
 })

 
```
<a name="Credentials.createIdentity"></a>

### Credentials.createIdentity()
generate a DID and private key

**Kind**: static method of [<code>Credentials</code>](#Credentials)  
