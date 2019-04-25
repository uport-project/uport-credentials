import Creds from './Credentials'
import { SimpleSigner as S } from 'did-jwt'
import { ContractFactory as CF } from './Contract'

export const Credentials = Creds
export const SimpleSigner = S
export const ContractFactory = CF
export default { Credentials, SimpleSigner, ContractFactory }
