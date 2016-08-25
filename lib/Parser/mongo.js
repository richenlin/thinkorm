'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
//js统计字符串中包含的特定字符个数
function getPlaceholderCount(strSource, k) {
    var thisCount = 0,
        reg = new RegExp('' + k, "g");
    strSource.replace(reg, function (m, i) {
        //m为找到的{xx}元素、i为索引
        thisCount++;
    });
    return thisCount;
}
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
            return _ref = {}, _ref[item] = (_item = {}, _item[identifiers[key]] = value, _item), _ref;
            break;
        case '$or':
            temp = [];
            value.map(function (data) {
                for (var k in data) {
                    temp.push(whereParse(k, data[k], k));
                }
            });
            return { $or: temp };
            break;
        case '$regex':
            if (_lib2.default.isObject(value)) {
                temp = {};
                for (var n in value) {
                    if (value[n].indexOf('%') > -1) {
                        if (getPlaceholderCount(value, '%') > 1) {} else if (value.indexOf('%') === 0) {} else if (value.indexOf('%') === 0) {} else {}
                    } else {
                        var _lib$extend;

                        temp = _lib2.default.extend(temp, (_lib$extend = {}, _lib$extend[key] = value[n], _lib$extend));
                    }
                }
                return temp;
            }
        default:
            if (_lib2.default.isObject(value)) {
                temp = {};
                for (var k in value) {
                    temp = _lib2.default.extend(temp, whereParse(k, value[k], key));
                }
                return temp;
            } else {
                var _ref2;

                return _ref2 = {}, _ref2[key] = value, _ref2;
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
            var _ref3;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref3 = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref3 = _i.value;
            }

            var n = _ref3;

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
     * @param collection
     * @param data
     * @param options
     */
    ;

    _class.prototype.parseMethod = function parseMethod(collection, data, options) {
        var caseList = {
            FIND: { skip: true, limit: true, sort: true, project: true },
            SELECT: { skip: true, limit: true, sort: true, project: true },
            ADD: {},
            /*ADDALL: {},*/
            UPDATE: {},
            DELETE: {},
            COUNT: {},
            SUM: {} };
        var optType = options.method,
            handler = void 0,
            fn = void 0,
            pipe = [];
        if (optType && optType in caseList) {
            switch (optType) {
                case 'FIND':
                    if (_lib2.default.isEmpty(options.group)) {
                        this.sql = '' + this.sql + (options.where ? '.findOne(' + (0, _stringify2.default)(options.where) + ')' : '.findOne()');
                        handler = collection.findOne(options.where || {});
                    } else {
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        handler = collection.group(options.group);
                    }
                    break;
                case 'SELECT':
                    if (_lib2.default.isEmpty(options.group)) {
                        this.sql = '' + this.sql + (options.where ? '.find(' + (0, _stringify2.default)(options.where) + ')' : '.find()');
                        handler = collection.find(options.where || {});
                    } else {
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        handler = collection.group(options.group);
                    }
                    break;
                case 'ADD':
                    this.sql = this.sql + '.insertOne(' + (0, _stringify2.default)(data) + ')';
                    handler = collection.insertOne(data);
                    break;
                case 'ADDALL':
                    this.sql = this.sql + '.insertMany(' + (0, _stringify2.default)(data) + ')';
                    handler = collection.insertMany(data);
                    break;
                case 'UPDATE':
                    this.sql = '' + this.sql + (options.where ? '.update(' + (0, _stringify2.default)(options.where) + ', {$set:' + (0, _stringify2.default)(data) + '}, false, true))' : '.update({}, {$set:' + (0, _stringify2.default)(data) + '}, false, true)');
                    handler = collection.updateMany(options.where || {}, data);
                    break;
                case 'DELETE':
                    this.sql = '' + this.sql + (options.where ? '.remove(' + (0, _stringify2.default)(options.where) + ')' : '.remove()');
                    handler = collection.deleteMany(options.where || {});
                    break;
                case 'COUNT':
                    if (_lib2.default.isEmpty(options.group)) {
                        fn = _lib2.default.promisify(collection.aggregate, collection);
                        !_lib2.default.isEmpty(options.where) && pipe.push({ $match: options.where });
                        pipe.push({
                            $group: {
                                _id: null,
                                count: { $sum: 1 }
                            }
                        });
                        this.sql = this.sql + '.aggregate(' + (0, _stringify2.default)(pipe) + ')';
                        handler = fn(pipe);
                    } else {
                        options.group.initial = {
                            "countid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', 'if (obj.' + options.count + ' != null) if (obj.' + options.count + ' instanceof Array){prev.countid += obj.' + options.count + '.length; }else{ prev.countid++;}');
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        handler = collection.group(options.group);
                    }
                    break;
                case 'SUM':
                    if (_lib2.default.isEmpty(options.group)) {
                        fn = _lib2.default.promisify(collection.aggregate, collection);
                        !_lib2.default.isEmpty(options.where) && pipe.push({ $match: options.where });
                        pipe.push({
                            $group: {
                                _id: 1,
                                sum: { $sum: '$' + options.sum }
                            }
                        });
                        this.sql = this.sql + '.aggregate(' + (0, _stringify2.default)(pipe) + ')';
                        handler = fn(pipe);
                    } else {
                        options.group.initial = {
                            "sumid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', 'prev.sumid = prev.sumid + obj.' + options.sum + ' - 0;');
                        options.group.cond = options.where;
                        this.sql = this.sql + '.group(' + (0, _stringify2.default)(options.group) + ')';
                        handler = collection.group(options.group);
                    }
                    break;
            }
            //解析skip,limit,sort,project
            for (var c in caseList[optType]) {
                if (options[c] && handler[c]) {
                    this.sql = this.sql + '.' + c + '(' + (0, _stringify2.default)(options[c]) + ')';
                    handler[c](options[c]);
                }
            }
            if (optType == 'SELECT') {
                return handler.toArray();
            } else {
                return handler;
            }
        } else {
            return null;
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
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(conn, data, options) {
            var caseList, optType, n, mt, collection, methodFn;
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

                            if (!conn) {
                                _context.next = 34;
                                break;
                            }

                            optType = options.method;
                            //处理join

                            if (!(options['join'] && caseList[optType]['join'])) {
                                _context.next = 8;
                                break;
                            }

                            _context.next = 7;
                            return this.parseJoin(data, options);

                        case 7:
                            caseList[optType]['join'] && (caseList[optType]['join'] = 0);

                        case 8:
                            if (!(options['where'] && caseList[optType]['where'])) {
                                _context.next = 12;
                                break;
                            }

                            _context.next = 11;
                            return this.parseWhere(data, options);

                        case 11:
                            caseList[optType]['where'] && (caseList[optType]['where'] = 0);

                        case 12:
                            if (!(options['group'] && caseList[optType]['group'])) {
                                _context.next = 16;
                                break;
                            }

                            _context.next = 15;
                            return this.parseGroup(data, options);

                        case 15:
                            caseList[optType]['group'] && (caseList[optType]['group'] = 0);

                        case 16:
                            if (!(options['data'] && caseList[optType]['data'])) {
                                _context.next = 20;
                                break;
                            }

                            _context.next = 19;
                            return this.parseData(data, options);

                        case 19:
                            caseList[optType]['data'] && (caseList[optType]['data'] = 0);

                        case 20:
                            _context.t0 = _regenerator2.default.keys(options);

                        case 21:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 30;
                                break;
                            }

                            n = _context.t1.value;

                            if (!caseList[optType][n]) {
                                _context.next = 28;
                                break;
                            }

                            mt = 'parse' + _lib2.default.ucFirst(n);

                            if (!(mt && _lib2.default.isFunction(this[mt]))) {
                                _context.next = 28;
                                break;
                            }

                            _context.next = 28;
                            return this[mt](data, options);

                        case 28:
                            _context.next = 21;
                            break;

                        case 30:
                            //处理collection
                            collection = conn.collection(options.table);

                            this.sql = 'db.' + options.table;
                            methodFn = this.parseMethod(collection, data, options);
                            return _context.abrupt('return', { sql: this.sql, col: methodFn });

                        case 34:
                            _context.next = 39;
                            break;

                        case 36:
                            _context.prev = 36;
                            _context.t2 = _context['catch'](0);

                            console.log(_context.t2);

                        case 39:
                            return _context.abrupt('return', { sql: this.sql, col: null });

                        case 40:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 36]]);
        }));

        function parseSql(_x2, _x3, _x4) {
            return _ref4.apply(this, arguments);
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
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(conn, data, options) {
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
                            return _context2.abrupt('return', this.parseSql(conn, data, parseOptions));

                        case 3:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function buildSql(_x5, _x6, _x7) {
            return _ref5.apply(this, arguments);
        }

        return buildSql;
    }();

    return _class;
}(_base3.default);

exports.default = _class;