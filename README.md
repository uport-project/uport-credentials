[![npm](https://img.shields.io/npm/v/uport-credentials.svg)](https://www.npmjs.com/package/uport-credentials)
[![Twitter Follow](https://img.shields.io/twitter/follow/uport_me.svg?style=social&label=Follow)](https://twitter.com/uport_me)

[DID Specification](https://w3c-ccg.github.io/did-spec/) | [Getting Started](/docs/guides/index.md)

[FAQ and helpdesk support](http://bit.ly/uPort_helpdesk)

# uPort Credentials Library

**Required Upgrade to uport-credentials@1.3.0**

Starting with version 1.3.0 you are required to specify either a `Resolver` instance, or a valid configuration
object for `ethr-did-resolver`.
Previous versions of this library were relying on the automatic configuration of some default
[DID resolvers](https://github.com/decentralized-identity/did-resolver) but this pattern was both limiting and prone
to errors of misconfiguration or interference.
This has caused an outage in credential verification on 2020-01-20 and continued use of previous versions are highly
likely to no longer function properly because of this.

An example configuration with a resolver:

```javascript
import { Credentials, SimpleSigner } from 'uport-credentials'
import { Resolver } from 'did-resolver'
import { getResolver } from 'ethr-did-resolver'

const providerConfig = { rpcUrl: 'https://mainnet.infura.io/<YOUR INFURA PROJECT ID>' }
const resolver = new Resolver(getResolver(providerConfig))

const credentials = new Credentials({
    did: process.env.APPLICATION_DID,
    signer: SimpleSigner(process.env.PRIVATE_KEY),
    resolver
})

```

See [ethr-did-resolver#43](https://github.com/decentralized-identity/ethr-did-resolver/issues/43) for more info.

## Integrate uPort Into Your Application 

uPort provides a set of tools for creating and managing identities that conform to the decentralized identifier (DID)
specification, and for requesting and exchanging verified data between identities. 

uPort Credentials simplifies the process of identity creation within JavaScript applications; additionally, it allows
applications to easily sign and verify data — signed by other identities to facilitate secure communication between
parties. These pieces of data take the form of signed JSON Web Tokens (JWTs), they have specific fields designed for
use with uPort clients, described in the uPort specifications, collectively referred to as verifications.
 
To allow for maximum flexibility, uPort Credential’s only deals with creation and validation of verifications. To pass
verifications between a JavaScript application and a user via the uPort mobile app, we have developed the
[uPort Transports library](https://github.com/uport-project/uport-transports), use it in conjunction with uPort
Credentials when necessary.

To hit the ground running with uPort Credentials, visit the [Getting Started guide](/docs/guides/index.md). 

For details on uPort's underlying architecture, read our [spec repo](https://github.com/uport-project/specs)

This library is part of a suite of tools maintained by the uPort Project, a ConsenSys formation. For more information
on the project, visit [uport.me](https://uport.me)

[FAQ and helpdesk support](http://bit.ly/uPort_helpdesk)

## Contributing

Please see our [contribution guidelines](/Contributing.md) if you wish to contribute to this project.
