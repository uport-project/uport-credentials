---
title: "Uport JS"
index: 4
category: "reference"
type: "content"
---



<a name="Credentials"></a>

# Credentials
The Credentials class allows you to easily create the signed payloads used in uPort inlcuding
   credentials and signed mobile app requests (ex. selective disclosure requests
   for private data). It also provides signature verification over signed payloads and
   allows you to send push notifications to users.

**Kind**: global class  

* [Credentials](#Credentials)
    * [new Credentials([settings])](#new_Credentials_new)
    * _instance_
        * [.requestDisclosure([params], expiresIn)](#Credentials+requestDisclosure) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * <del>[.createRequest([params])](#Credentials+createRequest) ⇒ <code>Promise.&lt;Object, Error&gt;</code></del>
        * [.disclose([params])](#Credentials+disclose) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.authenticate(token, [callbackUrl])](#Credentials+authenticate) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.createVerificationRequest(unsignedClaim, sub)](#Credentials+createVerificationRequest) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * <del>[.receive(token, [callbackUrl])](#Credentials+receive) ⇒ <code>Promise.&lt;Object, Error&gt;</code></del>
        * [.verifyProfile(token)](#Credentials+verifyProfile) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
        * [.attest([credential])](#Credentials+attest) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
    * _static_
        * [.createIdentity()](#Credentials.createIdentity)


* * *

<a name="new_Credentials_new"></a>

## new Credentials([settings])
Instantiates a new uPort Credentials object

The following example is just for testing purposes. You should never store a private key in source code.

<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[settings]</td><td><code>Object</code></td><td><p>setttings</p>
</td>
    </tr><tr>
    <td>settings.did</td><td><code>DID</code></td><td><p>Application <a href="https://w3c-ccg.github.io/did-spec/#decentralized-identifiers-dids">DID</a> (unique identifier) for your application</p>
</td>
    </tr><tr>
    <td>settings.privateKey</td><td><code>String</code></td><td><p>A hex encoded 32 byte private key</p>
</td>
    </tr><tr>
    <td>settings.signer</td><td><code>SimpleSigner</code></td><td><p>a signer object, see <a href="https://github.com/uport-project/did-jwt#signer-functions">Signer Functions</a></p>
</td>
    </tr><tr>
    <td>settings.ethrConfig</td><td><code>Object</code></td><td><p>Configuration object for ethr did resolver. See <a href="https://github.com/uport-project/ethr-did-resolver">ethr-did-resolver</a></p>
</td>
    </tr><tr>
    <td>settings.muportConfig</td><td><code>Object</code></td><td><p>Configuration object for muport did resolver. See <a href="https://github.com/uport-project/muport-did-resolver">muport-did-resolver</a></p>
</td>
    </tr><tr>
    <td>settings.address</td><td><code>Address</code></td><td><p>DEPRECATED your uPort address (may be the address of your application&#39;s uPort identity)</p>
</td>
    </tr><tr>
    <td>settings.networks</td><td><code>Object</code></td><td><p>DEPRECATED networks config object, ie. {  &#39;0x94365e3b&#39;: { rpcUrl: &#39;<a href="https://private.chain/rpc&#39;">https://private.chain/rpc&#39;</a>, address: &#39;0x0101.... }}</p>
</td>
    </tr><tr>
    <td>settings.registry</td><td><code>UportLite</code></td><td><p>DEPRECATED a registry object from UportLite</p>
</td>
    </tr>  </tbody>
</table>


* * *

<a name="Credentials+requestDisclosure"></a>

## credentials.requestDisclosure([params], expiresIn) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[params]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>request params object</p>
</td>
    </tr><tr>
    <td>params.requested</td><td><code>Array</code></td><td></td><td><p>an array of attributes for which you are requesting credentials to be shared for</p>
</td>
    </tr><tr>
    <td>params.verified</td><td><code>Array</code></td><td></td><td><p>an array of attributes for which you are requesting verified credentials to be shared for</p>
</td>
    </tr><tr>
    <td>params.notifications</td><td><code>Boolean</code></td><td></td><td><p>boolean if you want to request the ability to send push notifications</p>
</td>
    </tr><tr>
    <td>params.callbackUrl</td><td><code>String</code></td><td></td><td><p>the url which you want to receive the response of this request</p>
</td>
    </tr><tr>
    <td>params.network_id</td><td><code>String</code></td><td></td><td><p>network id of Ethereum chain of identity eg. 0x4 for rinkeby</p>
</td>
    </tr><tr>
    <td>params.accountType</td><td><code>String</code></td><td></td><td><p>Ethereum account type: &quot;general&quot;, &quot;segregated&quot;, &quot;keypair&quot;, &quot;devicekey&quot; or &quot;none&quot;</p>
</td>
    </tr><tr>
    <td>expiresIn</td><td><code>Number</code></td><td></td><td><p>Seconds until expiry</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const req = { requested: ['name', 'country'],
               callbackUrl: 'https://myserver.com',
               notifications: true }
 credentials.requestDisclosure(req).then(jwt => {
     ...
 })

 
```

* * *

<a name="Credentials+createRequest"></a>

## <del>credentials.createRequest([params]) ⇒ <code>Promise.&lt;Object, Error&gt;</code></del>
***Deprecated***

Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[params]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>request params object</p>
</td>
    </tr><tr>
    <td>params.requested</td><td><code>Array</code></td><td></td><td><p>an array of attributes for which you are requesting credentials to be shared for</p>
</td>
    </tr><tr>
    <td>params.verified</td><td><code>Array</code></td><td></td><td><p>an array of attributes for which you are requesting verified credentials to be shared for</p>
</td>
    </tr><tr>
    <td>params.notifications</td><td><code>Boolean</code></td><td></td><td><p>boolean if you want to request the ability to send push notifications</p>
</td>
    </tr><tr>
    <td>params.callbackUrl</td><td><code>String</code></td><td></td><td><p>the url which you want to receive the response of this request</p>
</td>
    </tr><tr>
    <td>params.network_id</td><td><code>String</code></td><td></td><td><p>network id of Ethereum chain of identity eg. 0x4 for rinkeby</p>
</td>
    </tr><tr>
    <td>params.accountType</td><td><code>String</code></td><td></td><td><p>Ethereum account type: &quot;general&quot;, &quot;segregated&quot;, &quot;keypair&quot;, &quot;devicekey&quot; or &quot;none&quot;</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const req = { requested: ['name', 'country'],
               callbackUrl: 'https://myserver.com',
               notifications: true }
 credentials.createRequest(req).then(jwt => {
     ...
 })

 
```

* * *

<a name="Credentials+disclose"></a>

## credentials.disclose([params]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Creates a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).

This can either be used to share information about the signing identity or as the response to a
[Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md), where it can be used to authenticate the identity.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[params]</td><td><code>Object</code></td><td><code>{}</code></td><td><p>request params object</p>
</td>
    </tr><tr>
    <td>params.req</td><td><code>JWT</code></td><td></td><td><p>A selective disclosure Request JWT if this is returned as part of an authentication flow</p>
</td>
    </tr><tr>
    <td>params.own</td><td><code>Object</code></td><td></td><td><p>An object of self attested claims about the signer (eg. name etc)</p>
</td>
    </tr><tr>
    <td>params.verified</td><td><code>Array</code></td><td></td><td><p>An array of attestation JWT&#39;s to include</p>
</td>
    </tr><tr>
    <td>params.nad</td><td><code>MNID</code></td><td></td><td><p>An ethereum address encoded as an <a href="https://github.com/uport-project/mnid">MNID</a></p>
</td>
    </tr><tr>
    <td>params.capabilities</td><td><code>Array</code></td><td></td><td><p>An array of capability JWT&#39;s to include</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
credentials.disclose({own: {name: 'Lourdes Valentina Gomez'}}).then(jwt => {
     ...
 })

 
```

* * *

<a name="Credentials+authenticate"></a>

## credentials.authenticate(token, [callbackUrl]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Authenticates [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md) from mobile
 app as part of the [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md).

 It Verifies and parses the given response token and verifies the challenge response flow.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a parsed response or rejects with an error.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>token</td><td><code>String</code></td><td></td><td><p>a response token</p>
</td>
    </tr><tr>
    <td>[callbackUrl]</td><td><code>String</code></td><td><code></code></td><td><p>callbackUrl</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.authenticate(resToken).then(res => {
     const credentials = res.verified
      const name =  res.name
     ...
 })

 
```

* * *

<a name="Credentials+createVerificationRequest"></a>

## credentials.createVerificationRequest(unsignedClaim, sub) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Creates a signed request for the user to attest a list of claims.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a signed JSON Web Token or rejects with an error  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>unsignedClaim</td><td><code>Object</code></td><td><p>an object that is an unsigned claim which you want the user to attest</p>
</td>
    </tr><tr>
    <td>sub</td><td><code>String</code></td><td><p>the DID of the identity you want to sign the attestation</p>
</td>
    </tr>  </tbody>
</table>

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

* * *

<a name="Credentials+receive"></a>

## <del>credentials.receive(token, [callbackUrl]) ⇒ <code>Promise.&lt;Object, Error&gt;</code></del>
***Deprecated***

Receive signed response token from mobile app. Verifies and parses the given response token.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a parsed response or rejects with an error.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Default</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>token</td><td><code>String</code></td><td></td><td><p>a response token</p>
</td>
    </tr><tr>
    <td>[callbackUrl]</td><td><code>String</code></td><td><code></code></td><td><p>callbackUrl</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.receive(resToken).then(res => {
     const credentials = res.verified
         const name =  res.name
     ...
 })

 
```

* * *

<a name="Credentials+verifyProfile"></a>

## credentials.verifyProfile(token) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Verify and return profile from a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).

 The main difference between this and `authenticate()` is that it does not verify the challenge. This can be used to verify user profiles that have been shared
 through other methods such as QR codes and messages.

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a parsed response or rejects with an error.  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>token</td><td><code>String</code></td><td><p>a response token</p>
</td>
    </tr>  </tbody>
</table>

**Example**  
```js
const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.verifyProfile(resToken).then(profile => {
     const credentials = profile.verified
         const name =  profile.name
     ...
 })

 
```

* * *

<a name="Credentials+attest"></a>

## credentials.attest([credential]) ⇒ <code>Promise.&lt;Object, Error&gt;</code>
Create a credential (a signed JSON Web Token)

**Kind**: instance method of [<code>Credentials</code>](#Credentials)  
**Returns**: <code>Promise.&lt;Object, Error&gt;</code> - a promise which resolves with a credential (JWT) or rejects with an error  
<table>
  <thead>
    <tr>
      <th>Param</th><th>Type</th><th>Description</th>
    </tr>
  </thead>
  <tbody>
<tr>
    <td>[credential]</td><td><code>Object</code></td><td><p>a unsigned credential object</p>
</td>
    </tr><tr>
    <td>credential.sub</td><td><code>String</code></td><td><p>subject of credential (a uPort address)</p>
</td>
    </tr><tr>
    <td>credential.claim</td><td><code>String</code></td><td><p>claim about subject single key value or key mapping to object with multiple values (ie { address: {street: ..., zip: ..., country: ...}})</p>
</td>
    </tr><tr>
    <td>credential.exp</td><td><code>String</code></td><td><p>time at which this claim expires and is no longer valid (seconds since epoch)</p>
</td>
    </tr>  </tbody>
</table>

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

* * *

<a name="Credentials.createIdentity"></a>

## Credentials.createIdentity()
generate a DID and private key

**Kind**: static method of [<code>Credentials</code>](#Credentials)  

* * *

