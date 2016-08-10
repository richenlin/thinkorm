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
    //userinfo: {type: 'hasone', model: 'user_info'},
    //scores: {type: 'hasmany', model: 'scores'},
    cls: {type: 'manytomany', model: 'class', relationtable: 'think_user_class_map'}
});

model

//.add({user_no: 'aaa', userinfo: {user_name: 'a'}})
    .add({user_no: 'hasmany', scores: [{scores: 1}, {scores: 2}], cls: {class_name: 'java'}})
    //    .update({user_no: 'hasmany', scores: [{scores: 1}, {scores: 2}]})
    //    .addAll([{user_no: 'aaa', userinfo: {user_name: 'a'}}, {user_no: 'aaa', userinfo: {user_name: 'a'}}])
    .
    then(data=> {
        console.log('result', data)
    }).catch(e=> {
    console.log(e.stack)
})
//.field(['id', 'user_no'])
//    .where({id: {'>': 1}, user_no: {'<': 1}})
//    .where({id: {'between': [1, 100]}})
//    .where({id: {'notbetween': [1, 100]}})
//    .where({not: {id: 1, user_no: 1}})
//    .where({notin: {id: 1, user_no: 1}})
//    .where({notnull: 'id,user_no'})
//    .where({null: 'id,user_no'})
//    .where({in: {id: [1, 2, 3], user_no: [1]}})
//    .where({or: [{id: 1}, {user_no: 1}]})
//    .where({or: [{in: {id: [1, 2, 3]}}, {user_no: {'<': 1}}]})
//    .where({or: [{in: {id: [1, 2, 3]}}, {not: {id: 1, user_no: 1}}]})
//    .where({or: [{null: 'id,user_no'}]})
//    .where({or: [{notnull: 'id,user_no'}]})
//    .where({or: [{id: {'between': [1, 100]}}, {user_no: 1}]})
//    .where({or: [{id: {'notbetween': [1, 100]}}, {user_no: 1}]})
//.where({or:[{notin: {id: 1, user_no: 1}}]})
//.order([{id: 'asc', user_no: 'desc'}])
//.group('id')
//.limit(1, 10)
//.join([
//    {
//        from: 'contacts',
//        on: {
//            or: [
//                {
//                    accounts: 'id',
//                    users: 'account_id'
//                },
//                {
//                    accounts: 'owner_id',
//                    users: 'id'
//                }
//            ]
//        }
//    },
//    {
//        from: 'b',
//        on: {
//            or: [
//                {
//                    b: 'id',
//                    users: 'account_id'
//                },
//                {
//                    b: 'owner_id',
//                    users: 'id'
//                }
//            ]
//        }
//    }
//])
//.rel(true)
//.find()
////.update({user_no: 1})
////.delete()
//.then(data=> {
//    console.log(data)
//})
//model.add({a:'a'});
