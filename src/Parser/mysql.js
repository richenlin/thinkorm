/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import lodash from 'lodash';
import base from './base';

export default class extends base {

    init(config = {}) {
        this.config = config;
    }

    sequelizer(sql){

    }

    /**
     *
     * @param sql
     * @param options
     */
    parseLimit(sql, options){

    }

    /**
     *
     * @param sql
     * @param options
     */
    parseOrder(sql, options){

    }

    /**
     *
     * @param sql
     * @param options
     */
    parseField(sql, options){

    }

    /**
     *
     * @param sql
     * @param options
     */
    parseWhere(sql, options){
        if(ORM.isEmpty(options.where)){
            return sql;
        }
        let str = '', values = options.where;
        for(let n in values){
            let key = n.trim();
            //or
            if(key === 'or'){
                if(ORM.isArray(values[n])){
                    values[n].forEach(item => {
                        if(item){
                            //sql +=
                        }
                    });
                }
            }
        }
    }

    /**
     *
     * @param sql
     * @param options
     */
    parseTable(sql, options){
       return sprintf(sql.replace(/\__TABLE\__/g, '%s'), options);
    }

    /**
     *
     * @param sql
     * @param options
     */
    parseSql(sql, options){
        for(let n in options){
            let mt = ORM.ucFirst(n);
            if(this[`parse${mt}`] && ORM.isFunction(this[`parse${mt}`])){
                sql = this[`parse${mt}`](sql, options[n]);
            }
        }
        return sql;
    }

    /**
     *
     * @param options
     * @returns {Promise.<T>}
     */
    buildSql(options){
        return this.parseSql(this.methodCase[options.method] || '', options);
    }
}
