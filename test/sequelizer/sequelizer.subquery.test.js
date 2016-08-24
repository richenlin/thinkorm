var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Subqueries', function() {
    describe('used as a predicate', function() {
      it('should generate a valid query for an IN subquery', function(done) {
        var tree = analyze({
          select: '*',
          where: {
            id: {
              in: {
                select: ['id'],
                from: 'users',
                where: {
                  or: [
                    { status: 'active' },
                    { name: 'John' }
                  ]
                }
              }
            }
          },
          from: 'accounts'
        });

        var result = Sequelizer({
          dialect: 'postgresql',
          tree: tree
        })

          assert.equal(result.sql, 'select * from "accounts" where "id" in (select "id" from "users" where "status" = $1 or "name" = $2)');
          assert.deepEqual(result.bindings, ['active', 'John']);
          return done();
      });

      it('should generate a valid query for a NOT IN subquery', function(done) {
        var tree = analyze({
          select: '*',
          from: 'accounts',
          where: {
            not: {
              id: {
                in: {
                  select: ['id'],
                  from: 'users',
                  where: {
                    or: [
                      { status: 'active' },
                      { name: 'John' }
                    ]
                  }
                }
              }
            }
          }
        });

        var result = Sequelizer({
          dialect: 'postgresql',
          tree: tree
        })

          assert.equal(result.sql, 'select * from "accounts" where "id" not in (select "id" from "users" where "status" = $1 or "name" = $2)');
          assert.deepEqual(result.bindings, ['active', 'John']);
          return done();
      });
    });

    describe('used as scalar values', function() {
      it('should generate a valid query when used inside a SELECT', function(done) {
        var tree = analyze({
          select: ['name', {
            select: ['username'],
            from: 'users',
            where: {
              or: [
                { status: 'active' },
                { name: 'John' }
              ]
            },
            as: 'username'
          }, 'age'],
          from: 'accounts'
        });

        var result = Sequelizer({
          dialect: 'postgresql',
          tree: tree
        })

          assert.equal(result.sql, 'select "name", (select "username" from "users" where "status" = $1 or "name" = $2) as "username", "age" from "accounts"');
          assert.deepEqual(result.bindings, ['active', 'John']);
          return done();
      });

      it('should generate a valid query when used as a value in a WHERE', function(done) {
        var tree = analyze({
          select: ['name', 'age'],
          from: 'accounts',
          where: {
            username: {
              select: ['username'],
              from: 'users',
              where: {
                color: 'accounts.color'
              }
            }
          }
        });

        var result = Sequelizer({
          dialect: 'postgresql',
          tree: tree
        })

          assert.equal(result.sql, 'select "name", "age" from "accounts" where "username" = (select "username" from "users" where "color" = $1)');
          assert.deepEqual(result.bindings, ['accounts.color']);
          return done();
      });
    });

    describe('used as table sub query', function() {
      it('should generate a valid query when used as a value in a FROM with an AS alias', function(done) {
        var tree = analyze({
          select: ['name', 'age'],
          from: {
            select: ['age'],
            from: 'users',
            where: {
              age: 21
            },
            as: 'userage'
          }
        });

        var result = Sequelizer({
          dialect: 'postgresql',
          tree: tree
        })

          assert.equal(result.sql, 'select "name", "age" from (select "age" from "users" where "age" = $1) as "userage"');
          assert.deepEqual(result.bindings, [21]);
          return done();
      });
    });
  });
});
