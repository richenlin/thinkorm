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
            user: config.db_user || '',
            password: config.db_pwd || '',
            port: config.db_port || 27017,
            charset: config.db_charset || 'utf8',
            connectTimeoutMS: config.db_timeout || 30,
            logSql: config.db_ext_config.db_log_sql || false,
            maxPoolSize: config.db_ext_config.db_pool_size || 10,
            replicaSet: config.db_ext_config.db_replicaset || '',
            connect_url: config.db_ext_config.db_conn_url || ''
        }

    }

    connect(){
        if(this.connection){
            return Promise.resolve(this.connection);
        }

        let driver = require('mongodb');

        //connection URL format
        if(ORM.isEmpty(this.config.connect_url)){
            this.config.connect_url = 'mongodb://';
            if(!ORM.isEmpty(this.config.user)){
                this.config.connect_url = `${this.config.connect_url}${this.config.user}:${this.config.password}@`;
            }
            //many hosts
            let hostStr = '';
            if(ORM.isArray(this.config.host)){
                hostStr = this.config.host.map((item, i) => {
                    return item + ':' + (this.config.port[i] || this.config.port[0]);
                }).join(',');
            }else{
                hostStr = this.config.host + ':' + this.config.port;
            }
            this.config.connect_url = `${this.config.connect_url}${hostStr}/${this.config.database}`;

            if(!ORM.isEmpty(this.config.maxPoolSize)){
                this.config.connect_url = `${this.config.connect_url}?maxPoolSize=${this.config.maxPoolSize}`;
            }
            if(!ORM.isEmpty(this.config.connectTimeoutMS)){
                this.config.connect_url = `${this.config.connect_url}&connectTimeoutMS=${this.config.connectTimeoutMS}`;
            }
            if(!ORM.isEmpty(this.config.replicaSet)){
                this.config.connect_url = `${this.config.connect_url}&replicaSet=${this.config.replicaSet}`;
            }
        }

        return ORM.await(this.config.connect_url, () => {
            let fn = ORM.promisify(driver.MongoClient.connect, driver.MongoClient);
            return fn(this.config.connect_url, this.config).then(conn => {
                this.connection = conn;
                return conn;
            }).catch(err => {
                return Promise.reject(err);
            })
        });
    }

    query(options){
        let startTime = Date.now();
        let connection, handler, sql;
        return this.connect().then(conn => {
            connection = conn;
            sql = `db.${options.table}`;
            let col = connection.collection(options.table);
            switch (options.method){
                case 'FIND':
                    sql = `${sql}${options.where ? '.findOne('+ JSON.stringify(options.where) +')' : '.findOne()'}`;
                    handler = col.findOne(options.where || {});
                    break;
                case 'SELECT':
                    sql = `${sql}${options.where ? '.find('+ JSON.stringify(options.where) +')' : '.find()'}`;
                    handler = col.find(options.where || {});
                    break;
                case 'COUNT':
                    sql = `${sql}${options.where ? '.count('+ JSON.stringify(options.where) +')' : '.count()'}`;
                    handler = col.count(options.where || {});
                    break;
                case 'SUM':
                    break;
            }
            let caseList = {skip: true, limit: true, sort: true, project: true};
            for(let c in options){
                if(caseList[c] && handler && handler[c]){
                    sql = `${sql}.${c}(${options[c]})`;
                    handler = handler[c](options[c]);
                }
            }
            if(options.method === 'SELECT'){
                return handler.toArray();
            } else {
                return handler;
            }
        }).then((rows = []) => {
            this.config.logSql && ORM.log(sql, 'MongoDB', startTime);
            return rows;
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    execute(options, data){
        let startTime = Date.now();
        let connection, handler, sql;
        return this.connect().then(conn => {
            connection = conn;
            sql = `db.${options.table}`;
            let col = connection.collection(options.table);
            switch (options.method){
                case 'ADD':
                    sql = `${sql}.insertOne(${JSON.stringify(data)})`;
                    handler = col.insertOne(data);
                    break;
                case 'ADDALL':
                    sql = `${sql}.insertMany(${JSON.stringify(data)})`;
                    handler = col.insertMany(data);
                    break;
                case 'UPDATE':
                    sql = `${sql}${options.where ? '.update('+ JSON.stringify(options.where) +', {$set:'+JSON.stringify(data)+'}, false, true))' : '.update({}, {$set:'+JSON.stringify(data)+'})'}`;
                    handler = col.updateMany(options.where || {}, data);
                    break;
                case 'DELETE':
                    sql = `${sql}${options.where ? '.remove('+ JSON.stringify(options.where) +')' : '.remove()'}`;
                    handler = col.deleteMany(options.where || {});
                    break;
            }
            return handler;
        }).then((rows = []) => {
            this.config.logSql && ORM.log(sql, 'MongoDB', startTime);
            return rows;
        }).catch(err => {
            return Promise.reject(err);
        });
    }

    close(){
        if(this.connection){
            this.connection.close();
            this.connection = null;
        }
    }
}
