/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var thinkorm = require('../index.js');
function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = {
    db_type: 'mysql',
    db_host: '192.168.99.100',
    db_port: 3306,
    db_name: 'test',
    db_user: 'root',
    db_pwd: 'richenlin',
    db_prefix: 'think_',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
};
var User = requireDefault(require('../lib/model/User.js')).default;
var Profile = requireDefault(require('../lib/model/Profile.js')).default;
var Pet = requireDefault(require('../lib/model/Pet.js')).default;
var Group = requireDefault(require('../lib/model/Group.js')).default;
//加载模型类
thinkorm.setCollection('User', config, User);
thinkorm.setCollection('Profile', config, Profile);
thinkorm.setCollection('Pet', config, Pet);
thinkorm.setCollection('Group', config, Group);

let model = new User('User', config);

function test(){
    "use strict";
    return model
        //.where({id: {'<>': 1, '>=': 0}}).find()
        //.join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], sex: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
        .field(['id','username']).join([{from: 'Profile', on: {or: [{profile: 'id'}, {username: 'test'}], sex: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
        //.rel(true).find()
        //.add({username: 'rrrrrrr',Profile: {test: 'rrrtest'}})
        //.where({id: 60}).update({username: 'tttttt',Profile: {test: 'ttttttt'}})
        //.add({username: 'rrrrrrr',Pet: [{types: 'ssfsssss'}]})
        //.where({id: 99}).update({username: 'tttttt',Pet: [{id: 7,types: 'ttttttt'}]})
        //.add({username: 'rrrrrrr',Group: [{name: 'ssfsssss'}]})
        //.where({id: 115}).update({username: 'tttttt',Group: [{id: 15,name: 'ttttttt'}]})
        //.where({id: 115}).update({username: 'tttttt',Group: [{userid: 115, groupid: 15}]})
        .then(res => {
        console.log(res);
    });
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

