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
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                primaryKey: true
            },
            test: {
                type: 'string'
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
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