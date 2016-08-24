var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('MIN statements', function() {
    it('should generate a min query', function(done) {
      Test({
        query: {
          min: [
            'active'
          ],
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select min("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select min(`active`) from `users`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select min("active") from "users"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select min("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select min(`active`) from `users`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
