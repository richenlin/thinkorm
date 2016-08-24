var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('FROM statements', function() {
    it('should generate a simple query with a FROM statement', function(done) {
      Test({
        query: {
          select: '*',
          from: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "books"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select * from `books`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "books"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select * from "books"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `books`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
