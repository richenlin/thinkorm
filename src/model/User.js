/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
import thinkorm from '../../index';

export default class extends thinkorm.Model{
    init(name, config){
        super.init(name, config);
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer'
            },
            username: {
                type: 'string'
            },
            profile: {
                type: 'integer'
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {
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
    }
}
