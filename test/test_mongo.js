/**
 * Created by lihao on 16/8/2.
 */
var thinkorm = require('../index.js');
var cls = new thinkorm('user', {
    db_type: 'mongo',
    db_host: '192.168.99.100',
    db_port: 27017,
    db_name: 'test',
    db_user: '',
    db_pwd: '',
    db_prefix: '',
    db_charset: 'utf8',
    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
});

//var cls = new thinkorm('user', {
//    db_type: 'mysql',
//    db_host: '192.168.99.100',
//    db_port: 3306,
//    db_name: 'test',
//    db_user: 'root',
//    db_pwd: 'richenlin',
//    db_prefix: 'think_',
//    db_charset: 'utf8',
//    db_ext_config: {safe: true, db_log_sql: true, db_pool_size: 10}
//});
//
//cls.addAll([{id:10,name:'a'},{id:20,name:'b'},{id:30,name:'c'},{id:40,name:'d'}]);
//cls.field('user_no').group('user_no').select().then(data=>{
//    console.log(data)
//})
//cls.field('name').order('id aes,name aes').find().then(data=> {
//    console.log(data)
//})
//cls.addAll([{id:4,name:'d'},{id:5,name:'e'}]).then(data=>{
//    console.log(data)
//})
//cls.where({name:'a'}).update({name:'b'}).then(data=>{
//    console.log(data)
//})
//cls.where({name:'b'}).delete().then(data=>{
//    console.log(data)
//})
//cls.count().then(data=>{
//    console.log(data)
//})
cls.join([{
    from: 'user_info',
    on: {
        user_info: 'user_id',
        users: 'id'
    }
}]).find().then(data=> {
    console.log(data)
})