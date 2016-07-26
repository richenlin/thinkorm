var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Grouping statements with OR', function() {
    it('should generate a query when an OR statement is used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          or: [
            {
              id: { '>': 10 }
            },
            {
              name: 'Tester'
            }
          ]
        },
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "id" > $1 or "name" = $2');
        assert.deepEqual(result.bindings, ['10', 'Tester']);
        return done();
    });

    it('should generate a query when nested OR statements are used', function(done) {
      var tree = analyze({
        select: '*',
        where: {
          or: [
            {
              or: [
                { id: 1 },
                { id: { '>': 10 } }
              ]
            },
            {
              name: 'Tester'
            }
          ]
        },
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where ("id" = $1 or "id" > $2) or "name" = $3');
        assert.deepEqual(result.bindings, ['1', '10', 'Tester']);
        return done();
    });
  });
});
