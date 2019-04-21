[uport-credentials](../README.md) > ["Credentials"](../modules/_credentials_.md)

# External module: "Credentials"

## Index

### Enumerations

* [Types](../enums/_credentials_.types.md)

### Classes

* [Credentials](../classes/_credentials_.credentials.md)

### Interfaces

* [DisclosurePayload](../interfaces/_credentials_.disclosurepayload.md)
* [DisclosureRequestParams](../interfaces/_credentials_.disclosurerequestparams.md)
* [DisclosureRequestPayload](../interfaces/_credentials_.disclosurerequestpayload.md)
* [DisclosureResponse](../interfaces/_credentials_.disclosureresponse.md)
* [DisclosureResponsePayload](../interfaces/_credentials_.disclosureresponsepayload.md)
* [EIP712Domain](../interfaces/_credentials_.eip712domain.md)
* [EIP712Object](../interfaces/_credentials_.eip712object.md)
* [EIP712Types](../interfaces/_credentials_.eip712types.md)
* [EcdsaSignature](../interfaces/_credentials_.ecdsasignature.md)
* [Identity](../interfaces/_credentials_.identity.md)
* [JWTPayload](../interfaces/_credentials_.jwtpayload.md)
* [Network](../interfaces/_credentials_.network.md)
* [NetworkRequest](../interfaces/_credentials_.networkrequest.md)
* [Networks](../interfaces/_credentials_.networks.md)
* [PersonalSignPayload](../interfaces/_credentials_.personalsignpayload.md)
* [Settings](../interfaces/_credentials_.settings.md)
* [TxReqOptions](../interfaces/_credentials_.txreqoptions.md)
* [TxReqPayload](../interfaces/_credentials_.txreqpayload.md)
* [Verification](../interfaces/_credentials_.verification.md)
* [VerificationParam](../interfaces/_credentials_.verificationparam.md)
* [VerificationRequest](../interfaces/_credentials_.verificationrequest.md)
* [VerifiedJWT](../interfaces/_credentials_.verifiedjwt.md)

### Type aliases

* [Signer](_credentials_.md#signer)

### Variables

* [secp256k1](_credentials_.md#secp256k1)

### Functions

* [configNetworks](_credentials_.md#confignetworks)
* [toSeconds](_credentials_.md#toseconds)

---

## Type aliases

<a id="signer"></a>

###  Signer

**Ƭ Signer**: *`function`*

*Defined in [Credentials.ts:45](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Credentials.ts#L45)*

#### Type declaration
▸(data: *`string`*): `Promise`<[EcdsaSignature](../interfaces/_credentials_.ecdsasignature.md)>

**Parameters:**

| Name | Type |
| ------ | ------ |
| data | `string` |

**Returns:** `Promise`<[EcdsaSignature](../interfaces/_credentials_.ecdsasignature.md)>

___

## Variables

<a id="secp256k1"></a>

### `<Const>` secp256k1

**● secp256k1**: *`ec`* =  new EC('secp256k1')

*Defined in [Credentials.ts:14](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Credentials.ts#L14)*

___

## Functions

<a id="confignetworks"></a>

###  configNetworks

▸ **configNetworks**(nets: *[Networks](../interfaces/_credentials_.networks.md)*): [Networks](../interfaces/_credentials_.networks.md)

*Defined in [Credentials.ts:727](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Credentials.ts#L727)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| nets | [Networks](../interfaces/_credentials_.networks.md) |

**Returns:** [Networks](../interfaces/_credentials_.networks.md)

___
<a id="toseconds"></a>

### `<Const>` toSeconds

▸ **toSeconds**(date: *`number`*): `number`

*Defined in [Credentials.ts:30](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Credentials.ts#L30)*

Convert a date to seconds since unix epoch, rounded down to the nearest whole second

**Parameters:**

| Name | Type | Description |
| ------ | ------ | ------ |
| date | `number` |  \- |

**Returns:** `number`

___

