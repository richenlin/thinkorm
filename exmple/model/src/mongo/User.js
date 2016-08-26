/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
import thinkorm from '../../../../index';

export default class extends thinkorm{
    init(config){
        super.init(config);
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {
            _id: {
                type: 'integer',
                primaryKey: true
            },
            name: {
                type: 'string',
                index: true
            },
            profile: {
                type: 'integer',
                index: true,
                defaultTo: 0
            },
            memo: {
                type: 'text'
            },
            create_time: {
                type: 'timestamp'
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {
            Profile : {
                type: 'hasone',//关联方式
                field: ['test', '_id'],//关联表字段
                fkey: 'profile', //主表外键 (子表主键)
                rkey: '_id' //子表主键
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
    }
}
