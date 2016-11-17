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
    let str = '', primary = false;
    if (value.hasOwnProperty('primaryKey') && value.primaryKey === true) {
        primary = true;
    }
    switch (value.type) {
        case 'integer':
            str += `t.integer('${field}')`;
            if (primary === true) {
                str += `.increments('${field}').primary()`;
            }
            break;
        case 'float':
            str += `t.float('${field}', 8, ${value.size || 2})${primary === true ? '.primary()' : ''}`;
            break;
        case 'string':
            str += `t.string('${field}', ${value.size || 50})${primary === true ? '.primary()' : ''}`;
            break;
        case 'json':
        case 'array':
            str += `t.json('${field}')${primary === true ? '.primary()' : ''}`;
            break;
        case 'text':
            str += `t.text('${field}')${primary === true ? '.primary()' : ''}`;
            break;
        default:
            str += `t.string('${field}')${primary === true ? '.primary()' : ''}`;
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
            if (n.indexOf('.') > -1) {
                cls.orderBy(n, options.order[n]);
            } else {
                cls.orderBy(`${options.alias}.${n}`, options.order[n]);
            }
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
        // let fds = [], temp = [];
        // options.field.forEach(item => {
        //     //跳过*
        //     if (item !== '*') {
        //         if (item.indexOf('.') > -1) {
        //             temp = item.trim().split('.');
        //             if (temp[0] !== options.alias && temp[1] !== '*') {
        //                 fds.push(`${item} AS ${item.replace('.', '_')}`);
        //             }
        //         } else {
        //             fds.push(`${options.alias}.${item}`);
        //         }
        //     }
        // });
        // cls.column(fds);
        cls.column(options.field);
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
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'Test', alias: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
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
            let type, config = this.config, name = options.alias, joinAlias = '', joinTable = '', onCondition, func = '', _field = [];
            options.join.map(item => {
                if (item && item.from && item.on) {
                    onCondition = item.on;
                    joinAlias = item.alias || item.from;
                    joinTable = `${config.db_prefix}${lib.parseName(item.from)}`;
                    !options.field && (options.field = ['*']);
                    //关联表字段
                    if (lib.isArray(item.field)) {
                        item.field.forEach(it => {
                            options.field.push(it.indexOf('.') > -1 ? it : `${joinAlias}.${it}`);
                        });
                    }
                    //构造函数
                    func = new Function('', preParseKnexJoin(onCondition, name, joinAlias));
                    //拼装knex
                    type = item.type ? item.type.toLowerCase() : 'inner';
                    cls[`${type}Join`](`${joinTable} AS ${joinAlias}`, func);
                }
            });
            options.field.forEach(it => {
                _field.push(it.indexOf('.') > -1 ? it : `${name}.${it}`);
            });
            options.field = _field;
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
