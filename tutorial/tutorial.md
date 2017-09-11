# Server-side Credentials

Here we will demonstrate how to create and sign a custom credential on a server (called the Creator) and present this to a uport identity. The user of the uPort app will add this credential to her list of credentials. Then we'll show how another service (called the Requestor) can request this credential and validate the corresponding JSON Web Token.

## Register Your App 

First we wish to create identities for our apps. To do this, go to the My Apps tab, or alternatively, [uPort AppManager](https://appmanager.uport.space), then connect with your uPort, and select "New App". This will create a uPort identity for your app, and will display a private key, which you will use on the server to sign credentials. It's important that you save this key!

Go ahead and create identities for the Creator and Requestor, or if you wish to skip this step we have created identities for these services already, with the private keys and addresses hard coded in the apps.

## Creator service

In the file `createcredential.js` we have a simple node `express` server. In the setup phase we use the private key we got from the App Manager to create a `SimpleSigner` object. This object is what will be signing the credential.

```
var signer = uport.SimpleSigner(<your key here>)
```

We then create a `Credentials` object using the signer and the uPort identifier of our app that we got from the App Manager:

```
var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',
  signer: signer
})
```

When we hit the default route using `app.get('/')` we will call `credentials.attest()` in order to sign the credential. For the fields of the credential, the `sub` field is the subject. Set this to the uPort Id of the user that is supposed to receive the credential. For testing purposes this would be the uPort identity shown on the mobile app of the reader. The `exp` field is the expiry of the token, in Unix time. As `claim` field, put your own custom object. We have here `{'Custom Attestation' : 'Custom Value'}` as an example.

```
credentials.attest({
  sub: '2oVV33jifY2nPBLowRS8H7Rkh7fCUDN7hNb',
  exp: 1552046024213,
  claim: {'Custom Attestation' : 'Custom Value'}
})
```

The `attest()` function returns a promise that resolves to a JSON Web Token. We're going to present this token to the user through a URL that looks like this:

```
me.uport:add?attestations=<JSON Web Token>
```

We present this to the user in the form of a QR code. When you scan this code with your mobile app you should see an alert that you are about to add a credential. It should reference the Creator app as the identity giving you this credential. This will add the credential locally to your phone.

## Requestor service

The file `requestcredential.js` contains a simple node express server which will request the same credential that the Creator service gave out. The Requestor server will then validate that the identity who is providing the credential is the same identity that received the credential from the Creator service.

As with the Creator service we start by setting up the Signer using the private key from the App Manager, and the `Credentials` object using the uPort identifier of our Requestor app. We also set up `bodyParser` so that we can parse the JWT that we will get back from the user.

When we load the app using `app.get('/')` we use `createRequest()` in order to request a specific credential from the user. Here we will request the `Custom Attestation` credential. We will use `verified` to denote which credentials we are requesting.

The `callbackUrl` field specifies where the mobile app user should send the credential, should she agree to share it. If you are running the app on a local network you should put your local IP address here, followed by the route `/callback`. Make sure your mobile device is connected to the same network. If you are running the app on a VPS service like Digital Ocean, make sure to put the correct IP address in and that the right ports are open.

```
credentials.createRequest({
  verified: ['Custom Attestation'],
  callbackUrl: 'http://192.168.1.34:8081/callback'
})
```

The `createRequest()` function creates a signed JWT containing the request. The mobile app can then validate that the correct app sent the request.

Once the mobile app user approves the request to share her credential, the `/callback` route is called using `app.post('/callback')`. Here we fetch the response JWT using `req.body.access_token`.

Once we have the JWT we wish to validate it. We use the `receive()` function first. This validates the JWT by checking that the signature matches the public key of the issuer. This validation is done both for the overall JWT and also for the JWTs that are sent in the larger payload.

Next we check that the issuer of the response token (i.e. the user) matches the subject (`sub` field) of the returned credential, that the issuer of the returned credential is the Creator App, and that the credential is of the type `Custom Attestation` with value `Custom Value`.

If everything checks out, you should see the output 

```
Credential verified.
```

in the console. Congratulations, you have verified the credential!
