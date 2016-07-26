var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('SKIP statements', function() {
    it('should generate a simple query with a SKIP statement', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          skip: 10
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" offset $1',
            bindings: ['10']
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` limit 18446744073709551615 offset ?',
            bindings: ['10']
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" limit ? offset ?',
            bindings: ['-1', '10']
          },
          {
            dialect: 'oracle',
            sql: 'select * from (select row_.*, ROWNUM rownum_ from (select * from "users") row_ where rownum <= :1) where rownum_ > :2',
            bindings: ['10000000000010', '10']
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` limit 18446744073709551615 offset ?',
            bindings: ['10']
          }
        ]
      }, done);
    });
  });
});
