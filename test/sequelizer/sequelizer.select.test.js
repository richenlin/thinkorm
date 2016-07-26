var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('SELECT statements', function() {
    it('should generate a query for select "*"', function(done) {
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

    it('should generate a query when defined columns are used', function(done) {
      var tree = analyze({
        select: ['title', 'author', 'year'],
        from: 'books'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "title", "author", "year" from "books"');
        return done();
    });
  });
});
