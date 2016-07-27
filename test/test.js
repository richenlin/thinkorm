/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var thinkorm = require('../index.js');
var cls = new thinkorm('test',{
    db_type: 'mysql',
    db_host: '192.168.99.100',
    db_port: 3306,
    db_name: 'test',
    db_user: 'root',
    db_pwd: 'richenlin',
    db_prefix: '',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
});

function test(){
    "use strict";
    return cls.addAll([{name: 'test'},{name: 'test2'}]).then(function (data) {
        console.log(data);
    })
}

test();


//function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//var parser = requireDefault(require('../lib/Parser/mysql.js')).default;
//var cls = new parser();
//
//cls.buildSql(
//    {
//        status: 'archived'
//    },{
//        method: 'SELECT',
//        field: ['archived'],
//        table: 'test',
//        limit: [0, 10],
//        order: [{id: 'asc', name: 'desc'}],
//        where: {
//            publishedDate: { '>': 2000 }
//        }
//    }
//).then(result => {
//    "use strict";
//    console.log(result);
//});
