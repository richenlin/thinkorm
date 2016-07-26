var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('OPTS', function() {
    it('should support schemas', function(done) {
      Test({
        query: {
          select: ['title', 'author', 'year'],
          from: 'books',
          opts: {
            schema: 'foo'
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "title", "author", "year" from "foo"."books"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select `title`, `author`, `year` from `foo`.`books`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select "title", "author", "year" from "foo"."books"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select "title", "author", "year" from "foo"."books"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select `title`, `author`, `year` from `foo`.`books`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
