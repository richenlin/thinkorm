/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/14
 */
import base from '../base';
import lib from '../Util/lib';

const identifiers = {
    OR: 'OR',
    AND: 'AND',
    NOT: 'NOT',
    IN: 'IN',
    NOTIN: 'NOTIN',
    '>': 'OPERATOR',
    '<': 'OPERATOR',
    '<>': 'OPERATOR',
    '<=': 'OPERATOR',
    '>=': 'OPERATOR',
    'LIKE': 'OPERATOR'
};
/**
 * 书写方法:
 * or:  {or: [{...}, {...}]}
 * not: {not: {name: '', id: 1}}
 * notin: {notin: {'id': [1,2,3]}}
 * in: {id: [1,2,3]}
 * and: {id: 1, name: 'a'},
 * operator: {id: {'<>': 1}}
 * operator: {id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}}
 * like: {name: {'like': '%a'}}
 * @param knex
 * @param options
 * @param alias
 * @param extkey
 */
let parseKnexWhere = function (knex, options, alias, extkey) {
    let idt = '';
    for (let op in options) {
        idt = op.toUpperCase();
        switch (identifiers[idt]) {
            case 'OR':
                if (lib.isArray(options[op])) {
                    parseOr(knex, options[op], alias);
                }
                break;
            case 'IN':
                if (lib.isArray(options[op])) {
                    parseIn(knex, op, options[op], alias);
                } else if (lib.isObject(options[op])) {
                    for (let n in options[op]) {
                        parseIn(knex, n, options[op][n], alias);
                    }
                }
                break;
            case 'NOTIN':
                if (lib.isObject(options[op])) {
                    parseNotIn(knex, options[op], alias);
                } else if (lib.isArray(options[op]) && extkey !== undefined) {
                    parseNotIn(knex, {[extkey]: options[op]}, alias);
                }
                break;
            case 'NOT':
                if (lib.isObject(options[op])) {
                    parseNot(knex, options[op], alias);
                } else if(extkey !== undefined){
                    parseNot(knex, {[extkey]: options[op]}, alias);
                }
                break;
            case 'OPERATOR':
                if (extkey !== undefined) {
                    parseOperator(knex, extkey, op, options[op], alias);
                } else if (lib.isObject(options[op])) {
                    for (let n in options[op]) {
                        parseKnexWhere(knex, {[n]: options[op][n]}, alias, op);
                    }
                }
                break;
            case 'AND':
            default:
                if (lib.isArray(options[op])) {
                    parseIn(knex, op, options[op], alias);
                } else if (lib.isObject(options[op])) {
                    for (let n in options[op]) {
                        parseKnexWhere(knex, {[n]: options[op][n]}, alias, op);
                    }
                } else {
                    let _key = (alias && op.indexOf('.') === -1) ? `${alias}.${op}` : op;
                    knex.where(_key, '=', options[op]);
                }
        }
    }
};
//解析or条件
function parseOr(knex, options, alias) {
    knex.where(function () {
        options.map(item => {
            if (lib.isObject(item)) {
                this.orWhere(function () {
                    parseKnexWhere(this, item, alias);
                });
            }
        });
    });
}
//解析not条件
function parseNot(knex, options, alias) {
    knex.whereNot(function () {
        parseKnexWhere(this, options, alias);
    });
}
//解析in条件
function parseIn(knex, key, value, alias) {
    let _key = (alias && key.indexOf('.') === -1) ? `${alias}.${key}` : key;
    knex.whereIn(_key, value);
}
//解析notin条件
function parseNotIn(knex, options, alias) {
    let _key = '';
    for (let n in options) {
        _key = (alias && n.indexOf('.') === -1) ? `${alias}.${n}` : n;
        knex.whereNotIn(_key, options[n]);
    }
}
//解析operator等条件
function parseOperator(knex, key, operator, value, alias) {
    let _key = (alias && key.indexOf('.') === -1) ? `${alias}.${key}` : key;
    knex.where(_key, operator, value);
}


