/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import lib from '../Util/lib';
import pg from 'pg';

export default class extends base {
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
            return Promise.resolve(this.connection);
        }

        //use pool
        if (this.config.max) {
            pg.defaults.poolSize = this.config.poolSize;
        }
        //set poolIdleTimeout, change default `30 seconds` to 8 hours
        pg.defaults.poolIdleTimeout = 8 * 60 * 60 * 1000;

        let connectKey = `postgres://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        if (this.config.db_ext_config.forceNewNum) {
            connectKey = `${connectKey}_${this.config.db_ext_config.forceNewNum}`;
        }
        return lib.await(connectKey, () => {
            let deferred = lib.getDefer();
            pg.connect(this.config, (err, client, done) => {
                if (err) {
                    this.close();
                    deferred.reject(err);
                } else {
                    this.connection = client;
                    this.connection.release = done;
                    deferred.resolve(this.connection);
                }
            });
            pg.on('error', () => {
                this.close();
                deferred.reject('DB connection error');
            });
            pg.on('end', () => {
                this.close();
                deferred.reject('DB connection end');
            });
            pg.on('close', () => {
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
}
