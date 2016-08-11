/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';

export default class extends base {

    init(config = {}) {
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

    connect() {
        if (this.connection) {
            return Promise.resolve(this.connection);
        }

        let driver = require('mongodb');

        //connection URL format
        if (ORM.isEmpty(this.config.connect_url)) {
            this.config.connect_url = 'mongodb://';
            if (!ORM.isEmpty(this.config.user)) {
                this.config.connect_url = `${this.config.connect_url}${this.config.user}:${this.config.password}@`;
            }
            //many hosts
            let hostStr = '';
            if (ORM.isArray(this.config.host)) {
                hostStr = this.config.host.map((item, i) => {
                    return item + ':' + (this.config.port[i] || this.config.port[0]);
                }).join(',');
            } else {
                hostStr = this.config.host + ':' + this.config.port;
            }
            this.config.connect_url = `${this.config.connect_url}${hostStr}/${this.config.database}`;

            if (!ORM.isEmpty(this.config.maxPoolSize)) {
                this.config.connect_url = `${this.config.connect_url}?maxPoolSize=${this.config.maxPoolSize}`;
            }
            if (!ORM.isEmpty(this.config.connectTimeoutMS)) {
                this.config.connect_url = `${this.config.connect_url}&connectTimeoutMS=${this.config.connectTimeoutMS}`;
            }
            if (!ORM.isEmpty(this.config.replicaSet)) {
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

    async query(options, data) {
        try {
            await this.connect();
            let col = this.connection.collection(options.table), handler, caselist, fn, pipe = [];
            switch (options.type) {
                case 'select':
                case 'SELECT':
                    //if (!ORM.isEmpty(options.lookup)) {//需要聚合的lookup方法
                    //    fn = ORM.promisify(col.aggregate, col);
                    //    if (!ORM.isEmpty(options.match)) pipe.push({$match: options.match});
                    //    if (!ORM.isEmpty(options.project)) pipe.push({$project: options.project});
                    //    if (!ORM.isEmpty(options.sort)) pipe.push({$sort: options.sort});
                    //    if (!ORM.isEmpty(options.skip)) pipe.push({$skip: options.skip});
                    //    pipe.push({
                    //        $lookup: {
                    //            from: options.lookup[0].from,
                    //            localField: options.lookup[0].on[1],
                    //            foreignField: options.lookup[0].on[2],
                    //            as: options.lookup[0].from
                    //        }
                    //    });
                    //    console.log(pipe)
                    //    return fn(pipe);
                    //} else {
                        //col.find().project({name:1}).toArray(function(err, docs){
                        //    console.log(docs)
                        //})
                        handler = col.find(options.match);
                        caselist = {skip: true, limit: true, sort: true, project: true};
                        for (let c in options) {
                            if (caselist[c]) {
                                handler[c](options[c])
                            }
                        }
                        return handler.toArray();
                    //}
                    break;
                case 'count':
                case 'COUNT':
                    fn = ORM.promisify(col.aggregate, col);
                    if (!ORM.isEmpty(options.match)) pipe.push({$match: options.where});
                    pipe.push({
                        $group: {
                            _id: null,
                            count: {$sum: 1}
                        }
                    })
                    return fn(pipe);
                    break;
                    break;
                case 'sum':
                case 'SUM':
                    fn = ORM.promisify(col.aggregate, col);
                    if (!ORM.isEmpty(options.match)) pipe.push({$match: options.where});
                    //此处gropu必须在match后面.......没搞懂
                    pipe.push({
                        $group: {
                            _id: 1,
                            count: {$sum: `$${data}`}
                        }
                    })
                    //pipe = [
                    //    {$match: {name: 'a'}},
                    //    {
                    //        $group: {
                    //            _id: 1,
                    //            count: {$sum: `$id`}
                    //        }
                    //    }
                    //
                    //]
                    return fn(pipe);
                    break;
                case 'avg':
                case 'AVG':
                    fn = ORM.promisify(col.aggregate, col);
                    if (!ORM.isEmpty(options.match)) pipe.push({$match: options.where});
                    pipe.push({
                        $group: {
                            _id: 1,
                            count: {$avg: `$${data}`}
                        }
                    })
                    return fn(pipe);
                    break;
                case 'min':
                case 'MIN':
                    fn = ORM.promisify(col.aggregate, col);
                    if (!ORM.isEmpty(options.match)) pipe.push({$match: options.where});
                    pipe.push({
                        $group: {
                            _id: 1,
                            count: {$min: `$${data}`}
                        }
                    })

                    return fn(pipe);
                    break;
                case 'MAX':
                case 'max':
                    fn = ORM.promisify(col.aggregate, col);
                    if (!ORM.isEmpty(options.match)) pipe.push({$match: options.where});
                    pipe.push({
                        $group: {
                            _id: 1,
                            count: {$max: `$${data}`}
                        }
                    })
                    return fn(pipe);
                    break;
                case 'find':
                case 'FIND':
                    handler = col.findOne(options.match);
                    return handler.toArray();
                    //return col.find(options.where).skip(1).limit(1).toArray();
                    break;
                case 'add':
                case 'ADD':
                    return col.insertOne(data)
                    break;
                case 'addall':
                case 'ADDALL':
                    return col.insertMany(data)
                    break;
                case 'update':
                case 'UPDATE':
                    return col.updateMany(options.match, data);
                    break;
                case 'delete':
                case 'DELETE':
                    return col.deleteMany(options.match || {});
                    break;
            }
        } catch (e) {
            console.log(e.stack)
        }
    }

    close() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }
}
