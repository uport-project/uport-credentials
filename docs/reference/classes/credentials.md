[uport-credentials](../README.md) > [Credentials](../classes/credentials.md)

# Class: Credentials

The Credentials class allows you to easily create the signed payloads used in uPort including credentials and signed mobile app requests (ex. selective disclosure requests for private data). It also provides signature verification over signed payloads.

## Hierarchy

**Credentials**

## Index

### Constructors

* [constructor](credentials.md#constructor)

### Properties

* [did](credentials.md#did)
* [signer](credentials.md#signer)

### Methods

* [authenticateDisclosureResponse](credentials.md#authenticatedisclosureresponse)
* [contract](credentials.md#contract)
* [createDisclosureRequest](credentials.md#createdisclosurerequest)
* [createDisclosureResponse](credentials.md#createdisclosureresponse)
* [createPersonalSignRequest](credentials.md#createpersonalsignrequest)
* [createTxRequest](credentials.md#createtxrequest)
* [createTypedDataSignatureRequest](credentials.md#createtypeddatasignaturerequest)
* [createVerification](credentials.md#createverification)
* [createVerificationSignatureRequest](credentials.md#createverificationsignaturerequest)
* [processDisclosurePayload](credentials.md#processdisclosurepayload)
* [signJWT](credentials.md#signjwt)
* [verifyDisclosure](credentials.md#verifydisclosure)
* [createIdentity](credentials.md#createidentity)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Credentials**(__namedParameters: *`object`*): [Credentials](credentials.md)

*Defined in [Credentials.ts:202](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L202)*

Instantiates a new uPort Credentials object

The following example is just for testing purposes. _You should never store a private key in source code._

```javascript
import { Credentials } from 'uport-credentials'
const credentials = new Credentials({
  privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
})
```

The above example derives the public key used to generate the did, so only a private key is needed. Generating a public key from a private key is slow. It is recommended to configure the `did` option as well.

```javascript
import { Credentials } from 'uport-credentials'
const credentials = new Credentials({
  did: 'did:ethr:0xbc3ae59bc76f894822622cdef7a2018dbe353840',
  privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
})
```

It is recommended to store the address and private key in environment variables for your server application

```javascript
import { Credentials, SimpleSigner } from 'uport-credentials'
const credentials = new Credentials({
  did: process.env.APPLICATION_DID,
  signer: SimpleSigner(process.env.PRIVATE_KEY)
})
```

Instead of a private key you can pass in a [Signer Functions](https://github.com/uport-project/did-jwt#signer-functions) to present UX or call a HSM.

```javascript
import { Credentials } from 'uport-credentials'

function mySigner (data) {
  return new Promise((resolve, reject) => {
    const signature = /// sign it
    resolve(signature)
  })
}

const credentials = new Credentials({
  did: process.env.APPLICATION_DID,
  signer: mySigner
})
```

**Parameters:**

**__namedParameters: `object`**

| Name | Type |
| ------ | ------ |
| address | `string` |
| did | `string` |
| ethrConfig | `any` |
| networks | [Networks](../interfaces/networks.md) |
| privateKey | `string` |
| registry | `function` |
| signer | `function` |

**Returns:** [Credentials](credentials.md)
self

___

## Properties

<a id="did"></a>

### `<Optional>` did

**● did**: *`string`*

*Defined in [Credentials.ts:201](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L201)*

___
<a id="signer"></a>

### `<Optional>` signer

**● signer**: *[Signer](../#signer)*

*Defined in [Credentials.ts:202](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L202)*

___

## Methods

<a id="authenticatedisclosureresponse"></a>

###  authenticateDisclosureResponse

▸ **authenticateDisclosureResponse**(token: *`string`*, callbackUrl?: *`any`*): `Promise`<[DisclosureResponse](../interfaces/disclosureresponse.md)>

*Defined in [Credentials.ts:671](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L671)*

Authenticates [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md) from uPort client as part of the [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md).

It Verifies and parses the given response token and verifies the challenge response flow.

```javascript
 const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.authenticateDisclosureResponse(resToken).then(res => {
     const credentials = res.verified
     const name =  res.name
     ...
 })
```

@param {String} token a response token @param {String} \[callbackUrl=null\] callbackUrl @return {Promise<Object, Error>} a promise which resolves with a parsed response or rejects with an error.

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| token | `string` | - |
| `Default value` callbackUrl | `any` |  undefined |

**Returns:** `Promise`<[DisclosureResponse](../interfaces/disclosureresponse.md)>

___
<a id="contract"></a>

###  contract

▸ **contract**(abi: *[ContractABI](../#contractabi)*): [Factory](../interfaces/factory.md)

*Defined in [Credentials.ts:724](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L724)*

Builds and returns a contract object which can be used to interact with a given contract. Similar to web3.eth.contract but with promises. Once specifying .at(address) you can call the contract functions with this object. Each call will create a request.

@param {Object} abi contract ABI @return {Object} contract object

**Parameters:**

| Name | Type |
| ------ | ------ |
| abi | [ContractABI](../#contractabi) |

**Returns:** [Factory](../interfaces/factory.md)

___
<a id="createdisclosurerequest"></a>

###  createDisclosureRequest

▸ **createDisclosureRequest**(params?: *[DisclosureRequestParams](../interfaces/disclosurerequestparams.md)*, expiresIn?: *`number`*): `Promise`<`string`>

*Defined in [Credentials.ts:345](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L345)*

Creates a [Selective Disclosure Request JWT](https://github.com/uport-project/specs/blob/develop/messages/sharereq.md)

```javascript
 const req = { requested: ['name', 'country'],
               callbackUrl: 'https://myserver.com',
               notifications: true }
 credentials.createDisclosureRequest(req).then(jwt => {
     ...
 })
```

@param {Object} \[params={}\] request params object @param {Array} params.requested an array of attributes for which you are requesting credentials to be shared for @param {Array} params.verified an array of attributes for which you are requesting verified credentials to be shared for @param {Boolean} params.notifications boolean if you want to request the ability to send push notifications @param {String} params.callbackUrl the url which you want to receive the response of this request @param {String} params.networkId network id of Ethereum chain of identity eg. 0x4 for rinkeby @param {String} params.rpcUrl JSON RPC url for use with account connecting to non standard (private or permissioned chain). The JSON-RPC url must match the `networkId` @param {String\[\]} params.vc An array of JWTs about the requester, signed by 3rd parties @param {String} params.accountType Ethereum account type: "general", "segregated", "keypair", or "none" @param {Number} expiresIn Seconds until expiry @return {Promise<Object, Error>} a promise which resolves with a signed JSON Web Token or rejects with an error

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` params | [DisclosureRequestParams](../interfaces/disclosurerequestparams.md) |  {} |
| `Default value` expiresIn | `number` | 600 |

**Returns:** `Promise`<`string`>

___
<a id="createdisclosureresponse"></a>

###  createDisclosureResponse

▸ **createDisclosureResponse**(payload?: *[DisclosureResponsePayload](../interfaces/disclosureresponsepayload.md)*, expiresIn?: *`number`*): `Promise`<`string`>

*Defined in [Credentials.ts:562](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L562)*

Creates a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).

This can either be used to share information about the signing identity or as the response to a [Selective Disclosure Flow](https://github.com/uport-project/specs/blob/develop/flows/selectivedisclosure.md), where it can be used to authenticate the identity.

```javascript
 credentials.createDisclosureResponse({own: {name: 'Lourdes Valentina Gomez'}}).then(jwt => {
     ...
 })
```

@param {Object} \[payload={}\] request params object @param {JWT} payload.req A selective disclosure Request JWT if this is returned as part of an authentication flow @param {Object} payload.own An object of self attested claims about the signer (eg. name etc) @param {Array} payload.verified An array of attestation JWT's to include @param {MNID} payload.nad An ethereum address encoded as an [MNID](https://github.com/uport-project/mnid) @param {Array} payload.capabilities An array of capability JWT's to include @return {Promise<Object, Error>} a promise which resolves with a signed JSON Web Token or rejects with an error

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| `Default value` payload | [DisclosureResponsePayload](../interfaces/disclosureresponsepayload.md) |  {} |
| `Default value` expiresIn | `number` | 600 |

**Returns:** `Promise`<`string`>

___
<a id="createpersonalsignrequest"></a>

###  createPersonalSignRequest

▸ **createPersonalSignRequest**(data: *`string`*, __namedParameters?: *`object`*): `Promise`<`string`>

*Defined in [Credentials.ts:506](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L506)*

Create a JWT requesting an eth\_sign/personal\_sign from a user.

**Parameters:**

**data: `string`**

hex encoded data to sign

**`Default value` __namedParameters: `object`**

| Name | Type |
| ------ | ------ |
| callback | `string` |
| from | `string` |
| net | `string` |

**Returns:** `Promise`<`string`>

___
<a id="createtxrequest"></a>

###  createTxRequest

▸ **createTxRequest**(txObj: *[TransactionRequest](../interfaces/transactionrequest.md)*, __namedParameters?: *`object`*): `Promise`<`string`>

*Defined in [Credentials.ts:533](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L533)*

Given a transaction object, similarly defined as the web3 transaction object, it creates a JWT transaction request and appends addtional request options.

```javascript
 const txObject = {
   to: '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347',
   value: '0.1',
   fn: "setStatus(string 'hello', bytes32 '0xc3245e75d3ecd1e81a9bfb6558b6dafe71e9f347')",
 }
 connect.createTxRequest(txObject, {callbackUrl: 'http://mycb.domain'}).then(jwt => {
   ...
 })
```

@param {Object} txObj A web3 style transaction object @param {Object} \[opts\] @param {String} \[opts.callbackUrl\] The url to receive the response of this request @param {String} \[opts.exp\] Time at which this request expires and is no longer valid (seconds since epoch) @param {String} \[opts.networkId\] Network ID for which this transaction request is for @param {String} \[opts.label\] @return {String} a transaction request jwt

**Parameters:**

**txObj: [TransactionRequest](../interfaces/transactionrequest.md)**

**`Default value` __namedParameters: `object`**

| Name | Type | Default value |
| ------ | ------ | ------ |
| callbackUrl | `string` | - |
| exp | `number` | 600 |
| label | `string` | - |
| networkId | `string` | - |

**Returns:** `Promise`<`string`>

___
<a id="createtypeddatasignaturerequest"></a>

###  createTypedDataSignatureRequest

▸ **createTypedDataSignatureRequest**(typedData: *[EIP712Object](../interfaces/eip712object.md)*, __namedParameters?: *`object`*): `Promise`<`string`>

*Defined in [Credentials.ts:487](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L487)*

Create a JWT requesting a signature on a piece of structured/typed data conforming to the ERC712 specification `` ` ``javascript // A ERC712 Greeting Structure const data = { types: { EIP712Domain: \[ {name: 'name', type: 'string'}, {name: 'version', type: 'string'}, {name: 'chainId', type: 'uint256'}, {name: 'verifyingContract', type: 'address'}, {name: 'salt', type: 'bytes32'} \], Greeting: \[ {name: 'text', type: 'string'}, {name: 'subject', type: 'string'}, \] }, domain: { name: 'My dapp', version: '1.0', chainId: 1, verifyingContract: '0xdeadbeef', salt: '0x999999999910101010101010' }, primaryType: 'Greeting', message: { text: 'Hello', subject: 'World' } }

const from = '0xbeef4567' // Eth account you are asking to sign the claim const net = '0x1' // The network on which this address exists const callback = '[https://my.cool.site/handleTheResponse'](https://my.cool.site/handleTheResponse') const signRequestJWT = credentials.createTypedDataSignatureRequest(data, {from, net, callback}) // Send the JWT to a client // ... `` ` ``

**Parameters:**

**typedData: [EIP712Object](../interfaces/eip712object.md)**

the ERC712 data to sign

**`Default value` __namedParameters: `object`**

| Name | Type |
| ------ | ------ |
| callback | `string` |
| from | `string` |
| net | `string` |

**Returns:** `Promise`<`string`>
a promise which resolves to a signed JWT or rejects with an error

___
<a id="createverification"></a>

###  createVerification

▸ **createVerification**(__namedParameters: *`object`*): `Promise`<`string`>

*Defined in [Credentials.ts:392](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L392)*

Create a credential (a signed JSON Web Token)

```javascript
 credentials.createVerification({
  sub: '5A8bRWU3F7j3REx3vkJ...', // uPort address of user, likely a MNID
  exp: <future timestamp>,
  claim: { name: 'John Smith' }
 }).then( credential => {
  ...
 })
```

**Parameters:**

**__namedParameters: `object`**

| Name | Type |
| ------ | ------ |
| callbackUrl | `string` |
| claim | `any` |
| exp | `number` |
| sub | `string` |
| vc | `string`[] |

**Returns:** `Promise`<`string`>
a promise which resolves with a credential (JWT) or rejects with an error

___
<a id="createverificationsignaturerequest"></a>

###  createVerificationSignatureRequest

▸ **createVerificationSignatureRequest**(unsignedClaim: *`Object`*, __namedParameters: *`object`*): `Promise`<`string`>

*Defined in [Credentials.ts:426](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L426)*

Creates a request a for a DID to [sign a verification](https://github.com/uport-project/specs/blob/develop/messages/verificationreq.md)

```javascript
 const unsignedClaim = {
   claim: {
     "Citizen of city X": {
       "Allowed to vote": true,
       "Document": "QmZZBBKPS2NWc6PMZbUk9zUHCo1SHKzQPPX4ndfwaYzmPW"
     }
   },
   sub: "2oTvBxSGseWFqhstsEHgmCBi762FbcigK5u"
 }
 const aud = '0x123...'
 const sub = '0x456...'
 const callbackUrl = 'https://my.cool.site/handleTheResponse'
 credentials.createVerificationSignatureRequest(unsignedClaim, {aud, sub, callbackUrl}).then(jwt => {
   // ...
 })
```

**Parameters:**

**unsignedClaim: `Object`**

Unsigned claim object which you want the user to attest

**__namedParameters: `object`**

| Name | Type |
| ------ | ------ |
| aud | `string` |
| callbackUrl | `string` |
| expiresIn | `number` |
| riss | `string` |
| sub | `string` |
| vc | `string`[] |

**Returns:** `Promise`<`string`>
A promise which resolves with a signed JSON Web Token or rejects with an error

___
<a id="processdisclosurepayload"></a>

### `<Private>` processDisclosurePayload

▸ **processDisclosurePayload**(__namedParameters: *`object`*): `Promise`<[DisclosureResponse](../interfaces/disclosureresponse.md)>

*Defined in [Credentials.ts:582](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L582)*

Parse a selective disclosure response, and verify signatures on each signed claim ("verification") included. This function renames and applies special handling to certain recognized key-value pairs, and preserves others untouched.

**Parameters:**

**__namedParameters: `object`**

| Name | Type |
| ------ | ------ |
| doc | `DIDDocument` |
| payload | [DisclosureResponsePayload](../interfaces/disclosureresponsepayload.md) |

**Returns:** `Promise`<[DisclosureResponse](../interfaces/disclosureresponse.md)>

___
<a id="signjwt"></a>

###  signJWT

▸ **signJWT**(payload: *`Object`*, expiresIn?: *`number`*): `Promise`<`string`>

*Defined in [Credentials.ts:291](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L291)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| payload | `Object` |
| `Optional` expiresIn | `number` |

**Returns:** `Promise`<`string`>

___
<a id="verifydisclosure"></a>

###  verifyDisclosure

▸ **verifyDisclosure**(token: *`string`*): `Promise`<[DisclosureResponse](../interfaces/disclosureresponse.md)>

*Defined in [Credentials.ts:711](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L711)*

Verify and return profile from a [Selective Disclosure Response JWT](https://github.com/uport-project/specs/blob/develop/messages/shareresp.md).

The main difference between this and `authenticateDisclosureResponse()` is that it does not verify the challenge. This can be used to verify user profiles that have been shared through other methods such as QR codes and messages.

```javascript
 const resToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJyZXF1Z....'
 credentials.verifyDisclosure(resToken).then(profile => {
     const credentials = profile.verified
     const name =  profile.name
     ...
 })
```

@param {String} token a response token @return {Promise<Object, Error>} a promise which resolves with a parsed response or rejects with an error.

**Parameters:**

| Name | Type |
| ------ | ------ |
| token | `string` |

**Returns:** `Promise`<[DisclosureResponse](../interfaces/disclosureresponse.md)>

___
<a id="createidentity"></a>

### `<Static>` createIdentity

▸ **createIdentity**(): [Identity](../interfaces/identity.md)

*Defined in [Credentials.ts:312](https://github.com/uport-project/uport-credentials/blob/2b03873/src/Credentials.ts#L312)*

Generate a DID and private key, effectively creating a new identity that can sign and verify data

```javascript
const {did, privateKey} = Credentials.createIdentity()
const credentials = new Credentials({did, privateKey, ...})
```

**Returns:** [Identity](../interfaces/identity.md)
keypair
          - {String} keypair.did         An ethr-did string for the new identity
          - {String} keypair.privateKey  The identity's private key, as a string

___

