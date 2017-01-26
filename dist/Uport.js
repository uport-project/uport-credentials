'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _JWT = require('./JWT');

var _uportRegistry = require('uport-registry');

var _uportRegistry2 = _interopRequireDefault(_uportRegistry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var INFURA_ROPSTEN = 'https://ropsten.infura.io';
var UPORT_REGISTRY_ADDRESS = '0xb9C1598e24650437a3055F7f66AC1820c419a679';

var Uport = function () {
  function Uport(settings) {
    _classCallCheck(this, Uport);

    this.settings = settings;
    if (!this.settings.registry) {
      var registry = new _uportRegistry2.default();
      // The only function we're really interested from uport registry is getAttributes
      this.settings.registry = registry.getAttributes.bind(registry);
    }
  }

  // Create request token


  _createClass(Uport, [{
    key: 'request',
    value: function request(payload) {
      return (0, _JWT.createJWT)(this.settings, _extends({}, payload, { type: 'shareReq' }));
    }

    // Receive response token from user and return data to callback

  }, {
    key: 'receive',
    value: function receive(token, callback) {}
    // verifyJWT


    // Create attestation

  }, {
    key: 'attest',
    value: function attest(_ref) {
      var sub = _ref.sub,
          claim = _ref.claim,
          exp = _ref.exp;

      return (0, _JWT.createJWT)(this.settings, { sub: sub, claim: claim, exp: exp });
    }

    // send push 

  }, {
    key: 'pushTo',
    value: function pushTo(pushToken, data, callback) {}
  }]);

  return Uport;
}();

exports.default = Uport;