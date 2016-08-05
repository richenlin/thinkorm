'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseLimit = function parseLimit(data, options) {
        var parseOptions = {};
        if (ORM.inArray(options.method, ['SELECT', 'FIND', 'COUNT', 'SUM'])) {
            parseOptions['skip'] = options.limit[0] || 0;
            parseOptions['limit'] = options.limit[1] || 10;
        }

        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseOrder = function parseOrder(data, options) {
        var parseOptions = {};
        if (ORM.inArray(options.method, ['SELECT', 'FIND'])) {
            for (var n in options.order) {
                parseOptions.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
            }
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseField = function parseField(data, options) {
        var parseOptions = {};
        if (ORM.inArray(options.method, ['SELECT', 'FIND'])) {
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

                var n = _ref;

                if (n.indexOf('.') > -1) {
                    parseOptions.project[n.split('.')[1]] = 1;
                } else {
                    parseOptions.project[n] = 1;
                }
            }
        }
        return parseOptions;
    };

    /**
     * count('xxx')
     * count(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseCount = function parseCount(data, options) {
        var parseOptions = { where: {} };
        if (ORM.inArray(options.method, ['SELECT', 'FIND', 'COUNT', 'SUM'])) {
            //{age: {'$exists': true}
            if (options.count) {
                parseOptions.where[options.count] = { '$exists': true };
            }
        }
        return parseOptions;
    };

    /**
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    //parseSum(data, options){
    //    let parseOptions = {};
    //    if(ORM.inArray(options.method, ['SELECT', 'FIND', 'COUNT', 'SUM'])){
    //        //
    //    }
    //    return parseOptions;
    //}

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseWhere = function parseWhere(data, options) {
        var parseOptions = {},
            where = {};
        var whereParse = function whereParse(key, value, item) {
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
                                temp.push(whereParse(k, data[k], k));
                            }
                        });
                        where = { $or: temp };
                        break;
                    default:
                        if (ORM.isJSONObj(value)) {
                            for (var k in value) {
                                return {
                                    v: whereParse(k, value[k], key)
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
        if (options.where) {
            for (var key in options.where) {
                whereParse(key, options.where[key], key);
            }
            parseOptions['where'] = where || {};
        }
        return parseOptions;
    };

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseGroup = function parseGroup(data, options) {
        //未实现
        return _promise2.default.reject('not support');
    };

    /**
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}}], 'left')
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'right')
     * @param data
     * @param options
     */


    _class.prototype.parseJoin = function parseJoin(data, options) {
        //未实现
        return _promise2.default.reject('not support');
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseTable = function parseTable(data, options) {
        var parseOptions = {};
        parseOptions.table = options.table;
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseData = function parseData(data, options) {
        var parseOptions = {};
        //
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseMethod = function parseMethod(data, options) {
        var parseOptions = {};
        parseOptions.method = options.method;
        return parseOptions;
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
            if (options[n] !== 'where' && this['parse' + mt] && ORM.isFunction(this['parse' + mt])) {
                parseOptions = ORM.extend(false, parseOptions, this['parse' + mt](data, options));
            }
        }

        parseOptions = ORM.extend(parseOptions, this.parseWhere(data, options));
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.buildSql = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parseOptions;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (options === undefined) {
                                options = data;
                            } else {
                                options.data = data;
                            }
                            _context.next = 3;
                            return this.parseSql(data, options);

                        case 3:
                            parseOptions = _context.sent;
                            return _context.abrupt('return', parseOptions);

                        case 5:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function buildSql(_x2, _x3) {
            return _ref2.apply(this, arguments);
        }

        return buildSql;
    }();

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
}(_base3.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    16/7/25
                    */


exports.default = _class;