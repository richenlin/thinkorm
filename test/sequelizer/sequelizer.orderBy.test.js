var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('ORDER BY statements', function() {
    it('should generate a simple query with ORDER BY statements', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        orderBy: [{ name: 'desc' }, { age: 'asc' }]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" order by "name" desc, "age" asc');
        return done();
    });
  });
});
