'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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
        this.lastInsertId;
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

    _class.prototype.getLastSql = function getLastSql() {
        return this.sql;
    };

    _class.prototype.getLastInsertId = function getLastInsertId() {
        return this.lastInsertId;
    };

    /**
     * 执行查询类操作
     * @param sql
     */


    _class.prototype.query = function query(sql) {
        var _this2 = this;

        //console.log(sql);
        this.sql = sql;
        return this.socket().query(sql).then(function (data) {
            return _this2.bufferToString(data);
        });
    };

    /**
     * 更新,修改,删除类操作
     * @param sql
     */


    _class.prototype.execute = function execute(sql) {
        var _this3 = this;

        //console.log(sql);
        this.sql = sql;
        return this.socket().query(sql).then(function (data) {
            if (data.insertId) {
                _this3.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    };

    _class.prototype.count = function count(options) {
        this.knex = this.knexClient.count(options.count);
        this.queryBuilder(options, 'count');
        return this.query(this.knex.toString());
    };

    _class.prototype.min = function min(options) {
        this.knex = this.knexClient.min(options.min);
        this.queryBuilder(options, 'min');
        return this.query(this.knex.toString());
    };

    _class.prototype.max = function max(options) {
        this.knex = this.knexClient.max(options.max);
        this.queryBuilder(options, 'max');
        return this.query(this.knex.toString());
    };

    _class.prototype.avg = function avg(options) {
        this.knex = this.knexClient.avg(options.avg);
        this.queryBuilder(options, 'avg');
        return this.query(this.knex.toString());
    };

    _class.prototype.avgDistinct = function avgDistinct(options) {
        this.knex = this.knexClient.avgDistinct(options.avgDistinct);
        this.queryBuilder(options, 'avgDistinct');
        return this.query(this.knex.toString());
    };

    /**
     * 字段自增
     * @param options
     */


    _class.prototype.increment = function increment(options) {
        this.knex = this.knexClient.increment(options.increment[0], options.increment[1]);
        this.queryBuilder(options, 'increment');
        return this.query(this.knex.toString());
    };

    /**
     * 字段自增
     * @param options
     */


    _class.prototype.decrement = function decrement(options) {
        this.knex = this.knexClient.decrement(options.decrement[0], options.decrement[1]);
        this.queryBuilder(options, 'decrement');
        return this.query(this.knex.toString());
    };

    /**
     * 查询操作
     * @param options
     */


    _class.prototype.select = function select(options) {
        this.knex = this.knexClient.select();
        this.queryBuilder(options, 'select');
        return this.query(this.knex.toString());
    };

    /**
     * 新增操作
     * @param data
     * @param options
     */


    _class.prototype.insert = function insert(data, options) {
        //去掉关联查询中的子模型字段
        var fn = function fn(data) {
            for (var key in data) {
                if (!ORM.isString(data[key]) && !ORM.isBoolean(data[key]) && !ORM.isNumber(data[key])) {
                    delete data[key];
                }
            }
            return data;
        };
        if (ORM.isArray(data)) {
            (function () {
                var _data = [];
                data.map(function (item) {
                    _data.push(fn(item));
                });
                data = data;
            })();
        } else {
            data = fn(data);
        }
        this.knex = this.knexClient.insert(data).from(options.table);
        return this.execute(this.knex.toString());
    };

    /**
     * 批量写入
     * 生成多条insert语句,一次执行
     * @param data
     * @param options
     */


    _class.prototype.insertAll = function insertAll(data, options) {
        return this.insert(data, options);
    };

    /**
     * 更新操作
     * @param data
     * @param options
     */


    _class.prototype.update = function update(data, options) {
        //去掉关联查询中的子模型字段
        var fn = function fn(data) {
            for (var key in data) {
                if (!ORM.isString(data[key]) && !ORM.isBoolean(data[key]) && !ORM.isNumber(data[key])) {
                    delete data[key];
                }
            }
            return data;
        };
        if (ORM.isArray(data)) {
            (function () {
                var _data = [];
                data.map(function (item) {
                    _data.push(fn(item));
                });
                data = data;
            })();
        } else {
            data = fn(data);
        }
        this.knex = this.knexClient.update(data);
        this.queryBuilder(options, 'update');
        //this.builderTable(options.table);
        //this.builderWhere(options.where);
        return this.query(this.knex.toString());
    };

    /**
     * 删除操作
     * @param options
     */


    _class.prototype.delete = function _delete(options) {
        this.knex = this.knexClient.del();
        this.queryBuilder(options, 'delete');
        //this.builderTable(options.table);
        //this.builderWhere(options.where);
        return this.execute(this.knex.toString());
    };

    /**
     * 查询对象转变为查询语句
     * 基于knex.js http://knexjs.org
     */


    _class.prototype.queryBuilder = function queryBuilder(options) {
        var optype = arguments.length <= 1 || arguments[1] === undefined ? 'select' : arguments[1];

        var caseList = {
            select: { table: true, where: true, fields: true, limit: true, order: true, group: true, join: true },
            add: { table: true },
            update: { table: true, where: true },
            delete: { table: true, where: true },
            count: { table: true, where: true },
            min: { table: true, where: true },
            max: { table: true, where: true },
            avg: { table: true, where: true },
            avgDistinct: { table: true, where: true },
            increment: { table: true, where: true },
            decrement: { table: true, where: true }
        };

        for (var o in options) {
            if (caseList[optype][o] && this['builder' + ORM.ucFirst(o)]) this['builder' + ORM.ucFirst(o)](options[o]);
        }
        //this.builderTable(options.table);
        //this.builderWhere(options.where);
        //this.builderFields(options.fields);
        //this.builderLimit(options.limit);
        //this.builderOrder(options.order);
        //this.builderGroup(options.group);
        //this.builderJoin(options.join);
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


    _class.prototype.builderFields = function builderFields(optionField) {
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
            var _ref;

            if (_isArray) {
                if (_i >= _iterator.length) break;
                _ref = _iterator[_i++];
            } else {
                _i = _iterator.next();
                if (_i.done) break;
                _ref = _i.value;
            }

            var order = _ref;

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
        var _this4 = this;

        if (!optionJoin) return;

        var _loop = function _loop() {
            if (_isArray2) {
                if (_i2 >= _iterator2.length) return 'break';
                _ref2 = _iterator2[_i2++];
            } else {
                _i2 = _iterator2.next();
                if (_i2.done) return 'break';
                _ref2 = _i2.value;
            }

            var join = _ref2;

            if (join.or) {
                _this4.knex[join.type + 'Join'](join.or[0], function () {
                    //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                    this.on(join.or[1][0], '=', join.or[1][1]);
                    //删除带个元素
                    join.or.shift();
                    join.or.shift();
                    for (var _iterator3 = join.or, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
                        var _ref3;

                        if (_isArray3) {
                            if (_i3 >= _iterator3.length) break;
                            _ref3 = _iterator3[_i3++];
                        } else {
                            _i3 = _iterator3.next();
                            if (_i3.done) break;
                            _ref3 = _i3.value;
                        }

                        var or = _ref3;


                        this.orOn(or[0], '=', or[1]);
                    }
                });
            } else {
                _this4.knex[join.type + 'Join'](join.on[0], join.on[1], join.on[2]);
            }
        };

        for (var _iterator2 = optionJoin, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
            var _ref2;

            var _ret3 = _loop();

            if (_ret3 === 'break') break;
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
        var _this5 = this;

        if (!optionWhere) return;
        if (optionWhere.where) {
            if (optionWhere.where.and) {
                optionWhere.where.and.map(function (data) {
                    _this5.knex.where(data[0], data[1], data[2]);
                });
            }

            if (optionWhere.where.in) {
                optionWhere.where.in.map(function (data) {
                    _this5.knex.whereIn(data[0], data[1]);
                });
            }

            if (optionWhere.where.not) {
                optionWhere.where.not.map(function (data) {
                    _this5.knex.whereNot(data[0], data[1]);
                });
            }

            if (optionWhere.where.notin) {
                optionWhere.where.notin.map(function (data) {
                    _this5.knex.whereNotIn(data[0], data[1]);
                });
            }

            if (optionWhere.where.null) {
                optionWhere.where.null.map(function (data) {
                    //this.knex.whereNull(...data);
                    data.map(function (d) {
                        _this5.knex.whereNull(d);
                    });
                });
            }

            if (optionWhere.where.notnull) {
                optionWhere.where.notnull.map(function (data) {
                    data.map(function (d) {
                        _this5.knex.whereNotNull(d);
                    });
                });
            }

            if (optionWhere.where.between) {
                optionWhere.where.between.map(function (data) {
                    _this5.knex.whereBetween(data[0], data[1]);
                });
            }

            if (optionWhere.where.notbetween) {
                optionWhere.where.notbetween.map(function (data) {
                    _this5.knex.whereNotBetween(data[0], data[1]);
                });
            }

            if (optionWhere.where.operation) {
                optionWhere.where.operation.map(function (data) {
                    _this5.knex.where(data[0], data[1], data[2]);
                });
            }
        }
        if (optionWhere.orwhere) {
            if (optionWhere.orwhere.and) {
                optionWhere.orwhere.and.map(function (data) {
                    _this5.knex.orWhere(data[0], data[1], data[2]);
                });
            }

            if (optionWhere.orwhere.operation) {
                optionWhere.orwhere.operation.map(function (data) {
                    _this5.knex.orWhere(data[0], data[1], data[2]);
                });
            }

            if (optionWhere.orwhere.in) {
                optionWhere.orwhere.in.map(function (data) {
                    _this5.knex.orWhereIn(data[0], data[1]);
                });
            }

            if (optionWhere.orwhere.not) {
                optionWhere.orwhere.not.map(function (data) {
                    _this5.knex.orWhereNot(data[0], data[1]);
                });
            }

            if (optionWhere.orwhere.notin) {
                optionWhere.orwhere.notin.map(function (data) {
                    _this5.knex.orWhereNotIn(data[0], data[1]);
                });
            }

            if (optionWhere.orwhere.null) {
                optionWhere.orwhere.null.map(function (data) {
                    data.map(function (d) {
                        _this5.knex.orWhereNull(d);
                    });
                });
            }

            if (optionWhere.orwhere.notnull) {
                optionWhere.orwhere.notnull.map(function (data) {
                    data.map(function (d) {
                        _this5.knex.orWhereNotNull(d);
                    });
                });
            }

            if (optionWhere.orwhere.between) {
                optionWhere.orwhere.between.map(function (data) {
                    _this5.knex.orWhereBetween(data[0], data[1]);
                });
            }

            if (optionWhere.orwhere.notbetween) {
                optionWhere.orwhere.notbetween.map(function (data) {
                    _this5.knex.orWhereNotBetween(data[0], data[1]);
                });
            }
        }
        //if (optionWhere.where) this.knex.where(optionWhere.where);
        //if (optionWhere.whereNot) this.knex.whereNot(optionWhere.whereNot);
        //if (optionWhere.whereNotIn) this.knex.whereNotIn(optionWhere.whereNotIn);
        //if (optionWhere.whereNull) this.knex.whereNull(optionWhere.whereNull);
        //if (optionWhere.whereNotNull)  this.knex.whereNotNull(optionWhere.whereNotNull);
        //if (optionWhere.whereExists) this.knex.whereExists(optionWhere.whereExists);
        //if (optionWhere.whereNotExists) this.knex.whereNotExists(optionWhere.whereNotExists);
        //if (optionWhere.whereBetween) this.knex.whereBetween(optionWhere.whereBetween);
        //if (optionWhere.whereNotBetween)  this.knex.whereNotBetween(optionWhere.whereNotBetween);
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