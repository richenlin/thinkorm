'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

    _class.prototype.query = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options, data) {
            var col, handler, caselist, c;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 3;
                            return this.connect();

                        case 3:
                            col = this.connection.collection(options.table), handler = void 0, caselist = void 0;
                            _context.t0 = options.type;
                            _context.next = _context.t0 === 'select' ? 7 : _context.t0 === 'SELECT' ? 7 : _context.t0 === 'find' ? 12 : _context.t0 === 'FIND' ? 12 : _context.t0 === 'add' ? 15 : _context.t0 === 'ADD' ? 15 : _context.t0 === 'addall' ? 17 : _context.t0 === 'ADDALL' ? 17 : _context.t0 === 'update' ? 19 : _context.t0 === 'UPDATE' ? 19 : _context.t0 === 'delete' ? 21 : _context.t0 === 'DELETE' ? 21 : 23;
                            break;

                        case 7:
                            //col.find().project({name:1}).toArray(function(err, docs){
                            //    console.log(docs)
                            //})
                            handler = col.find(options.where);
                            caselist = { skip: true, limit: true, sort: true, project: true };
                            for (c in options) {
                                if (caselist[c]) {
                                    handler[c](options[c]);
                                }
                            }
                            return _context.abrupt('return', handler.toArray());

                        case 12:
                            handler = col.findOne(options.where);
                            return _context.abrupt('return', handler.toArray());

                        case 15:
                            return _context.abrupt('return', col.insertOne(data));

                        case 17:
                            return _context.abrupt('return', col.insertMany(data));

                        case 19:
                            return _context.abrupt('return', col.updateMany(options.where, data));

                        case 21:
                            return _context.abrupt('return', col.deleteMany(options.where || {}));

                        case 23:
                            _context.next = 28;
                            break;

                        case 25:
                            _context.prev = 25;
                            _context.t1 = _context['catch'](0);

                            console.log(_context.t1.stack);

                        case 28:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 25]]);
        }));

        function query(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return query;
    }();

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