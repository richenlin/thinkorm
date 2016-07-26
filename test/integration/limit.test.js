var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('LIMIT statements', function() {
    it('should generate a simple query with a LIMIT statement', function(done) {
      Test({
        query: {
          select: 'id',
          from: 'users',
          limit: 10
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "id" from "users" limit $1',
            bindings: ['10']
          },
          {
            dialect: 'mysql',
            sql: 'select `id` from `users` limit ?',
            bindings: ['10']
          },
          {
            dialect: 'sqlite3',
            sql: 'select "id" from "users" limit ?',
            bindings: ['10']
          },
          {
            dialect: 'oracle',
            sql: 'select * from (select "id" from "users") where rownum <= :1',
            bindings: ['10']
          },
          {
            dialect: 'mariadb',
            sql: 'select `id` from `users` limit ?',
            bindings: ['10']
          }
        ]
      }, done);
    });
  });
});
