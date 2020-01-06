/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-06 17:36:11
 */
const liteq = require('liteq');
const helper = liteq.helper;

interface BaseModelInterface {
    pk: string;
    tableName: string;
    modelName: string;

    readonly getTableName: () => string;
    readonly getPk: () => string;
    readonly field: (values: string | string[]) => BaseModel;
    readonly alias: (values: string) => BaseModel;
    readonly where: (values: Object) => BaseModel;
    readonly limit: (skip: number, limit?: number) => BaseModel;
    readonly order: (values: Object) => BaseModel;
    readonly distinct: (values: string[]) => BaseModel;
    readonly group: (values: string | string[]) => BaseModel;
    readonly having: (values: Object) => BaseModel;
    readonly join: (values: any[]) => BaseModel;
    readonly _beforeAdd: (data: Object, options?: Object) => Promise<any>;
    readonly add: (data: Object, options?: Object) => Promise<any>;
    readonly _afterAdd: (data: Object, options?: Object) => Promise<any>;
    readonly thenAdd: (data: Object, options?: Object) => Promise<any>;
    readonly _beforeDelete: (options: Object) => Promise<any>;
    readonly delete: (options: Object) => Promise<any>;
    readonly _afterDelete: (options: Object) => Promise<any>;
    readonly _beforeUpdate: (data: Object, options?: Object) => Promise<any>;
    readonly update: (data: Object, options?: Object) => Promise<any>;
    readonly _afterUpdate: (data: Object, options?: Object) => Promise<any>;
    readonly increment: (field: string, step?: number, data?: Object, options?: Object) => Promise<any>;
    readonly decrement: (field: string, step?: number, data?: Object, options?: Object) => Promise<any>;
    readonly find: (options?: Object) => Promise<any>;
    readonly _afterFind: (result: any, options?: Object) => Promise<any>;
    readonly select: (options?: Object) => Promise<any[]>;
    readonly countSelect: (options?: Object) => Promise<any>;
    readonly _afterSelect: (result: any, options?: Object) => Promise<any>;
    readonly count: (field?: string, options?: Object) => Promise<any>;
    readonly sum: (field: string, options?: Object) => Promise<any>;
    readonly query: (sqlStr: string, params?: any[]) => Promise<any>;
    readonly transaction: (func: Function) => Promise<any>;
    readonly migrate: (sqlStr?: string) => Promise<any>;
    readonly sql: (options?: Object, data?: Object) => Promise<string>;
}

export class BaseModel extends liteq implements BaseModelInterface {
    tableName: string;
    modelName: string;
    pk: string;

    /**
     * Creates an instance of BaseModel.
     * @param {...any[]} args
     * @memberof BaseModel
     */
    constructor(...args: any[]) {
        super(...args);
    }

    /**
     * Get table name
     *
     * @returns
     * @memberof BaseModel
     */
    getTableName(): string {
        return super.getTableName();
    }

    /**
     * Get the primary key
     *
     * @returns {string}
     * @memberof BaseModel
     */
    getPk(): string {
        return super.getPk();
    }

    /**
     * Querying column names
     * 
     * field(['aaa', 'bbb', 'ccc'])
     * @param {(string | string[])} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    field(values: string | string[]): BaseModel {
        return super.field(values);
    }

    /**
     * Querying table name alias
     *
     * @param {string} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    alias(values: string): BaseModel {
        return super.alias(values);
    }

    /**
     * Query conditions
     *
     * or:  where({or: [{...}, {...}]})
     * 
     * not: where({not: {name: '', id: 1}})
     * 
     * notin: where({notin: {'id': [1,2,3]}})
     * 
     * null: where({id: null})
     * 
     * notnull: where({id: {"<>": null}})
     * 
     * in: where({id: [1,2,3]})
     * 
     * and: where({id: 1, name: 'a'},)
     * 
     * operator: where({id: {'<>': 1}})
     * 
     * operator: where({id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}})
     * 
     * like: where({name: {'like': '%a'}})
     * 
     * @param {Object} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    where(values: Object): BaseModel {
        return super.where(values);
    }

    /**
     * Querying limit
     * 
     * limit(1)
     * 
     * limit(10, 20)
     *
     * @param {number} skip
     * @param {number} [limit]
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    limit(skip: number, limit?: number): BaseModel {
        return super.limit(skip, limit);
    }

    /**
     * Querying order column
     * 
     * order({xxx: 'desc'})
     *
     * @param {Object} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    order(values: Object): BaseModel {
        return super.order(values);
    }

    /**
     * Querying distinct columns
     * 
     * distinct(['first_name'])
     *
     * @param {string[]} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    distinct(values: string[]): BaseModel {
        return super.distinct(values);
    }

    /**
     * Querying group columns
     *
     * group('xxx')
     * 
     * group(['xxx', 'xxx'])
     * 
     * @param {(string | string[])} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    group(values: string | string[]): BaseModel {
        return super.group(values);
    }

    /**
     * HAVING clause
     * 
     * having({"name":{">": 100}})
     *
     * @param {Object} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    having(values: Object): BaseModel {
        return super.having(values);
    }

    /**
     * Join Querying
     * 
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * 
     * join([{from: 'Test', alias: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * 
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     *
     * @param {any[]} values
     * @returns {BaseModel}
     * @memberof BaseModel
     */
    join(values: any[]): BaseModel {
        return super.join(values);
    }

