/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import lib from '../Util/lib';
import {ObjectID} from 'mongodb';
const identifiers = {
    '>': '$gt',
    '>=': '$gte',
    '<': '$lt',
    '<=': '$lte',
    '<>': '$ne',
    'OR': '$or',
    'NOT': '$ne',
    'IN': '$in',
    'NOTIN': '$nin',
    'LIKE': '$regex'
};
/**
 *
 * @param key
 * @param value
 * @param item
 * @returns {{}}
 */
let whereParse = function (key, value, item) {
    let idt = key.toUpperCase(), temp;
    switch (identifiers[idt]) {
        case '$gt':
        case '$gte':
        case '$lt':
        case '$lte':
        case '$ne':
        case '$in':
        case '$nin':
            return {[item]: {[identifiers[idt]]: value}};
            break;
        case '$or':
            if(lib.isArray(value)){
                temp = [];
                value.map(data=> {
                    for (let k in data) {
                        temp.push(whereParse(k, data[k], k));
                    }
                });
                return {$or: temp};
            }
            break;
        case '$regex':
            if(lib.isString(value)){
                if(value.indexOf('%') === 0 && value.substring(value.length -1) === '%'){
                    return {[item]: new RegExp(`${value}`)};
                } else if(value.indexOf('%') === 0){
                    return {[item]: new RegExp(`${value}^`)};
                }else if(value.substring(value.length -1) === '%'){
                    return {[item]: new RegExp(`^${value}`)};
                }
            }
            break;
        default:
            if (lib.isObject(value)) {
                temp = {};
                for (let k in value) {
                    temp = lib.extend(temp, whereParse(k, value[k], key));
                }
                return temp;
            } else {
                return {[key]: value};
            }
            break;
    }
};


export default class extends base {
    init(config = {}) {
        this.config = config;
        this.sql = '';
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseLimit(data, options) {
        options['skip'] = options.limit[0] || 0;
        options['limit'] = options.limit[1] || 10;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseOrder(data, options) {
        for (let n in options.order) {
            options.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*|Cursor|AggregationCursor}
     */
    parseField(data, options) {
        for (let n of options.field) {
            if (n.indexOf('.') > -1) {
                options.field[n.split('.')[1]] = 1;
            } else {
                options.field[n] = 1;
            }
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseWhere(data, options) {
        let where = {};
        if (options.where) {
            for (let key in options.where) {
                where = lib.extend(where, whereParse(key, options.where[key], key));
            }
            options.where = where || {};
        }
        //将主键转为ObjectID
        //options.pk && options.where[options.pk] && (options.where[options.pk] = new ObjectID(options.where[options.pk]))
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseGroup(data, options) {
        //db.getCollection('demo').group({
        //    "key": {
        //        "id": true,
        //            ...
        //    },
        //    "initial": {},
        //    "reduce": function(obj, prev) {},
        //    "cond": {
        //        "score": {
        //            "$gt": 0
        //        }
        //    }
        //});
        if (options.group) {
            let group = {};
            if (lib.isArray(options.group)) {
                options.group.map(item => {
                    group[item] = true;
                });

            } else {
                group = [options.group];
            }
            options.group = {
                "key": group,
                "initial": {"count": 0},
                "reduce": "function (obj, prev) { prev.count++; }",
                "cond": {}
            };
        }
    }

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseJoin(data, options) {
        //未实现
        return Promise.reject('adapter not support join');
    }
    /**
     *

     * @param data
     * @param options
     * @returns {*}
     */
    async parseSql(data, options) {
        try {
            let caseList = {
                FIND: {join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1},
                SELECT: {join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1},
                ADD: {data: 1},
                //ADDALL: {data: 1},
                UPDATE: {where: 1, data: 1},
                DELETE: {where: 1},
                COUNT: {join: 1, where: 1, limit: 1, group: 1},
                SUM: {join: 1, where: 1, limit: 1, group: 1}
            };

            let optType = options.method;
            //处理join
            if (options['join'] && caseList[optType]['join']) {
                await this.parseJoin(data, options);
                caseList[optType]['join'] && (caseList[optType]['join'] = 0);
            }
            //解析where
            if (options['where'] && caseList[optType]['where']) {
                await this.parseWhere(data, options);
                caseList[optType]['where'] && (caseList[optType]['where'] = 0);
            }
            //解析group
            if (options['group'] && caseList[optType]['group']) {
                await this.parseGroup(data, options);
                caseList[optType]['group'] && (caseList[optType]['group'] = 0);
            }
            //处理其他options
            for (let n in options) {
                if (caseList[optType][n]) {
                    let mt = `parse${lib.ucFirst(n)}`;
                    if (mt && lib.isFunction(this[mt])) {
                        await this[mt](data, options);
                    }
                }
            }
            return {data: data, options: options};
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {{data, options}|*}
     */
    async buildSql(data, options) {
        if (options === undefined) {
            options = data;
        }
        //防止外部options被更改
        let parseOptions = lib.extend({}, options);
        return this.parseSql(data, parseOptions);
    }
}
