var knex = require('knex');
var Test = require('../support/test-runner');
function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var baseparser = requireDefault(require('../../lib/Parser/knex.js')).default;


describe('Query Generation ::', function () {
    describe('Grouping statements with OPERATOR', function () {
        it('should generate a query when an OPERATOR > statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'>': 1}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` > 1"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '192.168.99.100',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'>': 1}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" > 1"
                    }
                ]
            }, done);
        });

        it('should generate a query when an OPERATOR < statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<': 1}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` < 1"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '192.168.99.100',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<': 1}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" < 1"
                    }
                ]
            }, done);
        });

        it('should generate a query when an OPERATOR >= statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'>=': 1}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` >= 1"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '192.168.99.100',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'>=': 1}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" >= 1"
                    }
                ]
            }, done);
        });

        it('should generate a query when an OPERATOR <= statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<=': 1}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` <= 1"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '192.168.99.100',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<=': 1}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" <= 1"
                    }
                ]
            }, done);
        });

        it('should generate a query when an OPERATOR <> statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<>': 1}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` <> 1"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '192.168.99.100',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<>': 1}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" <> 1"
                    }
                ]
            }, done);
        });

        it('should generate a query when an OPERATOR <> and >= and > and < and <= statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mysql',
                        config: {
                            db_type: 'mysql',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'mysql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<>': 1, '>=': 2, '>': 0,'<': 100, '<=': 10}}
                        },
                        sql: "select * from `think_user` as `User` where `User`.`id` <> 1 and `User`.`id` >= 2 and `User`.`id` > 0 and `User`.`id` < 100 and `User`.`id` <= 10"
                    },
                    {
                        dialect: 'postgresql',
                        config: {
                            db_type: 'postgresql',
                            db_host: '192.168.99.100',
                            db_port: 5432,
                            db_name: 'test',
                            db_user: 'root',
                            db_pwd: '',
                            db_prefix: 'think_',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: baseparser,
                        client: knex({client: 'postgresql'}).select().from('think_user AS User'),
                        query: {
                            where: {id: {'<>': 1, '>=': 2, '>': 0,'<': 100, '<=': 10}}
                        },
                        sql: "select * from \"think_user\" as \"User\" where \"User\".\"id\" <> 1 and \"User\".\"id\" >= 2 and \"User\".\"id\" > 0 and \"User\".\"id\" < 100 and \"User\".\"id\" <= 10"
                    }
                ]
            }, done);
        });
    });
});
