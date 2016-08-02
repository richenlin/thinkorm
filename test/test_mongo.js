/**
 * Created by lihao on 16/8/2.
 */
var thinkorm = require('../index.js');
var cls = new thinkorm('user', {
    db_type: 'mongo',
    db_host: '192.168.99.100',
    db_port: 5432,
    db_name: 'test',
    db_user: 'root',
    db_pwd: 'richenlin',
    db_prefix: '',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
});

cls.where({id: {'$gt': 1}}).select()