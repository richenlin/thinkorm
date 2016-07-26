var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('ORDER BY statements', function() {
    it('should generate a simple query with a FROM statement', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          orderBy: [{ name: 'desc' }, { age: 'asc' }]
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" order by "name" desc, "age" asc',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` order by `name` desc, `age` asc',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" order by "name" desc, "age" asc',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" order by "name" desc, "age" asc',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` order by `name` desc, `age` asc',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
