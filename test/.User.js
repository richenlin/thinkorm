/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
const {relModel, helper} = require('../index.js');
const Profile = require('./.Profile.js');
const Pet = require('./.Pet.js');
const Group = require('./.Group.js');
const UserGroup = require('./.UserGroup.js');

module.exports = class extends relModel {
    init(){
        // 模型名称
        this.modelName = 'User';
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                primaryKey: true
            },
            name: {
                type: 'string',
                index: true,
                defaultsTo: ''
            },
            profile: {
                type: 'integer',
                index: true,
                defaultsTo: 0
            },
            num: {
                type: 'integer',
                index: true,
                defaultsTo: 0
            },
            memo: {
                type: 'text',
                defaultsTo: ''
            },
            create_time: {
                type: 'integer',
                defaultsTo: 0
            }
        };
        // 数据验证
        this.validations = {
            name: {
                method: 'ALL', //ADD 新增时检查, UPDATE 更新时检查, ALL 新增和更新都检查,如果属性不存在则不检查
                valid: ['required', 'length'],
                length_args: 10,
                msg: {
                    required: '姓名必填',
                    length: '姓名长度必须大于10'
                }
            }
        };
        // 关联关系
        this.relations = {
            Profile: {
                type: 'hasone', //关联方式
                model: Profile, //子表模型
                //field: ['test', 'id'],//关联表字段
                fkey: 'profile', //主表外键 (子表主键)
                rkey: 'id' //子表主键
            },
            Pet: {
                type: 'hasmany',
                model: Pet, //子表模型
                //field: ['types','user', 'id'],
                fkey: '', //hasmany关联此值没用
                rkey: 'user'//子表外键 (主表主键)
            },
            Group: {
                type: 'manytomany',
                model: Group, //子表模型
                //field: ['name', 'type', 'id'],
                fkey: 'userid', //map外键(主表主键)
                rkey: 'groupid', //map外键(子表主键)
                map: UserGroup//map模型
            }
        };
    }
};
