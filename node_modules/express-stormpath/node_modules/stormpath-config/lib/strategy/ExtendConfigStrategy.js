'use strict';

var extend = require('cloneextend').extend;

/**
 * Represents a strategy that extends the configuration.
 *
 * @class
 */
function ExtendConfigStrategy (extendWith) {
  this.extendWith = extendWith;
}

ExtendConfigStrategy.prototype.process = function (config, callback) {
  extend(config, this.extendWith);
  callback(null, config);
};

module.exports = ExtendConfigStrategy;
