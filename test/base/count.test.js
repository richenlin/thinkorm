/*eslint-disable */
const knex = require('knex');
const Test = require('../test-runner.js');

describe('Query Generation ::', function () {
    describe('Grouping statements with COUNT', function () {
        it('should generate a query when an COUNT statement', function (done) {
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
                            db_ext_config: { safe: true, db_log_sql: true, db_pool_size: 10 }
                        },
                        options: {
                            table: 'think_user',
                            alias: 'User',
                            method: 'COUNT',
                            targetField: 'id'
                        },
                        client: knex({ client: 'mysql' }),
                        query: {
                            where: { id: { '>=': 0 } }
                        },
                        sql: "select count(`User`.`id`) as `count` from `think_user` as `User` where `User`.`id` >= 0"
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
                            db_ext_config: { safe: true, db_log_sql: true, db_pool_size: 10 }
                        },
                        options: {
                            table: 'think_user',
                            alias: 'User',
                            method: 'COUNT',
                            targetField: 'id'
                        },
                        client: knex({ client: 'postgresql' }),
                        query: {
                            where: { id: { '>=': 0 } }
                        },
                        sql: 'select count("User"."id") as "count" from "think_user" as "User" where "User"."id" >= 0'
                    },
                ]
            }, done);
        });
    });
});
