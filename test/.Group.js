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
        // 模型名称
        this.modelName = 'Group';
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                pk: true
            },
            name: {
                type: 'string',
                default: ''
            },
            type: {
                type: 'string',
                default: ''
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relations = {};
    }
};
