[uport-credentials](../README.md) > ["Contract"](../modules/_contract_.md)

# External module: "Contract"

## Index

### Enumerations

* [AbiEntryType](../enums/_contract_.abientrytype.md)
* [StateMutability](../enums/_contract_.statemutability.md)

### Interfaces

* [AbiEntry](../interfaces/_contract_.abientry.md)
* [AbiEvent](../interfaces/_contract_.abievent.md)
* [AbiEventParam](../interfaces/_contract_.abieventparam.md)
* [AbiFunction](../interfaces/_contract_.abifunction.md)
* [AbiParam](../interfaces/_contract_.abiparam.md)
* [ContractInterface](../interfaces/_contract_.contractinterface.md)
* [DynamicABI](../interfaces/_contract_.dynamicabi.md)
* [Factory](../interfaces/_contract_.factory.md)
* [TransactionRequest](../interfaces/_contract_.transactionrequest.md)

### Type aliases

* [ContractABI](_contract_.md#contractabi)

### Functions

* [ContractFactory](_contract_.md#contractfactory)
* [encodeMethodReadable](_contract_.md#encodemethodreadable)
* [getCallableMethodsFromABI](_contract_.md#getcallablemethodsfromabi)
* [isTransactionObject](_contract_.md#istransactionobject)

---

## Type aliases

<a id="contractabi"></a>

###  ContractABI

**Ƭ ContractABI**: *([AbiEvent](../interfaces/_contract_.abievent.md) \| [AbiFunction](../interfaces/_contract_.abifunction.md))[]*

*Defined in [Contract.ts:59](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Contract.ts#L59)*

___

## Functions

<a id="contractfactory"></a>

### `<Const>` ContractFactory

▸ **ContractFactory**(encoder?: *`function`*): `(Anonymous function)`

*Defined in [Contract.ts:117](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Contract.ts#L117)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` encoder | `function` |

**Returns:** `(Anonymous function)`

___
<a id="encodemethodreadable"></a>

### `<Const>` encodeMethodReadable

▸ **encodeMethodReadable**(methodObject: *[AbiFunction](../interfaces/_contract_.abifunction.md)*, methodArgs: *`any`[]*): `string`

*Defined in [Contract.ts:78](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Contract.ts#L78)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| methodObject | [AbiFunction](../interfaces/_contract_.abifunction.md) |
| methodArgs | `any`[] |

**Returns:** `string`

___
<a id="getcallablemethodsfromabi"></a>

### `<Const>` getCallableMethodsFromABI

▸ **getCallableMethodsFromABI**(contractABI: *[ContractABI](_contract_.md#contractabi)*): [AbiFunction](../interfaces/_contract_.abifunction.md)[]

*Defined in [Contract.ts:74](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Contract.ts#L74)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| contractABI | [ContractABI](_contract_.md#contractabi) |

**Returns:** [AbiFunction](../interfaces/_contract_.abifunction.md)[]

___
<a id="istransactionobject"></a>

### `<Const>` isTransactionObject

▸ **isTransactionObject**(txObj: *[TransactionRequest](../interfaces/_contract_.transactionrequest.md)*): `boolean`

*Defined in [Contract.ts:61](https://github.com/uport-project/uport-credentials/blob/25b41e5/src/Contract.ts#L61)*

**Parameters:**

| Name | Type |
| ------ | ------ |
| txObj | [TransactionRequest](../interfaces/_contract_.transactionrequest.md) |

**Returns:** `boolean`

___

