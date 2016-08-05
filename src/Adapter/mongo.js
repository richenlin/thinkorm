/**
 * Created by lihao on 16/8/2.
 */
import base from '../base';
import parser from '../Parser/mongo';
import socket from '../Socket/mongo';

export default class extends base {

    init(config = {}) {
        this.config = config;
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

    /**
     * 执行查询
     * @param sql
     */
    query(sql) {
        console.log(sql)
        return this.connect().query(sql).then(data => {
            return this.parsers().bufferToString(data);
        });
    }

    execute(sql, data) {
        return this.connect().query(sql, data).then(data => {
            //console.log(data)
            switch (sql.type) {
                case 'add':
                case 'ADD':
                    this.lastInsertId = data.insertedId;
                    return this.lastInsertId;
                    break;
                case 'addall':
                case 'ADDALL':
                    return data.insertedCount;
                    break;
                case 'update':
                case 'UPDATE':
                    return data.modifiedCount;
                    break;
                case 'delete':
                case 'DELETE':
                    return data.deletedCount;
                    break;
                default:
                    return data;
                    break;
            }
        });
    }

    /**
     * 语法解析器
     */
    parsers() {
        if (!this.parsercls) {
            this.parsercls = new parser(this.config);
        }
        return this.parsercls;
    }

    /**
     * 查询
     * @param options
     */
    select(options) {
        options.method = 'select';
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }


    /**
     * 查找单条记录
     * @param options
     * @returns {*}
     */
    find(options) {
        options.method = 'select';
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            return ORM.isEmpty(data) ? {} : data[0];
        });
    }

    /**
     * 插入记录
     * @param data
     * @param options
     */
    add(data, options) {
        options.method = 'add';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql, data);
        }).then(data => {
            return this.lastInsertId;
        });
    }

    /**
     * 插入多条
     * @param data
     * @param options
     * @returns {*}
     */
    addAll(data, options) {
        options.method = 'addall';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql, data);
        }).then(data => {
            return data;
        });
    }

    /**
     * 更新
     * @param data
     * @param options
     */
    update(data, options) {
        let parsedata;
        options.method = 'update';
        parsedata = {$set: data};
        return this.parsers().buildSql(parsedata, options).then(sql => {
            return this.execute(sql, parsedata);
        }).then(data => {
            return data;
        });
    }

    /**
     * 删除操作
     * @param options
     */
    delete(options) {
        options.method = 'delete';
        return this.parsers().buildSql(options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            return data;
        });
    }

    /**
     * 查询字段数
     * @param field
     * @param options
     */
    count(field, options) {

    }

    /**
     * 求和
     * @param field
     * @param options
     */
    sum(field, options) {
        options.method = 'sum';
        return this.parsers().buildSql(field, options).then(sql => {
            return this.execute(sql, field);
        }).then(data => {
            console.log(data)
            return data[0].count || 0
        });
    }


}

