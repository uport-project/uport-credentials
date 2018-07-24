const arrayContainsArray = require('ethjs-util').arrayContainsArray;
import { isMNID } from 'mnid'
// A derivative work of Nick Dodson's eths-contract https://github.com/ethjs/ethjs-contract/blob/master/src/index.js

const hasTransactionObject = (args) => {
  const txObjectProperties = ['from', 'to', 'data', 'value', 'gasPrice', 'gas'];
  if (typeof args === 'object' && Array.isArray(args) === true && args.length > 0) {
    if (typeof args[args.length - 1] === 'object'
      && (Object.keys(args[args.length - 1]).length === 0
      || arrayContainsArray(Object.keys(args[args.length - 1]), txObjectProperties, true))) {
      return true;
    }
  }

  return false;
}

const getCallableMethodsFromABI = (contractABI) => {
  return contractABI.filter((json) => ((json.type === 'function' || json.type === 'event') && json.name.length > 0));
}

const encodeMethodReadable = (methodObject, methodArgs) => {
  let dataString = `${methodObject.name}(`

  for (let i = 0; i < methodObject.inputs.length; i++) {
    const input = methodObject.inputs[i]
    let argString = `${input.type} `

    if (input.type === 'string') {
      argString += `'${methodArgs[i]}'`
    } else if (input.type === ( 'bytes32' || 'bytes')) {
      // TODO don't assume hex input? or throw error if not hex
      // argString += `0x${new Buffer(methodArgs[i], 'hex')}`
      argString += `${methodArgs[i]}`
    } else {
      argString += `${methodArgs[i]}`
    }

    dataString += argString

    if ((methodObject.inputs.length - 1) !== i) {
      dataString += `, `
    }
  }
  return dataString += `)`
}

const ContractFactory = (extend) => (contractABI) => {
  const output = {};
  output.at = function atContract(address) {

    function Contract() {
      const self = this;
      self.abi = contractABI || [];
      self.address = address || '0x';

      getCallableMethodsFromABI(contractABI).forEach((methodObject) => {
        self[methodObject.name] = function contractMethod() {

          if (methodObject.constant === true) {
            throw new Error('A call does not return the txobject, no transaction necessary.')
          }

          if (methodObject.type === 'event') {
            throw new Error('An event does not return the txobject, events not supported')
          }

          let providedTxObject = {};
          const methodArgs = [].slice.call(arguments);

          if (methodObject.type === 'function') {
            if (hasTransactionObject(methodArgs)) providedTxObject = methodArgs.pop();
            const methodTxObject = Object.assign({},
                providedTxObject, {
                  to: self.address,
              });

            methodTxObject.function = encodeMethodReadable(methodObject, methodArgs)

            if (!extend) return methodTxObject

            const extendArgs = methodArgs.slice(methodObject.inputs.length)
            return extend(methodTxObject, ...extendArgs)
          }
        };
      });
    }

    return new Contract();
  };

  return output;
};

const buildRequestURI = (txObject, {callbackUrl, type} = {}) => {
  if (!isMNID(txObject.to)) throw new Error('To address must be MNID')
  const uri = `me.uport:${txObject.to}`

  const pairs = []
  if (txObject.value)    pairs.push(['value', parseInt(txObject.value, 16)])
  if (txObject.function) pairs.push(['function', txObject.function])
  if (callbackUrl)       pairs.push(['callback_url', callbackUrl])
  if (txObject.gasPrice) pairs.push(['gasPrice', txObject.gasPrice])
  if (type)              pairs.push(['type',type])

  return `${uri}?${pairs.map(kv => `${kv[0]}=${encodeURIComponent(kv[1])}`).join('&')}`
}

const Contract = ContractFactory(buildRequestURI)

export { ContractFactory, Contract }