//let preParseKnexWhere = function (options, key, value, k, alias, isor = false) {
//    try {
//        let idt = key.toUpperCase();
//        let _alias = alias ? `${alias}.` : '';
//        switch (identifiers[idt]) {
//            case 'OR':
//                if (lib.isArray(value)) {
//                    for (let n of value) {
//                        for (let orKey in n) {
//                            preParseKnexWhere(options, orKey, n[orKey], orKey, alias, true);
//                        }
//                    }
//                }
//                break;
//            case 'IN':
//                for (let n in value) {
//                    if (lib.isArray(value[n])) {
//                        isor ? options.orwhere.in.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]) : options.where.in.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]);
//                    }
//                }
//                break;
//            case 'NOTIN':
//                for (let n in value) {
//                    if (lib.isArray(value[n])) {
//                        isor ? options.orwhere.notin.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]) : options.where.notin.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]);
//                    }
//                }
//                break;
//            case 'NOT':
//                for (let n in value) {
//                    if (lib.isArray(value[n])) {
//                        isor ? options.orwhere.notin.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]) : options.where.notin.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]);
//                    } else {
//                        isor ? options.orwhere.not.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]) : options.where.not.push([`${n.indexOf('.') === -1 ? _alias : ''}${n}`, value[n]]);
//                    }
//                }
//                break;
//            case 'OPERATOR':
//                isor ? options.orwhere.operation.push([`${k.indexOf('.') === -1 ? _alias : ''}${k}`, key, value]) : options.where.operation.push([`${k.indexOf('.') === -1 ? _alias : ''}${k}`, key, value]);
//                break;
//            case 'AND':
//            default:
//                if (lib.isArray(value)) {
//                    isor ? options.orwhere.in.push([`${key.indexOf('.') === -1 ? _alias : ''}${key}`, value]) : options.where.in.push([`${key.indexOf('.') === -1 ? _alias : ''}${key}`, value]);
//                } else if (lib.isObject(value)) {
//                    for (let n in value) {
//                        preParseKnexWhere(options, n, value[n], key, alias, isor);
//                    }
//                } else {
//                    isor ? options.orwhere.and.push([`${key.indexOf('.') === -1 ? _alias : ''}${key}`, '=', value]) : options.where.and.push([`${key.indexOf('.') === -1 ? _alias : ''}${key}`, '=', value]);
//                }
//                break;
//        }
//    } catch (e) {
//        return options;
//    }
//};
///**
// *
// * @param knex
// * @param optionWhere
// */
//let parseKnexAndWhere = function (knex, optionWhere) {
//    if (optionWhere.and.length > 0) {
//        optionWhere.and.map(data=> {
//            knex.where(data[0], data[1], data[2]);
//        });
//    }
//
//    if (optionWhere.in.length > 0) {
//        optionWhere.in.map(data=> {
//            knex.whereIn(data[0], data[1]);
//        });
//    }
//
//    if (optionWhere.not.length > 0) {
//        optionWhere.not.map(data=> {
//            knex.whereNot(data[0], data[1]);
//        });
//    }
//
//    if (optionWhere.notin.length > 0) {
//        optionWhere.notin.map(data=> {
//            knex.whereNotIn(data[0], data[1]);
//        });
//    }
//
//    if (optionWhere.operation.length > 0) {
//        optionWhere.operation.map(data=> {
//            knex.where(data[0], data[1], data[2]);
//        });
//    }
//};
//
///**
// *
// * @param knex
// * @param optionOrWhere
// */
//let parseKnexOrWhere = function (knex, optionOrWhere) {
//    if (optionOrWhere.and.length > 0) {
//        optionOrWhere.and.map(data=> {
//            knex.orWhere(data[0], data[1], data[2]);
//        })
//    }
//    if (optionOrWhere.operation.length > 0) {
//        optionOrWhere.operation.map(data=> {
//            knex.orWhere(data[0], data[1], data[2]);
//        })
//    }
//    if (optionOrWhere.in.length > 0) {
//        optionOrWhere.in.map(data=> {
//            knex.orWhereIn(data[0], data[1]);
//        })
//    }
//    if (optionOrWhere.not.length > 0) {
//        optionOrWhere.not.map(data=> {
//            knex.orWhereNot(data[0], data[1]);
//        })
//    }
//    if (optionOrWhere.notin.length > 0) {
//        optionOrWhere.notin.map(data=> {
//            knex.orWhereNotIn(data[0], data[1]);
//        })
//    }
//};
//
///**
// * modify by lihao ,修改or条件的解析
// * @param knex
// * @param optionOrWhere
// * @param optionWhere
// */
//let parseKnexWhere = function (knex, optionOrWhere, optionWhere) {
//    //parse where
//    parseKnexAndWhere(knex, optionWhere);
//
//    //parse orwhere
//    knex.andWhere(function () {
//        parseKnexOrWhere(this, optionOrWhere);
//    });
//};

