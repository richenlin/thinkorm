var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('DELETE statements', function() {
    it('should generate an insert query', function(done) {
      Test({
        query: {
          del: true,
          from: 'accounts',
          where: {
            activated: false
          }
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'delete from "accounts" where "activated" = $1 returning "id"',
            bindings: [false]
          },
          {
            dialect: 'mysql',
            sql: 'delete from `accounts` where `activated` = ?',
            bindings: [false]
          },
          {
            dialect: 'sqlite3',
            sql: 'delete from "accounts" where "activated" = ?',
            bindings: [false]
          },
          {
            dialect: 'oracle',
            sql: 'delete from "accounts" where "activated" = :1',
            bindings: ['0']
          },
          {
            dialect: 'mariadb',
            sql: 'delete from `accounts` where `activated` = ?',
            bindings: [false]
          }
        ]
      }, done);
    });
  });
});
