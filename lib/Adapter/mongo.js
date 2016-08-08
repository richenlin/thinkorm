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

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _mongo = require('../Parser/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

var _mongo3 = require('../Socket/mongo');

var _mongo4 = _interopRequireDefault(_mongo3);

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

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mongo4.default(this.config);
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    _class.prototype.parsers = function parsers() {
        if (!this.parsercls) {
            this.parsercls = new _mongo2.default(this.config);
        }
        return this.parsercls;
    };

    _class.prototype.schema = function schema() {}
    //自动创建表\更新表\迁移数据


    /**
     *
     * @param sql
     */
    ;

    _class.prototype.query = function query(options) {
        var _this2 = this;

        return this.connect().query(options).then(function (data) {
            return _this2.parsers().bufferToString(data);
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.execute = function execute(options, data) {
        return this.connect().execute(options, data).then(function (data) {
            var result = 0;
            switch (options.method) {
                case 'ADD':
                    result = data.insertedId;
                    break;
                case 'ADDALL':
                    result = data.insertedCount;
                    break;
                case 'UPDATE':
                    result = data.modifiedCount;
                    break;
                case 'DELETE':
                    result = data.deletedCount;
                    break;
            }
            return result || null;
        });
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function add(data, options) {
        var _this3 = this;

        options.method = 'ADD';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this3.execute(sql, data);
        }).then(function (data) {
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
        var _this4 = this;

        options.method = 'ADDALL';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this4.execute(sql, data);
        }).then(function (data) {
            return data;
        });
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete(options) {
        var _this5 = this;

        options.method = 'DELETE';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this5.execute(sql);
        }).then(function (data) {
            return data;
        });
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function update(data, options) {
        var _this6 = this;

        options.method = 'UPDATE';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this6.execute(sql, data);
        }).then(function (data) {
            return data;
        });
    };

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(field, options) {
        var _this7 = this;

        options.method = 'COUNT';
        options.count = field;
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(function (sql) {
            return _this7.query(sql);
        }).then(function (data) {
            return ORM.isEmpty(data) ? 0 : data || 0;
        });
    };

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function sum(field, options) {
        options.method = 'SUM';
        options.sum = field;
        options.limit = [0, 1];
        //未实现
        return _promise2.default.reject('not support');
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function find(options) {
        var _this8 = this;

        options.method = 'FIND';
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(function (sql) {
            return _this8.query(sql);
        }).then(function (data) {
            return ORM.isEmpty(data) ? {} : data || {};
        });
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function select(options) {
        var _this9 = this;

        options.method = 'SELECT';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this9.query(sql);
        }).then(function (data) {
            return ORM.isEmpty(data) ? [] : data || [];
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