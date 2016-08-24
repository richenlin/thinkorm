var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE NOT IN statements', function() {
    it('should generate a query', function(done) {
      Test({
        query: {
          select: ['name'],
          from: 'users',
          where: {
            not: {
              id: {
                in: [1, 2, 3]
              }
            }
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "name" from "users" where "id" not in ($1, $2, $3)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'mysql',
            sql: 'select `name` from `users` where `id` not in (?, ?, ?)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "name" from "users" where "id" not in (?, ?, ?)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'oracle',
            sql: 'select "name" from "users" where "id" not in (:1, :2, :3)',
            bindings: ['1', '2', '3']
          },
          {
            dialect: 'mariadb',
            sql: 'select `name` from `users` where `id` not in (?, ?, ?)',
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
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "name" from "users" where "id" not in ($1, $2, $3) or "id" not in ($4, $5, $6)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'mysql',
            sql: 'select `name` from `users` where `id` not in (?, ?, ?) or `id` not in (?, ?, ?)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "name" from "users" where "id" not in (?, ?, ?) or "id" not in (?, ?, ?)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'oracle',
            sql: 'select "name" from "users" where "id" not in (:1, :2, :3) or "id" not in (:4, :5, :6)',
            bindings: ['1', '2', '3', '4', '5', '6']
          },
          {
            dialect: 'mariadb',
            sql: 'select `name` from `users` where `id` not in (?, ?, ?) or `id` not in (?, ?, ?)',
            bindings: ['1', '2', '3', '4', '5', '6']
          }
        ]
      }, done);
    });

    it('should generate a query when inside an OR statement with multiple criteria', function(done) {
      Test({
        query: {
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
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "name" from "users" where ("id" not in ($1, $2, $3) and "age" = $4) or "id" not in ($5, $6, $7)',
            bindings: ['1', '2', '3', '21', '4', '5', '6']
          },
          {
            dialect: 'mysql',
            sql: 'select `name` from `users` where (`id` not in (?, ?, ?) and `age` = ?) or `id` not in (?, ?, ?)',
            bindings: ['1', '2', '3', '21', '4', '5', '6']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "name" from "users" where ("id" not in (?, ?, ?) and "age" = ?) or "id" not in (?, ?, ?)',
            bindings: ['1', '2', '3', '21', '4', '5', '6']
          },
          {
            dialect: 'oracle',
            sql: 'select "name" from "users" where ("id" not in (:1, :2, :3) and "age" = :4) or "id" not in (:5, :6, :7)',
            bindings: ['1', '2', '3', '21', '4', '5', '6']
          },
          {
            dialect: 'mariadb',
            sql: 'select `name` from `users` where (`id` not in (?, ?, ?) and `age` = ?) or `id` not in (?, ?, ?)',
            bindings: ['1', '2', '3', '21', '4', '5', '6']
          }
        ]
      }, done);
    });
  });
});
