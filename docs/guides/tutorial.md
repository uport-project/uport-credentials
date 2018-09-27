---
title: "Get Started with Uport-Credentials"
index: 1
category: "uport-credentials"
type: "tutorial"
source: "https://github.com/uport-project/uport-credentials/blob/develop/docs/guides/tutorial.md"
---

# Server-side Credentials

Here we will demonstrate how to create and sign a custom credential on a server (called the Creator) and present this to a uPort identity. The user of the uPort app will add this credential to her list of credentials. Then we'll show how another service (called the Requestor) can request this credential and validate the corresponding JSON Web Token. This example can be found in the the [uport-credentials repo](github.com/uport-project/uport-credentials).

To start, download repo, install and build, then find the code for this example in the examples folder:

``` bash
$ git clone https://github.com/uport-project/uport-credentials.git
$ cd uport-credentials
$ npm install
$ npm run build
$ cd examples
```

Here is the quick start, read the remainder of the guide for more detailed walk through and explanation.

Run the Credential Creator Service and open the url in the terminal console output. This will first request your DID (identifier) with a QR code in browser, once it receives a response, it will issue a credential to that DID and send it in a push notification. All output found in terminal console.

``` bash
$ node createcredential.js
```

Once you have the credential in your uPort client, you can now go and use the Requestor Service by running and opening the url in the terminal console output. It will ask that you share the credential you just received. Then upon receiving, will verify it. All output found in terminal console.

``` bash
$ node requestcredential.js
```

## Create an Identity

This tutorial uses sample application identities (i.e. private keys) to issue and verify credentials on a server.  For your own applications, you can create a new private key with this library, using the code snippet below:

```
$ node
> const { Credentials } = require('uport-credentials')
> Credentials.createIdentity()
{
  did: 'did:ethr:0x123...',
  privateKey: '3402abe3d...'
}
```

*Please note that in practice the signing key for the identity should be kept secret!*

## Creator service

In the file `createcredential.js` we have a simple node `express` server. In the setup phase we will use the private key and DID we created above or alternatively there is already an example keypair available. We then create a `Credentials` object.

```js
var credentials = new uport.Credentials({
  did: 'did:ethr:0xbc3ae59bc76f894822622cdef7a2018dbe353840',
  privateKey: '74894f8853f90e6e3d6dfdd343eb0eb70cca06e552ed8af80adadcc573b35da3'
})
```

When we hit the default route using `app.get('/')` we will call `credentials.createVerification()` in order to sign the credential. For the fields of the credential, the `sub` field is the subject. Set this to the uPort Id of the user that is supposed to receive the credential. For testing purposes this would be the uPort identity shown on the mobile app of the reader. The `exp` field is the expiry of the token, in Unix time (seconds precision). As `claim` field, put your own custom object, with a single primary key defining the claime 'title'. The remainder of the claim is a serializable javascript (JSON) object, or a string: `{'Title': {'key':'value', 'another key': 'another value', ...}}` or simply `{'Title' : 'Value'}`.

```js
credentials.createVerification({
  sub: '<uport Id of identity in mobile app>',
  exp: 1552046024,
  claim: {'My Title' : {'KeyOne' : 'ValueOne', 'KeyTwo' : 'Value2', 'Last Key' : 'Last Value'}}
})
```

The `createVerification()` function returns a promise that resolves to a JSON Web Token. We're going to present this token to the user through a URL that looks like this:

```
https://id.uport.me/req/eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NkstUiJ9.eyJpYXQiOjE1MzgwNjMyNzIsImV4cCI6MTUzODA2Mzg3MiwidmVyaWZpZWQiOlsiTXkgVGl0bGUiXSwicGVybWlzc2lvbnMiOlsibm90aWZpY2F0aW9ucyJdLCJjYWxsYmFjayI6Imh0dHBzOi8vNDkwNDEyMjYubmdyb2suaW8vY2FsbGJhY2siLCJ0eXBlIjoic2hhcmVSZXEiLCJpc3MiOiJkaWQ6ZXRocjoweGJjM2FlNTliYzc2Zjg5NDgyMjYyMmNkZWY3YTIwMThkYmUzNTM4NDAifQ.5RMznAoaenqxYgycxuqKfuka1XfAHIDKMucnVLGEqs8qI1xmB_XTXGWb1Rw2EJhQtHBG9Br_0siIFAwRQvfoRgE?callback_type=post
```

We present this to the user in the form of a QR code. When you scan this code with your mobile app you should see an alert that you are about to add a credential. It should reference the Creator app as the identity giving you this credential. This will add the credential locally to your phone.

We also create a clickable link. If you click on this link in a mobile browser you will be taken to the uport iOS app.

When you're done editing the file you may run the Creator service like so:

```bash
$ node createcredential.js
```

Open your browser to the url output in the console, you should see the QR code with the credential, which you may scan with the uPort app. Look for output and responses in the terminal console again.

## Requestor service

The file `requestcredential.js` contains a simple node express server which will request the same credential that the Creator service gave out. The Requestor server will then validate that the identity who is providing the credential is the same identity that received the credential from the Creator service.

As with the Creator service we start by setting up the `Credentials` object using the private key and DID we created above (or using example one provided). We also set up `bodyParser` so that we can parse the JWT that we will get back from the user.

When we load the app using `app.get('/')` we use `createDisclosureRequest()` in order to request a specific credential from the user. Here we will request the `My Title` credential. We will use `verified` to denote which credentials we are requesting.

The `callbackUrl` field specifies where the mobile app user should send the credential, should she agree to share it. This must be a publicly available endpoint so that the uPort client can post the response to it. By default the example uses [ngrok](), to create an available endpoint on demand. You could also remove ngrok and deploy the app somewhere.

```js
credentials.createDisclosureRequest({
  verified: [<Title of the credential>],
  callbackUrl: 'http://<Your endpoint>/callback',
})
```

The `createDisclosureRequest()` function creates a signed JWT containing the request. The mobile app can then validate that signature over your app DID which signed it.

To interact with the server, run

```bash
$ node requestcredential.js
```

Then open your browser to the url output in the console, you should see the QR code with request, which you may scan with the uPort app. Look for output and responses in the terminal console again.

When the mobile app user approves the request to share her credential after scanning the code, the `/callback` route is called using `app.post('/callback')`. Here we fetch the response JWT using `req.body.access_token`.

Once we have the JWT we wish to validate it. We use the `authenticateDisclosureResponse()` function first. This validates the JWT by checking that the signature matches the public key of the issuer. This validation is done both for the overall JWT and also for the JWTs that are sent in the larger payload. You may also want to verify additional data in the payload specific to your use case.

If everything checks out, you should see the output

```js
Credential verified.
```

in the console. Congratulations, you have verified the credential!

To test out everything, try checking for a different attestation and make sure it fails. Also try waiting until the request expires to make sure that the response fails - it should throw an error in this case.
