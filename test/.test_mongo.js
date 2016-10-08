/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/24
 */
var path = require('path');
var thinkorm = require('../index.js');
var ObjectID = require('mongodb').ObjectID;
var config = {
    db_type: 'mongo',
    db_host: '192.168.99.100',
    db_port: 27017,
    db_name: 'test',
    //db_pwd: '',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
};
//thinkorm.require需要使用绝对路径
var User = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/User.js');
var Profile = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/Profile.js');
var Pet = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/Pet.js');
var Group = thinkorm.require(path.dirname(__dirname) + '/exmple/model/lib/mongo/Group.js');

//加载模型类
thinkorm.setCollection(User, config);
thinkorm.setCollection(Profile, config);
thinkorm.setCollection(Pet, config);
thinkorm.setCollection(Group, config);

//实例化模型
var model = new User(config);
//model.add({id: 3, name: 'c', Profile: {id: 3, test: 'ca'}});
//model.where({id: 1, or: [{name: 'a'}, {name: 'c'}]}).select().then(res=> {
//    console.log(res)
//})
model.rel('Pet').find().then(res=> {
    console.log(res)
})
//model.where({name:'a'}).select().then(res=>{
//    console.log(res)
//})
//model.add({id: 1, name: 'a', Pet: [{types: 'a'}, {types: 'b'}, {types:'c'}]})