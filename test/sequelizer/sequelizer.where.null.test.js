var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE NULL statements', function() {
    it('should generate a query with a simple WHERE statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          updatedAt: null
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "updatedAt" is null');
        return done();
    });
  });
});
