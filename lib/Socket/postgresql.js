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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 5432,
            charset: config.db_charset || 'utf8',
            idleTimeoutMillis: config.db_timeout * 1000 || 8 * 60 * 60 * 1000,
            logSql: config.db_ext_config.db_log_sql || false,
            max: config.db_ext_config.db_pool_size || 10
        };
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        var driver = require('pg');
        //use pool
        if (this.config.max) {
            driver.defaults.poolSize = this.config.poolSize;
        }
        driver.defaults.poolIdleTimeout = this.config.poolIdleTimeout;
        var connectKey = 'postgres://' + this.config.user + ':' + this.config.password + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
        return ORM.await(connectKey, function () {
            var deferred = ORM.getDefer();
            var connection = driver;
            connection.connect(_this2.config, function (err, client, done) {
                if (err) {
                    _this2.close();
                    deferred.reject(err);
                } else {
                    _this2.release = done;
                    _this2.connection = client;
                    deferred.resolve(client);
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
            connection.on('close', function () {
                _this2.close();
                deferred.reject('DB connection close');
            });
            if (_this2.deferred) {
                _this2.deferred.reject(new Error('DB connection closed'));
            }
            _this2.deferred = deferred;
            return _this2.deferred.promise;
        });
    };

    _class.prototype.query = function query(sql) {
        var _this3 = this;

        var startTime = Date.now();
        var connection = void 0;
        return this.connect().then(function (conn) {
            connection = conn;
            var fn = ORM.promisify(connection.query, connection);
            return fn(sql);
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            _this3.release && _this3.release();
            _this3.config.logSql && ORM.log(sql, 'MYSQL', startTime);
            return rows;
        }).catch(function (err) {
            _this3.release();
            //when socket is closed, try it
            if (err.code === 'EPIPE') {
                _this3.close();
                return _this3.query(sql);
            }
            return _promise2.default.reject(err);
        });
    };

    _class.prototype.execute = function execute(sql) {
        return this.query(sql);
    };

    _class.prototype.close = function close() {
        if (this.connection) {
            this.connection.end();
            this.connection = null;
        }
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