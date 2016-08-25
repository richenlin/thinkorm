/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import lib from '../Util/lib';

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
                    return {[key]: new RegExp(`${v}`)};
                } else if(value.indexOf('%') === 0){
                    return {[key]: new RegExp(`${v}^`)};
                }else if(value.substring(value.length -1) === '%'){
                    return {[key]: new RegExp(`^${v}`)};
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
                options.project[n.split('.')[1]] = 1;
            } else {
                options.project[n] = 1;
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
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseGroup(data, options) {
        //db.demo.group({
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
        if(options.group){
            let group = {};
            if(lib.isArray(options.group)){
                options.group.map(item => {
                    group[item] = true;
                });

            } else {
                group = options.group;
            }
            options.group = {
                "key": group,
                "initial": {},
                "reduce": function(obj, prev) {},
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
        return Promise.reject('not support');
    }

    /**
     * mongodb需要严格匹配数据,此处做处理
     * @param data
     * @param options
     */
    parseData(data, options){
        //暂时未实现
    }

    /**
     *
     * @param collection
     * @param data
     * @param options
     */
    parseMethod(collection, data, options) {
        let caseList = {
            FIND: {skip: true, limit: true, sort: true, project: true},
            SELECT: {skip: true, limit: true, sort: true, project: true},
            ADD: {},
            /*ADDALL: {},*/
            UPDATE: {},
            DELETE: {},
            COUNT: {},
            SUM: {}};
        let optType = options.method, handler, fn, pipe = [];
        if (optType && optType in caseList) {
            switch (optType) {
                case 'FIND':
                    if(lib.isEmpty(options.group)){
                        this.sql = `${this.sql}${options.where ? '.findOne(' + JSON.stringify(options.where) + ')' : '.findOne()'}`;
                        handler = collection.findOne(options.where || {});
                    } else {
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        handler = collection.group(options.group);
                    }
                    break;
                case 'SELECT':
                    if(lib.isEmpty(options.group)){
                        this.sql = `${this.sql}${options.where ? '.find(' + JSON.stringify(options.where) + ')' : '.find()'}`;
                        handler = collection.find(options.where || {});
                    } else {
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        handler = collection.group(options.group);
                    }
                    break;
                case 'ADD':
                    this.sql = `${this.sql}.insertOne(${JSON.stringify(data)})`;
                    handler = collection.insertOne(data);
                    break;
                case 'ADDALL':
                    this.sql = `${this.sql}.insertMany(${JSON.stringify(data)})`;
                    handler = collection.insertMany(data);
                    break;
                case 'UPDATE':
                    this.sql = `${this.sql}${options.where ? '.update(' + JSON.stringify(options.where) + ', {$set:' + JSON.stringify(data) + '}, false, true))' : '.update({}, {$set:' + JSON.stringify(data) + '}, false, true)'}`;
                    handler = collection.updateMany(options.where || {}, data);
                    break;
                case 'DELETE':
                    this.sql = `${this.sql}${options.where ? '.remove(' + JSON.stringify(options.where) + ')' : '.remove()'}`;
                    handler = collection.deleteMany(options.where || {});
                    break;
                case 'COUNT':
                    if(lib.isEmpty(options.group)){
                        fn = lib.promisify(collection.aggregate, collection);
                        !lib.isEmpty(options.where) && pipe.push({$match: options.where});
                        pipe.push({
                            $group: {
                                _id: null,
                                count: {$sum: 1}
                            }
                        })
                        this.sql = `${this.sql}.aggregate(${JSON.stringify(pipe)})`;
                        handler = fn(pipe);
                    } else {
                        options.group.initial = {
                            "countid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', `if (obj.${options.count} != null) if (obj.${options.count} instanceof Array){prev.countid += obj.${options.count}.length; }else{ prev.countid++;}`);
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        handler = collection.group(options.group);
                    }
                    break;
                case 'SUM':
                    if(lib.isEmpty(options.group)){
                        fn = lib.promisify(collection.aggregate, collection);
                        !lib.isEmpty(options.where) && pipe.push({$match: options.where});
                        pipe.push({
                            $group: {
                                _id: 1,
                                sum: {$sum: `$${options.sum}`}
                            }
                        })
                        this.sql = `${this.sql}.aggregate(${JSON.stringify(pipe)})`;
                        handler = fn(pipe);
                    } else {
                        options.group.initial = {
                            "sumid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', `prev.sumid = prev.sumid + obj.${options.sum} - 0;`);
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        handler = collection.group(options.group);
                    }
                    break;
            }
            //解析skip,limit,sort,project
            for (let c in caseList[optType]){
                if(options[c] && handler[c]){
                    this.sql = `${this.sql}.${c}(${JSON.stringify(options[c])})`;
                    handler[c](options[c]);
                }
            }
            if(optType == 'SELECT'){
                return handler.toArray();
            } else {
                return handler;
            }
        } else {
            return null;
        }
    }

    /**
     *
     * @param conn
     * @param data
     * @param options
     * @returns {*}
     */
    async parseSql(conn, data, options) {
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
            if (conn) {
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
                //解析data
                if (options['data'] && caseList[optType]['data']) {
                    await this.parseData(data, options);
                    caseList[optType]['data'] && (caseList[optType]['data'] = 0);
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
                //处理collection
                let collection = conn.collection(options.table);
                this.sql = `db.${options.table}`;
                let methodFn = this.parseMethod(collection, data, options);
                return {sql: this.sql, col: methodFn};
            }
        } catch (e) {
            console.log(e)
        }
        return {sql: this.sql, col: null};
    }

    /**
     *
     * @param conn
     * @param data
     * @param options
     * @returns {string}
     */
    async buildSql(conn, data, options) {
        if (options === undefined) {
            options = data;
        }
        //防止外部options被更改
        let parseOptions = lib.extend({}, options);
        return this.parseSql(conn, data, parseOptions);
    }
}
