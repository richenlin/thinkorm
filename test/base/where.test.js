/*eslint-disable */
const knex = require('knex');
const Test = require('../test-runner.js');

describe('Query Generation ::', function () {
    describe('Grouping statements with WHERE', function () {
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { id: { '<>': 1, '>=': 0 }, name: 'rrrrrrr', or: [{ name: 'aa' }, { name: 'aaa' }], not: { name: 1, id: 2 }, notin: { name: [1, 2, 3] } },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where `User`.`id` <> 1 and `User`.`id` >= 0 and `User`.`name` = 'rrrrrrr' and ((`User`.`name` = 'aa') or (`User`.`name` = 'aaa')) and not (`User`.`name` = 1 and `User`.`id` = 2) and `User`.`name` not in (1, 2, 3) limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { id: { '<>': 1, '>=': 0 }, name: 'rrrrrrr', or: [{ name: 'aa' }, { name: 'aaa' }], not: { name: 1, id: 2 }, notin: { name: [1, 2, 3] } },
                            limit: 1
                        },
                        sql: 'select \"id\" from "think_user" as "User" where "User"."id" <> 1 and "User"."id" >= 0 and "User"."name" = \'rrrrrrr\' and (("User"."name" = \'aa\') or ("User"."name" = \'aaa\')) and not ("User"."name" = 1 and "User"."id" = 2) and "User"."name" not in (1, 2, 3) limit 10'
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { or: [{ name: { 'like': '%aa%' } }, { memo: { 'like': '%aa%' } }] },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where ((`User`.`name` like '%aa%') or (`User`.`memo` like '%aa%')) limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { or: [{ name: { 'like': '%aa%' } }, { memo: { 'like': '%aa%' } }] },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where (("User"."name" like '%aa%') or ("User"."memo" like '%aa%')) limit 10`
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { id: { '<>': 1, '>=': 0, notin: [1, 2, 3] }, name: ['aa', 'rrrrrrr'], notin: { 'id': [1, 2, 3], num: [1, 2, 3] }, not: { name: '', num: [1, 2, 3] }, memo: { 'like': '%a' }, or: [{ name: 'aa', id: 1 }, { name: 'rrrrrrr', id: { '>': 1 } }] },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where `User`.`id` <> 1 and `User`.`id` >= 0 and `User`.`id` not in (1, 2, 3) and `User`.`name` in ('aa', 'rrrrrrr') and `User`.`id` not in (1, 2, 3) and `User`.`num` not in (1, 2, 3) and not (`User`.`name` = '' and `User`.`num` in (1, 2, 3)) and `User`.`memo` like '%a' and ((`User`.`name` = 'aa' and `User`.`id` = 1) or (`User`.`name` = 'rrrrrrr' and `User`.`id` > 1)) limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { id: { '<>': 1, '>=': 0, notin: [1, 2, 3] }, name: ['aa', 'rrrrrrr'], notin: { 'id': [1, 2, 3], num: [1, 2, 3] }, not: { name: '', num: [1, 2, 3] }, memo: { 'like': '%a' }, or: [{ name: 'aa', id: 1 }, { name: 'rrrrrrr', id: { '>': 1 } }] },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where "User"."id" <> 1 and "User"."id" >= 0 and "User"."id" not in (1, 2, 3) and "User"."name" in ('aa', 'rrrrrrr') and "User"."id" not in (1, 2, 3) and "User"."num" not in (1, 2, 3) and not ("User"."name" = '' and "User"."num" in (1, 2, 3)) and "User"."memo" like '%a' and (("User"."name" = 'aa' and "User"."id" = 1) or ("User"."name" = 'rrrrrrr' and "User"."id" > 1)) limit 10`
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { 'and': { id: 1, name: 'aa' } },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where `User`.`id` = 1 and `User`.`name` = 'aa' limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { 'and': { id: 1, name: 'aa' } },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where "User"."id" = 1 and "User"."name" = 'aa' limit 10`
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { or: [{ id: 1, name: { or: [{ name: 'aa' }, { memo: 'aa' }] } }, { memo: 'aa' }] },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where ((`User`.`id` = 1 and ((`User`.`name` = 'aa') or (`User`.`memo` = 'aa'))) or (`User`.`memo` = 'aa')) limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { or: [{ id: 1, name: { or: [{ name: 'aa' }, { memo: 'aa' }] } }, { memo: 'aa' }] },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where (("User"."id" = 1 and (("User"."name" = 'aa') or ("User"."memo" = 'aa'))) or ("User"."memo" = 'aa')) limit 10`
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { in: { id: [1, 2, 3], num: [2, 3] } },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where `User`.`id` in (1, 2, 3) and `User`.`num` in (2, 3) limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { in: { id: [1, 2, 3], num: [2, 3] } },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where "User"."id" in (1, 2, 3) and "User"."num" in (2, 3) limit 10`
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { 'operator': { id: { '<>': 1, '>=': 0 } } },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where `User`.`id` <> 1 and `User`.`id` >= 0 limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { 'operator': { id: { '<>': 1, '>=': 0 } } },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where "User"."id" <> 1 and "User"."id" >= 0 limit 10`
                    }
                ]
            }, done);
        });
        it('should generate a query when an WHERE statement', function (done) {
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
                            where: { field: 'id', limit: 1, order: { id: 'desc' }, where: { name: { '<>': '', not: 'aa', notin: ['aa', 'rrr'], like: '%a' } } },
                            limit: 1
                        },
                        sql: "select `id` from `think_user` as `User` where `User`.`field` = 'id' and `User`.`limit` = 1 and `User`.`id` = 'desc' and `User`.`name` <> '' and not (`User`.`name` = 'aa') and `User`.`name` not in ('aa', 'rrr') and `User`.`name` like '%a' limit 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
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
                            where: { field: 'id', limit: 1, order: { id: 'desc' }, where: { name: { '<>': '', not: 'aa', notin: ['aa', 'rrr'], like: '%a' } } },
                            limit: 1
                        },
                        sql: `select \"id\" from "think_user" as "User" where "User"."field" = 'id' and "User"."limit" = 1 and "User"."id" = 'desc' and "User"."name" <> '' and not ("User"."name" = 'aa') and "User"."name" not in ('aa', 'rrr') and "User"."name" like '%a' limit 10`
                    }
                ]
            }, done);
        });

    });
});
