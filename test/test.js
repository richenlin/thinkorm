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
cls.fields = {
    id: {
        type: 'integer'
    },
    username: {
        type: 'string'
    }
};
cls.relation = {
    Profile : {
        type: 'hasone',//关联方式
        field: ['test', 'id'],//关联表字段
        fkey: 'profile', //主表外键 (子表主键)
        rkey: 'id' //子表主键
    },
    Pet: {
        type: 'hasmany',
        field: ['types','user', 'id'],
        fkey: 'pet',//虚拟字段
        rkey: 'user'//子表外键 (主表主键)
    },
    Group: {
        type: 'manytomany',
        field: ['name', 'type', 'id'],
        fkey: 'userid',//map外键(主表主键)
        rkey: 'groupid'//map外键(子表主键)
    }
};

function test(){
    "use strict";
    return cls
        //.where({id: {'<>': 1, '>=': 0}}).find()
        //.join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], sex: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
        //.field(['id','username']).join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], sex: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
        //.rel('Pet').countSelect()
        //.rel(true).select()
        .where({id: 3}).update({username: 'test3'})
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

