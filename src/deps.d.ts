declare module 'mnid' {
  interface NetworkAddress {
    address: string
    network: string
    checksum: string
  }
  export function isMNID(address: string): boolean
  export function decode(mnid: string): NetworkAddress
}
