/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import lib from '../Util/lib';
import parser from '../Parser/mongo';
import socket from '../Socket/mongo';
import {DBRef} from 'mongodb';
export default class extends base {
    init(config = {}) {
        this.config = config;
        this.logSql = config.db_ext_config.db_log_sql || false;

        this.sql = '';
        this.handel = null;
        this.parsercls = null;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config).connect();
        return this.handel;
    }

    close() {
        if (this.handel) {
            this.handel.close && this.handel.close();
            this.handel = null;
        }
    }

    parsers() {
        if (this.parsercls) {
            return this.parsercls;
        }
        this.parsercls = new parser(this.config);
        return this.parsercls;
    }

    /**
     * mongodb is schema less.
     */
    migrate() {
        return Promise.resolve();
    }

    /**
     *
     */
    startTrans() {
        lib.log(`Adapter is not support startTrans.`, 'WARNING');
        return Promise.resolve();
    }

    /**
     *
     */
    commit() {
        lib.log(`Adapter is not support commit.`, 'WARNING');
        return Promise.resolve();
    }

    /**
     *
     */
    rollback() {
        lib.log(`Adapter is not support rollback.`, 'WARNING');
        return Promise.resolve();
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
            this.logSql && lib.log(this.sql, 'MongoDB', startTime);
            return Promise.reject('Analytic result is empty');
        }
        return cls.then(data => {
            this.logSql && lib.log(this.sql, 'MongoDB', startTime);
            return this.formatData(data);
        }).catch(err => {
            this.logSql && lib.log(this.sql, 'MongoDB', startTime);
            return Promise.reject(err);
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
        if (lib.isEmpty(sqlStr)) {
            return Promise.reject('_OPERATION_WRONG_');
        }
        let sqlArr = sqlStr.split('.');
        if (lib.isEmpty(sqlArr) || lib.isEmpty(sqlArr[0]) || sqlArr[0] !== 'db' || lib.isEmpty(sqlArr[1])) {
            return Promise.reject('query language error');
        }
        sqlArr.shift();
        let table = sqlArr.shift();
        if (table !== tableName) {
            return Promise.reject('table name error');
        }
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(tableName);
            this.sql = `db.getCollection('${tableName}')${sqlArr.join('.')}`;
            let func = new Function('process', 'return process.' + sqlArr.join('.') + ';');
            handler = func(collection);
            return this.execute(handler, startTime);
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
        let startTime = Date.now(), collection, handler;
        //mongodb.js的addOne,会改变原有添加对象，将主键加进去。
        let _data = lib.extend({}, data);
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(_data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}').insertOne(${JSON.stringify(res.data)})`;
            handler = collection.insertOne(res.data);
            return this.execute(handler, startTime);
        }).then(data => {
            return data.insertedId.toHexString() || 0;
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.remove(' + JSON.stringify(res.options.where) + ')' : '.remove()'}`;
            handler = collection.deleteMany(res.options.where || {});
            return this.execute(handler, startTime);
        }).then(data => {
            return data.deletedCount || 0;
        });
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options = {}) {
        options.method = 'UPDATE';
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.update(' + JSON.stringify(res.options.where) + ', {$set:' + JSON.stringify(res.data) + '}, false, true)' : '.update({}, {$set:' + JSON.stringify(res.data) + '}, false, true)'}`;
            handler = collection.updateMany(res.options.where || {}, {$set: res.data}, false, true);
            return this.execute(handler, startTime);
        }).then(data => {
            return data.modifiedCount || 0;
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
        let startTime = Date.now(), collection, handler, dataObj;
        if(data[field]){
            dataObj = {[field]: data[field]};
            delete data[field];
        }
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.update(' + JSON.stringify(res.options.where) + ', {$inc:' + JSON.stringify(res.data) + ', false, true)' : '.update({}, {$inc:{' + field + ':' + data[field] + '}, false, true)'}`;
            handler = collection.updateMany(res.options.where || {}, {$inc: {[field]: data[field]}}, false, true);
            return this.execute(handler, startTime);
        }).then(res => {
            //更新前置操作内会改变data的值
            if(!lib.isEmpty(data)){
                this.update(data, options);
            }
            return res.modifiedCount || 0;
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
        let startTime = Date.now(), collection, handler, dataObj;
        if(data[field]){
            dataObj = {[field]: (0 - data[field])};
            delete data[field];
        }
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(data, options);
        }).then(res => {
            this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.update(' + JSON.stringify(res.options.where) + ', {$inc:' + JSON.stringify(res.data) + ', false, true)' : '.update({}, {$inc:{' + field + ':' + (0 - data[field]) + '}, false, true)'}`;
            handler = collection.updateMany(res.options.where || {}, {$inc: {[field]: (0 - data[field])}}, false, true);
            return this.execute(handler, startTime);
        }).then(res => {
            //更新前置操作内会改变data的值
            if(!lib.isEmpty(data)){
                this.update(data, options);
            }
            return res.modifiedCount || 0;
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
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (lib.isEmpty(res.options.group)) {
                let fn = lib.promisify(collection.aggregate, collection), pipe = [];
                !lib.isEmpty(res.options.where) && pipe.push({$match: res.options.where});
                pipe.push({
                    $group: {
                        _id: null,
                        count: {$sum: 1}
                    }
                });
                this.sql = `db.getCollection('${res.options.table}').aggregate(${JSON.stringify(pipe)})`;
                handler = fn(pipe);
            } else {
                res.options.group.initial = {
                    "countid": 0
                };
                res.options.group.reduce = new Function('obj', 'prev', `if (obj.${res.options.count} != null) if (obj.${res.options.count} instanceof Array){prev.countid += obj.${res.options.count}.length; }else{ prev.countid++;}`);
                res.options.group.cond = res.options.where;
                this.sql = `db.getCollection('${res.options.table}').group(${JSON.stringify(res.options.group)})`;
                handler = collection.group(res.options.group);
            }
            return this.query(handler, startTime);
        }).then(data => {
            if (lib.isArray(data)) {
                if (data[0]) {
                    return data[0]['count'] ? (data[0]['count'] || 0) : 0;
                } else {
                    return 0;
                }
            } else {
                return data['count'] || 0;
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
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (lib.isEmpty(res.options.group)) {
                let fn = lib.promisify(collection.aggregate, collection), pipe = [];
                !lib.isEmpty(res.options.where) && pipe.push({$match: res.options.where});
                pipe.push({
                    $group: {
                        _id: 1,
                        sum: {$sum: `$${res.options.sum}`}
                    }
                });
                this.sql = `db.getCollection('${res.options.table}').aggregate(${JSON.stringify(pipe)})`;
                handler = fn(pipe);
            } else {
                res.options.group.initial = {
                    "sumid": 0
                };
                res.options.group.reduce = new Function('obj', 'prev', `prev.sumid = prev.sumid + obj.${res.options.sum} - 0;`);
                res.options.group.cond = res.options.where;
                this.sql = `db.getCollection('${res.options.table}').group(${JSON.stringify(res.options.group)})`;
                handler = collection.group(res.options.group);
            }
            return this.query(handler, startTime);
        }).then(data => {
            if (lib.isArray(data)) {
                if (data[0]) {
                    return data[0]['sum'] ? (data[0]['sum'] || 0) : 0;
                } else {
                    return 0;
                }
            } else {
                return data['sum'] || 0;
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
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (lib.isEmpty(res.options.group)) {
                this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.findOne(' + JSON.stringify(res.options.where) + ')' : '.findOne()'}`;
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
        let startTime = Date.now(), collection, handler;
        return this.connect().then(conn => {
            collection = conn.collection(options.table);
            return this.parsers().buildSql(options);
        }).then(res => {
            if (lib.isEmpty(res.options.group)) {
                this.sql = `db.getCollection('${res.options.table}')${res.options.where ? '.find(' + JSON.stringify(res.options.where) + ')' : '.find()'}`;
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
        //                data[i][key] = data[i][key].toString();
        //            }
        //        }
        //    }
        //}
        if (!lib.isJSONObj(data)) {
            data = JSON.parse(JSON.stringify(data));
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
        if (lib.isEmpty(data) || lib.isEmpty(data[rel.fkey])) {
            return {};
        }
        let model = new (rel.model)(config);
        return model.find({field: rel.field, where: {[rel.rkey]: data[rel.fkey]['oid']}});
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
        if (lib.isEmpty(data) || lib.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        let model = new (rel.model)(config);
        //modify by lihao 此处主表查询出的结果中_id为ObjectId类型,会被parse/parseWhere解析出错,因此转为string
        let primaryPk = lib.isObject(data[rel.primaryPk]) ? data[rel.primaryPk].toString() : data[rel.primaryPk];
        let options = {field: rel.field, where: {[rel.rkey]: primaryPk}};
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
        if (lib.isEmpty(data) || lib.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        let model = new (rel.model)(config);
        let rpk = model.getPk();
        let mapModel = new rel.mapModel(config);
        //let mapName = `${rel.primaryName}${rel.name}Map`;
        //if(model.config.db_type === 'mongo'){
        return mapModel.field(rel.fkey).select({where: {[rel.fkey]: data[rel.primaryPk]}}).then(data => {
            let keys = [];
            data.map(item => {
                item[rel.fkey] && keys.push(item[rel.fkey]);
            });
            return model.select({where: {[rpk]: keys}});
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
    async __postHasOneRelation(config, result, options, rel, relationData, postType) {
        if (lib.isEmpty(result) || lib.isEmpty(relationData)) {
            lib.log('The main model\'s result is empty or the associated sub model\'s data is empty.', 'WARNING');
            return Promise.resolve();
        }
        let model = new (rel.model)(config);
        let primaryModel = new (ORM.collections[rel.primaryName])(config);
        switch (postType) {
            case 'ADD':
                //子表插入数据
                let fkey = await model.add(relationData);
                options.where = {[rel.primaryPk]: result};
                //modify by lihao,此处修改为mongo的ref引用关联字段
                let refKey = new DBRef(model.getTableName(), fkey);
                //更新主表关联字段
                //fkey && (await primaryModel.update({[rel.fkey]: fkey}, options));
                fkey && (await primaryModel.update({[rel.fkey]: refKey}, options));
                break;
            case 'UPDATE':
                if (!relationData[rel.fkey]) {
                    if (primaryModel) {
                        let info = await primaryModel.field(rel.fkey).find(options);
                        relationData[rel.fkey] = info[rel.fkey];
                    }
                }
                //子表主键数据存在才更新
                if (relationData[rel.fkey]) {
                    await model.update(relationData, {where: {[rel.rkey]: relationData[rel.fkey]}});
                }
                break;
        }
        return;
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
    async __postHasManyRelation(config, result, options, rel, relationData, postType) {
        if (lib.isEmpty(result) || !lib.isArray(relationData)) {
            lib.log('The main model\'s result is empty or the associated sub model\'s data is not an array.', 'WARNING');
            return Promise.resolve();
        }
        let model = new (rel.model)(config), rpk = model.getPk();
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
                let relIdArr = [], fkey;
                for (let [k, v] of relationData.entries()) {
                    //子表插入数据
                    v[rel.rkey] = result;
                    fkey = await model.add(v);
                    relIdArr.push(new DBRef(model.getTableName(), fkey))
                }
                //更新到主表的关联字段
                if (!lib.isEmpty(relIdArr)) {
                    options.where = {[rel.primaryPk]: result};
                    let primaryModel = new (ORM.collections[rel.primaryName])(config);
                    await primaryModel.update({[rel.fkey]: relIdArr}, options)
                }
                break;
            case 'UPDATE':
                for (let [k, v] of relationData.entries()) {
                    //子表主键数据存在才更新
                    if (v[rpk]) {
                        await model.update(v, {where: {[rpk]: v[rpk]}});
                    }
                }
                break;
        }
        return;
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
    async __postManyToManyRelation(config, result, options, rel, relationData, postType) {
        if (lib.isEmpty(result) || !lib.isArray(relationData)) {
            lib.log('The main model\'s result is empty or the associated sub model\'s data is not an array.', 'WARNING');
            return Promise.resolve();
        }
        //子表主键
        let model = new (rel.model)(config), rpk = model.getPk();
        let mapModel = new (rel['mapModel'])(config);
        //关系表
        for (let [k, v] of relationData.entries()) {
            switch (postType) {
                case 'ADD':
                    //子表增加数据
                    let fkey = await model.add(v);
                    //关系表增加数据,使用thenAdd
                    fkey && (await mapModel.thenAdd({[rel.fkey]: result, [rel.rkey]: fkey}, {
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
                        await mapModel.thenAdd({
                            [rel.fkey]: v[rel.fkey],
                            [rel.rkey]: v[rel.rkey]
                        }, {where: {[rel.fkey]: v[rel.fkey], [rel.rkey]: v[rel.rkey]}});
                    } else if (v[rpk]) {//仅存在子表主键情况下,更新子表
                        await model.update(v, {where: {[rpk]: v[rpk]}});
                    }
                    break;
            }
        }
        return;
    }
}
