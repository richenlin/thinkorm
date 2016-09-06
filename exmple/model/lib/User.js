'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _index = require('../../../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_thinkorm) {
    (0, _inherits3.default)(_class, _thinkorm);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _thinkorm.apply(this, arguments));
    }

    _class.prototype.init = function init(config) {
        _thinkorm.prototype.init.call(this, config);
        // 是否开启迁移(migrate方法可用)
        this.safe = true;
        // 数据表字段信息
        this.fields = {
            id: {
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
                defaultsTo: 0
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
            Profile: {
                type: 'hasone', //关联方式
                //field: ['test', 'id'],//关联表字段
                fkey: 'profile', //主表外键 (子表主键)
                rkey: 'id' //子表主键
            },
            Pet: {
                type: 'hasmany',
                //field: ['types','user', 'id'],
                fkey: '', //hasmany关联此值没用
                rkey: 'user' //子表外键 (主表主键)
            },
            Group: {
                type: 'manytomany',
                //field: ['name', 'type', 'id'],
                fkey: 'userid', //map外键(主表主键)
                rkey: 'groupid' //map外键(子表主键)
            }
        };
    };

    return _class;
}(_index2.default); /**
                     *
                     * @author     richen
                     * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
                     * @license    MIT
                     * @version    16/8/18
                     */


exports.default = _class;