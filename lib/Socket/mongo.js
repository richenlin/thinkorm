'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _mongodb = require('mongodb');

var _mongodb2 = _interopRequireDefault(_mongodb);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _base2.default {
    init(config = {}) {
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || '',
            password: config.db_pwd || '',
            port: config.db_port || 27017,
            encoding: config.db_charset || 'utf8',
            reconnectTries: config.db_timeout * 1000 || 10000, //try connection timeout
            poolSize: config.db_ext_config.db_pool_size || 10,
            replicaSet: config.db_ext_config.db_replicaset || '',
            connect_url: config.db_ext_config.db_conn_url || '',
            db_ext_config: config.db_ext_config || {}
        };
        this.connection = null;
    }

    connect() {
        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        //connection URL format
        if (_lib2.default.isEmpty(this.config.connect_url)) {
            this.config.connect_url = 'mongodb://';
            if (!_lib2.default.isEmpty(this.config.user)) {
                this.config.connect_url = `${this.config.connect_url}${this.config.user}:${this.config.password}@`;
            }
            //many hosts
            let hostStr = '';
            if (_lib2.default.isArray(this.config.host)) {
                hostStr = this.config.host.map((item, i) => {
                    return item + ':' + (this.config.port[i] || this.config.port[0]);
                }).join(',');
            } else {
                hostStr = this.config.host + ':' + this.config.port;
            }
            this.config.connect_url = `${this.config.connect_url}${hostStr}/${this.config.database}`;

            if (!_lib2.default.isEmpty(this.config.maxPoolSize)) {
                this.config.connect_url = `${this.config.connect_url}?maxPoolSize=${this.config.maxPoolSize}`;
            }
            if (!_lib2.default.isEmpty(this.config.connectTimeoutMS)) {
                this.config.connect_url = `${this.config.connect_url}&connectTimeoutMS=${this.config.connectTimeoutMS}`;
            }
            if (!_lib2.default.isEmpty(this.config.replicaSet)) {
                this.config.connect_url = `${this.config.connect_url}&replicaSet=${this.config.replicaSet}`;
            }
        }

        let connectKey = `mongodb://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        if (this.config.db_ext_config.forceNewNum) {
            connectKey = `${connectKey}_${this.config.db_ext_config.forceNewNum}`;
        }
        return _lib2.default.await(connectKey, () => {
            let fn = _lib2.default.promisify(_mongodb2.default.MongoClient.connect, _mongodb2.default.MongoClient);
            return fn(this.config.connect_url).then(conn => {
                this.connection = conn;
                return conn;
            }).catch(err => {
                return _promise2.default.reject(err);
            });
        });
    }

    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    16/7/25
    */