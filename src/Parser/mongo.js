/**
 * Created by lihao on 16/8/2.
 */
import base from '../base';
import builder from 'mongo-sql';
export default class extends base {
    init(config = {}) {
        this.config = config;
        this.jsonObj = {};
        this.lastsql = '';
    }


    /**
     * 解析分页
     * @param data
     * @param options
     */
    parsePage(data, options) {
        this.jsonObj.skip = options.page.page || 1;
        this.jsonObj.limit = options.page.limit || 10;
    }

    /**
     * 解析排序
     * @param data
     * @param options
     */
    parseOrder(data, options) {
        let o = -1, order = options.order;
        if (ORM.isString(order)) {
            if (order.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                o = 1;
                order = order.substr(0, order.length - 4);
            } else if (order.indexOf(' desc') > -1 || order.indexOf(' DESC') > -1) {
                order = order.substr(0, order.length - 5);
            }
            this.jsonObj.sort = {[options.order]: o};
        } else {
            this.jsonObj.sort = {};
            for (let k in order) {
                this.jsonObj.sort[k] =  order[k] == 'aes' || order[k] == 'AES' ? 1 : -1;
            }
        }
    }

    /**
     * 解析表名
     * @param table
     */
    parseTable(data, options) {
        this.jsonObj.table = options.table;
    }

    /**
     * 解析字段
     * @param data
     * @param options
     */
    parseField(data, options) {
        this.jsonObj.project = {};
        for (let field of options.field) {
            if (field.indexOf('.') > -1) {
                this.jsonObj.project[field.split('.')[1]] = 1;
            } else {
                this.jsonObj.project[field] = 1;
            }
        }
    }

    /**
     * 解析操作类型
     * @param method
     */
    parseMethod(data, options) {
        this.jsonObj.type = options.method;
    }

    /**
     * 解析条件
     * @param where
     */
    parseWhere(data, options) {
        let optionWhere = options.where;
        let where = {};
        let identifiers = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            'or': '$or',
            'not': '$ne',
            'in': '$in',
            'notin': '$nin',
        }
        let parse = function (key, value, item) {
            //console.log(key, value, item)
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
                            temp.push(parse(k, data[k], k));
                        }
                    })
                    where = {$or: temp};
                    break;
                default:
                    if (ORM.isJSONObj(value)) {
                        for (let k in value) {
                            return parse(k, value[k], key);
                        }
                    } else {
                        where[key] = value;
                        return {[key]: value}
                    }
                    break;
            }
        }

        for (let key in optionWhere) {
            parse(key, optionWhere[key], key);
        }
        this.jsonObj.where = where;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {string}
     */
    parseSql(data, options) {
        let parseOptions = {};
        for (let n in options) {
            let mt = ORM.ucFirst(n);
            if (this[`parse${mt}`] && ORM.isFunction(this[`parse${mt}`])) {
                parseOptions = ORM.extend(false, parseOptions, this[`parse${mt}`](data, options));
            }
        }
    }

    /**
     * 生成查询语句
     */
    buildSql(data, options) {
        if (options === undefined) {
            options = data;
        } else {
            options.data = data;
        }
        this.parseSql(data, options);
        return Promise.resolve(this.jsonObj);
        //console.log(this.jsonObj)
        //let result = builder.sql(this.jsonObj);
        //console.log(result)
        //let sql = result.toString();
        //if (!ORM.isEmpty(result.values)) {
        //    result.values.map(item=> {
        //        sql = sql.replace(/\$[0-9]*/, ORM.isNumber(item) ? item : `'${item}'`);
        //    })
        //}
        //this.lastsql = sql;
        //return Promise.resolve(this.lastsql)
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