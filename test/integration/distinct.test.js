var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('DISTINCT statements', function() {
    it('should generate a distinct query', function(done) {
      Test({
        query: {
          select: {
            distinct: ['firstName', 'lastName']
          },
          from: 'customers'
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select distinct "firstName", "lastName" from "customers"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select distinct `firstName`, `lastName` from `customers`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select distinct "firstName", "lastName" from "customers"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select distinct "firstName", "lastName" from "customers"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select distinct `firstName`, `lastName` from `customers`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
