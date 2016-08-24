var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('GROUP BY statements', function() {
    it('should generate a group by query', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          groupBy: ['count']
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" group by "count"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` group by `count`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" group by "count"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" group by "count"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` group by `count`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
