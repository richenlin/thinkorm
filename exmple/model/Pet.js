/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
const thinkorm = require('../../index.js');

module.exports = class extends thinkorm {
    init(config){
        super.init(config);
        // 模型名称
        this.modelName = 'Pet';
        // 是否自动迁移(默认安全模式)
        this.safe = false;
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                primaryKey: true
            },
            types: {
                type: 'string',
                defaultsTo: ''
            },
            user: {
                type: 'integer',
                defaultsTo: ''
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
    }
};
