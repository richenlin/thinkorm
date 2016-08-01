/**
 * Created by lihao on 16/7/26.
 */
var Model = require('./index');
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
model
    .field(['id', 'user_no'])
    .where({'id': 1})
    .order([{id: 'asc', user_no: 'desc'}])
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
    .select().then(data=> {
    console.log(data)
})
//model.add({a:'a'});
