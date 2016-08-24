var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('Simple WHERE statements', function() {
    it('should generate a query with a simple WHERE statement', function(done) {
      Test({
        query: {
          select: ['id'],
          where: {
            firstName: 'Test',
            lastName: 'User'
          },
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "id" from "users" where "firstName" = $1 and "lastName" = $2',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'mysql',
            sql: 'select `id` from `users` where `firstName` = ? and `lastName` = ?',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "id" from "users" where "firstName" = ? and "lastName" = ?',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'oracle',
            sql: 'select "id" from "users" where "firstName" = :1 and "lastName" = :2',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'mariadb',
            sql: 'select `id` from `users` where `firstName` = ? and `lastName` = ?',
            bindings: ['Test', 'User']
          }
        ]
      }, done);
    });

    it('should generate a query when operators are used', function(done) {
      Test({
        query: {
          select: '*',
          where: {
            votes: { '>': 100 }
          },
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "votes" > $1',
            bindings: ['100']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `votes` > ?',
            bindings: ['100']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "votes" > ?',
            bindings: ['100']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "votes" > :1',
            bindings: ['100']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `votes` > ?',
            bindings: ['100']
          }
        ]
      }, done);
    });

    it('should generate a query when multiple operators are used', function(done) {
      Test({
        query: {
          select: '*',
          where: {
            votes: { '>': 100, '<': 200 }
          },
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "votes" > $1 and "votes" < $2',
            bindings: ['100', '200']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `votes` > ? and `votes` < ?',
            bindings: ['100', '200']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "votes" > ? and "votes" < ?',
            bindings: ['100', '200']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "votes" > :1 and "votes" < :2',
            bindings: ['100', '200']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `votes` > ? and `votes` < ?',
            bindings: ['100', '200']
          }
        ]
      }, done);
    });

    it('should generate a query when multiple columns and operators are used', function(done) {
      Test({
        query: {
          select: '*',
          where: {
            votes: { '>': 100 },
            age: { '<': 50 }
          },
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "votes" > $1 and "age" < $2',
            bindings: ['100', '50']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `votes` > ? and `age` < ?',
            bindings: ['100', '50']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "votes" > ? and "age" < ?',
            bindings: ['100', '50']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "votes" > :1 and "age" < :2',
            bindings: ['100', '50']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `votes` > ? and `age` < ?',
            bindings: ['100', '50']
          }
        ]
      }, done);
    });
  });
});
