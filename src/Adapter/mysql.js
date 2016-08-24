/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import knex from 'knex';
import base from '../base';
import lib from '../Util/lib';
import parser from '../Parser/base';
import socket from '../Socket/mysql';

export default class extends base {

    init(config = {}) {
        this.config = config;
        this.logSql = config.db_ext_config.db_log_sql || false;
        this.transTimes = 0; //transaction times
        this.lastInsertId = 0;

        this.knexClient = knex({
            client: 'mysql'
        });

        this.handel = null;
        this.parsercls = null;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config).connect();
        return this.handel;
    }

    close() {
        if (this.handel) {
            this.handel.close && this.handel.close();
            this.handel = null;
        }
    }

    parsers() {
        if (this.parsercls) {
            return this.parsercls;
        }
        this.parsercls = new parser(this.config);
        return this.parsercls;
    }

    /**
     *
     * @param schema
     * @param config
     */
    migrate(schema, config) {
        if(lib.isEmpty(schema) || lib.isEmpty(config)){
            return;
        }
        let tableName = `${config.db_prefix}${lib.parseName(schema.name)}`;
        return this.query(this.knexClient.schema.hasTable(tableName).toString()).then(exists => {
            if(lib.isEmpty(exists)){
                return Promise.resolve();
            } else {
                return this.execute(this.knexClient.schema.dropTableIfExists(tableName).toString());
            }
        }).then(() => {
                let options = {
                    method: 'MIGRATE',
                    schema: schema
                };
                return this.parsers().buildSql(this.knexClient.schema, config, options).then(sql => {
                    if (/\n/.test(sql)) {
                        let temp = sql.replace(/\n/g, '').split(';'), ps = [];
                        temp.map(item => {
                            ps.push(this.execute(item));
                        });
                        return Promise.all(ps);
                    }
                    return this.execute(sql.replace(/\n/g, ''));
                });
        });

    }

    /**
     *
     * @param sql
     */
    query(sql) {
        if (lib.isEmpty(sql)) {
            return Promise.reject('SQL analytic result is empty');
        }
        let startTime = Date.now();
        let connection;
        return this.connect().then(conn => {
            connection = conn;
            let fn = lib.promisify(connection.query, connection);
            return fn(sql);
        }).then((rows = []) => {
            this.logSql && lib.log(sql, 'MySQL', startTime);
            return this.bufferToString(rows);
        }).catch(err => {
            //when socket is closed, try it
            if (err.code === 'PROTOCOL_CONNECTION_LOST' || err.code === 'EPIPE') {
                return this.close().then(() => {
                    return this.query(sql);
                });
            }
            this.logSql && lib.log(sql, 'MySQL', startTime);
            return Promise.reject(err);
        });
    }

    /**
     *
     * @param sql
     */
    execute(sql) {
        return this.query(sql).then(data => {
            if (data.insertId) {
                this.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    }

    /**
     *
     * @returns {*}
     */
    startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('START TRANSACTION');
        }
    }

    /**
     *
     * @returns {*}
     */
    commit() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return Promise.resolve();
    }

    /**
     *
     * @returns {*}
     */
    rollback() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return Promise.resolve();
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options = {}) {
        options.method = 'ADD';
        let knexCls = this.knexClient.insert(data).from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return this.lastInsertId;
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        let knexCls = this.knexClient.del().from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options = {}) {
        options.method = 'UPDATE';
        let knexCls = this.knexClient.update(data).from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */
    count(field, options = {}) {
        options.method = 'COUNT';
        options.limit = [0, 1];
        let knexCls = this.knexClient.count(`${field} AS count`).from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
        }).then(data => {
            if (lib.isArray(data)) {
                if (data[0]) {
                    return data[0]['count'] ? (data[0]['count'] || 0) : 0;
                } else {
                    return 0;
                }
            } else {
                return data['count'] || 0;
            }
        });
    }

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */
    sum(field, options = {}) {
        options.method = 'SUM';
        options.limit = [0, 1];
        let knexCls = this.knexClient.sum(`${options.sum} AS sum`).from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
        }).then(data => {
            if (lib.isArray(data)) {
                if (data[0]) {
                    return data[0]['sum'] ? (data[0]['sum'] || 0) : 0;
                } else {
                    return 0;
                }
            } else {
                return data['sum'] || 0;
            }
        });
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options = {}) {
        options.method = 'SELECT';
        options.limit = [0, 1];
        let knexCls = this.knexClient.select().from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options = {}) {
        options.method = 'SELECT';
        let knexCls = this.knexClient.select().from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    bufferToString(data) {
        if (!this.config.buffer_tostring || !lib.isArray(data)) {
            return data;
        }
        for (let i = 0, length = data.length; i < length; i++) {
            for (let key in data[i]) {
                if (lib.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    }
}
