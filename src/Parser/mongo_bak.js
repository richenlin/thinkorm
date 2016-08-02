/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';

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
            //
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
            //
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
            //
        }
        return parseOptions;
    }

    /**
     * count('xxx')
     * count(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    parseCount(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            //
        }
        return parseOptions;
    }

    /**
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    parseSum(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            //
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
        //
        return parseOptions;
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    parseGroup(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            //
        }
        return parseOptions;
    }

    /**
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}}], 'left')
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'right')
     * @param data
     * @param options
     */
    parseJoin(data, options){
        let parseOptions = {};
        if(options.method === 'SELECT'){
            //
        }
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
        //
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseData(data, options){
        let parseOptions = {};
        //
        return parseOptions;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseMethod(data, options){
        let parseOptions = {};
        //
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
        let parseOptions = await this.parseSql(data, options);

        let sql = '';
        //
        return sql;
    }
}