/**
 *
 * @param onCondition
 * @param alias
 * @param joinAlias
 * @returns {string}
 */
let preParseKnexJoin = function (onCondition, alias, joinAlias, funcTemp = 'this') {
    let _alias = alias ? `${alias}.` : '';
    let _joinAlias = joinAlias ? `${joinAlias}.` : '';
    //解析on
    for (let n in onCondition) {
        if (n === 'or' || n === 'OR') {
            if (!lib.isArray(onCondition[n])) {
                continue;
            }
            onCondition[n].forEach(it => {
                for (let i in it) {
                    //a join b, b join c的情况下,on条件内已经申明alias
                    if (i.indexOf('.') === -1) {
                        funcTemp += `.orOn('${_alias}${i}', '=', '${_joinAlias}${it[i]}')`;
                    } else {
                        funcTemp += `.orOn('${i}', '=', '${_joinAlias}${it[i]}')`;
                    }
                }
            })
        } else {
            //a join b, b join c的情况下,on条件内已经申明alias
            if (n.indexOf('.') === -1) {
                funcTemp += `.on('${_alias}${n}', '=', '${_joinAlias}${onCondition[n]}')`;
            } else {
                funcTemp += `.on('${n}', '=', '${_joinAlias}${onCondition[n]}')`;
            }
        }
    }
    return funcTemp;
};

/**
 *
 * @param str
 * @param field
 * @param value
 * let types = {
            integer: {},
            string: {size: 50},
            float: {precision: 8, size: 2},
            json: {},
            text: {}
        };
 */
let preParseSchema = function (field, value) {
    let str = '';
    if (value.hasOwnProperty('primaryKey') && value.primaryKey === true) {
        str += `t.increments('${field}').primary()`;
    } else {
        switch (value.type) {
            case 'integer':
                str += `t.integer('${field}')`;
                break;
            case 'float':
                str += `t.float('${field}', 8, ${value.size || 2})`;
                break;
            case 'string':
                str += `t.string('${field}', ${value.size || 50})`;
                break;
            case 'json':
                str += `t.json('${field}')`;
                break;
            case 'array':
                str += `t.enum('${field}')`;
                break;
            case 'text':
                str += `t.text('${field}')`;
                break;
            default:
                str += `t.string('${field}')`;
                break;
        }
        if (value.hasOwnProperty('index') && value.index === true) {
            str += `.index('${field}')`;
        }
        if (value.hasOwnProperty('unique') && value.unique === true) {
            str += `.unique()`;
        }
        if (value.hasOwnProperty('defaultsTo')) {
            str += `.defaultTo(${value.defaultsTo})`;
        }
    }
    return str + ';';
};


export default class extends base {

