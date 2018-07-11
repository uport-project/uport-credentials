import Credentials from './Credentials'
import { SimpleSigner, createJWT, verifyJWT } from 'did-jwt'
import { Contract, ContractFactory } from './Contract'
import UportDIDResolver from 'uport-did-resolver'

const createJWTWrap = ({address, signer}, payload) => createJWT(payload, {issuer: address, signer})

const verifyJWTWrap = ({registry, address}, jwt, callbackUrl = null) => {
  if (registry) UportDIDResolver(registry)
  return verifyJWT(jwt, {callbackUrl, audience: address})
}
const JWT = { createJWT: createJWTWrap , verifyJWT: verifyJWTWrap }

module.exports = { Credentials, SimpleSigner, Contract, ContractFactory, JWT }
