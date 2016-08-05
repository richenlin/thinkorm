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
        if(ORM.inArray(options.method, ['SELECT', 'FIND', 'COUNT', 'SUM'])){
            parseOptions['skip'] = options.limit[0] || 0;
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
        if(ORM.inArray(options.method, ['SELECT', 'FIND'])){
            for(let n in options.order){
                parseOptions.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
            }
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
        if(ORM.inArray(options.method, ['SELECT', 'FIND'])){
            for (let n of options.field) {
                if (n.indexOf('.') > -1) {
                    parseOptions.project[n.split('.')[1]] = 1;
                } else {
                    parseOptions.project[n] = 1;
                }
            }
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
        let parseOptions = {where: {}};
        if(ORM.inArray(options.method, ['SELECT', 'FIND', 'COUNT', 'SUM'])){
            //{age: {'$exists': true}
            if(options.count){
                parseOptions.where[options.count] = {'$exists': true};
            }
        }
        return parseOptions;
    }

    /**
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    //parseSum(data, options){
    //    let parseOptions = {};
    //    if(ORM.inArray(options.method, ['SELECT', 'FIND', 'COUNT', 'SUM'])){
    //        //
    //    }
    //    return parseOptions;
    //}

    /**
     *
     * @param data
     * @param options
     */
    parseWhere(data, options){
        let parseOptions = {}, where = {};
        let whereParse = function (key, value, item) {
            let identifiers = {
                '>': '$gt',
                '>=': '$gte',
                '<': '$lt',
                '<=': '$lte',
                'or': '$or',
                'not': '$ne',
                'in': '$in',
                'notin': '$nin',
            };
            switch (identifiers[key]){
                case '$gt':
                case '$gte':
                case '$lt':
                case '$lte':
                case '$ne':
                case '$in':
                case '$nin':
                    where[item] = {[identifiers[key]]: value};
                    return {[item]: {[identifiers[key]]: value}};
                    break;
                case '$or':
                    let temp = [];
                    value.map(data=> {
                        for (let k in data) {
                            temp.push(whereParse(k, data[k], k));
                        }
                    });
                    where = {$or: temp};
                    break;
                default:
                    if (ORM.isJSONObj(value)) {
                        for (let k in value) {
                            return whereParse(k, value[k], key);
                        }
                    } else {
                        where[key] = value;
                        return {[key]: value}
                    }
                    break;
            }
        };
        if(options.where){
            for(let key in options.where){
                whereParse(key, options.where[key], key);
            }
            parseOptions['where'] = where || {};
        }
        return parseOptions;
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    parseGroup(data, options){
        //未实现
        return Promise.reject('not support');
    }

    /**
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}}], 'left')
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'right')
     * @param data
     * @param options
     */
    parseJoin(data, options){
        //未实现
        return Promise.reject('not support');
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseTable(data, options){
        let parseOptions = {};
        parseOptions.table = options.table;
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
        parseOptions.method = options.method;
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
            if(options[n] !== 'where' && this[`parse${mt}`] && ORM.isFunction(this[`parse${mt}`])){
                parseOptions = ORM.extend(false, parseOptions, this[`parse${mt}`](data, options));
            }
        }
        parseOptions = ORM.extend(parseOptions, this.parseWhere(data, options));
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
        return parseOptions;
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
