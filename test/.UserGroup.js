/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
const { RelModel, helper } = require('../dist/index');

module.exports = class extends RelModel {
    init(config) {
        super.init(config);
        // 模型名称
        this.modelName = 'UserGroup';
        // 数据表字段信息
        this.fields = {
            userid: {
                type: 'integer',
                index: true,
                defaults: ''
            },
            groupid: {
                type: 'integer',
                index: true,
                defaults: ''
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relations = {};
    }
};
