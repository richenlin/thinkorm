/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/14
 */
import base from '../base';

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
    '>=': 'OPERATOR'
};
/**
 * 书写方法:
 and: {id: 1, name: 'a'},
 or:  {or: [{...}, {...}]}
 in: {id: [1,2,3]}
 not: {not: {name: '', id: 1}}
 notin: {notin: {'id': [1,2,3]}}
 operator: {id: {'<>': 1, '>=': 0}}
 * @param options
 * @param key
 * @param value
 * @param k
 * @param alias
 * @param isor
 * @returns {*}
 */
let preParseKnexWhere = function (options, key, value, k, alias, isor = false) {
    try {
        let idt = key.toUpperCase();
        switch (identifiers[idt]) {
            case 'OR':
                if (ORM.isArray(value)) {
                    for (let n of value) {
                        for (let orKey in n) {
                            preParseKnexWhere(options, orKey, n[orKey], orKey, alias, true);
                        }
                    }
                }
                break;
            case 'IN':
                for (let n in value) {
                    if (ORM.isArray(value[n])) {
                        isor ? options.orwhere.in.push([`${alias}.${n}`, value[n]]) : options.where.in.push([`${alias}.${n}`, value[n]]);
                    }
                }
                break;
            case 'NOTIN':
                for (let n in value) {
                    if (ORM.isArray(value[n])) {
                        isor ? options.orwhere.notin.push([`${alias}.${n}`, value[n]]) : options.where.notin.push([`${alias}.${n}`, value[n]]);
                    }
                }
                break;
            case 'NOT':
                for (let n in value) {
                    if (ORM.isArray(value[n])) {
                        isor ? options.orwhere.notin.push([`${alias}.${n}`, value[n]]) : options.where.notin.push([`${alias}.${n}`, value[n]]);
                    } else {
                        isor ? options.orwhere.not.push([`${alias}.${n}`, value[n]]) : options.where.not.push([`${alias}.${n}`, value[n]]);
                    }
                }
                break;
            case 'OPERATOR':
                isor ? options.orwhere.operation.push([`${alias}.${k}`, key, value]) : options.where.operation.push([`${alias}.${k}`, key, value]);
                break;
            case 'AND':
            default:
                if (ORM.isArray(value)) {
                    isor ? options.orwhere.in.push([`${alias}.${key}`, value]) : options.where.in.push([`${alias}.${key}`, value]);
                } else if (ORM.isObject(value)) {
                    for (let n in value) {
                        preParseKnexWhere(options, n, value[n], key, alias, isor);
                    }
                } else {
                    isor ? options.orwhere.and.push([`${alias}.${key}`, '=', value]) : options.where.and.push([`${alias}.${key}`, '=', value]);
                }
                break;
        }
    } catch (e) {
        return options;
    }
};
/**
 *
 * @param knex
 * @param optionWhere
 */
let parseKnexWhere = function (knex, optionWhere) {
    if (optionWhere.and) {
        optionWhere.and.map(data=> {
            knex.where(data[0], data[1], data[2]);
        })
    }

    if (optionWhere.in) {
        optionWhere.in.map(data=> {
            knex.whereIn(data[0], data[1]);
        })
    }

    if (optionWhere.not) {
        optionWhere.not.map(data=> {
            knex.whereNot(data[0], data[1]);
        })
    }

    if (optionWhere.notin) {
        optionWhere.notin.map(data=> {
            knex.whereNotIn(data[0], data[1]);
        })
    }

    if (optionWhere.null) {
        optionWhere.null.map(data=> {
            //this.knex.whereNull(...data);
            data.map(d=> {
                knex.whereNull(d);
            })
        })
    }

    if (optionWhere.notnull) {
        optionWhere.notnull.map(data=> {
            data.map(d=> {
                knex.whereNotNull(d);
            })
        })
    }

    if (optionWhere.between) {
        optionWhere.between.map(data=> {
            knex.whereBetween(data[0], data[1]);
        })
    }

    if (optionWhere.notbetween) {
        optionWhere.notbetween.map(data=> {
            knex.whereNotBetween(data[0], data[1]);
        })
    }

    if (optionWhere.operation) {
        optionWhere.operation.map(data=> {
            knex.where(data[0], data[1], data[2]);
        })
    }
};
/**
 *
 * @param knex
 * @param optionOrWhere
 */
