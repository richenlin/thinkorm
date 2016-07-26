var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('INSERT statements', function() {
    it('should generate a simple query with an INSERT statement', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five'
        },
        into: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'insert into "books" ("title") values ($1) returning "id"');
        assert.deepEqual(result.bindings, ['Slaughterhouse Five']);
        return done();
    });

    it('should generate a query with multiple values being inserted', function(done) {
      var tree = analyze({
        insert: {
          title: 'Slaughterhouse Five',
          author: 'Kurt Vonnegut'
        },
        into: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'insert into "books" ("author", "title") values ($1, $2) returning "id"');
        assert.deepEqual(result.bindings, ['Kurt Vonnegut', 'Slaughterhouse Five']);
        return done();
    });
  });
});
