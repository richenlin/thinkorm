/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';
import parser from '../Parser/mysql';
import socket from '../Socket/mysql';

export default class extends base {

    init(config = {}) {
        super.init(config);
        this.parser = null;
        //此Adapter特有的方法定义,例如mysql中可以使用startTrans,而mongo不行
        this.methods = {
            startTrans: this.startTrans,
            commit: this.commit,
            rollback: this.rollback
        };
        //保存传入的操作条件
        this._options = {};
        this.transTimes = 0; //transaction times
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config);
        this.parser = new parser(this.config);
        return this.handel;
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
            return this.parser.bufferToString(data);
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

    /**
     *
     * @returns {*}
     */
    startTrans(){
        if(this.transTimes === 0){
            this.transTimes ++;
            return this.execute('START TRANSACTION');
        }
    }

    /**
     *
     * @returns {*}
     */
    commit(){
        if(this.transTimes > 0){
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return Promise.resolve();
    }

    /**
     *
     * @returns {*}
     */
    rollback(){
        if(this.transTimes > 0){
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return Promise.resolve();
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
        return this.parser.buildSql(data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    addAll(data, options) {
        options.method = 'INSERT';
    }

    /**
     * 查询后新增
     * @param data
     * @param options
     */
    thenAdd(data, options){
        options.method = 'INSERT';
        if(ORM.isEmpty(options.where)){
            return this.add(data, options);
        } else {
            return this.find(options).then(result => {
                if(ORM.isEmpty(result)){
                    return this.add(data, options);
                } else {
                    return Promise.reject('Data record is exists.');
                }
            })
        }
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options) {
        options.method = 'DELETE';
        return this.parser.buildSql(options).then(sql => {
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
        return this.parser.buildSql(data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 查询数据条数
     * @param options
     * @returns {*}
     */
    count(options) {
        options.method = 'SELECT';
        options.count = options.field || '*';
        return this.parser.buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 统计数据数量和
     * @param options
     * @returns {*}
     */
    sum(options) {
        options.method = 'SELECT';
        options.sum = options.field || '*';
        return this.parser.buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options) {
        options.method = 'SELECT';
        options.limit = 1;
        return this.parser.buildSql(options).then(sql => {
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
        return this.parser.buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }
}
