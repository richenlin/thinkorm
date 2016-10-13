var knex = require('knex');
var Test = require('../support/test-runner');
function requireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}
var baseparser = requireDefault(require('../../lib/Parser/knexBase.js')).default;


describe('Query Generation ::', function () {
    describe('add option', function () {
        it('add option', function (done) {
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
                        options: {method: 'ADD'},
                        parser: baseparser,
                        data: {name: 'test'},
                        client: knex({client: 'mysql'}).insert({name: 'test'}).from('think_user AS User'),

                        sql: "insert into `think_user` as `User` (`name`) values ('test')"
                    }]
            }, done);
        });
    });
});
