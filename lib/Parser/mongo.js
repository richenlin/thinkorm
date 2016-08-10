'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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
     * 解析关联
     * @param data
     * @param options
     */


    _class.prototype.parseJoin = function parseJoin(data, options) {};

    /**
     * 解析分页
     * @param data
     * @param options
     */


    _class.prototype.parsePage = function parsePage(data, options) {
        this.jsonObj.skip = options.page.page || 1;
        this.jsonObj.limit = options.page.limit || 10;
    };

    /**
     * 解析排序
     * @param data
     * @param options
     */


    _class.prototype.parseOrder = function parseOrder(data, options) {
        var o = -1,
            order = options.order;
        if (ORM.isString(order)) {
            var _jsonObj$sort;

            if (order.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                o = 1;
                order = order.substr(0, order.length - 4);
            } else if (order.indexOf(' desc') > -1 || order.indexOf(' DESC') > -1) {
                order = order.substr(0, order.length - 5);
            }
            this.jsonObj.sort = (_jsonObj$sort = {}, _jsonObj$sort[options.order] = o, _jsonObj$sort);
        } else {
            this.jsonObj.sort = {};
            for (var k in order) {
                this.jsonObj.sort[k] = order[k] == 'aes' || order[k] == 'AES' ? 1 : -1;
            }
        }
    };

    /**
     * 解析表名
     * @param table
     */


    _class.prototype.parseTable = function parseTable(data, options) {
        this.jsonObj.table = options.table;
    };

    /**
     * 解析字段
     * @param data
     * @param options
     */


    _class.prototype.parseField = function parseField(data, options) {
        this.jsonObj.project = {};
        for (var _iterator = options.field, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var field = _ref;

            if (field.indexOf('.') > -1) {
                this.jsonObj.project[field.split('.')[1]] = 1;
            } else {
                this.jsonObj.project[field] = 1;
            }
        }
    };

    /**
     * 解析操作类型
     * @param method
     */


    _class.prototype.parseMethod = function parseMethod(data, options) {
        this.jsonObj.type = options.method;
    };

    /**
     * 解析条件
     * @param where
     */


    _class.prototype.parseWhere = function parseWhere(data, options) {
        var optionWhere = options.where;
        var where = {};
        var identifiers = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            'or': '$or',
            'not': '$ne',
            'in': '$in',
            'notin': '$nin'
        };
        var parse = function parse(key, value, item) {
            //console.log(key, value, item)
            var _ret = function () {
                var _where$item, _item, _v;

                switch (identifiers[key]) {
                    case '$gt':
                    case '$gte':
                    case '$lt':
                    case '$lte':
                    case '$ne':
                    case '$in':
                    case '$nin':
                        where[item] = (_where$item = {}, _where$item[identifiers[key]] = value, _where$item);
                        return {
                            v: (_v = {}, _v[item] = (_item = {}, _item[identifiers[key]] = value, _item), _v)
                        };
                        break;
                    case '$or':
                        var temp = [];
                        value.map(function (data) {
                            for (var k in data) {
                                temp.push(parse(k, data[k], k));
                            }
                        });
                        where = { $or: temp };
                        break;
                    default:
                        if (ORM.isJSONObj(value)) {
                            for (var k in value) {
                                return {
                                    v: parse(k, value[k], key)
                                };
                            }
                        } else {
                            var _v2;

                            where[key] = value;
                            return {
                                v: (_v2 = {}, _v2[key] = value, _v2)
                            };
                        }
                        break;
                }
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
        };

        for (var key in optionWhere) {
            parse(key, optionWhere[key], key);
        }
        this.jsonObj.where = where;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {string}
     */


    _class.prototype.parseSql = function parseSql(data, options) {
        var parseOptions = {};
        for (var n in options) {
            var mt = ORM.ucFirst(n);
            if (this['parse' + mt] && ORM.isFunction(this['parse' + mt])) {
                parseOptions = ORM.extend(false, parseOptions, this['parse' + mt](data, options));
            }
        }
    };

    /**
     * 生成查询语句
     */


    _class.prototype.buildSql = function buildSql(data, options) {
        if (options === undefined) {
            options = data;
        } else {
            options.data = data;
        }
        this.parseSql(data, options);
        return _promise2.default.resolve(this.jsonObj);
        //console.log(this.jsonObj)
        //let result = builder.sql(this.jsonObj);
        //console.log(result)
        //let sql = result.toString();
        //if (!ORM.isEmpty(result.values)) {
        //    result.values.map(item=> {
        //        sql = sql.replace(/\$[0-9]*/, ORM.isNumber(item) ? item : `'${item}'`);
        //    })
        //}
        //this.lastsql = sql;
        //return Promise.resolve(this.lastsql)
    };

    /**
     *
     * @param data
     * @returns {*}
     */


    _class.prototype.bufferToString = function bufferToString(data) {
        if (!this.config.buffer_tostring || !ORM.isArray(data)) {
            return data;
        }
        for (var i = 0, length = data.length; i < length; i++) {
            for (var key in data[i]) {
                if (ORM.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    };

    return _class;
}(_base3.default);

exports.default = _class;