var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('UNION statements', function() {
    it('should generate a UNION query', function(done) {
      Test({
        query: {
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
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "firstName" = $1 union (select * from "users" where "lastName" = $2) union (select * from "users" where "middleName" = $3)',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `firstName` = ? union (select * from `users` where `lastName` = ?) union (select * from `users` where `middleName` = ?)',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "firstName" = ? union (select * from "users" where "lastName" = ?) union (select * from "users" where "middleName" = ?)',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "firstName" = :1 union (select * from "users" where "lastName" = :2) union (select * from "users" where "middleName" = :3)',
            bindings: ['Bob', 'Smith', 'Allen']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `firstName` = ? union (select * from `users` where `lastName` = ?) union (select * from `users` where `middleName` = ?)',
            bindings: ['Bob', 'Smith', 'Allen']
          }
        ]
      }, done);
    });
  });
});
