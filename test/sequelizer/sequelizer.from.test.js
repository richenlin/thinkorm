var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('FROM statements', function() {
    it('should generate a simple query with a FROM statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "books"');
        return done();
    });
  });
});
