/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';
import analyze from '../Util/analyze';
import sequelizer from '../Util/sequelizer';

export default class extends base {

    init(config = {}) {
        this.config = config;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseLimit(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            parseOptions['offset'] = options.limit[0] || 0;
            parseOptions['limit'] = options.limit[1] || 10;
        }

        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseOrder(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            parseOptions['orderBy'] = options.order;
        }
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseField(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            parseOptions['select'] = options.field || '*';
        }
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseWhere(data, options){
        let parseOptions = {};
        parseOptions['where'] = options.where || 1;
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseTable(data, options){
        let parseOptions = {};
        if(options.method === 'UPDATE'){
            parseOptions['using'] = options.table;
        } else if(options.method === 'INSERT'){
            parseOptions['into'] = options.table;
        }else {
            parseOptions['from'] = options.table;
        }
       return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseData(data, options){
        let parseOptions = {};
        if(options.method === 'UPDATE'){
            parseOptions['update'] = data;
        } else if(options.method === 'INSERT'){
            parseOptions['insert'] = data;
        }
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseMethod(data, options){
        let parseOptions = {};
        if(options.method === 'DELETE'){
            parseOptions['del'] = true;
        }
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {string}
     */
    parseSql(data, options){
        let parseOptions = {};
        for(let n in options){
            let mt = ORM.ucFirst(n);
            if(this[`parse${mt}`] && ORM.isFunction(this[`parse${mt}`])){
                parseOptions = ORM.extend(false, parseOptions, this[`parse${mt}`](data, options));
            }
        }
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    async buildSql(data, options){
        if(options === undefined){
            options = data;
        } else {
            options.data = data;
        }
        let parseOptions =  this.parseSql(data, options);
        let seqs = await analyze(parseOptions);
        let builder =  await sequelizer({
            dialect: 'mysql',
            tree: seqs
        });

        let sql = '';
        if(!ORM.isEmpty(builder.sql)){
            sql = builder.sql;
            if(!ORM.isEmpty(builder.bindings)){
                builder.bindings.forEach(item => {
                    sql =  sql.replace(/\?/, ORM.isNumber(item) ? item : `'${item}'`);
                });
            }
        }
        return sql;
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    bufferToString(data){
        if (!this.config.buffer_tostring || !ORM.isArray(data)) {
            return data;
        }
        for(let i = 0, length = data.length; i < length; i++){
            for(let key in data[i]){
                if(ORM.isBuffer(data[i][key])){
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    }
}
