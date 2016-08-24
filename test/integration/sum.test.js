var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('SUM statements', function() {
    it('should generate a sum query', function(done) {
      Test({
        query: {
          sum: [
            'active'
          ],
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select sum("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select sum(`active`) from `users`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select sum("active") from "users"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select sum("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select sum(`active`) from `users`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
