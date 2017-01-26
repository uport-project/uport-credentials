'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function buildFunctionRequest(_ref) {
  var address = _ref.address,
      functionAbi = _ref.functionAbi,
      functionParams = _ref.functionParams,
      ethValue = _ref.ethValue;

  var functionCall = ''; /// create function call data from functionAbi and functionParams
  return 'me.uport:' + address + '?function=';
}

var Contract = function Contract(abi, address) {
  // TODO create functions for each transaction function in abi

  _classCallCheck(this, Contract);
};

exports.default = Contract;