    init(config = {}) {
        this.config = config;
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     */
    parseLimit(cls, data, options) {
        if (lib.isEmpty(options.limit)) {
            return;
        }
        cls.limit(options.limit[1] || 10).offset(options.limit[0] || 0);
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     */
    parseOrder(cls, data, options) {
        if (lib.isEmpty(options.order)) {
            return;
        }
        for (let n in options.order) {
            cls.orderBy(n, options.order[n]);
        }
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     */
    parseField(cls, data, options) {
        if (lib.isEmpty(options.field)) {
            return;
        }
        let fds = [], temp = [];
        options.field.forEach(item => {
            //不支持直接写*
            if (item !== '*') {
                if (item.indexOf('.') > -1) {
                    temp = item.trim().split('.');
                    if (temp[0] !== options.name && temp[1] !== '*') {
                        fds.push(`${item} AS ${item.replace('.', '_')}`);
                    }
                } else {
                    fds.push(`${options.name}.${item}`);
                }
            }
        });
        cls.column(fds);
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     */
    parseWhere(cls, data, options) {
        if (lib.isEmpty(options.where)) {
            return;
        }
        //parse where options
        parseKnexWhere(cls, options.where, options.alias);

        //let optionsWhere = {
        //    where: {
        //        "and": [],
        //        "not": [],
        //        "in": [],
        //        "notin": [],
        //        "operation": []
        //    },
        //    orwhere: {
        //        "and": [],
        //        "not": [],
        //        "in": [],
        //        "notin": [],
        //        "operation": []
        //    }
        //};
        ////parse where options
        //for (let key in options.where) {
        //    preParseKnexWhere(optionsWhere, key, options.where[key], '', options.alias);
        //}
        ////parsed to knex
        //parseKnexWhere(cls, optionsWhere.orwhere, optionsWhere.where);
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param cls
     * @param data
     * @param options
     */
    parseGroup(cls, data, options) {
        if (lib.isEmpty(options.group)) {
            return;
        }
        cls.groupBy(options.group);
    }

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param cls
     * @param data
     * @param options
     */
    parseJoin(cls, data, options) {
        //解析后结果
        //.innerJoin('accounts', function() {
        //    this.on('accounts.id', '=', 'users.account_id').on('accounts.owner_id', '=', 'users.id').orOn('accounts.owner_id', '=', 'users.id')
        //})
        if (lib.isArray(options.join)) {
            let type, config = this.config, name = options.name, joinAlias = '', joinTable = '', onCondition, func = '';
            options.join.map(item => {
                if (item && item.from && item.on) {
                    onCondition = item.on;
                    joinAlias = item.from;
                    joinTable = `${config.db_prefix}${lib.parseName(item.from)}`;
                    //关联表字段
                    if (!lib.isEmpty(item.field) && lib.isArray(item.field)) {
                        !options.field && (options.field = [`${name}.*`]);
                        item.field.forEach(it => {
                            //关联表字段不能写*
                            if (it && it.trim() !== '*') {
                                options.field.push(`${item.from}.${it} AS ${joinAlias}_${it}`);
                            }
                        });
                    }
                    //构造函数
                    func = new Function('', preParseKnexJoin(onCondition, name, joinAlias));
                    //拼装knex
                    type = item.type ? item.type.toLowerCase() : 'inner';
                    cls[`${type}Join`](`${joinTable} AS ${joinAlias}`, func);
                }
            });
        }
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     */
    parseSchema(cls, data, options) {
        if (lib.isEmpty(data) || lib.isEmpty(options.schema)) {
            return;
        }
        let tableName = `${data.db_prefix}${lib.parseName(options.schema.name)}`;
        let str = [], fields = options.schema.fields;
        for (let v in fields) {
            str.push(preParseSchema(v, fields[v]));
        }
        let func = new Function('t', str.join('\n'));
        cls.createTableIfNotExists(tableName, func);
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     * @returns {string}
     */
    async parseSql(cls, data, options) {
        try {
            let caseList = {
                SELECT: {join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1},
                ADD: {data: 1},
                UPDATE: {where: 1, data: 1},
                DELETE: {where: 1},
                COUNT: {join: 1, where: 1, limit: 1, group: 1},
                SUM: {join: 1, where: 1, limit: 1, group: 1},
                MIGRATE: {schema: 1}
            };
            if (cls) {
                let optType = options.method;
                //处理join
                if (options['join'] && caseList[optType]['join']) {
                    await this.parseJoin(cls, data, options);
                    caseList[optType]['join'] && (caseList[optType]['join'] = 0);
                }
                //处理其他options
                for (let n in options) {
                    if (caseList[optType][n]) {
                        let mt = `parse${lib.ucFirst(n)}`;
                        mt && lib.isFunction(this[mt]) && await this[mt](cls, data, options);
                    }
                }
                return cls.toString();
            }
        } catch (e) {
            throw new Error(e);
        }
    }

    /**
     *
     * @param cls
     * @param data
     * @param options
     * @returns {string}
     */
    buildSql(cls, data, options) {
        if (options === undefined) {
            options = data;
        }
        //防止外部options被更改
        let parseOptions = lib.extend({}, options);
        return this.parseSql(cls, data, parseOptions);
    }
}
