var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('UPDATE statements', function() {
    it('should generate a simple query with an UPDATE statement', function(done) {
      var tree = analyze({
        update: {
          status: 'archived'
        },
        where: {
          publishedDate: { '>': 2000 }
        },
        using: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'update "books" set "status" = $1 where "publishedDate" > $2 returning "id"');
        assert.deepEqual(result.bindings, ['archived', 2000]);
        return done();
    });

    it('should generate a query with multiple values being inserted', function(done) {
      var tree = analyze({
        update: {
          status: 'archived',
          active: false
        },
        where: {
          publishedDate: { '>': 2000 }
        },
        using: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'update "books" set "active" = $1, "status" = $2 where "publishedDate" > $3 returning "id"');
        assert.deepEqual(result.bindings, [false, 'archived', 2000]);
        return done();
    });

    it('should generate a query with a NULL value for input', function(done) {
      var tree = analyze({
        update: {
          status: null
        },
        using: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'update "books" set "status" = $1 returning "id"');
        assert.deepEqual(result.bindings, [null]);
        return done();
    });
  });
});
