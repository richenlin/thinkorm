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

        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3306,
            encoding: config.db_charset || 'utf8',
            connectTimeout: config.db_timeout * 1000 || 10000, //try connection timeout
            connectionLimit: config.db_ext_config.db_pool_size || 10
        };
        //node-mysql2 not support utf8 or utf-8
        var charset = (this.config.encoding || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }
        this.connection = null;
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }
        //use pool
        var driver = require('mysql');
        if (this.config.connectionLimit) {
            this.connection = driver.createPool(this.config);
            return _promise2.default.resolve(this.connection);
        }

        var connectKey = 'mysql://' + this.config.user + ':' + this.config.password + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
        return _lib2.default.await(connectKey, function () {
            var deferred = _lib2.default.getDefer();
            var connection = driver.createConnection(_this2.config);
            connection.connect(function (err) {
                if (err) {
                    _this2.close();
                    deferred.reject(err);
                } else {
                    deferred.resolve(connection);
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

    _class.prototype.close = function close() {
        var _this3 = this;

        if (this.pool) {
            var fn = _lib2.default.promisify(this.pool.end, this.pool);
            return fn().then(function () {
                return _this3.pool = null;
            });
        } else {
            var _fn = _lib2.default.promisify(this.connection.end, this.connection);
            return _fn().then(function () {
                return _this3.connection = null;
            });
        }
    };

    return _class;
}(_base3.default);

exports.default = _class;