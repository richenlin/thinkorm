/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import lib from '../Util/lib';
import parser from '../Parser/mongo';
import socket from '../Socket/mongo';

export default class extends base {
    init(config = {}) {
        this.config = config;
        this.logSql = config.db_ext_config.db_log_sql || false;

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
            this.handel.close();
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
     * 数据迁移
     */
    migrate() {
        return;
    }

    /**
     *
     */
    startTrans() {
        lib.log(`Adapter is not support.`, 'WARNING');
        return;
    }

    /**
     *
     */
    commit() {
        lib.log(`Adapter is not support.`, 'WARNING');
        return;
    }

    /**
     *
     */
    rollback() {
        lib.log(`Adapter is not support.`, 'WARNING');
        return;
    }

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */
    query(cls, startTime) {
        startTime = startTime || Date.now();
        if(!cls.col){
            this.logSql && lib.log(cls.sql, 'MongoDB', startTime);
            return Promise.reject('Analytic result is empty');
        }
        return cls.col.then(data => {
            this.logSql && lib.log(cls.sql, 'MongoDB', startTime);
            return this.bufferToString(data);
        }).catch(err => {
            this.logSql && lib.log(cls.sql, 'MongoDB', startTime);
            return Promise.reject(err);
        });
    }

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */
    execute(cls, startTime) {
        return this.query(cls, startTime);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options = {}) {
        options.method = 'ADD';
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, data, options);
        }).then(res => {
            return this.execute(res, startTime);
        }).then(data => {
            return data.insertedId || 0;
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.execute(res, startTime);
        }).then(data => {
            return data.deletedCount || 0;
        });
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options = {}) {
        options.method = 'UPDATE';
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, data, options);
        }).then(res => {
            return this.execute(res, startTime);
        }).then(data => {
            return data.modifiedCount || 0;
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
        options.count = field;
        options.limit = [0, 1];
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res, startTime);
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
        options.sum = field;
        options.limit = [0, 1];
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res, startTime);
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
        options.method = 'FIND';
        options.limit = [0, 1];
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res, startTime);
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options = {}) {
        options.method = 'SELECT';
        let startTime = Date.now();
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res, startTime);
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
