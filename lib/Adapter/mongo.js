'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _base = require('./base');

var _base2 = _interopRequireDefault(_base);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _mongo = require('../Parser/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

var _mongo3 = require('../Socket/mongo');

var _mongo4 = _interopRequireDefault(_mongo3);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = class extends _base2.default {
    init(config = {}) {
        this.config = config;
        this.logSql = config.db_ext_config.db_log_sql || false;

        this.sql = '';
        this.handel = null;
        this.parsercls = null;
    }

    connect() {
        if (this.handel) {
            return _promise2.default.resolve(this.handel);
        }
        this.handel = new _mongo4.default(this.config).connect();
        return this.handel;
    }

    close() {
        if (this.handel) {
            this.handel.close && this.handel.close();
        }
        this.handel = null;
        return _promise2.default.resolve();
    }

    parsers() {
        if (this.parsercls) {
            return this.parsercls;
        }
        this.parsercls = new _mongo2.default(this.config);
        return this.parsercls;
    }

    /**
     * mongodb is schema less.
     */
    migrate() {
        _lib2.default.log(`mongodb is schema less, migrate is not execute.`, 'WARNING');
        return _promise2.default.resolve();
    }

    /**
     *
     */
    startTrans() {
        _lib2.default.log(`Adapter is not support startTrans.`, 'WARNING');
        return _promise2.default.resolve();
    }

    /**
     *
     */
    commit() {
        _lib2.default.log(`Adapter is not support commit.`, 'WARNING');
        return _promise2.default.resolve();
    }

    /**
     *
     */
    rollback() {
        _lib2.default.log(`Adapter is not support rollback.`, 'WARNING');
        return _promise2.default.resolve();
    }

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */
    query(cls, startTime) {
        startTime = startTime || Date.now();
        if (!cls) {
            _lib2.default.log(this.sql, 'MongoDB', startTime, this.logSql);
            return _promise2.default.reject('SQL analytic result is empty');
        }
        return cls.then(data => {
            _lib2.default.log(this.sql, 'MongoDB', startTime, this.logSql);
            return this.formatData(data);
        }).catch(err => {
            this.close();
            _lib2.default.log(this.sql, 'MongoDB', startTime, this.logSql);
            return _promise2.default.reject(err);
        });
    }

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */
    execute(cls, startTime) {
        return this.query(cls, startTime);
    }

    /**
     * Give access to a native mongo collection object for running custom queries.
     * @param tableName
     * @param sqlStr
     * @returns {*}
     */
    native(tableName, sqlStr) {
        if (_lib2.default.isEmpty(sqlStr)) {
            return _promise2.default.reject('_OPERATION_WRONG_');
        }
        let sqlArr = sqlStr.split('.');
        if (_lib2.default.isEmpty(sqlArr) || _lib2.default.isEmpty(sqlArr[0]) || sqlArr[0] !== 'db' || _lib2.default.isEmpty(sqlArr[1])) {
            return _promise2.default.reject('query language error');
        }
        sqlArr.shift();
        let table = sqlArr.shift();
        if (table !== tableName) {
            return _promise2.default.reject('table name error');
        }
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(tableName);
            this.sql = `db.getCollection('${tableName}')${sqlArr.join('.')}`;
            /*eslint-disable no-new-func */
            let func = new Function('process', 'return process.' + sqlArr.join('.') + ';');
            handler = func(collection);
            return this.query(handler, startTime);
        }).then(data => {
            return data.insertedId.toHexString() || 0;
        });
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options = {}) {
        options.method = 'ADD';
        let startTime = Date.now(),
            collection,
            handler;
        //mongodb.js的addOne,会改变原有添加对象，将主键加进去。
        let _data = _lib2.default.extend(data, {}, true);
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(_data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}').insertOne(${(0, _stringify2.default)(res.data)})`;
            handler = collection.insertOne(res.data);
            return this.execute(handler, startTime);
        }).then(result => {
            return result.insertedId.toHexString() || 0;
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.remove(' + (0, _stringify2.default)(res.options.where) + ')' : '.remove()'}`;
            handler = collection.deleteMany(res.options.where || {});
            return this.execute(handler, startTime);
        }).then(result => {
            return result.deletedCount || 0;
        });
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options = {}) {
        options.method = 'UPDATE';
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.update(' + (0, _stringify2.default)(res.options.where) + ', {$set:' + (0, _stringify2.default)(res.data) + '}, false, true)' : '.update({}, {$set:' + (0, _stringify2.default)(res.data) + '}, false, true)'}`;
            handler = collection.updateMany(res.options.where || {}, { $set: res.data }, false, true);
            return this.execute(handler, startTime);
        }).then(result => {
            return result.modifiedCount || 0;
        });
    }

    /**
     *
     * @param data
     * @param field
     * @param options
     */
    increment(data, field, options = {}) {
        options.method = 'UPDATE';
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.update(' + (0, _stringify2.default)(res.options.where) + ', {$inc:' + (0, _stringify2.default)(res.data) + ', false, true)' : '.update({}, {$inc:{' + field + ':' + data[field] + '}, false, true)'}`;
            handler = collection.updateMany(res.options.where || {}, { $inc: { [field]: data[field] } }, false, true);
            return this.execute(handler, startTime);
        }).then(result => {
            //更新前置操作内会改变data的值
            if (!_lib2.default.isEmpty(data)) {
                this.update(data, options);
            }
            return result.modifiedCount || 0;
        });
    }

    /**
     *
     * @param data
     * @param field
     * @param options
     */
    decrement(data, field, options = {}) {
        options.method = 'UPDATE';
        let startTime = Date.now(),
            collection,
            handler;

        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.update(' + (0, _stringify2.default)(res.options.where) + ', {$inc:' + (0, _stringify2.default)(res.data) + ', false, true)' : '.update({}, {$inc:{' + field + ':' + (0 - data[field]) + '}, false, true)'}`;
            handler = collection.updateMany(res.options.where || {}, { $inc: { [field]: 0 - data[field] } }, false, true);
            return this.execute(handler, startTime);
        }).then(result => {
            //更新前置操作内会改变data的值
            if (!_lib2.default.isEmpty(data)) {
                this.update(data, options);
            }
            return result.modifiedCount || 0;
        });
    }

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */
    count(field, options = {}) {
        options.method = 'COUNT';
        options.count = field;
        options.limit = [0, 1];
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (_lib2.default.isEmpty(res.options.group)) {
                let fn = _lib2.default.promisify(collection.aggregate, collection),
                    pipe = [];
                !_lib2.default.isEmpty(res.options.where) && pipe.push({ $match: res.options.where });
                pipe.push({
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                });
                this.sql = `db.getCollection('${res.options.table}').aggregate(${(0, _stringify2.default)(pipe)})`;
                handler = fn(pipe);
            } else {
                res.options.group.initial = {
                    'countid': 0
                };
                /*eslint-disable no-new-func */
                res.options.group.reduce = new Function('obj', 'prev', `if (obj.${res.options.count} != null) if (obj.${res.options.count} instanceof Array){prev.countid += obj.${res.options.count}.length; }else{ prev.countid++;}`);
                res.options.group.cond = res.options.where;
                this.sql = `db.getCollection('${res.options.table}').group(${(0, _stringify2.default)(res.options.group)})`;
                handler = collection.group(res.options.group);
            }
            return this.query(handler, startTime);
        }).then(result => {
            if (_lib2.default.isArray(result)) {
                if (result[0]) {
                    return result[0].count ? result[0].count || 0 : 0;
                } else {
                    return 0;
                }
            } else {
                return result.count || 0;
            }
        });
    }

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */
    sum(field, options = {}) {
        options.method = 'SUM';
        options.sum = field;
        options.limit = [0, 1];
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (_lib2.default.isEmpty(res.options.group)) {
                let fn = _lib2.default.promisify(collection.aggregate, collection),
                    pipe = [];
                !_lib2.default.isEmpty(res.options.where) && pipe.push({ $match: res.options.where });
                pipe.push({
                    $group: {
                        _id: 1,
                        sum: { $sum: `$${res.options.sum}` }
                    }
                });
                this.sql = `db.getCollection('${res.options.table}').aggregate(${(0, _stringify2.default)(pipe)})`;
                handler = fn(pipe);
            } else {
                res.options.group.initial = {
                    'sumid': 0
                };
                /*eslint-disable no-new-func */
                res.options.group.reduce = new Function('obj', 'prev', `prev.sumid = prev.sumid + obj.${res.options.sum} - 0;`);
                res.options.group.cond = res.options.where;
                this.sql = `db.getCollection('${res.options.table}').group(${(0, _stringify2.default)(res.options.group)})`;
                handler = collection.group(res.options.group);
            }
            return this.query(handler, startTime);
        }).then(result => {
            if (_lib2.default.isArray(result)) {
                if (result[0]) {
                    return result[0].sum ? result[0].sum || 0 : 0;
                } else {
                    return 0;
                }
            } else {
                return result.sum || 0;
            }
        });
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options = {}) {
        options.method = 'FIND';
        options.limit = [0, 1];
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (_lib2.default.isEmpty(res.options.group)) {
                this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.findOne(' + (0, _stringify2.default)(res.options.where) + ')' : '.findOne()'}`;
                handler = collection.findOne(res.options.where || {});
            } else {
                res.options.group.cond = res.options.where;
                this.sql = `db.getCollection('${res.options.table}').group(${res.options.group.key},${res.options.group.cond},${res.options.group.initial},${res.options.group.reduce})`;
                //handler = collection.group(res.options.group);
                handler = collection.group(res.options.group.key, res.options.group.cond, res.options.group.initial, res.options.group.reduce);
            }
            return this.query(handler, startTime);
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options = {}) {
        options.method = 'SELECT';
        let startTime = Date.now(),
            collection,
            handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (_lib2.default.isEmpty(res.options.group)) {
                this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.find(' + (0, _stringify2.default)(res.options.where) + ')' : '.find()'}`;
                handler = collection.find(res.options.where || {});
            } else {
                res.options.group.cond = res.options.where;
                this.sql = `db.getCollection('${res.options.table}').group(${res.options.group.key},${res.options.group.cond},${res.options.group.initial},${res.options.group.reduce})`;
                //handler = collection.group(res.options.group);
                handler = collection.group(res.options.group.key, res.options.group.cond, res.options.group.initial, res.options.group.reduce);
            }
            return this.query(handler.toArray(), startTime);
        });
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    formatData(data) {
        //if (lib.isArray(data)) {
        //    for (let i = 0, length = data.length; i < length; i++) {
        //        for (let key in data[i]) {
        //            if (lib.isBuffer(data[i][key])) {
        //                data[i][key] = lib.toString(data[i][key]);
        //            }
        //        }
        //    }
        //}
        if (!_lib2.default.isJSONObj(data)) {
            data = JSON.parse((0, _stringify2.default)(data));
        }
        return data;
    }

    /**
     *
     * @param config
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */
    __getHasOneRelation(config, rel, data) {
        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(data[rel.fkey])) {
            return {};
        }
        let model = new rel.model(config);
        return model.find({ field: rel.field, where: { [rel.rkey]: data[rel.fkey].oid } });
    }

    /**
     *
     * @param config
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */
    __getHasManyRelation(config, rel, data) {
        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        let model = new rel.model(config);
        //modify by lihao 此处主表查询出的结果中_id为ObjectId类型,会被parse/parseWhere解析出错,因此转为string
        let primaryPk = _lib2.default.isObject(data[rel.primaryPk]) ? _lib2.default.toString(data[rel.primaryPk]) : data[rel.primaryPk];
        let options = { field: rel.field, where: { [rel.rkey]: primaryPk } };
        return model.select(options);
    }

    /**
     *
     * @param config
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */
    __getManyToManyRelation(config, rel, data) {
        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        let model = new rel.model(config);
        let rpk = model.getPk();
        let mapModel = new rel.mapModel(config);
        //let mapName = `${rel.primaryName}${rel.name}Map`;
        //if(model.config.db_type === 'mongo'){
        return mapModel.field(rel.fkey).select({ where: { [rel.fkey]: data[rel.primaryPk] } }).then(result => {
            let keys = [];
            result.map(item => {
                item[rel.fkey] && keys.push(item[rel.fkey]);
            });
            return model.select({ where: { [rpk]: keys } });
        });
        //} else {
        //    let options = {
        //        table: `${model.config.db_prefix}${lib.parseName(mapModel)}`,
        //        name: mapName,
        //        join: [
        //            {from: `${rel.model.modelName}`, on: {[rel.rkey]: rpk}, field: rel.field, type: 'inner'}
        //        ],
        //        where: {
        //            [rel.fkey]: data[rel.primaryPk]
        //        }
        //    };
        //    //数据量大的情况下可能有性能问题
        //    let regx = new RegExp(`${rel.name}_`, "g");
        //    return model.select(options).then(result => {
        //        result = JSON.stringify(result).replace(regx, '');
        //        return JSON.parse(result);
        //    });
        //}
    }

    /**
     *
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    __postHasOneRelation(config, result, options, rel, relationData, postType) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (_lib2.default.isEmpty(result) || _lib2.default.isEmpty(relationData)) {
                _lib2.default.log('The main model\'s result is empty or the associated sub model\'s data is empty.', 'WARNING');
                return _promise2.default.resolve();
            }
            let model = new rel.model(config);
            let primaryModel = new ORM.collections[rel.primaryName](config);
            switch (postType) {
                case 'ADD':
                    //子表插入数据
                    let fkey = yield model.add(relationData);
                    options.where = { [rel.primaryPk]: result };
                    //modify by lihao,此处修改为mongo的ref引用关联字段
                    let refKey = new _mongodb.DBRef(model.getTableName(), fkey);
                    //更新主表关联字段
                    //fkey && (await primaryModel.update({[rel.fkey]: fkey}, options));
                    fkey && (yield primaryModel.update({ [rel.fkey]: refKey }, options));
                    break;
                case 'UPDATE':
                    if (!relationData[rel.fkey]) {
                        if (primaryModel) {
                            let info = yield primaryModel.field(rel.fkey).find(options);
                            relationData[rel.fkey] = info[rel.fkey];
                        }
                    }
                    //子表主键数据存在才更新
                    if (relationData[rel.fkey]) {
                        yield model.update(relationData, { where: { [rel.rkey]: relationData[rel.fkey] } });
                    }
                    break;
                default:
                    break;
            }
            return _promise2.default.resolve();
        })();
    }

    /**
     *
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    __postHasManyRelation(config, result, options, rel, relationData, postType) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (_lib2.default.isEmpty(result) || !_lib2.default.isArray(relationData)) {
                _lib2.default.log('The main model\'s result is empty or the associated sub model\'s data is not an array.', 'WARNING');
                return _promise2.default.resolve();
            }
            let model = new rel.model(config),
                rpk = model.getPk();
            //for (let [k, v] of relationData.entries()) {
            //    switch (postType) {
            //        case 'ADD':
            //            //子表插入数据
            //            v[rel.rkey] = result;
            //            await model.add(v);
            //            //modify by lihao,将子表数据通过ref关联更新到主表
            //            break;
            //        case 'UPDATE':
            //            //子表主键数据存在才更新
            //            if (v[rpk]) {
            //                await model.update(v, {where: {[rpk]: v[rpk]}});
            //            }
            //            break;
            //    }
            //}
            //modify by lihao,将子表数据通过ref关联更新到主表
            switch (postType) {
                case 'ADD':
                    let relIdArr = [],
                        fkey;
                    for (let [k, v] of relationData.entries()) {
                        //子表插入数据
                        v[rel.rkey] = result;
                        fkey = yield model.add(v);
                        relIdArr.push(new _mongodb.DBRef(model.getTableName(), fkey));
                    }
                    //更新到主表的关联字段
                    if (!_lib2.default.isEmpty(relIdArr)) {
                        options.where = { [rel.primaryPk]: result };
                        let primaryModel = new ORM.collections[rel.primaryName](config);
                        yield primaryModel.update({ [rel.fkey]: relIdArr }, options);
                    }
                    break;
                case 'UPDATE':
                    for (let [k, v] of relationData.entries()) {
                        //子表主键数据存在才更新
                        if (v[rpk]) {
                            yield model.update(v, { where: { [rpk]: v[rpk] } });
                        }
                    }
                    break;
                default:
                    break;
            }
            return _promise2.default.resolve();
        })();
    }

    /**
     *
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    __postManyToManyRelation(config, result, options, rel, relationData, postType) {
        return (0, _asyncToGenerator3.default)(function* () {
            if (_lib2.default.isEmpty(result) || !_lib2.default.isArray(relationData)) {
                _lib2.default.log('The main model\'s result is empty or the associated sub model\'s data is not an array.', 'WARNING');
                return _promise2.default.resolve();
            }
            //子表主键
            let model = new rel.model(config),
                rpk = model.getPk();
            let mapModel = new rel.mapModel(config);
            //关系表
            for (let [k, v] of relationData.entries()) {
                switch (postType) {
                    case 'ADD':
                        //子表增加数据
                        let fkey = yield model.add(v);
                        //关系表增加数据,使用thenAdd
                        fkey && (yield mapModel.thenAdd({ [rel.fkey]: result, [rel.rkey]: fkey }, {
                            where: {
                                [rel.fkey]: result,
                                [rel.rkey]: fkey
                            }
                        }));
                        break;
                    case 'UPDATE':
                        //关系表两个外键都存在,更新关系表
                        if (v[rel.fkey] && v[rel.rkey]) {
                            //关系表增加数据,此处不考虑两个外键是否在相关表存在数据,因为关联查询会忽略
                            yield mapModel.thenAdd({
                                [rel.fkey]: v[rel.fkey],
                                [rel.rkey]: v[rel.rkey]
                            }, { where: { [rel.fkey]: v[rel.fkey], [rel.rkey]: v[rel.rkey] } });
                        } else if (v[rpk]) {
                            //仅存在子表主键情况下,更新子表
                            yield model.update(v, { where: { [rpk]: v[rpk] } });
                        }
                        break;
                    default:
                        break;
                }
            }
            return _promise2.default.resolve();
        })();
    }
}; /**
    *
    * @author     richen
    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
    * @license    MIT
    * @version    16/7/25
    */