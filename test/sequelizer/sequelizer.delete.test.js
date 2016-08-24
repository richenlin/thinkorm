var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('DELETE statements', function() {
    it('should generate a simple query with an DELETE statement', function(done) {
      var tree = analyze({
        del: true,
        from: 'accounts',
        where: {
          activated: false
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'delete from "accounts" where "activated" = $1 returning "id"');
        assert.deepEqual(result.bindings, [false]);
        return done();
    });
  });
});
