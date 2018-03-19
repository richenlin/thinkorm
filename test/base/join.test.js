/*eslint-disable */
const knex = require('knex');
const Test = require('../test-runner.js');

describe('Query Generation ::', function () {
    describe('Grouping statements with JOIN', function () {
        it('should generate a query when an JOIN statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '127.0.0.1',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User'
                        },
                        client: knex({client: 'mysql'}),
                        query: {
                            field: ['id'],
                            where: {'pfile.id':{"<>": ""}},
                            join: [{from: 'Profile', alias: 'pfile', on: {or: [{profile: 'id'}]}, field: ['id as aid', 'test'], type: 'left'}]
                        },
                        sql: "select `User`.`id`, `pfile`.`id` as `aid`, `pfile`.`test` from `think_user` as `User` left join `think_profile` as `pfile` on `User`.`profile` = `pfile`.`id` where `pfile`.`id` <> ''"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '127.0.0.1',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User'
                        },
                        client: knex({client: 'postgresql'}),
                        query: {
                            field: ['id'],
                            where: {'pfile.id':{"<>": ""}},
                            join: [{from: 'Profile', alias: 'pfile', on: {or: [{profile: 'id'}]}, field: ['id as aid', 'test'], type: 'left'}]
                        },
                        sql: 'select "User"."id", "pfile"."id" as "aid", "pfile"."test" from "think_user" as "User" left join "think_profile" as "pfile" on "User"."profile" = "pfile"."id" where "pfile"."id" <> \'\''
                    },
                ]
            }, done);
        });
        it('should generate a query when an JOIN statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '127.0.0.1',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User'
                        },
                        client: knex({client: 'mysql'}),
                        query: {
                            field: ['id','name', 'num'],
                            join: [{from: 'Profile', on: {or: [{profile: 'id'}, {name: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]
                        },
                        sql: "select `User`.`id`, `User`.`name`, `User`.`num`, `Profile`.`id`, `Profile`.`test` from `think_user` as `User` left join `think_profile` as `Profile` on `User`.`profile` = `Profile`.`id` or `User`.`name` = `Profile`.`test` and `User`.`profile` = `Profile`.`id`"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '127.0.0.1',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User'
                        },
                        client: knex({client: 'postgresql'}),
                        query: {
                            field: ['id','name', 'num'],
                            join: [{from: 'Profile', on: {or: [{profile: 'id'}, {name: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]
                        },
                        sql: 'select "User"."id", "User"."name", "User"."num", "Profile"."id", "Profile"."test" from "think_user" as "User" left join "think_profile" as "Profile" on "User"."profile" = "Profile"."id" or "User"."name" = "Profile"."test" and "User"."profile" = "Profile"."id"'
                    },
                ]
            }, done);
        });
    });
});
