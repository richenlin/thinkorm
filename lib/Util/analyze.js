'use strict';

/**
 * Given a criteria format, return the analyzed version.
 * For use with Sequelizer tests.
 */

var tokenizer = require('./wqb/tokenizer.js');
var analyzer = require('./wqb/analyzer.js');

module.exports = function (expression) {
  var tokens = tokenizer({
    expression: expression
  });
  var tree = analyzer({
    tokens: tokens
  });

  return tree;
};