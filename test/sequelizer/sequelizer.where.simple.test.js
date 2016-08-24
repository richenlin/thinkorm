var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE Simple statements', function() {
    it('should generate a query with a simple WHERE statement', function(done) {
      var tree = analyze({
        select: ['id'],
        where: {
          firstName: 'Test',
          lastName: 'User'
        },
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "id" from "users" where "firstName" = $1 and "lastName" = $2');
        assert.deepEqual(result.bindings, ['Test', 'User']);
        return done();
    });

    it('should generate a valid query when operators are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          votes: { '>': 100 }
        },
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "votes" > $1');
        assert.deepEqual(result.bindings, ['100']);
        return done();
    });

    it('should generate a valid query when multiple operators are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          votes: {
            '>': 100,
            '<': 200
          }
        },
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "votes" > $1 and "votes" < $2');
        assert.deepEqual(result.bindings, ['100', '200']);
        return done();
    });

    it('should generate a valid query when multiple columns and operators are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          votes: { '>': 100 },
          age: { '<': 50 }
        },
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "votes" > $1 and "age" < $2');
        assert.deepEqual(result.bindings, ['100', '50']);
        return done();
    });
  });
});
