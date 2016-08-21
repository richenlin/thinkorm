/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';

const identifiers = {
    '>': '$gt',
    '>=': '$gte',
    '<': '$lt',
    '<=': '$lte',
    'or': '$or',
    'not': '$ne',
    'in': '$in',
    'notin': '$nin'
};
/**
 *
 * @param key
 * @param value
 * @param item
 * @param where
 * @returns {{}}
 */
let whereParse = function (key, value, item, where) {
    switch (identifiers[key]) {
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
                    temp.push(whereParse(k, data[k], k, where));
                }
            });
            where = {$or: temp};
            break;
        default:
            if (ORM.isJSONObj(value)) {
                for (let k in value) {
                    return whereParse(k, value[k], key, where);
                }
            } else {
                where[key] = value;
                return {[key]: value}
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
     * @param col
     * @param data
     * @param options
     * @returns {*}
     */
    parseLimit(col, data, options) {
        this.sql = `${this.sql}.skip(${options.limit[0] || 0}).limit(${options.limit[1] || 10})`;
        return col.skip(options.limit[0] || 0).limit(options.limit[1] || 10);
    }

    /**
     *
     * @param col
     * @param data
     * @param options
     * @returns {*}
     */
    parseOrder(col, data, options) {
        for (let n in options.order) {
            options.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
        }
        this.sql = `${this.sql}.sort(${JSON.stringify(options.sort)})`;
        return col.sort(options.sort);
    }

    /**
     *
     * @param col
     * @param data
     * @param options
     * @returns {*|Cursor|AggregationCursor}
     */
    parseField(col, data, options) {
        for (let n of options.field) {
            if (n.indexOf('.') > -1) {
                options.project[n.split('.')[1]] = 1;
            } else {
                options.project[n] = 1;
            }
        }
        this.sql = `${this.sql}.project(${JSON.stringify(options.project)})`;
        return col.project(options.project);
    }

    /**
     *
     * @param col
     * @param data
     * @param options
     * @returns {*}
     */
    parseWhere(col, data, options) {
        let where = {};
        if (options.where) {
            for (let key in options.where) {
                whereParse(key, options.where[key], key, where);
            }
            options.where = where || {};
        }
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param col
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseGroup(col, data, options) {
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
            if(ORM.isArray(options.group)){
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
     * @param col
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseJoin(col, data, options) {
        //未实现
        return Promise.reject('not support');
    }

    /**
     * mongodb需要严格匹配数据,此处做处理
     * @param col
     * @param data
     * @param options
     */
    parseData(col, data, options){
        //暂时未实现
    }

    /**
     *
     * @param col
     * @param data
     * @param options
     */
    parseMethod(col, data, options) {
        let caseList = {SELECT: 1, ADD: 1, /*ADDALL: 1,*/ UPDATE: 1, DELETE: 1, COUNT: 1, SUM: 1};
        let optType = options.method, fn, pipe = [];
        if (optType && optType in caseList) {
            switch (optType) {
                case 'FIND':
                    if(ORM.isEmpty(options.group)){
                        this.sql = `${this.sql}${options.where ? '.findOne(' + JSON.stringify(options.where) + ')' : '.findOne()'}`;
                        return col.findOne(options.where || {});
                    } else {
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        return col.group(options.group);
                    }
                    break;
                case 'SELECT':
                    if(ORM.isEmpty(options.group)){
                        this.sql = `${this.sql}${options.where ? '.find(' + JSON.stringify(options.where) + ')' : '.find()'}`;
                        return col.find(options.where || {}).toArray();
                    } else {
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        return col.group(options.group);
                    }
                    break;
                case 'ADD':
                    this.sql = `${this.sql}.insertOne(${JSON.stringify(data)})`;
                    return col.insertOne(data);
                    break;
                case 'ADDALL':
                    this.sql = `${this.sql}.insertMany(${JSON.stringify(data)})`;
                    return col.insertMany(data);
                    break;
                case 'UPDATE':
                    this.sql = `${this.sql}${options.where ? '.update(' + JSON.stringify(options.where) + ', {$set:' + JSON.stringify(data) + '}, false, true))' : '.update({}, {$set:' + JSON.stringify(data) + '}, false, true)'}`;
                    return col.updateMany(options.where || {}, data);
                    break;
                case 'DELETE':
                    this.sql = `${this.sql}${options.where ? '.remove(' + JSON.stringify(options.where) + ')' : '.remove()'}`;
                    return col.deleteMany(options.where || {});
                    break;
                case 'COUNT':
                    if(ORM.isEmpty(options.group)){
                        fn = ORM.promisify(col.aggregate, col);
                        !ORM.isEmpty(options.where) && pipe.push({$match: options.where});
                        pipe.push({
                            $group: {
                                _id: null,
                                count: {$sum: 1}
                            }
                        })
                        this.sql = `${this.sql}.aggregate(${JSON.stringify(pipe)})`;
                        return fn(pipe);
                    } else {
                        options.group.initial = {
                            "countid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', `if (obj.${options.count} != null) if (obj.${options.count} instanceof Array){prev.countid += obj.${options.count}.length; }else{ prev.countid++;}`);
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        return col.group(options.group);
                    }
                    break;
                case 'SUM':
                    if(ORM.isEmpty(options.group)){
                        fn = ORM.promisify(col.aggregate, col);
                        !ORM.isEmpty(options.where) && pipe.push({$match: options.where});
                        pipe.push({
                            $group: {
                                _id: 1,
                                count: {$sum: `$${options.sum}`}
                            }
                        })
                        this.sql = `${this.sql}.aggregate(${JSON.stringify(pipe)})`;
                        return fn(pipe);
                    } else {
                        options.group.initial = {
                            "sumid": 0
                        };
                        options.group.reduce = new Function('obj', 'prev', `prev.sumid = prev.sumid + obj.${options.sum} - 0;`);
                        options.group.cond = options.where;
                        this.sql = `${this.sql}.group(${JSON.stringify(options.group)})`;
                        return col.group(options.group);
                    }
                    break;
            }
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
        let collection;
        try {
            let caseList = {
                SELECT: {join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1},
                ADD: {data: 1},
                UPDATE: {where: 1, data: 1},
                DELETE: {where: 1},
                COUNT: {join: 1, where: 1, limit: 1, group: 1},
                SUM: {join: 1, where: 1, limit: 1, group: 1}
            };
            if (conn) {
                let optType = options.method;
                //处理collection
                collection = await conn.collection(options.table);
                this.sql = `db.${options.table}`;

                //处理join
                if (options['join'] && caseList[optType]['join']) {
                    await this.parseJoin(collection, data, options);
                    caseList[optType]['join'] && (caseList[optType]['join'] = 0);
                }
                //解析where
                if (options['where'] && caseList[optType]['where']) {
                    await this.parseWhere(collection, data, options);
                    caseList[optType]['where'] && (caseList[optType]['where'] = 0);
                }
                //解析group
                if (options['group'] && caseList[optType]['group']) {
                    await this.parseGroup(collection, data, options);
                    caseList[optType]['group'] && (caseList[optType]['group'] = 0);
                }
                //解析data
                if (options['data'] && caseList[optType]['data']) {
                    await this.parseData(collection, data, options);
                    caseList[optType]['data'] && (caseList[optType]['data'] = 0);
                }
                //处理method
                collection = await this.parseMethod(collection, data, options);

                //处理其他options
                for (let n in options) {
                    if (caseList[optType][n]) {
                        let mt = `parse${ORM.ucFirst(n)}`;
                        if (mt && ORM.isFunction(this[mt])) {
                            collection = await this[mt](collection, data, options);
                        }
                    }
                }
                return {sql: this.sql, col: collection};
            }
        } catch (e) {

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
        let parseOptions = ORM.extend({}, options);
        return this.parseSql(conn, data, parseOptions);
    }
}
