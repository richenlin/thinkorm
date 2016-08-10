/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/8
 */
var Model = require('../index');
var model = new Model('user', {
    db_type: 'mysql', // 数据库类型
    db_host: '192.168.99.100', // 服务器地址
    db_port: '3306', // 端口
    db_name: 'test', // 数据库名
    db_user: 'root', // 用户名
    db_pwd: 'richenlin', // 密码
    db_prefix: 'think_', // 数据库表前缀
    db_ext_config: false
});

model.setRelation({
    userinfo: {type: 'hasone', model: 'user_info'},
    scores: {type: 'hasmany', model: 'scores'},
    cls: {type: 'manytomany', model: 'class', relationtable: 'think_user_class_map'}
});

model

//    .add({
//        user_no: 1,
//        userinfo: {user_name: 'Lee'},
//        scores: [{scores: 1}, {scores: 2}],
//        cls: [{class_name: 'java'}, {class_name: 'nodejs'}]
//    }).then(id=> {
//    console.log(id);
//})
    .rel(true)
    .select()
    .then(res=> {
        console.log(res);
    })
