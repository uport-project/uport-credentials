'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.createJWT = createJWT;
exports.verifyJWT = verifyJWT;

var _jsontokens = require('jsontokens');

var JOSE_HEADER = { typ: 'JWT', alg: 'ES256K' };

function createJWT(_ref, payload) {
  var address = _ref.address,
      signer = _ref.signer;

  var signingInput = (0, _jsontokens.createUnsignedToken)(JOSE_HEADER, _extends({}, payload, { iss: address, iat: new Date().getTime() }));
  return new Promise(function (resolve, reject) {
    return signer(signingInput, function (error, signature) {
      if (error) return reject(error);
      resolve([signingInput, signature].join('.'));
    });
  });
}

function verifyJWT(_ref2, jwt) {
  var registry = _ref2.registry,
      address = _ref2.address;

  return new Promise(function (resolve, reject) {
    // 1. decode jwt
    var _decodeToken = (0, _jsontokens.decodeToken)(jwt),
        payload = _decodeToken.payload;
    // 2. Fetch uport-registry profile for iss


    registry(payload.iss).then(function (profile) {
      if (!profile) return reject(new Error('No profile found, unable to verify JWT'));
      var verifier = new _jsontokens.TokenVerifier('ES256K', profile.publicKey);
      if (verifier.verify(jwt)) {
        if (payload.exp && payload.exp <= new Date().getTime()) {
          return reject(new Error('JWT has expired'));
        }
        if (payload.aud && payload.aud !== address) {
          return reject(new Error('JWT audience does not match your address'));
        }
        resolve({ payload: payload, profile: profile });
      } else {
        return reject(new Error('Signature invalid for JWT'));
      }
    }).catch(reject);
  });
}