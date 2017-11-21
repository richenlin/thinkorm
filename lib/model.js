/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const lib = require('think_lib');
const logger = require('think_logger');
const adapter = require('./adapter.js');
const schema = require('./schema.js');
const helper = require('./helper.js');
const relation = require('./relation.js');
const valid = require('./validation.js');


// force count
var forceNewNum = 1;

module.exports = class {
    /**
     * constructor
     * @param  {Mixed} args []
     * @return {}      []
     */
    constructor(...args) {
        this.init(...args);
        // 模型名称
        if(!this.modelName){
            return this.error('modelName is undefined.');
        }
        // 数据源配置
        this.config = this.config || args[0] || {};
        // 数据表名
        this.tableName = this.tableName || this.getTableName();
        // set schema
        schema.setSchema(this, this.config);
        // 
        this.options = {};
        this.instances = null;
    }

    /**
     * init
     * @param  {Mixed} args []
     * @return {}      []
     */
    init(config) {
        // 数据源配置
        this.config = config || {};
        // 是否开启迁移(migrate方法可用)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
    }

    /**
     * load realpath model class files
     * @param args
     * @returns {type[]}
     */
    static require(...args) {
        return lib.require(...args);
    }

    /**
     * get collection
     * @param args
     * @returns {*}
     */
    static setCollection(...args) {
        return schema.setCollection(...args);
    }

    /**
     * auto migrate all model structure to database
     * @param args
     * @returns {*|{get}}
     */
    static migrate(...args) {
        return helper.migrate(...args);
    }

    /**
     * 错误封装
     * @param err
     */
    error(err) {
        let msg = err;
        if (msg) {
            if (!lib.isError(msg)) {
                if (!lib.isString(msg)) {
                    msg = JSON.stringify(msg);
                }
                msg = new Error(msg);
            }
            let stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            logger.error(msg);
        }
        return Promise.reject(msg);
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        if (lib.isEmpty(this.modelName)) {
            return this.error('modelName is undefined.');
        }
        if (!this.tableName) {
            let tableName = this.config.db_prefix || '';
            tableName += helper.parseName(this.modelName);
            this.tableName = tableName.toLowerCase();
        }
        return this.tableName;
    }

    /**
     * 
     * 
     * @param {boolean} [forceNew=false] 
     */
    initDB(forceNew = false) {
        //check collection
        if (!__thinkorm.collections[this.modelName]) {
            return this.error(`Collections ${this.modelName} is undefined.`);
        }
        //set db
        if (lib.isObject(forceNew)) {
            this.instances = forceNew;
            return Promise.resolve(forceNew);
        }
        if (this.instances && !forceNew) {
            return Promise.resolve(this.instances);
        }
        if (forceNew) {
            this.config.db_ext_config.forceNewNum = forceNewNum++;
        }
        try {
            this.instances = adapter.getInstance(this.config);
        } catch (e) {
            return this.error(e);
        }

        if (!this.instances) {
            return this.error(`Adapter initialize error`);
        }
        return Promise.resolve(this.instances);
    }

    /**
     * 获取主键名
     * 
     * @returns 
     */
    getPk() {
        try {
            if (!this.pk) {
                if (!lib.isEmpty(this.fields)) {
                    for (let v in this.fields) {
                        if (this.fields[v].primaryKey !== undefined && this.fields[v].primaryKey) {
                            this.pk = v;
                        }
                    }
                }
            }
            return this.pk;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * relation ship 
     * rel(true)
     * rel(true, {user:{field:[], where: {}}})
     * rel(['user'], {user:{field:[], where: {}}})
     * @param {boolean} [rels=true] 
     * @param {any} options 
     */
    rel(rels = true, options = {}) {
        try {
            if (rels) {
                this.options.rels = {};
                let relationShip = relation.getRelations(this.modelName, this.config);
                if (rels === true) {
                    rels = Object.keys(relationShip);
                } else if (lib.isString(rels)) {
                    rels = rels.replace(/ +/g, '').split(',');
                } else if (!lib.isArray(rels)) {
                    rels = [];
                }
                for (let i = 0, len = rels.length; i < len; i++) {
                    this.options.rels[rels[i]] = relationShip[rels[i]] || {};
                    this.options.rels[rels[i]].options = options[rels[i]] || {};
                }
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * field(['aaa', 'bbb', 'ccc'])
     * @param {any} field 
     * @returns 
     */
    field(field) {
        try {
            if (!field) {
                return this;
            }
            if (lib.isString(field)) {
                field = field.replace(/ +/g, '').split(',');
            }
            if (lib.isArray(field)) {
                this.options.field = this.options.field ? lib.extend(this.options.field, field) : field;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * alias('xxx')
     * @param {any} alias 
     * @returns 
     */
    alias(alias) {
        try {
            if (!alias) {
                return this;
            }
            if (lib.isString(alias)) {
                this.options.alias = this.options.alias ? lib.extend(this.options.alias, alias) : alias;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * or:  where({or: [{...}, {...}]})
     * not: where({not: {name: '', id: 1}})
     * notin: where({notin: {'id': [1,2,3]}})
     * in: where({id: [1,2,3]})
     * and: where({id: 1, name: 'a'},)
     * operator: where({id: {'<>': 1}})
     * operator: where({id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}})
     * like: where({name: {'like': '%a'}})
     * @param {any} where 
     * @returns 
     */
    where(where) {
        try {
            if (!where) {
                return this;
            }
            if (lib.isObject(where)) {
                this.options.where = this.options.where ? lib.extend(this.options.where, where) : where;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * limit(1)
     * limit(10, 20)
     * limit([10, 10])
     * @param {any} skip 
     * @param {any} limit 
     * @returns 
     */
    limit(skip, limit) {
        try {
            if (skip === undefined) {
                skip = 0;
            }
            if (skip && limit === undefined) {
                if (lib.isArray(skip)) {
                    limit = skip[1];
                    skip = skip[0];
                } else {
                    skip = 0;
                    limit = skip;
                }
            }
            if (limit === undefined) {
                limit = 1;
            }
            skip = lib.toInt(skip);
            limit = lib.toInt(limit);
            this.options.limit = this.options.limit ? lib.extend(this.options.limit, [skip, limit]) : [skip, limit];
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * order({xxx: 'desc'})
     * @param {any} order 
     * @returns 
     */
    order(order) {
        try {
            if (!order) {
                return this;
            }
            if (lib.isObject(order)) {
                this.options.order = this.options.order ? lib.extend(this.options.order, order) : order;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @returns 
     */
    group(group) {
        try {
            if (!group) {
                return this;
            }
            if (lib.isString(group) || lib.isArray(group)) {
                this.options.group = this.options.group ? lib.extend(this.options.group, group) : group;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'Test', alias: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param {any} join 
     */
    join(join) {
        try {
            if (!join) {
                return this;
            }
            if (lib.isArray(join)) {
                this.options.join = this.options.join ? lib.extend(this.options.join, join) : join;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     */
    _beforeAdd(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     */
    async add(data, options) {
        try {
            if (lib.isEmpty(data)) {
                throw Error('_DATA_TYPE_INVALID_');
            }
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            // copy data
            let _data = lib.clone(data, true);
            _data = await this._beforeAdd(data, parsedOptions);
            _data = valid.validData(db, this.fields, _data, this.validations, parsedOptions, 'ADD');
            if (lib.isEmpty(_data)) {
                throw Error('_DATA_TYPE_INVALID_');
            }
            let result = await db.add(_data, parsedOptions);
            _data[this.pk] = _data[this.pk] ? _data[this.pk] : result;
            //relation ship
            if (!lib.isEmpty(parsedOptions.rels)) {
                await relation.postRelationData(db, this.config, parsedOptions, _data[this.pk], data, 'ADD');
            }
            await this._afterAdd(_data, parsedOptions);
            return _data[this.pk] || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _afterAdd(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    async thenAdd(data, options) {
        try {
            if (lib.isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let record = await this.find(options);
            if (lib.isEmpty(record)) {
                return this.add(data, options);
            }
            return null;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    _beforeDelete(options) {
        return Promise.resolve(options);
    }

    /**
     * 
     * 
     * @param {any} options 
     */
    async delete(options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            if (lib.isEmpty(parsedOptions.where)) {
                return this.error('_OPERATION_WRONG_');
            }
            // init db
            let db = await this.initDB();
            await this._beforeDelete(parsedOptions);
            let result = await db.delete(parsedOptions);
            await this._afterDelete(parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    _afterDelete(options) {
        return Promise.resolve(options);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _beforeUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     */
    async update(data, options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            // copy data
            let _data = lib.clone(data, true);
            _data = await this._beforeUpdate(data, parsedOptions);
            _data = valid.validData(db, this.fields, _data, this.validations, parsedOptions, 'UPDATE');
            if (lib.isEmpty(_data)) {
                throw Error('_DATA_TYPE_INVALID_');
            }
            // 如果存在主键数据 则自动作为更新条件
            if (lib.isEmpty(parsedOptions.where)) {
                if (!lib.isEmpty(_data[this.pk])) {
                    parsedOptions.where = {};
                    parsedOptions.where[this.pk] = _data[this.pk];
                    delete _data[this.pk];
                } else {
                    throw Error('_OPERATION_WRONG_');
                }
            } else {
                if (!lib.isEmpty(_data[this.pk])) {
                    delete _data[this.pk];
                }
            }
            let result = await db.update(_data, parsedOptions);
            if (!lib.isEmpty(parsedOptions.rels)) {
                await relation.postRelationData(db, this.config, parsedOptions, result, data, 'UPDATE');
            }
            await this._afterUpdate(_data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _afterUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} options 
     */
    async increment(field, step = 1, options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            //copy data
            let _data = { [field]: step };
            _data = await this._beforeUpdate(_data, parsedOptions);
            _data = valid.validData(db, this.fields, _data, this.validations, parsedOptions, 'UPDATE');
            if (lib.isEmpty(_data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }

            let result = await db.increment(_data, field, parsedOptions);
            await this._afterUpdate(_data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} options 
     * @returns 
     */
    async decrement(field, step = 1, options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            //copy data
            let _data = { [field]: step };
            _data = await this._beforeUpdate(_data, parsedOptions);
            _data = valid.validData(db, this.fields, _data, this.validations, parsedOptions, 'UPDATE');
            if (lib.isEmpty(_data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }

            let result = await db.decrement(_data, field, parsedOptions);
            await this._afterUpdate(_data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {any} options 
     */
    async count(field, options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            let result = await db.count(field, parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {any} options 
     * @returns 
     */
    async sum(field, options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            let result = await db.sum(field, parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    async find(options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            let result = await db.find(parsedOptions);
            result = await valid.parseData(db, (lib.isArray(result) ? result[0] : result) || {}, this.fields, parsedOptions);
            if (!lib.isEmpty(parsedOptions.rels)) {
                result = await relation.getRelationData(db, this.config, parsedOptions, result);
            }
            result = await this._afterFind(result, parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} result 
     * @param {any} options 
     * @returns 
     */
    _afterFind(result, options) {
        return Promise.resolve(result);
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    async select(options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            let result = await db.select(parsedOptions);
            result = await valid.parseData(db, result || [], this.fields, parsedOptions);
            if (!lib.isEmpty(parsedOptions.rels)) {
                result = await relation.getRelationData(db, this.config, parsedOptions, result);
            }
            result = await this._afterSelect(result, parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 
     * 
     * @param {any} result 
     * @param {any} options 
     * @returns 
     */
    _afterSelect(result, options) {
        return Promise.resolve(result);
    }

    /**
     * 
     * 
     * @param {any} options 
     */
    async countSelect(options) {
        try {
            let parsedOptions = await helper.parseOptions(this, options);
            // init db
            let db = await this.initDB();
            let countNum = await db.count(null, parsedOptions);
            let pageOptions = helper.parsePage(options.page, options.num) || { page: 1, num: 10 };
            let totalPage = Math.ceil(countNum / pageOptions.num);
            if (pageOptions.page > totalPage) {
                pageOptions.page = totalPage;
            }
            //传入分页参数
            let offset = (pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
            parsedOptions.limit = [offset, pageOptions.num];
            let result = lib.extend({ count: countNum, total: totalPage }, pageOptions);

            result.data = await db.select(parsedOptions);
            result.data = await valid.parseData(db, result.data || [], this.fields, parsedOptions);
            if (!lib.isEmpty(parsedOptions.rels)) {
                result.data = await relation.getRelationData(db, this.config, parsedOptions, result.data);
            }
            result.data = await this._afterSelect(result.data, parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 原生语句查询
     * mysql  TestModel.query('select * from test');
     * mongo  TestModel.query('db.test.find()');
     * @param sqlStr
     */
    async query(sqlStr) {
        try {
            // init db
            let db = await this.initDB();
            let result = await db.native(this.tableName, sqlStr);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * transaction exec functions
     * @param  {Function} fn [exec function]
     * @return {Promise}      []
     */
    async transaction(fn) {
        //init db
        let db = await this.initDB(true);
        try {
            await db.startTrans();
            let result = await helper.thinkco(fn(db));
            await db.commit();
            return result;
        } catch (e) {
            await db.rollback();
            return this.error(e);
        }
    }

};