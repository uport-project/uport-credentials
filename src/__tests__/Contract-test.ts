import { ContractFactory, ContractABI, AbiEntryType } from '../Contract'

const buildRequestURI = txObject => {
  return `me.uport:${txObject.to}?function=${txObject.function}`
}
const Contract = ContractFactory(buildRequestURI)

const address = '0x41566e3a081f5032bdcad470adb797635ddfe1f0'
const abiToken: ContractABI = [
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'approve',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: true,
    inputs: [],
    name: 'totalSupply',
    outputs: [
      {
        name: '',
        type: 'uint256'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: false,
    inputs: [
      {
        name: '_from',
        type: 'address'
      },
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transferFrom',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [
      {
        name: '',
        type: 'uint8'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: true,
    inputs: [],
    name: 'version',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      }
    ],
    name: 'balanceOf',
    outputs: [
      {
        name: 'balance',
        type: 'uint256'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [
      {
        name: '',
        type: 'string'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: false,
    inputs: [
      {
        name: '_to',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'transfer',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: false,
    inputs: [
      {
        name: '_spender',
        type: 'address'
      },
      {
        name: '_value',
        type: 'uint256'
      },
      {
        name: '_extraData',
        type: 'bytes'
      }
    ],
    name: 'approveAndCall',
    outputs: [
      {
        name: 'success',
        type: 'bool'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    constant: true,
    inputs: [
      {
        name: '_owner',
        type: 'address'
      },
      {
        name: '_spender',
        type: 'address'
      }
    ],
    name: 'allowance',
    outputs: [
      {
        name: 'remaining',
        type: 'uint256'
      }
    ],
    payable: false,
    type: AbiEntryType.Function
  },
  {
    inputs: [
      {
        name: '_initialAmount',
        type: 'uint256'
      },
      {
        name: '_tokenName',
        type: 'string'
      },
      {
        name: '_decimalUnits',
        type: 'uint8'
      },
      {
        name: '_tokenSymbol',
        type: 'string'
      }
    ],
    type: AbiEntryType.Constructor
  },
  {
    payable: false,
    type: AbiEntryType.Fallback
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_from',
        type: 'address'
      },
      {
        indexed: true,
        name: '_to',
        type: 'address'
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'Transfer',
    type: AbiEntryType.Event
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: '_owner',
        type: 'address'
      },
      {
        indexed: true,
        name: '_spender',
        type: 'address'
      },
      {
        indexed: false,
        name: '_value',
        type: 'uint256'
      }
    ],
    name: 'Approval',
    type: AbiEntryType.Event
  }
]

describe('Contract', () => {
  let tokenContract

  beforeAll(() => {
    tokenContract = Contract(abiToken).at(address)
  })

  it('initializes given a contractABI and address', () => {
    expect(tokenContract).toEqual(jasmine.any(Object))
  })

  it('returns a function given a contractABI', () => {
    expect(Contract(abiToken)).toEqual(jasmine.any(Object))
  })

  it('returns a contract object with the given contract functions available', () => {
    expect(tokenContract.transferFrom).toBeDefined()
    expect(tokenContract.transfer).toBeDefined()
    expect(tokenContract.approveAndCall).toBeDefined()
  })

  it('returns a well formed uri on contract function calls', () => {
    const uri = tokenContract.transfer(
      '0x41566e3a081f5032bdcad470adb797635ddfe1f0',
      10
    )
    expect(uri).toEqual(
      'me.uport:0x41566e3a081f5032bdcad470adb797635ddfe1f0?function=transfer(address 0x41566e3a081f5032bdcad470adb797635ddfe1f0, uint256 10)'
    )
  })
})

describe('ContractFactory', () => {
  describe('By default', () => {
    let tokenContract: any
    let txObject

    beforeAll(() => {
      tokenContract = ContractFactory()(abiToken).at(address)
    })

    describe('function with address and uint256', () => {
      beforeAll(() => {
        txObject = tokenContract.transfer(
          '0x41566e3a081f5032bdcad470adb797635ddfe1f0',
          10
        )
      })

      it('returns a well formed txObject on contract function calls', () => {
        expect(txObject.function).toBeDefined()
        expect(txObject.to).toEqual(address)
      })

      it('returns a txObject with a human readable function and params', () => {
        expect(txObject.function).toEqual(
          'transfer(address 0x41566e3a081f5032bdcad470adb797635ddfe1f0, uint256 10)'
        )
      })
    })

    describe('function with address, uint and bytes and txObject', () => {
      beforeAll(() => {
        txObject = tokenContract.approveAndCall(
          '0x41566e3a081f5032bdcad470adb797635ddfe1f0',
          10,
          '0x1234',
          { gas: '0x123454' }
        )
      })

      it('returns a well formed txObject on contract function calls', () => {
        expect(txObject.function).toBeDefined()
        expect(txObject.to).toEqual(address)
      })

      it('returns a txObject with a human readable function and params', () => {
        expect(txObject.function).toEqual(
          'approveAndCall(address 0x41566e3a081f5032bdcad470adb797635ddfe1f0, uint256 10, bytes 0x1234)'
        )
      })
    })
  })

  describe('With an extend function', () => {
    it('allows the Contract object functions to be extended if given a function', () => {
      const extend = _ => 'hello'
      const Contract = ContractFactory(extend)
      const tokenContract: any = Contract(abiToken).at(address)
      expect(
        tokenContract.transfer('0x41566e3a081f5032bdcad470adb797635ddfe1f0', 10)
      ).toEqual('hello')
    })

    it('passes additional args on Contract object function calls to the extend function', () => {
      const str = 'ether'
      const extend = (_, arg) => arg
      const Contract = ContractFactory(extend)
      const tokenContract: any = Contract(abiToken).at(address)
      expect(
        tokenContract.transfer(
          '0x41566e3a081f5032bdcad470adb797635ddfe1f0',
          10,
          str
        )
      ).toEqual(str)
    })
  })
})