let parseKnexOrWhere = function (knex, optionOrWhere) {
    if (optionOrWhere.and) {
        optionOrWhere.and.map(data=> {
            knex.orWhere(data[0], data[1], data[2]);
        })
    }
    if (optionOrWhere.operation) {
        optionOrWhere.operation.map(data=> {
            knex.orWhere(data[0], data[1], data[2]);
        })
    }
    if (optionOrWhere.in) {
        optionOrWhere.in.map(data=> {
            knex.orWhereIn(data[0], data[1]);
        })
    }
    if (optionOrWhere.not) {
        optionOrWhere.not.map(data=> {
            knex.orWhereNot(data[0], data[1]);
        })
    }
    if (optionOrWhere.notin) {
        optionOrWhere.notin.map(data=> {
            knex.orWhereNotIn(data[0], data[1]);
        })
    }
};

/**
 *
 * @param onCondition
 * @param table
 * @param joinTable
 * @returns {string}
 */
let preParseKnexJoin = function (onCondition, table, joinTable, funcTemp = 'this') {
    //解析on
    for (let n in onCondition) {
        if (n === 'or' || n === 'OR') {
            if (!ORM.isArray(onCondition[n])) {
                continue;
            }
            onCondition[n].forEach(it => {
                for (let i in it) {
                    funcTemp += `.orOn('${table}.${i}', '=', '${joinTable}.${it[i]}')`;
                }
            })
        } else {
            funcTemp += `.on('${table}.${n}', '=', '${joinTable}.${onCondition[n]}')`;
        }
    }
    return funcTemp;
};


export default class extends base {
    init(config = {}) {
        this.config = config;
        this.knex = null;
    }

    /**
     *
     * @param data
     * @param options
     */
    parseLimit(data, options) {
        if (ORM.isEmpty(options.limit)) {
            return;
        }
        this.knex.limit(options.limit[1] || 10).offset(options.limit[0] || 0);
    }

    /**
     *
     * @param data
     * @param options
     */
    parseOrder(data, options) {
        if (ORM.isEmpty(options.order)) {
            return;
        }
        for (let n in options.order) {
            this.knex.orderBy(n, options.order[n]);
        }
    }

    /**
     *
     * @param data
     * @param options
     */
    parseField(data, options) {
        if (ORM.isEmpty(options.field)) {
            return;
        }
        let fds = [];
        options.field.forEach(item => {
            if (item.indexOf('.') > -1) {
                fds.push(item);
            } else {
                fds.push(`${options.table}.${item}`);
            }
        });
        this.knex.column(fds);
    }

