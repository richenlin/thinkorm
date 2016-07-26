var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('Subqueries', function() {
    describe('used as table sub query', function() {
      it('should generate a valid query when used as a value in a FROM with an AS alias', function(done) {
        Test({
          query: {
            select: ['name', 'age'],
            from: {
              select: ['age'],
              from: 'users',
              where: {
                age: 21
              },
              as: 'userage'
            }
          },
          outcomes: [
            {
              dialect: 'postgresql',
              sql: 'select "name", "age" from (select "age" from "users" where "age" = $1) as "userage"',
              bindings: [21]
            },
            {
              dialect: 'mysql',
              sql: 'select `name`, `age` from (select `age` from `users` where `age` = ?) as `userage`',
              bindings: [21]
            },
            {
              dialect: 'sqlite3',
              sql: 'select "name", "age" from (select "age" from "users" where "age" = ?) as "userage"',
              bindings: [21]
            },
            {
              dialect: 'oracle',
              sql: 'select "name", "age" from (select "age" from "users" where "age" = :1) "userage"',
              bindings: [21]
            },
            {
              dialect: 'mariadb',
              sql: 'select `name`, `age` from (select `age` from `users` where `age` = ?) as `userage`',
              bindings: [21]
            }
          ]
        }, done);
      });
    });
  });
});
