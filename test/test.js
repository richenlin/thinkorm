/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var thinkorm = require('../index.js');
var cls = new thinkorm('user',{
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

cls.relation = [
    {
        type: 'HASONE',
        model: 'ttttt',
        fkey: 'tid',
        field: ['name', 'user', 'id']
    }
];

function test(){
    "use strict";
    return cls
        //.where({id: {'<>': 1, '>=': 0}}).find()
        //.join([{from: 'ttttt', on: {or: [{tid: 'id'}, {name: 'name'}], num: 'user'}, field: ['id', 'name']}], 'left').find()
        //.rel(true).select()
        .rel('ttttt').select()
        .then(function (data) {
        console.log(data);
    })
}

//let key = 'ttttt';
//let str = '{"name":"aaa","num":null,"id":2,"tid":2,"ttttt_name":"test","ttttt_user":2,"ttttt_id":2}';
//let out = '{"name":"aaa","num":null,"id":2,"tid":2,"ttttt": {"name":"test","user":2,"id":2}}';

test();

//function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
//var analyze = requireDefault(require('../lib/Util/analyze.js')).default;
//var sequelizer = requireDefault(require('../lib/Util/sequelizer.js')).default;
//var seqs = analyze({
//    insert: {x: 10, y: 20},
//    into: 'coords'
//});
//var builder =  sequelizer({
//    dialect: 'mysql',
//    tree: seqs
//});
//console.log(builder);

