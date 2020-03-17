/*eslint-disable */
const knex = require('knex');
const Test = require('../test-runner.js');

describe('Query Generation ::', function () {
    describe('Grouping statements with AND', function () {
        it('should generate a query when an AND statement', function (done) {
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
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User',
                        },
                        client: knex({ client: 'mysql' }),
                        query: {
                            where: { firstName: 'foo', lastName: 'bar' }
                        },
                        sql: "select `User`.`id` from `think_user` as `User` where `User`.`firstName` = 'foo' and `User`.`lastName` = 'bar'"
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
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User',
                        },
                        client: knex({ client: 'postgresql' }),
                        query: {
                            where: { firstName: 'foo', lastName: 'bar' }
                        },
                        sql: "select \"User\".\"id\" from \"think_user\" as \"User\" where \"User\".\"firstName\" = 'foo' and \"User\".\"lastName\" = 'bar'"
                    }
                ]
            }, done);
        });

        it('should generate a query when an AND statement', function (done) {
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
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User',
                            method: 'SELECT'
                        },
                        client: knex({ client: 'mysql' }),
                        query: {
                            where: { age: { '>': 10, '<=': 80 } }
                        },
                        sql: "select `User`.`id` from `think_user` as `User` where `User`.`age` > 10 and `User`.`age` <= 80"
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
                            method: 'SELECT',
                            table: 'think_user',
                            alias: 'User',
                            method: 'SELECT'
                        },
                        client: knex({ client: 'postgresql' }),
                        query: {
                            where: { age: { '>': 10, '<=': 80 } }
                        },
                        sql: "select \"User\".\"id\" from \"think_user\" as \"User\" where \"User\".\"age\" > 10 and \"User\".\"age\" <= 80"
                    }
                ]
            }, done);
        });
    });
});
