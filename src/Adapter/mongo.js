/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
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
        ORM.log(`Adapter is not support.`, 'WARNING');
        return;
    }

    /**
     *
     */
    commit() {
        ORM.log(`Adapter is not support.`, 'WARNING');
        return;
    }

    /**
     *
     */
    rollback() {
        ORM.log(`Adapter is not support.`, 'WARNING');
        return;
    }

    /**
     *
     * @param sql
     */
    query(cls) {
        let startTime = Date.now();
        if(!cls.col){
            this.logSql && ORM.log(cls.sql, 'MongoDB', startTime);
            return Promise.reject('Analytic result is empty');
        }
        return cls.col.then(data => {
            this.logSql && ORM.log(cls.sql, 'MongoDB', startTime);
            return this.bufferToString(data);
        }).catch(err => {
            this.logSql && ORM.log(cls.sql, 'MongoDB', startTime);
            return Promise.reject(err);
        });
    }

    /**
     *
     * @param cls
     */
    execute(cls) {
        return this.query(cls);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options = {}) {
        options.method = 'ADD';
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, data, options);
        }).then(res => {
            return this.execute(res);
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
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.execute(res);
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
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, data, options);
        }).then(res => {
            return this.execute(res);
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
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res);
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
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res);
        });
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options = {}) {
        options.method = 'FIND';
        options.limit = [0, 1];
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res);
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options = {}) {
        options.method = 'SELECT';
        return this.connect().then(conn => {
            return this.parsers().buildSql(conn, options);
        }).then(res => {
            return this.query(res);
        });
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    bufferToString(data) {
        if (!this.config.buffer_tostring || !ORM.isArray(data)) {
            return data;
        }
        for (let i = 0, length = data.length; i < length; i++) {
            for (let key in data[i]) {
                if (ORM.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    }
}
