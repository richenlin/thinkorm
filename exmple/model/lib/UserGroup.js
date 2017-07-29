'use strict';

exports.__esModule = true;

var _index = require('../../../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _index2.default {
    init(config) {
        super.init(config);
        // 是否自动迁移(默认安全模式)
        this.safe = false;
        // 数据表字段信息
        this.fields = {
            userid: {
                type: 'string',
                index: true,
                defaultsTo: ''
            },
            groupid: {
                type: 'string',
                index: true,
                defaultsTo: ''
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    16/8/18
    */