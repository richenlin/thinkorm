'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _base2.default {
    init(config = {}) {
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
    }

    connect() {
        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        //use pool
        if (this.config.max) {
            _pg2.default.defaults.poolSize = this.config.poolSize;
        }
        //set poolIdleTimeout, change default `30 seconds` to 8 hours
        _pg2.default.defaults.poolIdleTimeout = 8 * 60 * 60 * 1000;

        let connectKey = `postgres://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        if (this.config.db_ext_config.forceNewNum) {
            connectKey = `${connectKey}_${this.config.db_ext_config.forceNewNum}`;
        }
        return _lib2.default.await(connectKey, () => {
            let deferred = _lib2.default.getDefer();
            _pg2.default.connect(this.config, (err, client, done) => {
                if (err) {
                    this.close();
                    deferred.reject(err);
                } else {
                    this.connection = client;
                    this.connection.release = done;
                    deferred.resolve(this.connection);
                }
            });
            _pg2.default.on('error', () => {
                this.close();
                deferred.reject('DB connection error');
            });
            _pg2.default.on('end', () => {
                this.close();
                deferred.reject('DB connection end');
            });
            _pg2.default.on('close', () => {
                this.close();
                deferred.reject('DB connection close');
            });
            if (this.deferred) {
                this.deferred.reject(new Error('DB connection closed'));
            }
            this.deferred = deferred;
            return this.deferred.promise;
        });
    }

    close() {
        if (this.connection) {
            this.connection.end();
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