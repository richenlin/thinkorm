var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('WHERE NOT IN statements', function() {
    it('should generate a query', function(done) {
      var tree = analyze({
        select: ['name'],
        from: 'users',
        where: {
          not: {
            id: {
              in: [1, 2, 3]
            }
          }
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "name" from "users" where "id" not in ($1, $2, $3)');
        assert.deepEqual(result.bindings, ['1', '2', '3']);
        return done();
    });

    it('should generate a query when in an OR statement', function(done) {
      var tree = analyze({
        select: ['name'],
        from: 'users',
        where: {
          or: [
            {
              not: {
                id: {
                  in: [1, 2, 3]
                }
              }
            },
            {
              not: {
                id: {
                  in: [4, 5, 6]
                }
              }
            }
          ]
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "name" from "users" where "id" not in ($1, $2, $3) or "id" not in ($4, $5, $6)');
        assert.deepEqual(result.bindings, ['1', '2', '3', '4', '5', '6']);
        return done();
    });

    it('should generate a query when in an OR statement with multiple criteria', function(done) {
      var tree = analyze({
        select: ['name'],
        from: 'users',
        where: {
          or: [
            {
              not: {
                id: {
                  in: [1, 2, 3]
                }
              },
              age: 21
            },
            {
              not: {
                id: {
                  in: [4, 5, 6]
                }
              }
            }
          ]
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "name" from "users" where ("id" not in ($1, $2, $3) and "age" = $4) or "id" not in ($5, $6, $7)');
        assert.deepEqual(result.bindings, ['1', '2', '3', '21', '4', '5', '6']);
        return done();
    });
  });
});
