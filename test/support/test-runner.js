/**
 * Given a db flavor and a query object, generate the SQL statement and test
 * it against the expected outcome.
 */

var assert = require('assert');
var async = require('async');
var analyze = require('../../lib/Util/analyze.js');
var sequelizer = require('../../lib/Util/sequelizer.js');

module.exports = function(test, cb) {
  var testDialect = function testDialect(outcome, next) {
    let seqs = analyze(test.query);
    let results =  sequelizer({
      dialect: outcome.dialect,
      tree: seqs
    });
    try {
      assert.equal(results.sql, outcome.sql, outcome.dialect);
      if (outcome.bindings) {
        assert.deepEqual(results.bindings, outcome.bindings, outcome.dialect);
      }
      next();
    } catch (e) {
      e.dialect = outcome.dialect;
      return cb(e);
    }

  };

  async.each(test.outcomes, testDialect, cb);
};
