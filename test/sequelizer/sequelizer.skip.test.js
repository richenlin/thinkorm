var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('SKIP statements', function() {
    it('should generate a simple query with a SKIP statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        skip: 10
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" offset $1');
        assert.deepEqual(result.bindings, ['10']);
        return done();
    });
  });
});
