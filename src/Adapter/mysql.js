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
        this.parser = new parser(config);
        this.sql = '';
        this.lastInsertId = 0;
        this.transTimes = 0; //transaction times
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config);
        return this.handel;
    }

    /**
     *
     * @param data
     * @param options
     * @param replace
     */
    add(data, options, replace) {
        let values = [];
        let fields = [];
        for (let key in data) {
            let val = data[key];
            val = this.parser.parseValue(val);
            if (ORM.isString(val) || ORM.isBoolean(val) || ORM.isNumber(val)) {
                values.push(val);
                fields.push(this.parser.parseKey(key));
            }
        }
        let sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parser.parseTable(options.table) + ' (' + fields.join(',') + ')';
        sql += ' VALUES (' + values.join(',') + ')';
        sql += this.parser.parseLock(options.lock) + this.parser.parseComment(options.comment);
        return this.execute(sql);
    }

    /**
     *
     * @param data
     * @param options
     * @param replace
     */
    addMany(data, options, replace) {
        let fields = Object.keys(data[0].map(item => this.parser.parseKey(item)).join(','));
        let values = data.map(item => {
            let value = [];
            for (let key in item) {
                let val = item[key];
                val = this.parser.parseValue(val);
                if (ORM.isString(val) || ORM.isBoolean(val) || ORM.isNumber(val)) {
                    value.push(val);
                }
            }
            return '(' + value.join(',') + ')';
        }).join(',');
        let sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parser.parseTable(options.table) + '(' + fields + ')';
        sql += ' VALUES ' + values;
        sql += this.parser.parseLock(options.lock) + this.parser.parseComment(options.comment);
        return this.execute(sql);
    }

    /**
     *
     * @param fields
     * @param table
     * @param options
     */
    selectAdd(fields, table, options = {}) {
        if (ORM.isString(fields)) {
            fields = fields.split(/\s*,\s*/);
        }
        fields = fields.map(item => this.parser.parseKey(item));
        let sql = 'INSERT INTO ' + this.parser.parseTable(table) + ' (' + fields.join(',') + ') ';
        sql += this.parser.buildSelectSql(options);
        return this.execute(sql);
    }

    /**
     *
     * @param options
     */
    delete(options) {
        let sql = [
            'DELETE FROM ',
            this.parser.parseTable(options.table),
            this.parser.parseWhere(options.where),
            this.parser.parseOrder(options.order),
            this.parser.parseLimit(options.limit),
            this.parser.parseLock(options.lock),
            this.parser.parseComment(options.comment)
        ].join('');
        return this.execute(sql);
    }

    /**
     *
     * @param options
     * @param data
     */
    update(options, data) {
        let sql = [
            'UPDATE ',
            this.parser.parseTable(options.table),
            this.parser.parseSet(data),
            this.parser.parseWhere(options.where),
            this.parser.parseOrder(options.order),
            this.parser.parseLimit(options.limit),
            this.parser.parseLock(options.lock),
            this.parser.parseComment(options.comment)
        ].join('');
        return this.execute(sql);
    }

    /**
     *
     * @param options
     */
    select(options){
        let sql;
        if(ORM.isObject(options)){
            sql = this.buildSelectSql(options);
        }
        return this.query(sql);
    }

    getLastSql(){
        return this.sql;
    }

    getLastInsertId(){
        return this.lastInsertId;
    }

    /**
     *
     * @param sql
     */
    query(sql){
        this.sql = sql;
        return this.connect().query(sql).then(data => {
            return this.parser.bufferToString(data);
        });
    }

    /**
     *
     * @param sql
     */
    execute(sql){
        this.sql = sql;
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
}
