var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('SELECT statements', function() {
    it('should generate a select * query', function(done) {
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

    it('should generate a select query using defined columns', function(done) {
      Test({
        query: {
          select: ['title', 'author', 'year'],
          from: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "title", "author", "year" from "books"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select `title`, `author`, `year` from `books`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select "title", "author", "year" from "books"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select "title", "author", "year" from "books"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select `title`, `author`, `year` from `books`',
            bindings: []
          }
        ]
      }, done);
    });

    it('should generate a select query using aliased columns', function(done) {
      Test({
        query: {
          select: ['title as book_title', 'author as book_author', 'year as book_year'],
          from: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "title" as "book_title", "author" as "book_author", "year" as "book_year" from "books"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select `title` as `book_title`, `author` as `book_author`, `year` as `book_year` from `books`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select "title" as "book_title", "author" as "book_author", "year" as "book_year" from "books"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select "title" "book_title", "author" "book_author", "year" "book_year" from "books"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select `title` as `book_title`, `author` as `book_author`, `year` as `book_year` from `books`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
