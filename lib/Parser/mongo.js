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

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
/**
 *
 * @param key
 * @param value
 * @param item
 * @param where
 * @returns {{}}
 */
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
var whereParse = function whereParse(key, value, item, where) {
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
                        temp.push(whereParse(k, data[k], k, where));
                    }
                });
                where = { $or: temp };
                break;
            default:
                if (ORM.isJSONObj(value)) {
                    for (var k in value) {
                        return {
                            v: whereParse(k, value[k], key, where)
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
     * @param col
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseLimit = function parseLimit(col, data, options) {
        this.sql = this.sql + '.skip(' + (options.limit[0] || 0) + ').limit(' + (options.limit[1] || 10) + ')';
        return col.skip(options.limit[0] || 0).limit(options.limit[1] || 10);
    };

    /**
     *
     * @param col
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseOrder = function parseOrder(col, data, options) {
        for (var n in options.order) {
            options.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
        }
        this.sql = this.sql + '.sort(' + (0, _stringify2.default)(options.sort) + ')';
        return col.sort(options.sort);
    };

    /**
     *
     * @param col
     * @param data
     * @param options
     * @returns {*|Cursor|AggregationCursor}
     */


    _class.prototype.parseField = function parseField(col, data, options) {
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
                options.project[n.split('.')[1]] = 1;
            } else {
                options.project[n] = 1;
            }
        }
        this.sql = this.sql + '.project(' + (0, _stringify2.default)(options.project) + ')';
        return col.project(options.project);
    };

    /**
     *
     * @param col
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseWhere = function parseWhere(col, data, options) {
        var where = {};
        if (options.where) {
            for (var key in options.where) {
                whereParse(key, options.where[key], key, where);
            }
            options.where = where || {};
        }
    };

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param col
     * @param data
     * @param options
     * @returns {Promise}
     */


    _class.prototype.parseGroup = function parseGroup(col, data, options) {
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
                if (ORM.isArray(options.group)) {
                    options.group.map(function (item) {
                        group[item] = true;
                    });
                } else {
                    group = options.group;
                }
                options.group = {
                    "key": group,
                    "initial": {},
                    "reduce": function reduce(obj, prev) {},
                    "cond": {}
                };
            })();
        }
    };

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param col
     * @param data
     * @param options
     * @returns {Promise}
     */


    _class.prototype.parseJoin = function parseJoin(col, data, options) {
        //未实现
        return _promise2.default.reject('not support');
    };

    /**
     * mongodb需要严格匹配数据,此处做处理
     * @param col
     * @param data
     * @param options
     */


    _class.prototype.parseData = function parseData(col, data, options) {}
    //暂时未实现


    /**
     *
     * @param col
     * @param data
     * @param options
     */
    ;

    _class.prototype.parseMethod = function parseMethod(col, data, options) {
        var caseList = { SELECT: 1, ADD: 1, /*ADDALL: 1,*/UPDATE: 1, DELETE: 1, COUNT: 1, SUM: 1 };
        var optType = options.method,
            fn = void 0,
            pipe = [];
        if (optType && optType in caseList) {
            switch (optType) {
                case 'FIND':
                    if (ORM.isEmpty(options.group)) {
                        this.sql = '' + this.sql + (options.where ? '.findOne(' + (0, _stringify2.default)(options.where) + ')' : '.findOne()');
                        return col.findOne(options.where || {});
                    } else {
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        return col.group(options.group);
                    }
                    break;
                case 'SELECT':
                    if (ORM.isEmpty(options.group)) {
                        this.sql = '' + this.sql + (options.where ? '.find(' + (0, _stringify2.default)(options.where) + ')' : '.find()');
                        return col.find(options.where || {}).toArray();
                    } else {
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        return col.group(options.group);
                    }
                    break;
                case 'ADD':
                    this.sql = this.sql + '.insertOne(' + (0, _stringify2.default)(data) + ')';
                    return col.insertOne(data);
                    break;
                case 'ADDALL':
                    this.sql = this.sql + '.insertMany(' + (0, _stringify2.default)(data) + ')';
                    return col.insertMany(data);
                    break;
                case 'UPDATE':
                    this.sql = '' + this.sql + (options.where ? '.update(' + (0, _stringify2.default)(options.where) + ', {$set:' + (0, _stringify2.default)(data) + '}, false, true))' : '.update({}, {$set:' + (0, _stringify2.default)(data) + '}, false, true)');
                    return col.updateMany(options.where || {}, data);
                    break;
                case 'DELETE':
                    this.sql = '' + this.sql + (options.where ? '.remove(' + (0, _stringify2.default)(options.where) + ')' : '.remove()');
                    return col.deleteMany(options.where || {});
                    break;
                case 'COUNT':
                    if (ORM.isEmpty(options.group)) {
                        fn = ORM.promisify(col.aggregate, col);
                        !ORM.isEmpty(options.where) && pipe.push({ $match: options.where });
                        pipe.push({
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        });
                        this.sql = this.sql + '.aggregate(' + (0, _stringify2.default)(pipe) + ')';
                        return fn(pipe);
                    } else {
                        options.group.initial = {
                            "countid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', 'if (obj.' + options.count + ' != null) if (obj.' + options.count + ' instanceof Array){prev.countid += obj.' + options.count + '.length; }else{ prev.countid++;}');
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        return col.group(options.group);
                    }
                    break;
                case 'SUM':
                    if (ORM.isEmpty(options.group)) {
                        fn = ORM.promisify(col.aggregate, col);
                        !ORM.isEmpty(options.where) && pipe.push({ $match: options.where });
                        pipe.push({
                            $group: {
                                _id: 1,
                                count: { $sum: '$' + options.sum }
                            }
                        });
                        this.sql = this.sql + '.aggregate(' + (0, _stringify2.default)(pipe) + ')';
                        return fn(pipe);
                    } else {
                        options.group.initial = {
                            "sumid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', 'prev.sumid = prev.sumid + obj.' + options.sum + ' - 0;');
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        return col.group(options.group);
                    }
                    break;
            }
        }
    };

    /**
     *
     * @param conn
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseSql = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(conn, data, options) {
            var collection, caseList, optType, n, mt;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            collection = void 0;
                            _context.prev = 1;
                            caseList = {
                                SELECT: { join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1 },
                                ADD: { data: 1 },
                                UPDATE: { where: 1, data: 1 },
                                DELETE: { where: 1 },
                                COUNT: { join: 1, where: 1, limit: 1, group: 1 },
                                SUM: { join: 1, where: 1, limit: 1, group: 1 }
                            };

                            if (!conn) {
                                _context.next = 40;
                                break;
                            }

                            optType = options.method;
                            //处理collection

                            _context.next = 7;
                            return conn.collection(options.table);

                        case 7:
                            collection = _context.sent;

                            this.sql = 'db.' + options.table;

                            //处理join

                            if (!(options['join'] && caseList[optType]['join'])) {
                                _context.next = 13;
                                break;
                            }

                            _context.next = 12;
                            return this.parseJoin(collection, data, options);

                        case 12:
                            caseList[optType]['join'] && (caseList[optType]['join'] = 0);

                        case 13:
                            if (!(options['where'] && caseList[optType]['where'])) {
                                _context.next = 17;
                                break;
                            }

                            _context.next = 16;
                            return this.parseWhere(collection, data, options);

                        case 16:
                            caseList[optType]['where'] && (caseList[optType]['where'] = 0);

                        case 17:
                            if (!(options['group'] && caseList[optType]['group'])) {
                                _context.next = 21;
                                break;
                            }

                            _context.next = 20;
                            return this.parseGroup(collection, data, options);

                        case 20:
                            caseList[optType]['group'] && (caseList[optType]['group'] = 0);

                        case 21:
                            if (!(options['data'] && caseList[optType]['data'])) {
                                _context.next = 25;
                                break;
                            }

                            _context.next = 24;
                            return this.parseData(collection, data, options);

                        case 24:
                            caseList[optType]['data'] && (caseList[optType]['data'] = 0);

                        case 25:
                            _context.next = 27;
                            return this.parseMethod(collection, data, options);

                        case 27:
                            collection = _context.sent;
                            _context.t0 = _regenerator2.default.keys(options);

                        case 29:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 39;
                                break;
                            }

                            n = _context.t1.value;

                            if (!caseList[optType][n]) {
                                _context.next = 37;
                                break;
                            }

                            mt = 'parse' + ORM.ucFirst(n);

                            if (!(mt && ORM.isFunction(this[mt]))) {
                                _context.next = 37;
                                break;
                            }

                            _context.next = 36;
                            return this[mt](collection, data, options);

                        case 36:
                            collection = _context.sent;

                        case 37:
                            _context.next = 29;
                            break;

                        case 39:
                            return _context.abrupt('return', { sql: this.sql, col: collection });

                        case 40:
                            _context.next = 44;
                            break;

                        case 42:
                            _context.prev = 42;
                            _context.t2 = _context['catch'](1);

                        case 44:
                            return _context.abrupt('return', { sql: this.sql, col: null });

                        case 45:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[1, 42]]);
        }));

        function parseSql(_x2, _x3, _x4) {
            return _ref2.apply(this, arguments);
        }

        return parseSql;
    }();

    /**
     *
     * @param conn
     * @param data
     * @param options
     * @returns {string}
     */


    _class.prototype.buildSql = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(conn, data, options) {
            var parseOptions;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (options === undefined) {
                                options = data;
                            }
                            //防止外部options被更改
                            parseOptions = ORM.extend({}, options);
                            return _context2.abrupt('return', this.parseSql(conn, data, parseOptions));

                        case 3:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function buildSql(_x5, _x6, _x7) {
            return _ref3.apply(this, arguments);
        }

        return buildSql;
    }();

    return _class;
}(_base3.default);

exports.default = _class;