    /**
     * Pre-Add method
     *
     * @param {Object} data
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async _beforeAdd(data: Object, options?: Object) {
        return data;
    }

    /**
     * Add method
     *
     * @param {Object} data
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async add(data: Object, options?: Object) {
        try {
            if (helper.isEmpty(data)) {
                throw Error('Data can not be empty');
            }
            options = helper.parseOptions(this, options);
            const _data = await this._beforeAdd(data, options) || data;
            if (helper.isEmpty(_data)) {
                throw Error('Data can not be empty');
            }
            const result = await super.add(_data, options);
            //add return pk to data
            if (result) {
                Reflect.set(_data, this.pk, result);
            }
            await this._afterAdd(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Added after method
     *
     * @param {Object} data
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async _afterAdd(data: Object, options?: Object) {
        return data;
    }

    /**
     * Added when query result is empty
     *
     * @param {Object} data
     * @param {Object} options
     * @returns
     * @memberof BaseModel
     */
    async thenAdd(data: Object, options = { where: {} }) {
        try {
            if (helper.isEmpty(options) || helper.isEmpty(options.where)) {
                options.where = data;
            }
            const record = await this.find(options);
            if (helper.isEmpty(record)) {
                return this.add(data, options);
            }
            // tslint:disable-next-line: no-null-keyword
            return null;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Pre-Delete method
     *
     * @param {Object} options
     * @returns
     * @memberof BaseModel
     */
    async _beforeDelete(options: Object) {
        return options;
    }

    /**
     * Delete method
     *
     * @param {Object} options
     * @returns
     * @memberof BaseModel
     */
    async delete(options = {}) {
        try {
            options = helper.parseOptions(this, options);
            await this._beforeDelete(options);
            const result = await super.delete(options);
            await this._afterDelete(options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Delete after method
     *
     * @param {Object} options
     * @returns
     * @memberof BaseModel
     */
    async _afterDelete(options: Object) {
        return options;
    }

    /**
     * Pre-Update method
     *
     * @param {Object} data
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async _beforeUpdate(data: Object, options?: Object) {
        return data;
    }

    /**
     * Update method
     *
     * @param {Object} data
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async update(data: Object, options?: Object) {
        try {
            options = helper.parseOptions(this, options);
            const _data = await this._beforeUpdate(data, options) || data;
            if (helper.isEmpty(_data)) {
                throw Error('Data can not be empty');
            }
            const result = await super.update(_data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Increment method
     *
     * @param {string} field
     * @param {number} [step=1]
     * @param {*} [data={}]
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async increment(field: string, step = 1, data = {}, options?: Object) {
        try {
            options = helper.parseOptions(this, options);
            const _data = await this._beforeUpdate(data, options) || data;
            const result = await super.increment(field, step, _data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Decrement method
     *
     * @param {string} field
     * @param {number} [step=1]
     * @param {*} [data={}]
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async decrement(field: string, step = 1, data = {}, options?: Object) {
        try {
            options = helper.parseOptions(this, options);
            const _data = await this._beforeUpdate(data, options) || data;
            const result = await super.decrement(field, step, _data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Update after method
     *
     * @param {Object} data
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async _afterUpdate(data: Object, options?: Object) {
        return data;
    }

    /**
     * Findone
     *
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async find(options?: Object) {
        try {
            options = helper.parseOptions(this, options);
            let result = await super.find(options);
            result = await this._afterFind(result, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Find one after method
     *
     * @param {*} result
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    _afterFind(result: any, options?: Object) {
        return result;
    }

    /**
     * Find all
     *
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async select(options?: Object) {
        try {
            options = helper.parseOptions(this, options);
            let result = await super.select(options);
            result = await this._afterSelect(result, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Paging query
     *
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async countSelect(options?: Object) {
        try {
            options = helper.parseOptions(this, options);
            const result = await super.countSelect(options);
            result.data = await this._afterSelect(result.data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * Find all after method
     *
     * @param {*} result
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    _afterSelect(result: any, options?: Object) {
        return Promise.resolve(result);
    }

    /**
     * Count query
     *
     * @param {string} [field]
     * @param {Object} [options]
     * @memberof BaseModel
     */
    async count(field?: string, options?: Object) {
        return super.count(field, options);
    }

    /**
     * Sum query
     *
     * @param {string} field
     * @param {Object} [options]
     * @returns
     * @memberof BaseModel
     */
    async sum(field: string, options?: Object) {
        return super.sum(field, options);
    }

    /**
     * Native statement query
     * 
     * mysql/posgre  TestModel.query('select ?, ? from test where id=?', ['id', 'name', 1]);
     * 
     * mongo  TestModel.query('db.test.find()');
     *
     * @param {string} sqlStr
     * @param {any[]} [params=[]]
     * @memberof BaseModel
     */
    async query(sqlStr: string, params: any[] = []) {
        return super.query(sqlStr, params);
    }

    /**
     * Execute transaction
     *
     * @param {Function} func
     * @memberof BaseModel
     */
    async transaction(func: Function) {
        return super.transaction(func);
    }

    /**
     * Structure migration
     *
     * @param {string} [sqlStr]
     * @memberof BaseModel
     */
    async migrate(sqlStr?: string) {
        return super.migrate(sqlStr);
    }

    /**
     * sqlString build
     *
     * {method: find | select | add | update | count | sum | decrement | increment}
     *
     * @param {string} [options={ method: "select" }]
     * @param {*} [data={}]
     * @returns
     * @memberof BaseModel
     */
    async sql(options = { method: "select" }, data = {}) {
        return super.sql(options, data);
    }
}