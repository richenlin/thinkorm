'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('../Base');

var _Base2 = _interopRequireDefault(_Base);

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 数据库适配器,将查询有对象转变为查询语句的query bulider
 * Created by lihao on 16/7/26.
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    //配置数据库实例
    _class.prototype.init = function init(config) {
        _base.prototype.init.call(this, config);
        this.config = config;
        this.knex;
        this.knexClient = (0, _knex2.default)({
            client: this.config.db_type
        });
        this.sql = '';
    };

    //实例化数据库Socket


    _class.prototype.socket = function socket() {
        if (this._socket) {
            return this._socket;
        }
        var MysqlSocket = require('../Socket/mysqlSocket').default;
        this._socket = new MysqlSocket(this.config);
        return this._socket;
    };

    /**
     * 执行查询类操作
     * @param sql
     */


    _class.prototype.query = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(sql) {
            var _this2 = this;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            console.log(sql);
                            this.sql = sql;
                            return _context.abrupt('return', this.socket().query(sql).then(function (data) {
                                return _this2.bufferToString(data);
                            }));

                        case 3:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function query(_x) {
            return _ref.apply(this, arguments);
        }

        return query;
    }();

    /**
     * 更新,修改,删除类操作
     * @param sql
     */


    _class.prototype.execute = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(sql) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function execute(_x2) {
            return _ref2.apply(this, arguments);
        }

        return execute;
    }();

    _class.prototype.count = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(options) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            this.knex = this.knexClient.count(options.count);
                            this.queryBuilder(options);
                            return _context3.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function count(_x3) {
            return _ref3.apply(this, arguments);
        }

        return count;
    }();

    _class.prototype.min = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(options) {
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            this.knex = this.knexClient.min(options.min);
                            this.queryBuilder(options);
                            return _context4.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function min(_x4) {
            return _ref4.apply(this, arguments);
        }

        return min;
    }();

    _class.prototype.max = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(options) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            this.knex = this.knexClient.max(options.max);
                            this.queryBuilder(options);
                            return _context5.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function max(_x5) {
            return _ref5.apply(this, arguments);
        }

        return max;
    }();

    _class.prototype.avg = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(options) {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            this.knex = this.knexClient.avg(options.avg);
                            this.queryBuilder(options);
                            return _context6.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function avg(_x6) {
            return _ref6.apply(this, arguments);
        }

        return avg;
    }();

    _class.prototype.avgDistinct = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            this.knex = this.knexClient.avgDistinct(options.avgDistinct);
                            this.queryBuilder(options);
                            return _context7.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function avgDistinct(_x7) {
            return _ref7.apply(this, arguments);
        }

        return avgDistinct;
    }();

    /**
     * 字段自增
     * @param options
     */


    _class.prototype.increment = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            this.knex = this.knexClient.increment(options.increment[0], options.increment[1]);
                            this.queryBuilder(options);
                            return _context8.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function increment(_x8) {
            return _ref8.apply(this, arguments);
        }

        return increment;
    }();

    /**
     * 字段自增
     * @param options
     */


    _class.prototype.decrement = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options) {
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            this.knex = this.knexClient.decrement(options.decrement[0], options.decrement[1]);
                            this.queryBuilder(options);
                            return _context9.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function decrement(_x9) {
            return _ref9.apply(this, arguments);
        }

        return decrement;
    }();

    /**
     * 查询操作
     * @param options
     */


    _class.prototype.select = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(options) {
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            this.knex = this.knexClient.select();
                            this.queryBuilder(options);
                            return _context10.abrupt('return', this.query(this.knex.toString()));

                        case 3:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function select(_x10) {
            return _ref10.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 新增操作
     * @param data
     * @param options
     */


    _class.prototype.insert = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(data, options) {
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            this.knex = this.knexClient.insert(data);
                            return _context11.abrupt('return', this.query(this.knex.toString()));

                        case 2:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function insert(_x11, _x12) {
            return _ref11.apply(this, arguments);
        }

        return insert;
    }();

    /**
     * 查询对象转变为查询语句
     * 基于knex.js http://knexjs.org
     */


    _class.prototype.queryBuilder = function queryBuilder(options) {
        this.builderTable(options.table);
        this.builderWhere(options.where);
        this.builderField(options.fields);
        this.builderLimit(options.limit);
        this.builderOrder(options.order);
        this.builderGroup(options.group);
        this.builderJoin(options.join);
    };

    /**
     * 解析表名
     * @param optionTable
     */


    _class.prototype.builderTable = function builderTable(optionTable) {
        this.knex.from(optionTable);
    };

    /**
     * 解析字段
     * @param optionField
     */


    _class.prototype.builderField = function builderField(optionField) {
        if (!optionField) return;
        this.knex.column(optionField);
    };

    /**
     * 解析limit
     * @param optionLimit
     */


    _class.prototype.builderLimit = function builderLimit(optionLimit) {
        if (!optionLimit || optionLimit.length < 1) return;
        this.knex.limit(optionLimit[1]).offset(optionLimit[0]);
    };

    /**
     * 解析Order
     * @param optionOrder
     */


    _class.prototype.builderOrder = function builderOrder(optionOrder) {
        if (!optionOrder || optionOrder.length < 1) return;
        for (var _iterator = optionOrder, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
            var _ref12;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref12 = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref12 = _i.value;
            }

            var order = _ref12;

            this.knex.orderBy(order[0], order[1]);
        }
    };

    _class.prototype.builderGroup = function builderGroup(optionGroup) {
        if (!optionGroup) return;
        this.knex.groupBy(optionGroup);
    };

    /**
     * 解析join条件
     * join:{
     *  innerJoin,leftJoin,leftOuterJoin,rightJoin,rightOuterJoin,outerJoin,fullOuterJoin,crossJoin,
     * }
     * @param optionJoin
     */


    _class.prototype.builderJoin = function builderJoin(optionJoin) {
        var _this3 = this;

        if (!optionJoin) return;

        var _loop = function _loop() {
            if (_isArray2) {
                if (_i2 >= _iterator2.length) return 'break';
                _ref13 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) return 'break';
                _ref13 = _i2.value;
            }

            var join = _ref13;

            if (join.or) {
                _this3.knex[join.type + 'Join'](join.or[0], function () {
                    //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                    this.on(join.or[1][0], '=', join.or[1][1]);
                    //删除带个元素
                    join.or.shift();
                    join.or.shift();
                    for (var _iterator3 = join.or, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
                        var _ref14;

                        if (_isArray3) {
                            if (_i3 >= _iterator3.length) break;
                            _ref14 = _iterator3[_i3++];
                        } else {
                            _i3 = _iterator3.next();
                            if (_i3.done) break;
                            _ref14 = _i3.value;
                        }

                        var or = _ref14;


                        this.orOn(or[0], '=', or[1]);
                    }
                });
            } else {
                _this3.knex[join.type + 'Join'](join.on[0], join.on[1], join.on[2]);
            }
        };

        for (var _iterator2 = optionJoin, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
            var _ref13;

            var _ret = _loop();

            if (_ret === 'break') break;
        }
        //if (optionJoin.innerJoin) this.knex.innerJoin(optionJoin.innerJoin);
    };

    /**
     * 解析where条件
     * where:{
     *  where,whereNot,whereNotIn,whereNull,whereNotNull,whereExists,whereNotExists,whereBetween,whereNotBetween,
     * }
     * @param optionWhere
     */


    _class.prototype.builderWhere = function builderWhere(optionWhere) {
        if (!optionWhere) return;
        if (optionWhere.where) this.knex.where(optionWhere.where);
        if (optionWhere.whereNot) this.knex.whereNot(optionWhere.whereNot);
        if (optionWhere.whereNotIn) this.knex.whereNotIn(optionWhere.whereNotIn);
        if (optionWhere.whereNull) this.knex.whereNull(optionWhere.whereNull);
        if (optionWhere.whereNotNull) this.knex.whereNotNull(optionWhere.whereNotNull);
        if (optionWhere.whereExists) this.knex.whereExists(optionWhere.whereExists);
        if (optionWhere.whereNotExists) this.knex.whereNotExists(optionWhere.whereNotExists);
        if (optionWhere.whereBetween) this.knex.whereBetween(optionWhere.whereBetween);
        if (optionWhere.whereNotBetween) this.knex.whereNotBetween(optionWhere.whereNotBetween);
    };

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
}(_Base2.default);

exports.default = _class;