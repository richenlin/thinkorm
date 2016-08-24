var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('WHERE NOT statements', function() {
    it('should generate a query with a WHERE NOT statement', function(done) {
      Test({
        query: {
          select: ['id'],
          from: 'users',
          where: {
            not: {
              firstName: 'Test',
              lastName: 'User'
            }
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "id" from "users" where not "firstName" = $1 and not "lastName" = $2',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'mysql',
            sql: 'select `id` from `users` where not `firstName` = ? and not `lastName` = ?',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "id" from "users" where not "firstName" = ? and not "lastName" = ?',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'oracle',
            sql: 'select "id" from "users" where not "firstName" = :1 and not "lastName" = :2',
            bindings: ['Test', 'User']
          },
          {
            dialect: 'mariadb',
            sql: 'select `id` from `users` where not `firstName` = ? and not `lastName` = ?',
            bindings: ['Test', 'User']
          }
        ]
      }, done);
    });

    it('should generate a query when nested WHERE NOT statements are used', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          where: {
            or: [
              {
                not: {
                  or: [
                    {
                      id: 1
                    },
                    {
                      not: {
                        id: {
                          '>': 10
                        }
                      }
                    }
                  ]
                }
              },
              {
                not: {
                  name: 'Tester'
                }
              }
            ]
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where not ("id" = $1 or not "id" > $2) or not "name" = $3',
            bindings: ['1', '10', 'Tester']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where not (`id` = ? or not `id` > ?) or not `name` = ?',
            bindings: ['1', '10', 'Tester']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where not ("id" = ? or not "id" > ?) or not "name" = ?',
            bindings: ['1', '10', 'Tester']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where not ("id" = :1 or not "id" > :2) or not "name" = :3',
            bindings: ['1', '10', 'Tester']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where not (`id` = ? or not `id` > ?) or not `name` = ?',
            bindings: ['1', '10', 'Tester']
          }
        ]
      }, done);
    });

    it('should generate a query when operators are used', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          where: {
            not: {
              votes: { '>': 100 }
            }
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where not "votes" > $1',
            bindings: ['100']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where not `votes` > ?',
            bindings: ['100']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where not "votes" > ?',
            bindings: ['100']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where not "votes" > :1',
            bindings: ['100']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where not `votes` > ?',
            bindings: ['100']
          }
        ]
      }, done);
    });

    it('should generate a query when multiple operators are used', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          where: {
            or: [
              { name: 'John' },
              {
                votes: { '>': 100 },
                not: {
                  title: 'Admin'
                }
              }
            ]
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" where "name" = $1 or ("votes" > $2 and not "title" = $3)',
            bindings: ['John', '100', 'Admin']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` where `name` = ? or (`votes` > ? and not `title` = ?)',
            bindings: ['John', '100', 'Admin']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" where "name" = ? or ("votes" > ? and not "title" = ?)',
            bindings: ['John', '100', 'Admin']
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" where "name" = :1 or ("votes" > :2 and not "title" = :3)',
            bindings: ['John', '100', 'Admin']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` where `name` = ? or (`votes` > ? and not `title` = ?)',
            bindings: ['John', '100', 'Admin']
          }
        ]
      }, done);
    });
  });
});
