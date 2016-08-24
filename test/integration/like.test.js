var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('LIKE operator ::', function() {
    it('should generate a LIKE query', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          where: {
            or: [
              {
                name: {
                  like: '%Test%'
                }
              },
              {
                not: {
                  id: {
                    in: [1, 2, 3]
                  }
                }
              }
            ]
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "name" like $1 or "id" not in ($2, $3, $4)',
            bindings: ['%Test%', '1', '2', '3']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `name` like ? or `id` not in (?, ?, ?)',
            bindings: ['%Test%', '1', '2', '3']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "name" like ? or "id" not in (?, ?, ?)',
            bindings: ['%Test%', '1', '2', '3']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "name" like :1 or "id" not in (:2, :3, :4)',
            bindings: ['%Test%', '1', '2', '3']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `name` like ? or `id` not in (?, ?, ?)',
            bindings: ['%Test%', '1', '2', '3']
          }
        ]
      }, done);
    });
  });
});
