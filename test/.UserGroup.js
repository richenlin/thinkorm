/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
const {relModel, helper} = require('../index.js');

module.exports = class extends relModel {
    init(config){
        super.init(config);
        // 模型名称
        this.modelName = 'UserGroup';
        // 数据表字段信息
        this.fields = {
            userid: {
                type: 'integer',
                index: true,
                defaultsTo: ''
            },
            groupid: {
                type: 'integer',
                index: true,
                defaultsTo: ''
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
    }
};
