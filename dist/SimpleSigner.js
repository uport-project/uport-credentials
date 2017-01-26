'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = SimpleSigner;

var _jsontokens = require('jsontokens');

function SimpleSigner(privateKey) {
  return function (data, callback) {
    var hash = _jsontokens.SECP256K1Client.createHash(data);
    var signature = _jsontokens.SECP256K1Client.signHash(hash, privateKey);
    callback(null, signature);
  };
}