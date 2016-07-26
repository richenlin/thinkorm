var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('AVG statements', function() {
    it('should generate a avg query', function(done) {
      Test({
        query: {
          avg: [
            'active'
          ],
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select avg("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select avg(`active`) from `users`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select avg("active") from "users"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select avg("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select avg(`active`) from `users`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
