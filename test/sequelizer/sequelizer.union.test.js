var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('UNION statements', function() {
    it('should generate a simple query with a UNION statement', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        where: {
          firstName: 'Bob'
        },
        union: [
          {
            select: '*',
            from: 'users',
            where: {
              lastName: 'Smith'
            }
          },
          {
            select: '*',
            from: 'users',
            where: {
              middleName: 'Allen'
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" where "firstName" = $1 union (select * from "users" where "lastName" = $2) union (select * from "users" where "middleName" = $3)');
        assert.deepEqual(result.bindings, ['Bob', 'Smith', 'Allen']);
        return done();
    });
  });
});
