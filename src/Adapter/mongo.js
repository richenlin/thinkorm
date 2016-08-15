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

        this.handel = null;
        this.parsercls = null;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config);
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

    schema() {
        //自动创建表\更新表\迁移数据
    }

    /**
     *
     * @param sql
     */
    query(options) {
        return this.connect().query(options).then(data => {
            return this.parsers().bufferToString(data);
        });
    }

    /**
     *
     * @param sql
     */
    execute(options, data) {
        return this.connect().execute(options, data).then(data => {
            let result = 0;
            switch (options.method) {
                case 'ADD':
                    result = data.insertedId;
                    break;
                case 'ADDALL':
                    result = data.insertedCount;
                    break;
                case 'UPDATE':
                    result = data.modifiedCount;
                    break;
                case 'DELETE':
                    result = data.deletedCount;
                    break;
            }
            return result || null;
        });
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options = {}) {
        options.method = 'ADD';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql, data);
        }).then(data => {
            return data;
        });
    }

    /**
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    addAll(data, options = {}) {
        options.method = 'ADDALL';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql, data);
        }).then(data => {
            return data;
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        return this.parsers().buildSql(options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            return data;
        });
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options = {}) {
        options.method = 'UPDATE';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql, data);
        }).then(data => {
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
        options.count = field;
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            return ORM.isEmpty(data) ? 0 : data || 0;
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
        //未实现
        return Promise.reject('not support');
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options = {}) {
        options.method = 'FIND';
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            return ORM.isEmpty(data) ? {} : data || {};
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options = {}) {
        options.method = 'SELECT';
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            return ORM.isEmpty(data) ? [] : data || [];
        });
    }
}
