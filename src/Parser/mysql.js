/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import {sprintf} from "sprintf-js";
import base from './base';
import analyze from '../Util/analyze';
import sequelizer from '../Util/sequelizer';

export default class extends base {

    init(config = {}) {
        this.config = config;
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
     * @param options
     */
    parseSql(options){
        //for(let n in options){
        //    let mt = ORM.ucFirst(n);
        //    if(this[`parse${mt}`] && ORM.isFunction(this[`parse${mt}`])){
        //        sql = this[`parse${mt}`](sql, options[n]);
        //    }
        //}
        let seqs = analyze(
            {
                select: '*',
                from: 'users',
                where: {
                    name: "ccc", id: 1
                },
                orderBy: [
                    {id: 'desc'},
                    {name: 'asc'}
                ]
            }
        );
        let builder =  sequelizer({
            dialect: 'mysql',
            tree: seqs
        });

        let sql = '';
        if(!ORM.isEmpty(builder.sql)){
            sql = builder.sql;
            if(!ORM.isEmpty(builder.bindings)){
                builder.bindings.forEach(item => {
                   sql =  sql.replace(/\?/, `'${item}'`);
                });
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
        return this.parseSql(options);
    }
}
