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

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 5432,
            encoding: config.db_charset || 'utf8',
            connectTimeout: config.db_timeout * 1000 || 10000, //try connection timeout
            poolSize: config.db_ext_config.db_pool_size || 10,
            db_ext_config: config.db_ext_config || {}
        };
        this.connection = null;
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        //use pool
        if (this.config.max) {
            _pg2.default.defaults.poolSize = this.config.poolSize;
        }
        //set poolIdleTimeout, change default `30 seconds` to 8 hours
        _pg2.default.defaults.poolIdleTimeout = 8 * 60 * 60 * 1000;

        var connectKey = 'postgres://' + this.config.user + ':' + this.config.password + '@' + this.config.host + ':' + this.config.port + '/' + this.config.database;
        if (this.config.db_ext_config.forceNewNum) {
            connectKey = connectKey + '_' + this.config.db_ext_config.forceNewNum;
        }
        return _lib2.default.await(connectKey, function () {
            var deferred = _lib2.default.getDefer();
            _pg2.default.connect(_this2.config, function (err, client, done) {
                if (err) {
                    _this2.close();
                    deferred.reject(err);
                } else {
                    _this2.connection = client;
                    _this2.connection.release = done;
                    deferred.resolve(_this2.connection);
                }
            });
            _pg2.default.on('error', function () {
                _this2.close();
                deferred.reject('DB connection error');
            });
            _pg2.default.on('end', function () {
                _this2.close();
                deferred.reject('DB connection end');
            });
            _pg2.default.on('close', function () {
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