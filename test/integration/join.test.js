var Test = require('../support/test-runner');

describe('Query Generation ::', function() {
  describe('JOINS ::', function() {
    it('should generate a basic join query', function(done) {
      Test({
        query: {
          select: ['users.id', 'contacts.phone'],
          from: 'users',
          join: [
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
            sql: 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select `users`.`id`, `contacts`.`phone` from `users` inner join `contacts` on `users`.`id` = `contacts`.`user_id`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select "users"."id", "contacts"."phone" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select `users`.`id`, `contacts`.`phone` from `users` inner join `contacts` on `users`.`id` = `contacts`.`user_id`',
            bindings: []
          }
        ]
      }, done);
    });

    it('should be able to contain multiple joins', function(done) {
      Test({
        query: {
          select: ['users.id', 'contacts.phone', 'carriers.name'],
          from: 'users',
          join: [
            {
              from: 'contacts',
              on: {
                users: 'id',
                contacts: 'user_id'
              }
            },
            {
              from: 'carriers',
              on: {
                users: 'id',
                carriers: 'user_id'
              }
            }
          ]
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select "users"."id", "contacts"."phone", "carriers"."name" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id" inner join "carriers" on "users"."id" = "carriers"."user_id"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select `users`.`id`, `contacts`.`phone`, `carriers`.`name` from `users` inner join `contacts` on `users`.`id` = `contacts`.`user_id` inner join `carriers` on `users`.`id` = `carriers`.`user_id`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select "users"."id", "contacts"."phone", "carriers"."name" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id" inner join "carriers" on "users"."id" = "carriers"."user_id"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select "users"."id", "contacts"."phone", "carriers"."name" from "users" inner join "contacts" on "users"."id" = "contacts"."user_id" inner join "carriers" on "users"."id" = "carriers"."user_id"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select `users`.`id`, `contacts`.`phone`, `carriers`.`name` from `users` inner join `contacts` on `users`.`id` = `contacts`.`user_id` inner join `carriers` on `users`.`id` = `carriers`.`user_id`',
            bindings: []
          }
        ]
      }, done);
    });

    it('should be able to group joins', function(done) {
      Test({
        query: {
          select: '*',
          from: 'users',
          join: [
            {
              from: 'accounts',
              on: {
                or: [
                  {
                    accounts: 'id',
                    users: 'account_id'
                  },
                  {
                    accounts: 'owner_id',
                    users: 'id'
                  }
                ]
              }
            }
          ]
        },
        outcomes: [
          {
            dialect: 'postgresql',
            sql: 'select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"',
            bindings: []
          },
          {
            dialect: 'mysql',
            sql: 'select * from `users` inner join `accounts` on `accounts`.`id` = `users`.`account_id` or `accounts`.`owner_id` = `users`.`id`',
            bindings: []
          },
          {
            dialect: 'sqlite3',
            sql: 'select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"',
            bindings: []
          },
          {
            dialect: 'oracle',
            sql: 'select * from "users" inner join "accounts" on "accounts"."id" = "users"."account_id" or "accounts"."owner_id" = "users"."id"',
            bindings: []
          },
          {
            dialect: 'mariadb',
            sql: 'select * from `users` inner join `accounts` on `accounts`.`id` = `users`.`account_id` or `accounts`.`owner_id` = `users`.`id`',
            bindings: []
          }
        ]
      }, done);
    });
  });
});
