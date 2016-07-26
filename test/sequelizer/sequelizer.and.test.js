var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Grouping statements with AND', function() {
    it('should generate a query when AND is used as an array', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          and: [
            {
              firstName: 'foo'
            },
            {
              lastName: 'bar'
            }
          ]
        }
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      });
        assert.equal(result.sql, 'select * from "users" where "firstName" = $1 and "lastName" = $2');
        assert.deepEqual(result.bindings, ['foo', 'bar']);
        return done();
    });

    it('should generate a query when nested OR statements are used', function(done) {
      var tree = analyze({
        select: ['*'],
        from: 'users',
        where: {
          and: [
            {
              or: [
                {
                  firstName: 'John'
                },
                {
                  lastName: 'Smith'
                }
              ]
            },
            {
              or: [
                {
                  qty: {
                    '>': 100
                  }
                },
                {
                  price: {
                    '<': 10.00
                  }
                }
              ]
            }
          ]
        }
      });

      Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
      .exec(function(err, result) {
        assert(!err);
        assert.equal(result.sql, 'select * from "users" where ("firstName" = $1 or "lastName" = $2) and ("qty" > $3 or "price" < $4)');
        assert.deepEqual(result.bindings, ['John', 'Smith', '100', '10.00']);
        return done();
      });
    });
  });
});
