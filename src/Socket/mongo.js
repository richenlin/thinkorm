/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
const base = require('../base');
const lib = require('../Util/lib');
const schema = require('../schema');
const awaitjs = require('../Util/await');
const mongodb = require('mongodb');

module.exports = class extends base {
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
            return Promise.resolve(this.connection);
        }

        //connection URL format
        if (lib.isEmpty(this.config.connect_url)) {
            this.config.connect_url = 'mongodb://';
            if (!lib.isEmpty(this.config.user)) {
                this.config.connect_url = `${this.config.connect_url}${this.config.user}:${this.config.password}@`;
            }
            //many hosts
            let hostStr = '';
            if (lib.isArray(this.config.host)) {
                hostStr = this.config.host.map((item, i) => {
                    return item + ':' + (this.config.port[i] || this.config.port[0]);
                }).join(',');
            } else {
                hostStr = this.config.host + ':' + this.config.port;
            }
            this.config.connect_url = `${this.config.connect_url}${hostStr}/${this.config.database}`;

            if (!lib.isEmpty(this.config.maxPoolSize)) {
                this.config.connect_url = `${this.config.connect_url}?maxPoolSize=${this.config.maxPoolSize}`;
            }
            if (!lib.isEmpty(this.config.connectTimeoutMS)) {
                this.config.connect_url = `${this.config.connect_url}&connectTimeoutMS=${this.config.connectTimeoutMS}`;
            }
            if (!lib.isEmpty(this.config.replicaSet)) {
                this.config.connect_url = `${this.config.connect_url}&replicaSet=${this.config.replicaSet}`;
            }
        }

        let connectKey = `mongodb://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        if (this.config.db_ext_config.forceNewNum) {
            connectKey = `${connectKey}_${this.config.db_ext_config.forceNewNum}`;
        }

        if (!schema.connections) {
            schema.connections = new awaitjs();
        }
        return schema.connections.run(connectKey, () => {
            let fn = lib.promisify(mongodb.MongoClient.connect, mongodb.MongoClient);
            return fn(this.config.connect_url).then(conn => {
                this.connection = conn;
                return conn;
            }).catch(err => {
                return Promise.reject(err);
            });
        });
    }

    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
};
