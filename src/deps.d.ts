declare module 'mnid' {
  interface NetworkAddress {
    address: string,
    network: string,
    checksum: string
  }
  export function isMNID(address: string): boolean
  export function decode(mnid: string) : NetworkAddress
}

declare module 'ethr-did-resolver' {
  export default function register(ethConfig: object): void
}

declare module 'uport-lite' {
  export default function UportLite (conf: {networks: object}): (address: string) => Promise<object>
}