'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _mysql = require('../Parser/mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _mysql3 = require('../Socket/mysql');

var _mysql4 = _interopRequireDefault(_mysql3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _base.prototype.init.call(this, config);
        this.parser = new _mysql2.default(config);
        //此Adapter特有的方法定义,例如mysql中可以使用startTrans,而mongo不行
        this.methods = {
            startTrans: this.startTrans,
            commit: this.commit,
            rollback: this.rollback
        };
        //保存传入的操作条件
        this._options = {};
        this.transTimes = 0; //transaction times
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mysql4.default(this.config);
        return this.handel;
    };

    _class.prototype.schema = function schema() {}
    //自动创建表\更新表\迁移数据


    /**
     *
     * @param sql
     */
    ;

    _class.prototype.query = function query(sql) {
        var _this2 = this;

        return this.connect().query(sql).then(function (data) {
            return _this2.parser.bufferToString(data);
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.execute = function execute(sql) {
        var _this3 = this;

        return this.connect().execute(sql).then(function (data) {
            if (data.insertId) {
                _this3.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.startTrans = function startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('START TRANSACTION');
        }
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.commit = function commit() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return _promise2.default.resolve();
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.rollback = function rollback() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return _promise2.default.resolve();
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function add(data, options) {
        var _this4 = this;

        options.method = 'INSERT';
        return this.parser.buildSql(data, options).then(function (sql) {
            return _this4.execute(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype.addAll = function addAll(data, options) {
        options.method = 'INSERT';
    };

    /**
     * 查询后新增
     * @param data
     * @param options
     */


    _class.prototype.thenAdd = function thenAdd(data, options) {
        var _this5 = this;

        options.method = 'INSERT';
        if (ORM.isEmpty(options.where)) {
            return this.add(data, options);
        } else {
            return this.find(options).then(function (result) {
                if (ORM.isEmpty(result)) {
                    return _this5.add(data, options);
                } else {
                    return _promise2.default.reject('Data record is exists.');
                }
            });
        }
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete(options) {
        var _this6 = this;

        options.method = 'DELETE';
        return this.parser.buildSql(data, options).then(function (sql) {
            return _this6.execute(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function update(data, options) {
        var _this7 = this;

        options.method = 'UPDATE';
        return this.parser.buildSql(data, options).then(function (sql) {
            return _this7.execute(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 查询数据条数
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(options) {
        var _this8 = this;

        options.method = 'SELECT';
        options.count = options.field || '*';
        return this.parser.buildSql(options).then(function (sql) {
            return _this8.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 统计数据数量和
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function sum(options) {
        var _this9 = this;

        options.method = 'SELECT';
        options.sum = options.field || '*';
        return this.parser.buildSql(options).then(function (sql) {
            return _this9.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function find(options) {
        var _this10 = this;

        options.method = 'SELECT';
        options.limit = 1;
        return this.parser.buildSql(options).then(function (sql) {
            return _this10.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function select(options) {
        var _this11 = this;

        options.method = 'SELECT';
        return this.parser.buildSql(options).then(function (sql) {
            return _this11.query(sql);
        }).then(function (data) {
            //
            return data;
        });
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