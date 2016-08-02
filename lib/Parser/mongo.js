'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _mongoSql = require('mongo-sql');

var _mongoSql2 = _interopRequireDefault(_mongoSql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by lihao on 16/8/2.
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
        this.jsonObj = {};
        this.lastsql = '';
    };

    /**
     * 解析表名,操作类型
     * @param table
     */


    _class.prototype.parseTableAndType = function parseTableAndType(table, type) {
        this.jsonObj.type = type;
        this.jsonObj.table = table;
    };

    /**
     * 解析条件
     * @param where
     */


    _class.prototype.parseWhere = function parseWhere(where) {
        var identifiers = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            'or': '$or',
            'in': '$in',
            'notin': '$nin'
        };
        var parse = function parse(key, value) {
            if (identifiers[key]) {}
        };
    };

    /**
     * 生成查询语句
     */


    _class.prototype.buildSql = function buildSql() {
        var mongosql = _mongoSql2.default.sql(this.jsonObj);
        this.lastsql = mongosql.toString();
        console.log(this.lastsql);
        return this.lastsql;
    };

    return _class;
}(_base3.default);

exports.default = _class;