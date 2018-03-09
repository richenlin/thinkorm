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
        this.modelName = 'Pet';
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                pk: true
            },
            types: {
                type: 'string',
                default: ''
            },
            user: {
                type: 'integer',
                default: ''
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relations = {};
    }
};
