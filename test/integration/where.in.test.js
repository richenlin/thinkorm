var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE IN statements', function() {
    it('should generate a query', function(done) {
      Test({
        query: {
          select: ['name'],
          from: 'users',
          where: {
            id: {
              in: [1, 2, 3]
            }
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "name" from "users" where "id" in ($1, $2, $3)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'mysql',
            sql: 'select `name` from `users` where `id` in (?, ?, ?)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "name" from "users" where "id" in (?, ?, ?)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'oracle',
            sql: 'select "name" from "users" where "id" in (:1, :2, :3)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'mariadb',
            sql: 'select `name` from `users` where `id` in (?, ?, ?)',
            bindings: ['1', '2', '3']
          }
        ]
      }, done);
    });

    it('should generate a query when inside an OR statement', function(done) {
      Test({
        query: {
          select: ['name'],
          from: 'users',
          where: {
            or: [
              {
                id: {
                  in: [1, 2, 3]
                }
              },
              {
                id: {
                  in: [4, 5, 6]
                }
              }
            ]
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "name" from "users" where "id" in ($1, $2, $3) or "id" in ($4, $5, $6)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'mysql',
            sql: 'select `name` from `users` where `id` in (?, ?, ?) or `id` in (?, ?, ?)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "name" from "users" where "id" in (?, ?, ?) or "id" in (?, ?, ?)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'oracle',
            sql: 'select "name" from "users" where "id" in (:1, :2, :3) or "id" in (:4, :5, :6)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'mariadb',
            sql: 'select `name` from `users` where `id` in (?, ?, ?) or `id` in (?, ?, ?)',
            bindings: ['1', '2', '3', '4', '5', '6']
          }
        ]
      }, done);
    });
  });
});
