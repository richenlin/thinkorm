'use strict';

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const path = require('path');
const lib = require('think_lib');
const adapter = require('./adapter.js');
const schema = require('./schema.js');
const helper = require('./helper.js');
const logger = require('./logger.js');
const relation = require('./relation.js');
const valid = require('./validation.js');

// force count
var forceNewNum = 1;

module.exports = class {
    /**
     * constructor
     * @param  {Object} http []
     * @return {}      []
     */
    constructor(config = {}) {
        this.init(config);
        // set schema
        schema.setSchema(this, config);
        // 模型名称
        this.modelName = this.modelName || this.getModelName();
        // 数据表名
        this.tableName = this.tableName || this.getTableName();
        // 
        this.options = {};
        this.instances = null;
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
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    init(config = {}) {}

    /**
     * 错误封装
     * @param err
     */
    error(err) {
        let msg = err;
        if (msg) {
            if (!lib.isError(msg)) {
                if (!lib.isString(msg)) {
                    msg = (0, _stringify2.default)(msg);
                }
                msg = new Error(msg);
            }
            let stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            logger(msg, 'ERROR');
        }
        return _promise2.default.reject(msg);
    }

    /**
     * 获取模型名
     * @returns {*}
     */
    getModelName() {
        if (!this.modelName) {
            let filename = path.basename(this.__filename, '.js');
            let last = filename.lastIndexOf(lib.sep);
            this.modelName = filename.substr(last + 1, filename.length - last);
        }
        return this.modelName;
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
            return _promise2.default.resolve(forceNew);
        }
        if (this.instances && !forceNew) {
            return _promise2.default.resolve(this.instances);
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
        return _promise2.default.resolve(this.instances);
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
                    rels = (0, _keys2.default)(relationShip);
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
        return _promise2.default.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     */
    add(data, options) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (lib.isEmpty(data)) {
                    throw Error('_DATA_TYPE_INVALID_');
                }
                let parsedOptions = yield helper.parseOptions(_this, options);
                // init db
                let db = yield _this.initDB();
                // copy data
                let _data = lib.clone(data, true);
                _data = yield _this._beforeAdd(data, parsedOptions);
                _data = valid.validData(db, _this.fields, _data, _this.validations, parsedOptions, 'ADD');
                if (lib.isEmpty(_data)) {
                    throw Error('_DATA_TYPE_INVALID_');
                }
                let result = yield db.add(_data, parsedOptions);
                _data[_this.pk] = _data[_this.pk] ? _data[_this.pk] : result;
                //relation ship
                if (!lib.isEmpty(parsedOptions.rels)) {
                    yield relation.postRelationData(db, _this.config, parsedOptions, _data[_this.pk], data, 'ADD');
                }
                yield _this._afterAdd(_data, parsedOptions);
                return _data[_this.pk] || 0;
            } catch (e) {
                return _this.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _afterAdd(data, options) {
        return _promise2.default.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    thenAdd(data, options) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                if (lib.isEmpty(data)) {
                    return _this2.error('_DATA_TYPE_INVALID_');
                }
                let record = yield _this2.find(options);
                if (lib.isEmpty(record)) {
                    return _this2.add(data, options);
                }
                return null;
            } catch (e) {
                return _this2.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    _beforeDelete(options) {
        return _promise2.default.resolve(options);
    }

    /**
     * 
     * 
     * @param {any} options 
     */
    delete(options) {
        var _this3 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this3, options);
                if (lib.isEmpty(parsedOptions.where)) {
                    return _this3.error('_OPERATION_WRONG_');
                }
                // init db
                let db = yield _this3.initDB();
                yield _this3._beforeDelete(parsedOptions);
                let result = yield db.delete(parsedOptions);
                yield _this3._afterDelete(parsedOptions);
                return result || [];
            } catch (e) {
                return _this3.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    _afterDelete(options) {
        return _promise2.default.resolve(options);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _beforeUpdate(data, options) {
        return _promise2.default.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     */
    update(data, options) {
        var _this4 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this4, options);
                // init db
                let db = yield _this4.initDB();
                // copy data
                let _data = lib.clone(data, true);
                _data = yield _this4._beforeUpdate(data, parsedOptions);
                _data = valid.validData(db, _this4.fields, _data, _this4.validations, parsedOptions, 'UPDATE');
                if (lib.isEmpty(_data)) {
                    throw Error('_DATA_TYPE_INVALID_');
                }
                // 如果存在主键数据 则自动作为更新条件
                if (lib.isEmpty(parsedOptions.where)) {
                    if (!lib.isEmpty(_data[_this4.pk])) {
                        parsedOptions.where = {};
                        parsedOptions.where[_this4.pk] = _data[_this4.pk];
                        delete _data[_this4.pk];
                    } else {
                        throw Error('_OPERATION_WRONG_');
                    }
                } else {
                    if (!lib.isEmpty(_data[_this4.pk])) {
                        delete _data[_this4.pk];
                    }
                }
                let result = yield db.update(_data, parsedOptions);
                if (!lib.isEmpty(parsedOptions.rels)) {
                    yield relation.postRelationData(db, _this4.config, parsedOptions, result, data, 'UPDATE');
                }
                yield _this4._afterUpdate(_data, parsedOptions);
                return result || [];
            } catch (e) {
                return _this4.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _afterUpdate(data, options) {
        return _promise2.default.resolve(data);
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} options 
     */
    increment(field, step = 1, options) {
        var _this5 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this5, options);
                // init db
                let db = yield _this5.initDB();
                //copy data
                let _data = { [field]: step };
                _data = yield _this5._beforeUpdate(_data, parsedOptions);
                _data = valid.validData(db, _this5.fields, _data, _this5.validations, parsedOptions, 'UPDATE');
                if (lib.isEmpty(_data)) {
                    return _this5.error('_DATA_TYPE_INVALID_');
                }

                let result = yield db.increment(_data, field, parsedOptions);
                yield _this5._afterUpdate(_data, parsedOptions);
                return result || [];
            } catch (e) {
                return _this5.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} options 
     * @returns 
     */
    decrement(field, step = 1, options) {
        var _this6 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this6, options);
                // init db
                let db = yield _this6.initDB();
                //copy data
                let _data = { [field]: step };
                _data = yield _this6._beforeUpdate(_data, parsedOptions);
                _data = valid.validData(db, _this6.fields, _data, _this6.validations, parsedOptions, 'UPDATE');
                if (lib.isEmpty(_data)) {
                    return _this6.error('_DATA_TYPE_INVALID_');
                }

                let result = yield db.decrement(_data, field, parsedOptions);
                yield _this6._afterUpdate(_data, parsedOptions);
                return result || [];
            } catch (e) {
                return _this6.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {any} options 
     */
    count(field, options) {
        var _this7 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this7, options);
                // init db
                let db = yield _this7.initDB();
                let result = yield db.count(field, parsedOptions);
                return result || 0;
            } catch (e) {
                return _this7.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} field 
     * @param {any} options 
     * @returns 
     */
    sum(field, options) {
        var _this8 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this8, options);
                // init db
                let db = yield _this8.initDB();
                let result = yield db.sum(field, parsedOptions);
                return result || 0;
            } catch (e) {
                return _this8.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    find(options) {
        var _this9 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this9, options);
                // init db
                let db = yield _this9.initDB();
                let result = yield db.find(parsedOptions);
                result = yield valid.parseData(db, (lib.isArray(result) ? result[0] : result) || {}, _this9.fields, parsedOptions);
                if (!lib.isEmpty(parsedOptions.rels)) {
                    result = yield relation.getRelationData(db, _this9.config, parsedOptions, result);
                }
                result = yield _this9._afterFind(result, parsedOptions);
                return result;
            } catch (e) {
                return _this9.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} result 
     * @param {any} options 
     * @returns 
     */
    _afterFind(result, options) {
        return _promise2.default.resolve(result);
    }

    /**
     * 
     * 
     * @param {any} options 
     * @returns 
     */
    select(options) {
        var _this10 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this10, options);
                // init db
                let db = yield _this10.initDB();
                let result = yield db.select(parsedOptions);
                result = yield valid.parseData(db, result || [], _this10.fields, parsedOptions);
                if (!lib.isEmpty(parsedOptions.rels)) {
                    result = yield relation.getRelationData(db, _this10.config, parsedOptions, result);
                }
                result = yield _this10._afterSelect(result, parsedOptions);
                return result;
            } catch (e) {
                return _this10.error(e);
            }
        })();
    }

    /**
     * 
     * 
     * @param {any} result 
     * @param {any} options 
     * @returns 
     */
    _afterSelect(result, options) {
        return _promise2.default.resolve(result);
    }

    /**
     * 
     * 
     * @param {any} options 
     */
    countSelect(options) {
        var _this11 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let parsedOptions = yield helper.parseOptions(_this11, options);
                // init db
                let db = yield _this11.initDB();
                let countNum = yield db.count(null, parsedOptions);
                let pageOptions = helper.parsePage(options.page, options.num) || { page: 1, num: 10 };
                let totalPage = Math.ceil(countNum / pageOptions.num);
                if (pageOptions.page > totalPage) {
                    pageOptions.page = totalPage;
                }
                //传入分页参数
                let offset = pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
                parsedOptions.limit = [offset, pageOptions.num];
                let result = lib.extend({ count: countNum, total: totalPage }, pageOptions);

                result.data = yield db.select(parsedOptions);
                result.data = yield valid.parseData(db, result.data || [], _this11.fields, parsedOptions);
                if (!lib.isEmpty(parsedOptions.rels)) {
                    result.data = yield relation.getRelationData(db, _this11.config, parsedOptions, result.data);
                }
                result.data = yield _this11._afterSelect(result.data, parsedOptions);
                return result;
            } catch (e) {
                return _this11.error(e);
            }
        })();
    }

    /**
     * 原生语句查询
     * mysql  TestModel.query('select * from test');
     * mongo  TestModel.query('db.test.find()');
     * @param sqlStr
     */
    query(sqlStr) {
        var _this12 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                // init db
                let db = yield _this12.initDB();
                let result = yield db.native(_this12.tableName, sqlStr);
                return result;
            } catch (e) {
                return _this12.error(e);
            }
        })();
    }

    /**
     * transaction exec functions
     * @param  {Function} fn [exec function]
     * @return {Promise}      []
     */
    transaction(fn) {
        var _this13 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            //init db
            let db = yield _this13.initDB(true);
            try {
                yield db.startTrans();
                let result = yield helper.thinkco(fn(db));
                yield db.commit();
                return result;
            } catch (e) {
                yield db.rollback();
                return _this13.error(e);
            }
        })();
    }

};