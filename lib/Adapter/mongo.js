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

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _mongo = require('../Parser/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

var _mongo3 = require('../Socket/mongo');

var _mongo4 = _interopRequireDefault(_mongo3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
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
        this.logSql = config.db_ext_config.db_log_sql || false;

        this.handel = null;
        this.parsercls = null;
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mongo4.default(this.config).connect();
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    _class.prototype.parsers = function parsers() {
        if (this.parsercls) {
            return this.parsercls;
        }
        this.parsercls = new _mongo2.default(this.config);
        return this.parsercls;
    };

    /**
     * 数据迁移
     */


    _class.prototype.migrate = function migrate() {
        return;
    };

    /**
     *
     */


    _class.prototype.startTrans = function startTrans() {
        _lib2.default.log('Adapter is not support.', 'WARNING');
        return;
    };

    /**
     *
     */


    _class.prototype.commit = function commit() {
        _lib2.default.log('Adapter is not support.', 'WARNING');
        return;
    };

    /**
     *
     */


    _class.prototype.rollback = function rollback() {
        _lib2.default.log('Adapter is not support.', 'WARNING');
        return;
    };

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */


    _class.prototype.query = function query(cls, startTime) {
        var _this2 = this;

        startTime = startTime || Date.now();
        if (!cls.col) {
            this.logSql && _lib2.default.log(cls.sql, 'MongoDB', startTime);
            return _promise2.default.reject('Analytic result is empty');
        }
        return cls.col.then(function (data) {
            _this2.logSql && _lib2.default.log(cls.sql, 'MongoDB', startTime);
            return _this2.bufferToString(data);
        }).catch(function (err) {
            _this2.logSql && _lib2.default.log(cls.sql, 'MongoDB', startTime);
            return _promise2.default.reject(err);
        });
    };

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */


    _class.prototype.execute = function execute(cls, startTime) {
        return this.query(cls, startTime);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function add(data) {
        var _this3 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'ADD';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this3.parsers().buildSql(conn, data, options);
        }).then(function (res) {
            return _this3.execute(res, startTime);
        }).then(function (data) {
            return data.insertedId || 0;
        });
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete() {
        var _this4 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'DELETE';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this4.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this4.execute(res, startTime);
        }).then(function (data) {
            return data.deletedCount || 0;
        });
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function update(data) {
        var _this5 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'UPDATE';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this5.parsers().buildSql(conn, data, options);
        }).then(function (res) {
            return _this5.execute(res, startTime);
        }).then(function (data) {
            return data.modifiedCount || 0;
        });
    };

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(field) {
        var _this6 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'COUNT';
        options.count = field;
        options.limit = [0, 1];
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this6.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this6.query(res, startTime);
        }).then(function (data) {
            if (_lib2.default.isArray(data)) {
                if (data[0]) {
                    return data[0]['count'] ? data[0]['count'] || 0 : 0;
                } else {
                    return 0;
                }
            } else {
                return data['count'] || 0;
            }
        });
    };

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function sum(field) {
        var _this7 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'SUM';
        options.sum = field;
        options.limit = [0, 1];
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this7.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this7.query(res, startTime);
        }).then(function (data) {
            if (_lib2.default.isArray(data)) {
                if (data[0]) {
                    return data[0]['sum'] ? data[0]['sum'] || 0 : 0;
                } else {
                    return 0;
                }
            } else {
                return data['sum'] || 0;
            }
        });
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function find() {
        var _this8 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'FIND';
        options.limit = [0, 1];
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this8.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this8.query(res, startTime);
        });
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function select() {
        var _this9 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'SELECT';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this9.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this9.query(res, startTime);
        });
    };

    /**
     *
     * @param data
     * @returns {*}
     */


    _class.prototype.bufferToString = function bufferToString(data) {
        if (!this.config.buffer_tostring || !_lib2.default.isArray(data)) {
            return data;
        }
        for (var i = 0, length = data.length; i < length; i++) {
            for (var key in data[i]) {
                if (_lib2.default.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    };

    return _class;
}(_base3.default);

exports.default = _class;