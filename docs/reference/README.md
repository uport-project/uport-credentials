
[![npm](https://img.shields.io/npm/dt/ethr-did.svg)](https://www.npmjs.com/package/uport-credentials) [![npm](https://img.shields.io/npm/v/ethr-did.svg)](https://www.npmjs.com/package/uport-credentials) [![Join the chat at](https://img.shields.io/badge/Riot-Join%20chat-green.svg)](https://chat.uport.me/#/login) [![Twitter Follow](https://img.shields.io/twitter/follow/uport_me.svg?style=social&label=Follow)](https://twitter.com/uport_me)

[DID Specification](https://w3c-ccg.github.io/did-spec/) \| [Getting Started](/docs/guides/index.md)

uPort Credentials Library
=========================

**Required Upgrade to [uport-credentials@1.0.0](mailto:uport-credentials@1.0.0) or uport@^0.6.3**

**^0.6.3 (uport) to support new both new uPort Mobile Clients and legacy uPort Mobile Clients - [View Details](https://github.com/uport-project/uport-js/releases/tag/v0.6.3)**

**v1.0.0 (uport-credentials) to support only new uPort Mobile Clients and to use new features and fixes. In the future only v1.0.0 onwards will be supported.**

:bangbang: :warning: **v1.0.0** is released at the npm next tag at **uport-credentials@next**. While **^0.6.3** remains at **uport** on npm. Only the newest uPort Mobile Client release will work with **v1.0.0**. It will become the default release once the newest uPort Mobile Client release is widely adopted (~ 2 weeks). Reference master branch for docs and info on current default release **^0.6.3**. Documentation for **v1.0.0** can only be found here and in the docs folder. The [developer site](https://developer.uport.me) will not contain **v1.0.0** documentation until it is the default release :warning: :bangbang:

Integrate uPort Into Your Application
-------------------------------------

uPort provides a set of tools for creating and managing identities that conform to the decentralized identifier (DID) specification, and for requesting and exchanging verified data between identities.

uPort Credentials simplifies the process of identity creation within JavaScript applications; additionally, it allows applications to easily sign and verify data — signed by other identities to facilitate secure communication between parties. These pieces of data take the form of signed JSON Web Tokens (JWTs), they have specific fields designed for use with uPort clients, described in the uPort specifications, collectively referred to as verifications.

To allow for maximum flexibility, uPort Credential’s only deals with creation and validation of verifications. To pass verifications between a JavaScript application and a user via the uPort mobile app, we have developed the [uPort Transports library](https://github.com/uport-project/uport-transports), use it in conjunction with uPort Credentials when necessary.

To hit the ground running with uPort Credentials, visit the [Getting Started guide](/docs/guides/index.md).

For details on uPort's underlying architecture, read our [spec repo](https://github.com/uport-project/specs) or check out the [uPort identity contracts](https://github.com/uport-project/uport-identity).

This library is part of a suite of tools maintained by the uPort Project, a ConsenSys formation. For more information on the project, visit [uport.me](https://uport.me)

## Index

### Enumerations

* [AbiEntryType](enums/abientrytype.md)
* [StateMutability](enums/statemutability.md)
* [Types](enums/types.md)

### Classes

* [Credentials](classes/credentials.md)

### Interfaces

* [AbiEntry](interfaces/abientry.md)
* [AbiEvent](interfaces/abievent.md)
* [AbiEventParam](interfaces/abieventparam.md)
* [AbiFunction](interfaces/abifunction.md)
* [AbiParam](interfaces/abiparam.md)
* [ContractInterface](interfaces/contractinterface.md)
* [DisclosurePayload](interfaces/disclosurepayload.md)
* [DisclosureRequestParams](interfaces/disclosurerequestparams.md)
* [DisclosureRequestPayload](interfaces/disclosurerequestpayload.md)
* [DisclosureResponse](interfaces/disclosureresponse.md)
* [DisclosureResponsePayload](interfaces/disclosureresponsepayload.md)
* [DynamicABI](interfaces/dynamicabi.md)
* [EIP712Domain](interfaces/eip712domain.md)
* [EIP712Object](interfaces/eip712object.md)
* [EIP712Types](interfaces/eip712types.md)
* [EcdsaSignature](interfaces/ecdsasignature.md)
* [Factory](interfaces/factory.md)
* [Identity](interfaces/identity.md)
* [JWTPayload](interfaces/jwtpayload.md)
* [Network](interfaces/network.md)
* [NetworkRequest](interfaces/networkrequest.md)
* [Networks](interfaces/networks.md)
* [PersonalSignPayload](interfaces/personalsignpayload.md)
* [Settings](interfaces/settings.md)
* [TransactionRequest](interfaces/transactionrequest.md)
* [TxReqOptions](interfaces/txreqoptions.md)
* [TxReqPayload](interfaces/txreqpayload.md)
* [Verification](interfaces/verification.md)
* [VerificationParam](interfaces/verificationparam.md)
* [VerificationRequest](interfaces/verificationrequest.md)
* [VerifiedJWT](interfaces/verifiedjwt.md)

### Type aliases

* [ContractABI](#contractabi)
* [Signer](#signer)

### Variables

* [secp256k1](#secp256k1)

### Functions

* [ContractFactory](#contractfactory)
* [configNetworks](#confignetworks)
* [encodeMethodReadable](#encodemethodreadable)
* [getCallableMethodsFromABI](#getcallablemethodsfromabi)
* [isTransactionObject](#istransactionobject)
* [toSeconds](#toseconds)

---

## Type aliases

<a id="contractabi"></a>

###  ContractABI

**Ƭ ContractABI**: *([AbiEvent](interfaces/abievent.md) \| [AbiFunction](interfaces/abifunction.md))[]*

*Defined in [Contract.ts:59](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Contract.ts#L59)*

___
<a id="signer"></a>

###  Signer

**Ƭ Signer**: *`function`*

*Defined in [Credentials.ts:45](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Credentials.ts#L45)*

#### Type declaration
▸(data: *`string`*): `Promise`<[EcdsaSignature](interfaces/ecdsasignature.md)>

**Parameters:**

| Name | Type |
| ------ | ------ |
| data | `string` |

**Returns:** `Promise`<[EcdsaSignature](interfaces/ecdsasignature.md)>

___

## Variables

<a id="secp256k1"></a>

### `<Const>` secp256k1

**● secp256k1**: *`ec`* =  new EC('secp256k1')

*Defined in [Credentials.ts:14](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Credentials.ts#L14)*

___

## Functions

<a id="contractfactory"></a>

### `<Const>` ContractFactory

▸ **ContractFactory**(encoder?: *`function`*): `(Anonymous function)`

*Defined in [Contract.ts:117](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Contract.ts#L117)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` encoder | `function` |

**Returns:** `(Anonymous function)`

___
<a id="confignetworks"></a>

###  configNetworks

▸ **configNetworks**(nets: *[Networks](interfaces/networks.md)*): [Networks](interfaces/networks.md)

*Defined in [Credentials.ts:727](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Credentials.ts#L727)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| nets | [Networks](interfaces/networks.md) |

**Returns:** [Networks](interfaces/networks.md)

___
<a id="encodemethodreadable"></a>

### `<Const>` encodeMethodReadable

▸ **encodeMethodReadable**(methodObject: *[AbiFunction](interfaces/abifunction.md)*, methodArgs: *`any`[]*): `string`

*Defined in [Contract.ts:78](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Contract.ts#L78)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| methodObject | [AbiFunction](interfaces/abifunction.md) |
| methodArgs | `any`[] |

**Returns:** `string`

___
<a id="getcallablemethodsfromabi"></a>

### `<Const>` getCallableMethodsFromABI

▸ **getCallableMethodsFromABI**(contractABI: *[ContractABI](#contractabi)*): [AbiFunction](interfaces/abifunction.md)[]

*Defined in [Contract.ts:74](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Contract.ts#L74)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| contractABI | [ContractABI](#contractabi) |

**Returns:** [AbiFunction](interfaces/abifunction.md)[]

___
<a id="istransactionobject"></a>

### `<Const>` isTransactionObject

▸ **isTransactionObject**(txObj: *[TransactionRequest](interfaces/transactionrequest.md)*): `boolean`

*Defined in [Contract.ts:61](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Contract.ts#L61)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| txObj | [TransactionRequest](interfaces/transactionrequest.md) |

**Returns:** `boolean`

___
<a id="toseconds"></a>

### `<Const>` toSeconds

▸ **toSeconds**(date: *`number`*): `number`

*Defined in [Credentials.ts:30](https://github.com/uport-project/uport-credentials/blob/c498e74/src/Credentials.ts#L30)*

Convert a date to seconds since unix epoch, rounded down to the nearest whole second

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| date | `number` |  \- |

**Returns:** `number`

___

