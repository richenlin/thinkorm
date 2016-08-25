'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
var identifiers = {
    '>': '$gt',
    '>=': '$gte',
    '<': '$lt',
    '<=': '$lte',
    '<>': '$ne',
    'OR': '$or',
    'NOT': '$ne',
    'IN': '$in',
    'NOTIN': '$nin',
    'LIKE': '$regex'
};
/**
 *
 * @param key
 * @param value
 * @param item
 * @returns {{}}
 */
var whereParse = function whereParse(key, value, item) {
    var _item, _ref;

    var idt = key.toUpperCase(),
        temp = void 0;
    switch (identifiers[idt]) {
        case '$gt':
        case '$gte':
        case '$lt':
        case '$lte':
        case '$ne':
        case '$in':
        case '$nin':
            return _ref = {}, _ref[item] = (_item = {}, _item[identifiers[idt]] = value, _item), _ref;
            break;
        case '$or':
            if (_lib2.default.isArray(value)) {
                temp = [];
                value.map(function (data) {
                    for (var k in data) {
                        temp.push(whereParse(k, data[k], k));
                    }
                });
                return { $or: temp };
            }
            break;
        case '$regex':
            if (_lib2.default.isString(value)) {
                if (value.indexOf('%') === 0 && value.substring(value.length - 1) === '%') {
                    var _ref2;

                    return _ref2 = {}, _ref2[key] = new RegExp('' + v), _ref2;
                } else if (value.indexOf('%') === 0) {
                    var _ref3;

                    return _ref3 = {}, _ref3[key] = new RegExp(v + '^'), _ref3;
                } else if (value.substring(value.length - 1) === '%') {
                    var _ref4;

                    return _ref4 = {}, _ref4[key] = new RegExp('^' + v), _ref4;
                }
            }
            break;
        default:
            if (_lib2.default.isObject(value)) {
                temp = {};
                for (var k in value) {
                    temp = _lib2.default.extend(temp, whereParse(k, value[k], key));
                }
                return temp;
            } else {
                var _ref5;

                return _ref5 = {}, _ref5[key] = value, _ref5;
            }
            break;
    }
};

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
        this.sql = '';
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseLimit = function parseLimit(data, options) {
        options['skip'] = options.limit[0] || 0;
        options['limit'] = options.limit[1] || 10;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseOrder = function parseOrder(data, options) {
        for (var n in options.order) {
            options.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
        }
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*|Cursor|AggregationCursor}
     */


    _class.prototype.parseField = function parseField(data, options) {
        for (var _iterator = options.field, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref6;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref6 = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref6 = _i.value;
            }

            var n = _ref6;

            if (n.indexOf('.') > -1) {
                options.project[n.split('.')[1]] = 1;
            } else {
                options.project[n] = 1;
            }
        }
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseWhere = function parseWhere(data, options) {
        var where = {};
        if (options.where) {
            for (var key in options.where) {
                where = _lib2.default.extend(where, whereParse(key, options.where[key], key));
            }
            options.where = where || {};
        }
    };

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     * @returns {Promise}
     */


    _class.prototype.parseGroup = function parseGroup(data, options) {
        //db.demo.group({
        //    "key": {
        //        "id": true,
        //            ...
        //    },
        //    "initial": {},
        //    "reduce": function(obj, prev) {},
        //    "cond": {
        //        "score": {
        //            "$gt": 0
        //        }
        //    }
        //});
        if (options.group) {
            (function () {
                var group = {};
                if (_lib2.default.isArray(options.group)) {
                    options.group.map(function (item) {
                        group[item] = true;
                    });
                } else {
                    group = [options.group];
                }
                options.group = {
                    "key": group,
                    "initial": { "count": 0 },
                    "reduce": "function (obj, prev) { prev.count++; }",
                    "cond": {}
                };
            })();
        }
    };

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param data
     * @param options
     * @returns {Promise}
     */


    _class.prototype.parseJoin = function parseJoin(data, options) {
        //未实现
        return _promise2.default.reject('not support');
    };

    /**
     * mongodb需要严格匹配数据,此处做处理
     * @param data
     * @param options
     */


    _class.prototype.parseData = function parseData(data, options) {}
    //暂时未实现


    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    ;

    _class.prototype.parseSql = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var caseList, optType, n, mt;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            caseList = {
                                FIND: { join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1 },
                                SELECT: { join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1 },
                                ADD: { data: 1 },
                                //ADDALL: {data: 1},
                                UPDATE: { where: 1, data: 1 },
                                DELETE: { where: 1 },
                                COUNT: { join: 1, where: 1, limit: 1, group: 1 },
                                SUM: { join: 1, where: 1, limit: 1, group: 1 }
                            };
                            optType = options.method;
                            //处理join

                            if (!(options['join'] && caseList[optType]['join'])) {
                                _context.next = 7;
                                break;
                            }

                            _context.next = 6;
                            return this.parseJoin(data, options);

                        case 6:
                            caseList[optType]['join'] && (caseList[optType]['join'] = 0);

                        case 7:
                            if (!(options['where'] && caseList[optType]['where'])) {
                                _context.next = 11;
                                break;
                            }

                            _context.next = 10;
                            return this.parseWhere(data, options);

                        case 10:
                            caseList[optType]['where'] && (caseList[optType]['where'] = 0);

                        case 11:
                            if (!(options['group'] && caseList[optType]['group'])) {
                                _context.next = 15;
                                break;
                            }

                            _context.next = 14;
                            return this.parseGroup(data, options);

                        case 14:
                            caseList[optType]['group'] && (caseList[optType]['group'] = 0);

                        case 15:
                            if (!(options['data'] && caseList[optType]['data'])) {
                                _context.next = 19;
                                break;
                            }

                            _context.next = 18;
                            return this.parseData(data, options);

                        case 18:
                            caseList[optType]['data'] && (caseList[optType]['data'] = 0);

                        case 19:
                            _context.t0 = _regenerator2.default.keys(options);

                        case 20:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 29;
                                break;
                            }

                            n = _context.t1.value;

                            if (!caseList[optType][n]) {
                                _context.next = 27;
                                break;
                            }

                            mt = 'parse' + _lib2.default.ucFirst(n);

                            if (!(mt && _lib2.default.isFunction(this[mt]))) {
                                _context.next = 27;
                                break;
                            }

                            _context.next = 27;
                            return this[mt](data, options);

                        case 27:
                            _context.next = 20;
                            break;

                        case 29:
                            return _context.abrupt('return', { data: data, options: options });

                        case 32:
                            _context.prev = 32;
                            _context.t2 = _context['catch'](0);
                            throw new Error(_context.t2);

                        case 35:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 32]]);
        }));

        function parseSql(_x2, _x3) {
            return _ref7.apply(this, arguments);
        }

        return parseSql;
    }();

    /**
     *
     * @param data
     * @param options
     * @returns {{data, options}|*}
     */


    _class.prototype.buildSql = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            var parseOptions;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (options === undefined) {
                                options = data;
                            }
                            //防止外部options被更改
                            parseOptions = _lib2.default.extend({}, options);
                            return _context2.abrupt('return', this.parseSql(data, parseOptions));

                        case 3:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function buildSql(_x4, _x5) {
            return _ref8.apply(this, arguments);
        }

        return buildSql;
    }();

    return _class;
}(_base3.default);

exports.default = _class;