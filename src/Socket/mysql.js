/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import lib from '../Util/lib';

export default class extends base{

    init(config = {}){
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3306,
            charset: config.db_charset || 'utf8',
            timeout: config.db_timeout || 30,
            connectionLimit: config.db_ext_config.db_pool_size || 10
        }
        //node-mysql2 not support utf8 or utf-8
        let charset = (this.config.charset || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }
        this.connection = null;
    }

    connect(){
        if(this.connection){
            return Promise.resolve(this.connection);
        }
        //use pool
        let driver = require('mysql');
        if(this.config.connectionLimit){
            this.connection = driver.createPool(this.config);
            return Promise.resolve(this.connection);
        }

        let connectKey = `mysql://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        return lib.await(connectKey, () => {
            let deferred = lib.getDefer();
            let connection = driver.createConnection(this.config);
            connection.connect(err => {
                if(err){
                    this.close();
                    deferred.reject(err);
                } else {
                    deferred.resolve(connection);
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
            this.connection = connection;
            if (this.deferred) {
                this.deferred.reject(new Error('DB connection closed'));
            }
            this.deferred = deferred;
            return this.deferred.promise;
        });
    }

    close(){
        if(this.pool){
            let fn = lib.promisify(this.pool.end, this.pool);
            return fn().then(() => this.pool = null);
        } else {
            let fn = lib.promisify(this.connection.end, this.connection);
            return fn().then(() => this.connection = null);
        }
    }
}
