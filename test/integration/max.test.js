var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('MAX statements', function() {
    it('should generate a max query', function(done) {
      Test({
        query: {
          max: [
            'active'
          ],
          from: 'users'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select max("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select max(`active`) from `users`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select max("active") from "users"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select max("active") from "users"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select max(`active`) from `users`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
