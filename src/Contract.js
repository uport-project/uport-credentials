const arrayContainsArray = require('ethjs-util').arrayContainsArray;

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

/**
 * A factory function that returns web3-style contract classes, which calls
 * the provided sendTransaction function on the transaction object for each
 * contract method call.  Generally this is used to create signed JWTs from 
 * method calls which can be signed by the uPort mobile app
 *
 * @param {Function} sendTransaction    The function to be called with the transaction
 *                                      object and a method-specific id on every method call
 * @param {Object}   [provider]         A web3 provider to handle requests etc. that don't
 *                                      require sending an ethereum transaction
 *
 * @returns {UportContract Constructor} The web3-style contract, configured with the above
 */
function ContractFactory (sendTransaction) {
  // const Web3Contract = provider && (new Web3(provider)).eth.Contract

  /**
   * The Contract class, which mocks web3 functionality by creating signed transaction
   * requests, which can be passed to the Uport Mobile app to actually send
   */
  class UportContract {
    constructor (jsonInterface = [], address = '0x', options = {}) {      
      // Create a parallel contract using the provider, for handling non-transaction methods
      // this.contract = provider 
      //   ? new Web3Contract(jsonInterface, address, options)
      //   : {}

      this.jsonInterface = jsonInterface
      this.address = address
      this.options = { ...options, address, jsonInterface }

      this.methods = {}
      // this.events = this.contract.events

      // Create a transaction request function for each Contract method
      getCallableMethodsFromABI(jsonInterface).map(({name, type, inputs, constant}) => {
        if (type === 'function') {          
          // Callable functions are available in this.methods[methodName]
          this.methods[name] = (...args) => ({
            // Borrow estimateGas and encodeABI from web3 contract
            // ...(this.contract && this.contract.methods[name](args)),
            // Overwrite the send function with the uPort sendTransaction or request creator 
            send: (txObject) => {
              txObject = {
                ...txObject, 
                to: address, 
                fn: encodeMethodReadable({name, inputs}, args)
              }

              return sendTransaction 
                ? sendTransaction(txObject, txObject.fn) // TODO: Come up with better id
                : txObject
            },
          })
        } else if (constant) {
          this.methods[name] = () => ({
            call: () => { throw new Error('Constant methods do not require uport interaction') }
          })
          // this.methods[name] = provider 
          //   ? this.contract.methods[name]
          //   : () => new Error('Constant functions cannot be computed without a web3 provider')
        } else {
          // What about the fallback function ?? 
          console.warn(`Unhandled ABI method: ${name}`)
        }
      })

      // Wrap other web3 contract api methods
      // this.getPastEvents = this.contract.getPastEvents
      // this.once = this.contract.once
    }

    clone () {
      return new UportContract(this.jsonInterface, this.address, this.options)
    }

    deploy () {
      throw new Error('Contract deployment not yet supported, use web3')
    }
  }

  return UportContract  
}

const buildRequestURI = (txObject) => {
  return `me.uport:${txObject.to}?function=${txObject.fn}`
}

const Contract = ContractFactory(buildRequestURI)

export { ContractFactory, Contract }
