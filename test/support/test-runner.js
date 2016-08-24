/**
 * Given a db flavor and a query object, generate the SQL statement and test
 * it against the expected outcome.
 */

var assert = require('assert');
var async = require('async');
var path = require('path');
var thinkorm = require('../../index.js');
//thinkorm.require需要使用绝对路径
var User = thinkorm.require(path.dirname(path.dirname(__dirname)) + '/exmple/model/lib/User.js');
function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var _aToG = require('babel-runtime/helpers/asyncToGenerator');
var _asyncToGenerator = requireDefault(_aToG);
var baseparser = requireDefault(require('../../lib/Parser/base.js')).default;

module.exports = function(test, cb) {
  var testDialect = function testDialect(outcome, next) {

    let model = new User(outcome.config);

    let parser = new baseparser(outcome.config);
    for(let n in outcome.query){
      model = model[n](outcome.query[n]);
    }
    let options = model._parseOptions(outcome.options);
    return  (0, _asyncToGenerator.default)(function* () {
      var result = yield parser.buildSql(outcome.client, options);

      try {
        assert.equal(result, outcome.sql);
        next();
      } catch (e) {
        return cb(e);
      }

    })();
  };

  async.each(test.outcomes, testDialect, cb);
};
