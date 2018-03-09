/*eslint-disable */
const knex = require('knex');
const Test = require('../test-runner.js');


describe('Query Generation ::', function () {
    describe('Grouping statements with ALIAS', function () {
        it('should generate a query when an ALIAS statement', function (done) {
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
                        options: {method: 'SELECT'},
                        client: knex({client: 'mysql'}).select().from('think_user'),
                        query: {
                            where: {id: {'<>': 1, '>=': 2, '>': 0,'<': 100, '<=': 10}},
                            alias: 'test'
                        },
                        sql: "select * from `think_user` where `test`.`id` <> 1 and `test`.`id` >= 2 and `test`.`id` > 0 and `test`.`id` < 100 and `test`.`id` <= 10"
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
                        options: {method: 'SELECT'},
                        client: knex({client: 'postgresql'}).select().from('think_user'),
                        query: {
                            where: {id: {'<>': 1, '>=': 2, '>': 0,'<': 100, '<=': 10}},
                            alias: 'test'
                        },
                        sql: 'select * from "think_user" where "test"."id" <> 1 and "test"."id" >= 2 and "test"."id" > 0 and "test"."id" < 100 and "test"."id" <= 10'
                    },
                ]
            }, done);
        });
    });
});
