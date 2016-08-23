/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var path = require('path');
var thinkorm = require('../index.js');

var config = {
    db_type: 'mysql',
    //db_type: 'postgresql',
    //db_type: 'mongo',
    db_host: '192.168.99.100',
    db_port: 3306,
    //db_port: 5432,
    //db_port: 27017,
    db_name: 'test',
    db_user: 'root',
    //db_user: '',
    db_pwd: 'richenlin',
    //db_pwd: '',
    db_prefix: 'think_',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
};

//thinkorm.require需要使用绝对路径
var User = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/User.js');
var Profile = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/Profile.js');
var Pet = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/Pet.js');
var Group = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/Group.js');

//加载模型类
thinkorm.setCollection(User, config);
thinkorm.setCollection(Profile, config);
thinkorm.setCollection(Pet, config);
thinkorm.setCollection(Group, config);

//实例化模型
let model = new User(config);

function test() {
    "use strict";
    return model
    //.where({id: {'<>': 1, '>=': 0}, name: '', or: [{name: 'aa'}, {name: 'aaa'}]}).find()
    //.where({id: {'>=': 0}}).count()
    //.where({id: {'>=': 0}}).sum('id')
    //.where({id: {'>=': 0}}).select()
    //.countSelect()
    //.join([{from: 'profile', on: {or: [{profile: 'id'}, {username: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
    //.field(['id','username']).join([{from: 'Profile', on: {or: [{profile: 'id'}, {username: 'test'}], profile: 'id'}, field: ['id', 'test'], type: 'left'}]).find()
    //.where({id: {'>=': 0}}).group(['id','username']).find()
    .rel(true).find()
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
