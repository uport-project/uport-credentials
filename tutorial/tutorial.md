# Server-side Credentials

Here we will demonstrate how to create and sign a custom credential on a server (called the Creator) and present this to a uport identity. The user of the uPort app will add this credential to her list of credentials. Then we'll show how another service (called the Requestor) can request this credential and validate the corresponding JSON Web Token.

## Register The App

First we wish to create identities for our apps. You can skip this step if you're ok with using the default identities that are hardcoded in the tutorial files. To create identities, go to the [uPort AppManager](https://appmanager.uport.me), connect with your uPort, and select "New App". This will create a uPort identity for your app, and will display a private key, which you will use on the server to sign credentials. It's important that you save this key!

Go ahead and create identities for the Creator and Requestor, or if you wish to skip this step we have created identities for these services already, with the private keys and addresses hard coded in the apps.

## Creator service

In the file `createcredential.js` we have a simple node `express` server. In the setup phase we use the private key we got from the App Manager to create a `SimpleSigner` object. This object is what will be signing the credential.

```js
var signer = uport.SimpleSigner(<your key here>)
```

We then create a `Credentials` object using the signer and the uPort identifier of our app that we got from the App Manager (or the default identity):

```js
var credentials = new uport.Credentials({
  appName: 'Credential Tutorial',
  address: '2od4Re9CL92phRUoAhv1LFcFkx2B9UAin92',
  signer: signer
})
```

When we hit the default route using `app.get('/')` we will call `credentials.attest()` in order to sign the credential. For the fields of the credential, the `sub` field is the subject. Set this to the uPort Id of the user that is supposed to receive the credential. For testing purposes this would be the uPort identity shown on the mobile app of the reader. The `exp` field is the expiry of the token, in Unix time (seconds precision). As `claim` field, put your own custom object. We show an example below. The format of the claim needs to be `{'Title': {'key':'value', 'another key': 'another value', ...}}` or simply `{'Title' : 'Value'}`. We do not support more nested claims at this time.

```js
credentials.attest({
  sub: '<uport Id of mobile app>',
  exp: 1552046024,
  claim: {'My Title' : {'KeyOne' : 'ValueOne', 'KeyTwo' : 'Value2', 'Last Key' : 'Last Value'}}
})
```

The `attest()` function returns a promise that resolves to a JSON Web Token. We're going to present this token to the user through a URL that looks like this:

```js
me.uport:add?attestations=<JSON Web Token>
```

We present this to the user in the form of a QR code. When you scan this code with your mobile app you should see an alert that you are about to add a credential. It should reference the Creator app as the identity giving you this credential. This will add the credential locally to your phone.

We also create a clickable link. If you click on this link in a mobile browser you will be taken to the uport iOS app.

When you're done editing the file you may run the Creator service like so:

```js
> cd tutorial
> node createcredential.js
```

If you open your browser to `http://localhost:8081/` you should see the QR code with the credential, which you may scan with the uPort app.

## Requestor service

The file `requestcredential.js` contains a simple node express server which will request the same credential that the Creator service gave out. The Requestor server will then validate that the identity who is providing the credential is the same identity that received the credential from the Creator service.

As with the Creator service we start by setting up the Signer using the private key from the App Manager, and the `Credentials` object using the uPort identifier of our Requestor app. We also set up `bodyParser` so that we can parse the JWT that we will get back from the user.

When we load the app using `app.get('/')` we use `createRequest()` in order to request a specific credential from the user. Here we will request the `Custom Attestation` credential. We will use `verified` to denote which credentials we are requesting.

The `callbackUrl` field specifies where the mobile app user should send the credential, should she agree to share it. If you are running the app on a local network you should put your local IP address here, followed by the route `/callback`. Make sure your mobile device is connected to the same network. If you are running the app on a VPS service like Digital Ocean, make sure to put the correct IP address in and that the right ports are open.

We have an expiry field, denoted `exp`, which represents the unix epoch when the request will expire. In our example we use 300 seconds (5 minutes) in the future. This means that if the user waits longer than 300 seconds to provide the response their response will not be accepted as valid.

```js
credentials.createRequest({
  verified: [<Title of the credential>],
  callbackUrl: 'http://192.168.1.34:8081/callback',
  exp: Math.floor(new Date().getTime()/1000) + <expiry time in seconds>
})
```

The `createRequest()` function creates a signed JWT containing the request. The mobile app can then validate that the correct app sent the request.

To interact with the server, run

```js
node requestcredential.js
```

and go to `http://localhost:8081` in your browser.

When the mobile app user approves the request to share her credential after scanning the code, the `/callback` route is called using `app.post('/callback')`. Here we fetch the response JWT using `req.body.access_token`.

Once we have the JWT we wish to validate it. We use the `receive()` function first. This validates the JWT by checking that the signature matches the public key of the issuer. This validation is done both for the overall JWT and also for the JWTs that are sent in the larger payload.

Next we check that the issuer of the response token (i.e. the user) matches the subject (`sub` field) of the returned credential, that the issuer of the returned credential is the Creator App, and that the credential has title `My Title` with the values defined by the Creator App.

If everything checks out, you should see the output

```js
Credential verified.
```

in the console. Congratulations, you have verified the credential!

To test out everything, try checking for a different attestation and make sure it fails. Also try waiting until the request expires to make sure that the response fails - it should throw an error in this case.
