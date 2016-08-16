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
    db_prefix: 'think_',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
});

cls.relation = {
    profile : {
        type: 'hasone',//关联方式
        field: ['test', 'id'],//关联表字段
        fkey: 'profile', //外键
        rkey: 'id' //关联表主键
    },
    pet: {
        type: 'hasmany',
        field: ['types','user', 'id'],
        fkey: 'pet',
        rkey: 'user'
    },
    group: {
        type: 'manytomany',
        field: ['name', 'type', 'id'],
        fkey: 'userid',
        rkey: 'groupid'
    }
};

function test(){
    "use strict";
    return cls
        //.where({id: {'<>': 1, '>=': 0}}).find()
        //.join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], sex: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
        //.field(['id','username']).join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], sex: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
        .rel(true).select()
        //.rel('ttttt').select()
        .then(function (data) {
        console.log(JSON.stringify(data));
    })
}

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