    /**
     *
     * @param data
     * @param options
     */
    parseWhere(data, options) {
        if (ORM.isEmpty(options.where)) {
            return;
        }
        let optionsWhere = {
            where: {
                "and": [],
                "not": [],
                "in": [],
                "notin": [],
                "null": [],
                "notnull": [],
                "between": [],
                "notbetween": [],
                "operation": []
            },
            orwhere: {
                "and": [],
                "not": [],
                "in": [],
                "notin": [],
                "null": [],
                "notnull": [],
                "between": [],
                "notbetween": [],
                "operation": []
            }
        };
        //parse where options
        for (let key in options.where) {
            preParseKnexWhere(optionsWhere, key, options.where[key], '', options.table);
        }

        //parsed to knex
        for (let n in optionsWhere) {
            if (n === 'where') {
                parseKnexWhere(this.knex, optionsWhere[n]);
            } else if (n === 'orwhere') {
                parseKnexOrWhere(this.knex, optionsWhere[n]);
            }
        }
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     */
    parseGroup(data, options) {
        if (ORM.isEmpty(options.group)) {
            return;
        }
        this.knex.groupBy(options.group);
    }

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name']}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name']}], 'left')
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name']}], 'right')
     * @param data
     * @param options
     */
    parseJoin(data, options) {
        //解析后结果
        //.innerJoin('accounts', function() {
        //    this.on('accounts.id', '=', 'users.account_id').on('accounts.owner_id', '=', 'users.id').orOn('accounts.owner_id', '=', 'users.id')
        //})
        if (options.joinType && ORM.isArray(options.join)) {
            let type = options.joinType, config = this.config, table = options.table, joinTable = '', onCondition, func = '';
            options.join.map(item => {
                if (item.from && item.on) {
                    onCondition = item.on;
                    joinTable = item.from.toLowerCase();
                    joinTable = joinTable.indexOf(config.db_prefix) > -1 ? joinTable : `${config.db_prefix}${joinTable}`;
                    if (!ORM.isEmpty(item.field) && ORM.isArray(item.field)) {
                        item.field.forEach(it => {
                            //关联表字段必须指定,不能写*
                            if (it.indexOf('*') === -1) {
                                options.field.push(`${joinTable}.${it} AS ${joinTable}_${it}`);
                            }
                        });
                    }
                    //构造函数
                    func = new Function('', preParseKnexJoin(onCondition, table, joinTable));
                    //拼装knex
                    this.knex[`${type}Join`](`${joinTable} AS ${joinTable}`, func);
                }
            });
        }
    }

    /**
     *
     * @param data
     * @param options
     */
    parseData(data, options) {
        return data;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseTable(data, options) {
        this.knex.from(`${options.table} AS ${options.table}`);
    }

    /**
     *
     * @param data
     * @param options
     */
    parseMethod(data, options) {
        let caseList = {SELECT: 1, ADD: 1, UPDATE: 1, DELETE: 1, COUNT: 1, SUM: 1};
        let optType = options.method;
        if (optType && optType in caseList) {
            switch (optType) {
                case 'SELECT':
                    this.knex = this.knexClient.select();
                    break;
                case 'ADD':
                    this.knex = this.knexClient.insert(data);
                    break;
                case 'UPDATE':
                    this.knex = this.knexClient.update(data);
                    break;
                case 'DELETE':
                    this.knex = this.knexClient.del();
                    break;
                case 'COUNT':
                    this.knex = this.knexClient.count(options.count);
                    break;
                case 'SUM':
                    this.knex = this.knexClient.sum(options.sum);
                    break;
            }
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {string}
     */
    async parseSql(data, options) {
        try {
            let caseList = {
                SELECT: {table: 1, join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1},
                ADD: {table: 1},
                UPDATE: {table: 1, where: 1},
                DELETE: {table: 1, where: 1},
                COUNT: {table: 1, join: 1, where: 1, field: 1, limit: 1, group: 1},
                SUM: {table: 1, join: 1, where: 1, field: 1, limit: 1, group: 1}
            };
            //处理method
            await this.parseMethod(data, options);
            if (this.knex) {
                let optType = options.method;
                //处理table
                await this.parseTable(data, options);
                caseList[optType]['table'] && (caseList[optType]['table'] = 0);
                //处理join
                if (options['join'] && caseList[optType]['join']) {
                    await this.parseJoin(data, options);
                    caseList[optType]['join'] && (caseList[optType]['join'] = 0);
                }
                //处理其他options
                for (let n in options) {
                    if (caseList[optType][n]) {
                        let mt = `parse${ORM.ucFirst(n)}`;
                        mt && ORM.isFunction(this[mt]) && await this[mt](data, options);
                    }
                }
                return this.knex.toString();
            }
        } catch (e) {
        }
        return '';
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    buildSql(data, options) {
        if (options === undefined) {
            options = data;
        } else {
            options.data = data;
        }
        return this.parseSql(data, options);
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
