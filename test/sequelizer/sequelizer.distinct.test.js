var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('DISTINCT statements', function() {
    it('should generate a distinct query', function(done) {
      var tree = analyze({
        select: {
          distinct: ['firstName', 'lastName']
        },
        from: 'customers'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select distinct "firstName", "lastName" from "customers"');
        return done();
    });
  });
});
