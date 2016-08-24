var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE NOT statements', function() {
    it('should generate a query', function(done) {
      var tree = analyze({
        select: ['id'],
        from: 'users',
        where: {
          not: {
            firstName: 'Test',
            lastName: 'User'
          }
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "id" from "users" where not "firstName" = $1 and not "lastName" = $2');
        assert.deepEqual(result.bindings, ['Test', 'User']);
        return done();
    });

    it('should generate a query with nested WHERE NOT statements', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          or: [
            {
              not: {
                or: [
                  {
                    id: 1
                  },
                  {
                    not: {
                      id: {
                        '>': 10
                      }
                    }
                  }
                ]
              }
            },
            {
              not: {
                name: 'Tester'
              }
            }
          ]
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where not ("id" = $1 or not "id" > $2) or not "name" = $3');
        assert.deepEqual(result.bindings, ['1', '10', 'Tester']);
        return done();
    });

    it('should generate a query when operators are used', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          not: {
            votes: { '>': 100 }
          }
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where not "votes" > $1');
        assert.deepEqual(result.bindings, ['100']);
        return done();
    });

    it('should generate a query when multiple operators are used', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          or: [
            { name: 'John' },
            {
              votes: { '>': 100 },
              not: {
                title: 'Admin'
              }
            }
          ]
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "name" = $1 or ("votes" > $2 and not "title" = $3)');
        assert.deepEqual(result.bindings, ['John', '100', 'Admin']);
        return done();
    });
  });
});
