var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('JOIN statements', function() {
    it('should generate a query when a JOIN statement is added', function(done) {
      var tree = analyze({
        select: ['users.id', 'contacts.phone'],
        from: 'users',
        join: [
          {
            from: 'contacts',
            on: {
              users: 'id',
              contacts: 'user_id'
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"');
        return done();
    });

    it('should generate a query when a multiple JOIN statements are added', function(done) {
      var tree = analyze({
        select: ['users.id', 'contacts.phone', 'carriers.name'],
        from: 'users',
        join: [
          {
            from: 'contacts',
            on: {
              users: 'id',
              contacts: 'user_id'
            }
          },
          {
            from: 'carriers',
            on: {
              users: 'id',
              carriers: 'user_id'
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "users"."id", "contacts"."phone", "carriers"."name" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id" inner join "carriers" on "users"."id" = "carriers"."user_id"');
        return done();
    });

    it('should generate a query when an INNERJOIN statement is added', function(done) {
      var tree = analyze({
        select: ['users.id', 'contacts.phone'],
        from: 'users',
        innerJoin: [
          {
            from: 'contacts',
            on: {
              users: 'id',
              contacts: 'user_id'
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"');
        return done();
    });

    it('should generate a query when an OUTERJOIN statement is added', function(done) {
      var tree = analyze({
        select: ['users.id', 'contacts.phone'],
        from: 'users',
        outerJoin: [
          {
            from: 'contacts',
            on: {
              users: 'id',
              contacts: 'user_id'
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select "users"."id", "contacts"."phone" from "users" outer join "contacts" on "users"."id" = "contacts"."user_id"');
        return done();
    });

    it('should generate a query when grouped OR joins are added', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        join: [
          {
            from: 'accounts',
            on: {
              or: [
                {
                  accounts: 'id',
                  users: 'account_id'
                },
                {
                  accounts: 'owner_id',
                  users: 'id'
                }
              ]
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"');
        return done();
    });

    it('should generate a query when grouped AND joins are added', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        join: [
          {
            from: 'accounts',
            on: [
              {
                accounts: 'id',
                users: 'account_id'
              },
              {
                accounts: 'owner_id',
                users: 'id'
              }
            ]
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" and "accounts"."owner_id" = "users"."id"');
        return done();
    });

    it('should generate a query when multiple grouped OR joins are added', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        join: [
          {
            from: 'accounts',
            on: {
              or: [
                {
                  accounts: 'id',
                  users: 'account_id'
                },
                {
                  accounts: 'owner_id',
                  users: 'id'
                }
              ]
            }
          },
          {
            from: 'carriers',
            on: {
              or: [
                {
                  carriers: 'id',
                  users: 'account_id'
                },
                {
                  carriers: 'owner_id',
                  users: 'id'
                }
              ]
            }
          }
        ]
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })

        assert.equal(result.sql, 'select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id" inner join "carriers" on "carriers"."id" = "users"."account_id" or "carriers"."owner_id" = "users"."id"');
        return done();
    });
  });
});
