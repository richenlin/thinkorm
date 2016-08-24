var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('Subqueries', function() {
    describe('used as a predicate', function() {
      it('should generate a valid query for an IN subquery', function(done) {
        Test({
          query: {
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
          },
          outcomes: [
            {
              dialect: 'postgresql',
              sql: 'select * from "accounts" where "id" in (select "id" from "users" where "status" = $1 or "name" = $2)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'mysql',
              sql: 'select * from `accounts` where `id` in (select `id` from `users` where `status` = ? or `name` = ?)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'sqlite3',
              sql: 'select * from "accounts" where "id" in (select "id" from "users" where "status" = ? or "name" = ?)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'oracle',
              sql: 'select * from "accounts" where "id" in (select "id" from "users" where "status" = :1 or "name" = :2)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'mariadb',
              sql: 'select * from `accounts` where `id` in (select `id` from `users` where `status` = ? or `name` = ?)',
              bindings: ['active', 'John']
            }
          ]
        }, done);
      });

      it('should generate a valid query for a NOT IN subquery', function(done) {
        Test({
          query: {
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
          },
          outcomes: [
            {
              dialect: 'postgresql',
              sql: 'select * from "accounts" where "id" not in (select "id" from "users" where "status" = $1 or "name" = $2)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'mysql',
              sql: 'select * from `accounts` where `id` not in (select `id` from `users` where `status` = ? or `name` = ?)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'sqlite3',
              sql: 'select * from "accounts" where "id" not in (select "id" from "users" where "status" = ? or "name" = ?)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'oracle',
              sql: 'select * from "accounts" where "id" not in (select "id" from "users" where "status" = :1 or "name" = :2)',
              bindings: ['active', 'John']
            },
            {
              dialect: 'mariadb',
              sql: 'select * from `accounts` where `id` not in (select `id` from `users` where `status` = ? or `name` = ?)',
              bindings: ['active', 'John']
            }
          ]
        }, done);
      });
    });
  });
});
