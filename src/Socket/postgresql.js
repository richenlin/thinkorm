/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';

export default class extends base{

    init(config = {}){
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 5432,
            charset: config.db_charset || 'utf8',
            idleTimeoutMillis: config.db_timeout * 1000 || 8 * 60 * 60 * 1000,
            max: config.db_ext_config.db_pool_size || 10
        }
        this.connection = null;
    }

    connect(){
        if(this.connection){
            return Promise.resolve(this.connection);
        }

        let driver = require('pg');
        //use pool
        if(this.config.max){
            driver.defaults.poolSize = this.config.poolSize;
        }
        driver.defaults.poolIdleTimeout = this.config.poolIdleTimeout;
        let connectKey = `postgres://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        return ORM.await(connectKey, () => {
            let deferred = ORM.getDefer();
            let connection = driver;
            connection.connect(this.config, (err, client, done) => {
                if(err){
                    this.close();
                    deferred.reject(err);
                } else {
                    this.connection = client;
                    this.connection.release = done;
                    deferred.resolve(this.connection);
                }
            });
            connection.on('error', () => {
                this.close();
                deferred.reject('DB connection error');
            })
            connection.on('end', () => {
                this.close();
                deferred.reject('DB connection end');
            })
            connection.on('close', () => {
                this.close();
                deferred.reject('DB connection close');
            })
            if (this.deferred) {
                this.deferred.reject(new Error('DB connection closed'));
            }
            this.deferred = deferred;
            return this.deferred.promise;
        });
    }

    close(){
        if(this.connection){
            this.connection.end();
            this.connection = null;
        }
    }
}
