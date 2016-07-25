/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';

export default class extends base{
    init(config = {}){
        super.init(config);
        this.config = {
            database: config.db_name,
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_pwd || '',
            port: config.db_port || 3306,
            charset: config.db_charset || 'utf8',
            timeout: config.db_timeout || 30,
            logSql: config.db_log_sql || false,
            connectionLimit: config.db_pool_size || 10
        }
        //node-mysql2 not support utf8 or utf-8
        let charset = (this.config.charset || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }
    }

    connect(){
        if(this.connection){
            return this.connection;
        }

        let driver = require('mysql2');
        //use pool
        if(this.config.connectionLimit){
            this.pool = driver.createPool(this.config);
        }
        if(this.pool){
            let fn = ORM.promisify(this.pool.getConnection, this.pool);
            return fn().then(conn => {
                this.connection = conn;
                return this.connection;
            }).catch(err => {
                this.close();
                return Promise.reject(err);
            });
        }
        let connectKey = `mysql://${this.config.user}:${this.config.password}@${this.config.host}:${this.config.port}/${this.config.database}`;
        return ORM.await(connectKey, () => {
            let deferred = ORM.getDefer();
            let connection = driver.createConnection(this.config);
            connection.connect(err => {
                if(err){
                    this.close();
                    deferred.reject(err);
                } else {
                    deferred.resolve();
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

    query(sql){
        //query timeout
        this.closeTimer = setTimeout(() => {
            this.close();
            return Promise.reject('query time out');
        }, this.config.timeout);

        let startTime = Date.now();
        let connection;
        return this.connect().then(conn => {
            connection = conn;
            let fn = ORM.promisify(connection.query, connection);
            return fn(sql);
        }).then((rows = []) => {
            (this.pool && connection.release) && connection.release();
            this.config.logSql && ORM.log(sql, 'MYSQL', startTime);
            return rows;
        }).catch(err => {
            this.close();
            return Promise.reject(err);
        });
    }

    execute(sql){
        return this.query(sql);
    }

    close(){
        clearTimeout(this.closeTimer);
        if(this.pool){
            let fn = ORM.promisify(this.pool.end, this.pool);
            return fn().then(() => this.pool = null);
        } else {
            let fn = ORM.promisify(this.connection.end, this.connection);
            return fn().then(() => this.connection = null);
        }
    }
}
