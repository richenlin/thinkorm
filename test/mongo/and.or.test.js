/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/26
 */
var Test = require('../support/mongo-test-runner');
function requireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}
var mongoparser = requireDefault(require('../../lib/Parser/mongo.js')).default;


describe('MONGO Query Generation ::', function () {
    describe('Grouping statements with AND OR', function () {
        it('should generate a query when an AND OR statement', function (done) {
            Test({
                outcomes: [
                    {
                        dialect: 'mongo',
                        config: {
                            db_type: 'mongo',
                            db_host: '192.168.99.100',
                            db_port: 3306,
                            db_name: 'test',
                            db_user: '',
                            db_pwd: '',
                            db_prefix: '',
                            db_charset: 'utf8',
                            db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
                        },
                        options: {method: 'SELECT'},
                        parser: mongoparser,
                        client: {},
                        query: {
                            where: {
                                or: [{name: 'a'}, {name: 'c'}],
                                id: 1
                            }
                        },
                        queryBody: {
                            data: {},
                            options: {
                                where: {id: 1, $or: [{name: 'a'}, {name: 'c'}]},
                                method: 'SELECT',
                                table: 'user',
                                name: 'User',
                                alias: 'User',
                                pk: 'id'
                            }
                        }
                    }
                ]
            }, done);
        });
    });
});
