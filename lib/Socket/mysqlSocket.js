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

var _Base2 = require('../Base');

var _Base3 = _interopRequireDefault(_Base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_Base) {
    (0, _inherits3.default)(_class, _Base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _Base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _Base.prototype.init.call(this, config);
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3006,
            charset: config.db_charset || 'utf8',
            connectionLimit: config.poolsize || 10
        };

        var charset = (this.config.charset || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        var driver = require('mysql2');
        //use pool
        if (this.config.connectionLimit) {
            this.pool = driver.createPool(this.config);
        }
        if (this.pool) {
            var fn = ORM.promisify(this.pool.getConnection, this.pool);
            return fn().then(function (conn) {
                _this2.connection = conn;
                return _this2.connection;
            }).catch(function (err) {
                _this2.close();
                return _promise2.default.reject(err);
            });
        }
        var connectKey = 'mysql://' + this.config.user + ':' + this.config.password + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
        return ORM.await(connectKey, function () {
            var deferred = ORM.getDefer();
            var connection = driver.createConnection(_this2.config);
            connection.connect(function (err) {
                if (err) {
                    _this2.close();
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });
            connection.on('error', function () {
                _this2.close();
                deferred.reject('DB connection error');
            });
            connection.on('end', function () {
                _this2.close();
                deferred.reject('DB connection end');
            });
            _this2.connection = connection;
            if (_this2.deferred) {
                _this2.deferred.reject(new Error('DB connection closed'));
            }
            _this2.deferred = deferred;
            return _this2.deferred.promise;
        });
    };

    _class.prototype.query = function query(sql) {
        var _this3 = this;

        console.log(sql);
        var startTime = Date.now();
        var connection = void 0;
        return this.connect().then(function (conn) {
            connection = conn;
            var fn = ORM.promisify(connection.query, connection);
            return fn(sql);
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            _this3.pool && connection.release && connection.release();
            _this3.config.logSql && ORM.log(sql, 'MYSQL', startTime);
            return rows;
        }).catch(function (err) {
            _this3.close();
            return _promise2.default.reject(err);
        });
    };

    _class.prototype.execute = function execute(sql) {
        return this.query(sql);
    };

    _class.prototype.close = function close() {
        var _this4 = this;

        if (this.pool) {
            var fn = ORM.promisify(this.pool.end, this.pool);
            return fn().then(function () {
                return _this4.pool = null;
            });
        } else {
            var _fn = ORM.promisify(this.connection.end, this.connection);
            return _fn().then(function () {
                return _this4.connection = null;
            });
        }
    };

    return _class;
}(_Base3.default); /**
                    * 数据库实例,真是操作数据库
                    * Created by lihao on 16/7/26.
                    */


exports.default = _class;