var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('UPDATE statements', function() {
    it('should generate an update query', function(done) {
      Test({
        query: {
          update: {
            status: 'archived'
          },
          where: {
            publishedDate: { '>': 2000 }
          },
          using: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'update "books" set "status" = $1 where "publishedDate" > $2 returning "id"',
            bindings: ['archived', 2000]
          },
          {
            dialect: 'mysql',
            sql: 'update `books` set `status` = ? where `publishedDate` > ?',
            bindings: ['archived', 2000]
          },
          {
            dialect: 'sqlite3',
            sql: 'update "books" set "status" = ? where "publishedDate" > ?',
            bindings: ['archived', 2000]
          },
          {
            dialect: 'oracle',
            sql: 'update "books" set "status" = :1 where "publishedDate" > :2',
            bindings: ['archived', 2000]
          },
          {
            dialect: 'mariadb',
            sql: 'update `books` set `status` = ? where `publishedDate` > ?',
            bindings: ['archived', 2000]
          }
        ]
      }, done);
    });

    it('should generate an update query where order doesn\'t matter', function(done) {
      Test({
        query: {
          where: {
            type: 'test'
          },
          using: 'user',
          update: {
            age: 10
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'update "user" set "age" = $1 where "type" = $2 returning "id"',
            bindings: [10, 'test']
          },
          {
            dialect: 'mysql',
            sql: 'update `user` set `age` = ? where `type` = ?',
            bindings: [10, 'test']
          },
          {
            dialect: 'sqlite3',
            sql: 'update "user" set "age" = ? where "type" = ?',
            bindings: [10, 'test']
          },
          {
            dialect: 'oracle',
            sql: 'update "user" set "age" = :1 where "type" = :2',
            bindings: [10, 'test']
          },
          {
            dialect: 'mariadb',
            sql: 'update `user` set `age` = ? where `type` = ?',
            bindings: [10, 'test']
          }
        ]
      }, done);
    });

    it('should generate an insert query when using multiple values', function(done) {
      Test({
        query: {
          update: {
            status: 'archived',
            active: false
          },
          where: {
            publishedDate: { '>': 2000 }
          },
          using: 'books'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'update "books" set "active" = $1, "status" = $2 where "publishedDate" > $3 returning "id"',
            bindings: [false, 'archived', 2000]
          },
          {
            dialect: 'mysql',
            sql: 'update `books` set `active` = ?, `status` = ? where `publishedDate` > ?',
            bindings: [false, 'archived', 2000]
          },
          {
            dialect: 'sqlite3',
            sql: 'update "books" set "active" = ?, "status" = ? where "publishedDate" > ?',
            bindings: [false, 'archived', 2000]
          },
          {
            dialect: 'oracle',
            sql: 'update "books" set "active" = :1, "status" = :2 where "publishedDate" > :3',
            bindings: ['0', 'archived', 2000]
          },
          {
            dialect: 'mariadb',
            sql: 'update `books` set `active` = ?, `status` = ? where `publishedDate` > ?',
            bindings: [false, 'archived', 2000]
          }
        ]
      }, done);
    });
  });
});
