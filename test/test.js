/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var thinkorm = require('../index.js');
//var instances = new thinkorm('test',{
//    db_type: 'mysql',
//    db_host: '192.168.99.100',
//    db_port: 3306,
//    db_name: 'test',
//    db_user: 'root',
//    db_pwd: 'richenlin',
//    db_prefix: '',
//    db_charset: 'utf8',
//    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
//});
//
//function test(){
//    "use strict";
//    return instances.where({name: 'ccc'}).order({
//        id: "DESC",
//        name: "ASC"
//    }).select().then(function (data) {
//        console.log(data);
//    })
//}
//
//test();


function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
var parser = requireDefault(require('../lib/Parser/mysql.js')).default;
var cls = new parser();

console.log(cls.buildSql(
    {
        select: '*',
        from: 'users',
        where: {
            name: "ccc", id: 1
        },
        orderBy: [
            {id: 'desc'},
            {name: 'asc'}
        ],
        leftJoin: [
            {
                from: 'accounts',
                on: {
                    users: 'id',
                    accounts: 'user_id'
                }
            }
        ]
    }
));
