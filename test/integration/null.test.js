var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('NULL operator ::', function() {
    describe('IS NULL ::', function() {
      it('should generate a query when a NULL value is used', function(done) {
        Test({
          query: {
            select: '*',
            from: 'users',
            where: {
              updatedAt: null
            }
          },
          outcomes: [
            {
              dialect: 'postgresql',
              sql: 'select * from "users" where "updatedAt" is null',
              bindings: []
            },
            {
              dialect: 'mysql',
              sql: 'select * from `users` where `updatedAt` is null',
              bindings: []
            },
            {
              dialect: 'sqlite3',
              sql: 'select * from "users" where "updatedAt" is null',
              bindings: []
            },
            {
              dialect: 'oracle',
              sql: 'select * from "users" where "updatedAt" is null',
              bindings: []
            },
            {
              dialect: 'mariadb',
              sql: 'select * from `users` where `updatedAt` is null',
              bindings: []
            }
          ]
        }, done);
      });
    });

    describe('IS NOT NULL ::', function() {
      it('should generate a query when a NOT NULL value is used', function(done) {
        Test({
          query: {
            select: '*',
            from: 'users',
            where: {
              not: {
                updatedAt: null
              }
            }
          },
          outcome: 'select * from "users" where "updatedAt" is not null'
        }, done);
      });
    });
  });
});
