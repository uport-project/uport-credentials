
// A derivative work of Nick Dodson's eths-contract https://github.com/ethjs/ethjs-contract/blob/master/src/index.js

export interface TransactionRequest {
  from?: string,
  to?: string,
  data?: string,
  value?: string | number,
  gasPrice?: string | number,
  gas?: string | number
  fn?: string
  function?: string
}

export enum AbiEntryType {
  Function = 'function',
  Event = 'event',
  Constructor = 'constructor',
  Fallback = 'fallback'
}

enum StateMutability {
  Pure = 'pure',
  View = 'view',
  NonPayable = 'nonpayable',
  Payable = 'payable'
}

export interface AbiParam {
  name: string,
  type: string,
  components?: AbiParam[]
}

interface AbiEntry {
  type: AbiEntryType,
  name?: string,
  inputs?: AbiParam[],
}

export interface AbiFunction extends AbiEntry {
  // type: AbiEntryType.Function | AbiEntryType.Constructor | AbiEntryType.Constructor,
  outputs?: AbiParam[],
  stateMutability?: StateMutability,
  payable?: true
  constant?: true
}

interface AbiEventParam extends AbiParam {
  indexed?: boolean
}

export interface AbiEvent extends AbiEntry {
  // type: AbiEntryType.Event,
  inputs?: AbiEventParam[],
  anonymous?: boolean
}

export type ContractABI = Array<AbiEvent|AbiFunction>

const isTransactionObject = (txObj: TransactionRequest) => {
  const txObjectProperties = ['from', 'to', 'data', 'value', 'gasPrice', 'gas']
  if (typeof txObj !== 'object') return false
  // Return true for empty object
  if (Object.keys(txObj).length === 0) return true
  // Also return true if the object contains any of the expected txObject properties
  for (const prop of txObjectProperties) {
    if (prop in txObj) return true
  }

  return false;
}

const getCallableMethodsFromABI = (contractABI: ContractABI): AbiFunction[] => {
  return <AbiFunction[]>contractABI.filter((entry) => (entry.type === AbiEntryType.Function && entry.name && (!(<AbiFunction>entry).constant)));
}

const encodeMethodReadable = (methodObject: AbiFunction, methodArgs: any[]) => {
  let dataString = `${methodObject.name}(`
  const inputs = methodObject.inputs || []

  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i]
    let argString = `${input.type} `

    if (input.type === 'string') {
      argString += `"${methodArgs[i]}"`
    } else if (input.type === ('bytes32' || 'bytes')) {
      // TODO don't assume hex input? or throw error if not hex
      // argString += `0x${new Buffer(methodArgs[i], 'hex')}`
      argString += `${methodArgs[i]}`
    } else {
      argString += `${methodArgs[i]}`
    }

    dataString += argString

    if ((inputs.length - 1) !== i) {
      dataString += `, `
    }
  }
  return dataString += `)`
}

export interface Factory {
  at(address: string): ContractInterface
}

export interface ContractInterface {
  abi: ContractABI
  address: string
}

interface DynamicABI {
  [method: string]: () => TransactionRequest
}
export const ContractFactory = (encoder?: (tx: any, params? : any) => any) => (contractABI: ContractABI): Factory => {
  return {
    at: (address: string) : any => {
      const functionCalls : DynamicABI = {}
      getCallableMethodsFromABI(contractABI).forEach((methodObject) => {
        if (methodObject.name) {
          functionCalls[methodObject.name] = function contractMethod() {
            let providedTxObject = {};
            const methodArgs = [].slice.call(arguments);
            const nArgs = (methodObject.inputs || []).length
            // Remove transaction object if provided
            if (isTransactionObject(methodArgs[nArgs])) {
              providedTxObject = methodArgs.splice(nArgs, 1)[0]
            }

            const methodTxObject = {
              ...providedTxObject,
              to: address,
              function: encodeMethodReadable(methodObject, methodArgs)
            }
            if (!encoder) return methodTxObject

            const extendArgs = methodArgs[methodArgs.length - 1]
            return encoder(methodTxObject, extendArgs)
          }  
        }
      })
      return { ...functionCalls, abi: contractABI, address }
    }
  }
}

