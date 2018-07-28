---
title: "Using uPort from a server backend"
index: 1
category: "tutorials"
type: "content"
source: "https://github.com/uport-project/uport-js/blob/develop/docs/guides/server-side-credentials-example.md"
---


# Server-side Credentials

Here we will demonstrate how to create and sign a custom credential on a server (called the Creator) and present this to a uport identity. The user of the uPort app will add this credential to her list of credentials. Then we'll show how another service (called the Requestor) can request this credential and validate the corresponding JSON Web Token.

### Prerequisites:

1. The code for this tutorial can be found in the [Uport-JS examples.](github.com/uport-project/uport-js/blob/develop/examples/simple-credential-tutorial/).  Use this to follow the tutorial.
1. A publicly available IP address to deploy the service to.  An HTTP tunneling service, such as [Ngrok](https://ngrok.com) can be used.

## Register an App

We have created application identities and hard-coded them in the [examples](github.com/uport-project/uport-js/blob/develop/examples/simple-credential-tutorial) for convenience and educational purposes.  If you wish to expand upon these examples please utilize our [Application Manager](https://appmanager.uport.me) or [Uport JS Client](https://github.com/uport-project/uport-js-client) to create a new application identity and replace the signing key and MNID in the examples with your own.

*Please note that in practice the signing key for the identity should be protected information*

To create identities using the [uPort AppManager](https://appmanager.uport.me),

1.  Navigate to https:appmanager.uport.me
1.  Click "Connect with uPort".
1.  Scan the QR using the uPort mobile application
1.  Once authenticated, select "New App".

This will create a uPort identity for your app and display a private key.  This key will be used to instantiate a Simple Signer object which you will use in this example to sign credentials. It's important that you save and secure this key!

Now that you have the application identity sorted, lets step into the code.

## Setup a Requestor Service

If you haven't yet, clone the Uport-JS [repository](github.com/uport-project/uport-js) and from the root of the project change directory to *examples/simple-credential-tutorial*, then `npm install` to ensure required dependencies are present.

The file *requestcredential.js* contains a service that will request the MNID identifier of the mobile application.  This identifier will be used throughout the tutorial.

With a private key obtained from creating an application identity, use it to create a `SimpleSigner` object. This object returns a function that is configured to sign data, in this case it will used to sign the JWT.

This example service also requires a public IP.  Update the variable assignment to `endpoint` to reference a public IP or HTTP tunnel using a service like [Ngrok](https://ngrok.com).

```js
let signer = uport.SimpleSigner(<your key here>)
let endpoint = <replace this with a public IP or HTTP tunnel>
```

Then create a `Credentials` object using the signer and the MNID identifier of the application identity (or use the default identity):

```js
const credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',    // MNID of the application identity
  signer: signer                                     // Signer object created with the private signing key
})
```

Using `express` we wrap the requesting of these credentials in a service using the default route `app.get('/')`.

When a client makes a request of the default route the service will call `credentials.createRequest` to request information from the mobile client.  The `createRequest()` function creates a signed JWT containing the request and the MNID of the mobile client by default, which is what we are seeking.  An optional array of requested profile information can be passed as the value for the `requested` attribute.  We are including this here to show the capability, however we only need the MNID identifier of the uPort identity for the purpose of this tutorial.

```js
credentials.createRequest({
    requested: ['name', 'avatar', 'phone', 'country'],
    callbackUrl: "<public address>/callback",            // publicly available IP address for the callback
    exp: Math.floor(new Date().getTime()/1000) + 300     // expiration for the request
  }).then( function(response) {
    // see step 4...
  })
```

The `callbackUrl` field specifies where the mobile app user should send the credential, should they agree to share it.  If you are running the app on a local network and your mobile device has access to the the local network you should put your local IP address here, followed by the route `/callback`.  Otherwise you will need a publicly available address to utilize the service we are creating.  An HTTP tunneling service like [Ngrok](https://ngrok.com) can be used for the purposes of this tutorial.

There is also an expiry field, denoted `exp`, which represents the unix epoch when the request will expire. In our example we use 300 seconds (5 minutes) in the future. This means that if the user waits longer than 300 seconds to respond it will not be accepted as valid.

To interact with the server, run

```js
node requestcredential.js
```

When the mobile app user approves the request to share their credentials after scanning the code, the `/callback` route is called using `app.post('/callback')`.  The service will output the result of it's operations to the node console.

A successful request will result in output resembling the following:

```sh
Decoded JWT:

{ '@context': 'http://schema.org',
  '@type': 'Person',
  publicKey: '0x04e543f2b14163a814e732a220613ad4a189ed7a74398ca74ecafb3913c7ceed1e861101ba522a5bda2c341bc604b738d4f9a36e13cac6a54ecc9caab74dd29947',
  publicEncKey: 'UThhBIP5XWo6r/oZhBsrTIwc2ZOSGCcfBcRhIuB4GEA=',
  address: '2orwKquTNVjJJvxjRnUxY3sVKCNqoNEow1pW',
  networkAddress: '2orwKquTNVjJJvxjRnUY3sVKCNqoNEow1pW' }
```

Save the value of the `address` key for the next two examples.  This is your MNID.

## Setup a Creator Service

Inspecting the file *createcredential.js* there is a minimal express server setup to run on port `8081` and code that is configured with a default signing identity.  The example will run as-is, however for the purposes of this example we are assuming an application identity was created and you have your own private key to use.  You should use the same information from step one.

With a private key obtained from creating an application identity, use it to create a `SimpleSigner` object. This object returns a function that is configured to sign data, in this case it will used to sign the credential.

```js
let signer = uport.SimpleSigner(<your key here>)
```

Then create a `Credentials` object using the signer and the MNID identifier of the application identity (or use the default identity):

```js
let credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',    // MNID of the application identity
  signer: signer                                     // Signer object created with the private signing key
})
```

When a client makes a request of the default route the service will call `credentials.attest()` in order to sign the credential.

```js
credentials.attest({
  sub: '<uport Id of identity in mobile app>',
  exp: 1552046024,
  claim: {'My Title' : {'KeyOne' : 'ValueOne', 'KeyTwo' : 'Value2', 'Last Key' : 'Last Value'}}
})
```

### For the fields of the credential:

* `sub` is the subject. Set this to the uPort Id of the user that is supposed to receive the credential. For testing purposes this would be the uPort identity shown on the mobile app of the reader.
* The `exp` field is the expiry of the token, in Unix time (seconds precision).
* For the `claim` field, put your own custom object or leave the defaults. The format of the claim needs to be `{'Title': {'key':'value', 'another key': 'another value', ...}}` or simply `{'Title' : 'Value'}`. We do not officially support deeper nested claims at this time.

The `attest()` function returns a promise that resolves to a JSON Web Token. We're going to present this token to the user through a URL that looks like this:

```js
me.uport:add?attestations=<JSON Web Token>&callback_type=post
```

We present this to the user in the form of a QR code. When you scan this code with your mobile app you should see an alert that you are about to add a credential. It should reference the Creator app as the identity giving you this credential. This will add the credential locally to your phone.

We also create a clickable link. If you click on this link in a mobile browser you will be taken to the uport iOS app.

When you're done editing the file you may run the Creator service like so:
The service is now ready to run.  Using a terminal from the root of the *simple-credential-tutorial* execute `node credentials.js`.  Now use a browser to navigate to *http://localhost:8081* and interact with the service.


```sh
node createcredential.js
```

If you open your browser to `http://localhost:8081/` you should see the QR code with the credential, which you may scan with the uPort app.  After scanning the QR you should see output resembling the following

```js
{ header: { typ: 'JWT', alg: 'ES256K' },
  payload:
   { iss: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',
     iat: 1526360544,
     sub: '2orwKquTNVjJJvxjRnUY3sVKCNqoNEow1pW',
     claim: { 'My Title': [Object] },
     exp: 1552046024 },
  signature: '4a5_4l0QOUEjt5dEAUpdU17S6pYNY28xlaA9TJbPOB2AWQ0338MvReWwp_sN20HS02wVOuWkxjpmFrxN3ySFkA' }
```

## Setup a Verification service

The file *verifycredential.js* contains a simple node express server which will request the same credential that the Creator service gave out. The Requestor server will then validate that the identity who is providing the credential is the same identity that received the credential from the Creator service.

As with the Creator service we start by setting up the Signer using the private key from the App Manager, and the `Credentials` object using the uPort identifier of our Requestor app. We also set up `bodyParser` so that we can parse the JWT that we will get back from the user.

When we load the app using `app.get('/')` we use `createRequest()` in order to request a specific credential from the user. Here we will request the `Custom Attestation` credential. We will use `verified` to denote which credentials we are requesting.

```js
credentials.createRequest({
  verified: [<Title of the credential>],
  callbackUrl: 'http://192.168.1.34:8081/callback',
  exp: Math.floor(new Date().getTime()/1000) + <expiry time in seconds>
})
```

Remember, the `createRequest()` function creates a signed JWT containing the request.  The mobile app can then validate that the correct application identity sent the request.

To interact with the server, run

```sh
node verifycredential.js
```

When the mobile app user approves the request to share their credential after scanning the code, the `/callback` route is called using `app.post('/callback')`. Here we fetch the response JWT using `req.body.access_token`.

Once we have the JWT we wish to validate it. We use the `receive()` function first. This validates the JWT by checking that the signature matches the public key of the issuer. This validation is done both for the overall JWT and also for the JWTs that are sent in the larger payload.

Next we check that the issuer of the response token (i.e. the user) matches the subject (`sub` field) of the returned credential, that the issuer of the returned credential is the Creator App, and that the credential has title `My Title` with the values defined by the Creator App.

If everything checks out, you should see the output

```js
Credential verified.
```

in the console. Congratulations, you have verified the credential!

To test out everything, try checking for a different attestation and make sure it fails. Also try waiting until the request expires to make sure that the response fails - it should throw an error in this case.
