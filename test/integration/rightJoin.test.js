var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('RIGHT JOINS ::', function() {
    it('should generate a basic right join query', function(done) {
      Test({
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          rightJoin: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            }
          ]
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "users"."id", "contacts"."phone" from "users" right join "contacts" on "users"."id" = "contacts"."user_id"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select `users`.`id`, `contacts`.`phone` from `users` right join `contacts` on `users`.`id` = `contacts`.`user_id`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select "users"."id", "contacts"."phone" from "users" right join "contacts" on "users"."id" = "contacts"."user_id"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select "users"."id", "contacts"."phone" from "users" right join "contacts" on "users"."id" = "contacts"."user_id"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select `users`.`id`, `contacts`.`phone` from `users` right join `contacts` on `users`.`id` = `contacts`.`user_id`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
