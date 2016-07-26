var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE NOT NULL statements', function() {
    it('should generate a query with a simple WHERE statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          not: {
            updatedAt: null
          }
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "updatedAt" is not null');
        return done();
    });
  });
});
