'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _of = require('babel-runtime/core-js/array/of');

var _of2 = _interopRequireDefault(_of);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _analyze = require('../Util/analyze');

var _analyze2 = _interopRequireDefault(_analyze);

var _sequelizer = require('../Util/sequelizer');

var _sequelizer2 = _interopRequireDefault(_sequelizer);

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
        if (options.method === 'SELECT') {
            parseOptions['offset'] = options.limit[0] || 0;
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
        if (options.method === 'SELECT') {
            parseOptions['orderBy'] = options.order;
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
        if (options.method === 'SELECT') {
            parseOptions['select'] = options.field || '*';
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
        var parseOptions = {};
        if (options.method === 'SELECT') {
            parseOptions['count'] = ORM.isArray(options.count) ? options.count : (0, _of2.default)(options.count);
        }
        return parseOptions;
    };

    /**
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseSum = function parseSum(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            parseOptions['sum'] = ORM.isArray(options.sum) ? options.sum : (0, _of2.default)(options.sum);
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseWhere = function parseWhere(data, options) {
        var parseOptions = {};
        parseOptions['where'] = options.where || 1;
        return parseOptions;
    };

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseGroup = function parseGroup(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            parseOptions['groupBy'] = ORM.isArray(options.group) ? options.group : (0, _of2.default)(options.group);
        }
        return parseOptions;
    };

    /**
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}}], 'left')
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'right')
     * @param data
     * @param options
     */


    _class.prototype.parseJoin = function parseJoin(data, options) {
        var _this2 = this;

        var parseOptions = {};
        if (options.method === 'SELECT') {
            //解析后结果
            //innerJoin: [{from: 'accounts',on: {or: [{accounts: 'id',users: 'account_id'},{accounts: 'owner_id',users: 'id'}]}}]
            //innerJoin: [{from: 'accounts',on: [{accounts: 'id',users: 'account_id'},{accounts: 'owner_id',users: 'id'}]}]
            if (options.joinType && ORM.isArray(options.join)) {
                (function () {
                    var type = options.joinType.toLowerCase();
                    try {
                        (function () {
                            var config = _this2.config;
                            var table = options.table;
                            parseOptions[type + 'Join'] = [];
                            options.join.forEach(function (item) {
                                if (item.from && item.on) {
                                    (function () {
                                        var temp = {};
                                        temp.from = item.from.toLowerCase();
                                        temp.from = temp.from.indexOf(config.db_prefix) > -1 ? temp.from : '' + config.db_prefix + temp.from;
                                        temp.on = [];
                                        if (ORM.isArray(item.on)) {
                                            item.on.forEach(function (it) {
                                                if (ORM.isObject(it)) {
                                                    for (var i in it) {
                                                        var _temp$on$push;

                                                        temp.on.push((_temp$on$push = {}, _temp$on$push[table] = i, _temp$on$push[temp.from] = it[i], _temp$on$push));
                                                    }
                                                }
                                            });
                                        } else {
                                            temp.on = {};
                                            if (ORM.isArray(item.on.or)) {
                                                temp.on.or = [];
                                                item.on.or.forEach(function (it) {
                                                    if (ORM.isObject(it)) {
                                                        for (var i in it) {
                                                            var _temp$on$or$push;

                                                            temp.on.or.push((_temp$on$or$push = {}, _temp$on$or$push[table] = i, _temp$on$or$push[temp.from] = it[i], _temp$on$or$push));
                                                        }
                                                    }
                                                });
                                            }
                                        }
                                        parseOptions[type + 'Join'].push(temp);
                                    })();
                                }
                            });
                        })();
                    } catch (e) {
                        parseOptions[type + 'Join'] && delete parseOptions[type + 'Join'];
                    }
                })();
            }
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseTable = function parseTable(data, options) {
        var parseOptions = {};
        if (options.method === 'UPDATE') {
            parseOptions['using'] = options.table;
        } else if (options.method === 'INSERT') {
            parseOptions['into'] = options.table;
        } else {
            parseOptions['from'] = options.table;
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseData = function parseData(data, options) {
        var parseOptions = {};
        if (options.method === 'UPDATE') {
            parseOptions['update'] = data;
        } else if (options.method === 'INSERT') {
            parseOptions['insert'] = data;
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseMethod = function parseMethod(data, options) {
        var parseOptions = {};
        if (options.method === 'DELETE') {
            parseOptions['del'] = true;
        }
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
            if (this['parse' + mt] && ORM.isFunction(this['parse' + mt])) {
                parseOptions = ORM.extend(false, parseOptions, this['parse' + mt](data, options));
            }
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.buildSql = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parseOptions, seqs, builder, sql;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (options === undefined) {
                                options = data;
                            } else {
                                options.data = data;
                            }
                            parseOptions = this.parseSql(data, options);
                            _context.next = 4;
                            return (0, _analyze2.default)(parseOptions);

                        case 4:
                            seqs = _context.sent;
                            _context.next = 7;
                            return (0, _sequelizer2.default)({
                                dialect: 'postgresql',
                                tree: seqs
                            });

                        case 7:
                            builder = _context.sent;
                            sql = '';

                            if (!ORM.isEmpty(builder.sql)) {
                                sql = builder.sql;
                                if (!ORM.isEmpty(builder.bindings)) {
                                    builder.bindings.forEach(function (item) {
                                        sql = sql.replace(/\?/, ORM.isNumber(item) ? item : '\'' + item + '\'');
                                    });
                                }
                            }
                            return _context.abrupt('return', sql);

                        case 11:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function buildSql(_x2, _x3) {
            return _ref.apply(this, arguments);
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