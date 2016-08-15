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
            port: config.db_port || 3306,
            charset: config.db_charset || 'utf8',
            timeout: config.db_timeout || 30,
            logSql: config.db_ext_config.db_log_sql || false,
            connectionLimit: config.db_ext_config.db_pool_size || 10
        }
        //node-mysql2 not support utf8 or utf-8
        let charset = (this.config.charset || '').toLowerCase();
        if (charset === 'utf8' || charset === 'utf-8') {
            this.config.charset = 'UTF8_GENERAL_CI';
        }
        this.pool = null;
        this.connection = null;
    }

    connect(){
        if(this.connection){
            return Promise.resolve(this.connection);
        }
        //use pool
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

        let driver = require('mysql');
        if(this.config.connectionLimit){
            this.pool = driver.createPool(this.config);
            return this.connect();
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
        let startTime = Date.now();
        let connection;
        return this.connect().then(conn => {
            connection = conn;
            let fn = ORM.promisify(connection.query, connection);
            return fn(sql);
        }).then((rows = []) => {
            (this.pool && connection.release) && connection.release();
            this.config.logSql && ORM.log(sql, 'MySQL', startTime);
            return rows;
        }).catch(err => {
            (this.pool && connection.release) && connection.release();
            //when socket is closed, try it
            if(err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'EPIPE'){
                return this.close().then(() => {
                    return this.query(sql);
                });
            }
            this.config.logSql && ORM.log(sql, 'MySQL', startTime);
            return Promise.reject(err);
        });
    }

    execute(sql){
        return this.query(sql);
    }

    close(){
        if(this.pool){
            let fn = ORM.promisify(this.pool.end, this.pool);
            return fn().then(() => this.pool = null);
        } else {
            let fn = ORM.promisify(this.connection.end, this.connection);
            return fn().then(() => this.connection = null);
        }
    }
}
