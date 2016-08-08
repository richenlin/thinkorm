'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
            user: config.db_user || '',
            password: config.db_pwd || '',
            port: config.db_port || 27017,
            charset: config.db_charset || 'utf8',
            connectTimeoutMS: config.db_timeout || 30,
            logSql: config.db_ext_config.db_log_sql || false,
            maxPoolSize: config.db_ext_config.db_pool_size || 10,
            replicaSet: config.db_ext_config.db_replicaset || '',
            connect_url: config.db_ext_config.db_conn_url || ''
        };
    };

    _class.prototype.connect = function connect() {
        var _this2 = this;

        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        var driver = require('mongodb');

        //connection URL format
        if (ORM.isEmpty(this.config.connect_url)) {
            this.config.connect_url = 'mongodb://';
            if (!ORM.isEmpty(this.config.user)) {
                this.config.connect_url = '' + this.config.connect_url + this.config.user + ':' + this.config.password + '@';
            }
            //many hosts
            var hostStr = '';
            if (ORM.isArray(this.config.host)) {
                hostStr = this.config.host.map(function (item, i) {
                    return item + ':' + (_this2.config.port[i] || _this2.config.port[0]);
                }).join(',');
            } else {
                hostStr = this.config.host + ':' + this.config.port;
            }
            this.config.connect_url = '' + this.config.connect_url + hostStr + '/' + this.config.database;

            if (!ORM.isEmpty(this.config.maxPoolSize)) {
                this.config.connect_url = this.config.connect_url + '?maxPoolSize=' + this.config.maxPoolSize;
            }
            if (!ORM.isEmpty(this.config.connectTimeoutMS)) {
                this.config.connect_url = this.config.connect_url + '&connectTimeoutMS=' + this.config.connectTimeoutMS;
            }
            if (!ORM.isEmpty(this.config.replicaSet)) {
                this.config.connect_url = this.config.connect_url + '&replicaSet=' + this.config.replicaSet;
            }
        }

        return ORM.await(this.config.connect_url, function () {
            var fn = ORM.promisify(driver.MongoClient.connect, driver.MongoClient);
            return fn(_this2.config.connect_url, _this2.config).then(function (conn) {
                _this2.connection = conn;
                return conn;
            }).catch(function (err) {
                return _promise2.default.reject(err);
            });
        });
    };

    _class.prototype.query = function query(options) {
        var _this3 = this;

        var startTime = Date.now();
        var connection = void 0,
            handler = void 0,
            sql = void 0;
        return this.connect().then(function (conn) {
            connection = conn;
            sql = 'db.' + options.table;
            var col = connection.collection(options.table);
            switch (options.method) {
                case 'FIND':
                    sql = '' + sql + (options.where ? '.findOne(' + (0, _stringify2.default)(options.where) + ')' : '.findOne()');
                    handler = col.findOne(options.where || {});
                    break;
                case 'SELECT':
                    sql = '' + sql + (options.where ? '.find(' + (0, _stringify2.default)(options.where) + ')' : '.find()');
                    handler = col.find(options.where || {});
                    break;
                case 'COUNT':
                    sql = '' + sql + (options.where ? '.count(' + (0, _stringify2.default)(options.where) + ')' : '.count()');
                    handler = col.count(options.where || {});
                    break;
                case 'SUM':
                    break;
            }
            var caseList = { skip: true, limit: true, sort: true, project: true };
            for (var c in options) {
                if (caseList[c] && handler && handler[c]) {
                    sql = sql + '.' + c + '(' + options[c] + ')';
                    handler = handler[c](options[c]);
                }
            }
            if (options.method === 'SELECT') {
                return handler.toArray();
            } else {
                return handler;
            }
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            _this3.config.logSql && ORM.log(sql, 'MongoDB', startTime);
            return rows;
        }).catch(function (err) {
            return _promise2.default.reject(err);
        });
    };

    _class.prototype.execute = function execute(options, data) {
        var _this4 = this;

        var startTime = Date.now();
        var connection = void 0,
            handler = void 0,
            sql = void 0;
        return this.connect().then(function (conn) {
            connection = conn;
            sql = 'db.' + options.table;
            var col = connection.collection(options.table);
            switch (options.method) {
                case 'ADD':
                    sql = sql + '.insertOne(' + (0, _stringify2.default)(data) + ')';
                    handler = col.insertOne(data);
                    break;
                case 'ADDALL':
                    sql = sql + '.insertMany(' + (0, _stringify2.default)(data) + ')';
                    handler = col.insertMany(data);
                    break;
                case 'UPDATE':
                    sql = '' + sql + (options.where ? '.update(' + (0, _stringify2.default)(options.where) + ', {$set:' + (0, _stringify2.default)(data) + '}, false, true))' : '.update({}, {$set:' + (0, _stringify2.default)(data) + '})');
                    handler = col.updateMany(options.where || {}, data);
                    break;
                case 'DELETE':
                    sql = '' + sql + (options.where ? '.remove(' + (0, _stringify2.default)(options.where) + ')' : '.remove()');
                    handler = col.deleteMany(options.where || {});
                    break;
            }
            return handler;
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            _this4.config.logSql && ORM.log(sql, 'MongoDB', startTime);
            return rows;
        }).catch(function (err) {
            return _promise2.default.reject(err);
        });
    };

    _class.prototype.close = function close() {
        if (this.connection) {
            this.connection.close();
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