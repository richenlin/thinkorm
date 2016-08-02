/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import parser from '../Parser/postgresql';
import socket from '../Socket/postgresql';

export default class extends base {

    init(config = {}) {
        this.config = config;
        this.transTimes = 0; //transaction times
        this.lastInsertId = 0;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config);
        return this.handel;
    }

    parsers(){
        if(!this.parsercls){
            this.parsercls = new parser(this.config);
        }
        return this.parsercls;
    }

    schema(){
        //自动创建表\更新表\迁移数据
    }

    /**
     *
     * @param sql
     */
    query(sql){
        return this.connect().query(sql).then(data => {
            return this.parsers().bufferToString(data);
        });
    }

    /**
     *
     * @param sql
     */
    execute(sql){
        return this.connect().execute(sql).then(data => {
            if (data.insertId) {
                this.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    }

    close(){
        if(this.handel){
            this.handel.close();
            this.handel = null;
        }
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options) {
        options.method = 'INSERT';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return this.lastInsertId;
        });
    }

    /**
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    addAll(data, options) {
        let promised = data.map(item => {
            return this.add(item, options);
        });
        return Promise.all(promised);
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options) {
        options.method = 'DELETE';
        return this.parsers().buildSql(options).then(sql => {
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
    update(data, options) {
        options.method = 'UPDATE';
        return this.parsers().buildSql(data, options).then(sql => {
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
    count(field, options) {
        options.method = 'SELECT';
        options.count = field;
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            if(ORM.isArray(field)){
                return Object.values(data[0]);
            } else {
                if(data[0]){
                    return data[0]['count(`'+field+'`)'] ? (data[0]['count(`'+field+'`)'] || 0) : 0;
                } else {
                    return 0;
                }
            }
            return data;
        });
    }

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */
    sum(field, options) {
        options.method = 'SELECT';
        options.sum = field;
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            if(ORM.isArray(field)){
                return Object.values(data[0]);
            } else {
                if(data[0]){
                    return data[0]['sum(`'+field+'`)'] ? (data[0]['sum(`'+field+'`)'] || 0) : 0;
                } else {
                    return 0;
                }
            }
        });
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options) {
        options.method = 'SELECT';
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(sql => {
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
    select(options) {
        options.method = 'SELECT';
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }
}
