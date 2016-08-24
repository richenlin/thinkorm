var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('OPTS', function() {
    it('should support schemas', function(done) {
      var tree = analyze({
        select: ['title', 'author', 'year'],
        from: 'books',
        opts: {
          schema: 'foo'
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "title", "author", "year" from "foo"."books"');
        return done();
    });
  });
});
