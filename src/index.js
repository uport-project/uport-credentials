import Credentials from './Credentials'
import { createJWT, verifyJWT } from './JWT'
import { SimpleSigner } from 'did-jwt'
import { Contract, ContractFactory } from './Contract'
import UportDIDResolver from 'uport-did-resolver'

const JWT = { createJWT: createJWT , verifyJWT: verifyJWT }

module.exports = { Credentials, SimpleSigner, Contract, ContractFactory, JWT }