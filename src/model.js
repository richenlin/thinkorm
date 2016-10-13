/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';
import schema from './schema';
import lib from './Util/lib';
import vaild from './Util/valid';

export default class extends base {
    /**
     * init
     * @param name
     * @param config
     */
    init(config = {}) {
        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 模型名称(不能被重载)
        this.modelName = '';
        // 数据表名(不能被重载)
        this.tableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
        // 模型Adapter实例
        this.__model = null;
        // 参数
        this.__options = {};
        // 关联模型数据
        this.__relationData = {};

        // 配置
        this.config = {
            db_type: config.db_type,
            db_host: config.db_host,
            db_port: config.db_port,
            db_name: config.db_name,
            db_user: config.db_user,
            db_pwd: config.db_pwd,
            db_prefix: config.db_prefix,
            db_charset: config.db_charset,
            db_timeout: config.db_timeout,
            db_ext_config: config.db_ext_config || {}
        };
        // 模型名
        this.modelName = this.getModelName();
        // 表名
        this.tableName = this.getTableName();
    }

    /**
     * load realpath model class files
     * @param args
     * @returns {type[]}
     */
    static require(...args) {
        return lib.thinkRequire(...args);
    }

    /**
     * load collection
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
    static migrate(...args){
        return schema.migrate(...args);
    }

    /**
     * 初始化模型
     */
    async initModel() {
        try {
            //check collection
            if (!ORM.collections[this.modelName]) {
                return this.error(`Collections ${this.modelName} is undefined.`);
            }
            if(this.__model){
                return this.__model;
            }
            let adapterList = {
                mysql: __dirname + '/Adapter/mysql.js',
                postgresql: __dirname + '/Adapter/postgresql.js',
                mongo: __dirname + '/Adapter/mongo.js'
            }, config = this.config, dbType = config.db_type ? config.db_type.toLowerCase() : '';
            if (!dbType in adapterList) {
                return this.error(`adapter ${dbType} is not support.`);
            }
            this.__model = new (lib.thinkRequire(adapterList[dbType]))(config);
            return this.__model;
        } catch (e) {
            return this.error(e);
        }
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
            //lib.log(msg);
        }
        return Promise.reject(msg);
    }

    /**
     * 事务开始
     */
    async startTrans() {
        try {
            // init model
            let model = await this.initModel();
            return model.startTrans();
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 事务提交
     */
    async commit() {
        try {
            // init model
            let model = await this.initModel();
            return model.commit();
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 事务回滚
     */
    async rollback() {
        try {
            // init model
            let model = await this.initModel();
            return model.rollback();
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        try {
            if (!this.tableName) {
                let tableName = this.config.db_prefix || '';
                tableName += lib.parseName(this.getModelName());
                this.tableName = tableName.toLowerCase();
            }
            return this.tableName;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName(name) {
        try {
            if (!this.modelName) {
                let filename = this.__filename;
                let last = filename.lastIndexOf('/');
                this.modelName = filename.substr(last + 1, filename.length - last - 4);
            }
            return this.modelName;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 获取主键名称
     * @access public
     * @return string
     */
    getPk() {
        try {
            if (!lib.isEmpty(this.fields)) {
                for (let v in this.fields) {
                    if (this.fields[v].hasOwnProperty('primaryKey') && this.fields[v].primaryKey === true) {
                        this.pk = v;
                    }
                }
            } else {
                if (this.config.db_type === 'mongo') {
                    this.pk = '_id';
                }
            }
            return this.pk;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */
    page(page, listRows) {
        try {
            if (page === undefined) {
                return this;
            }
            this.__options.page = listRows === undefined ? page : page + ',' + listRows;
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 关联操作
     * @param table
     * @param field
     */
    rel(table = false, field = {}) {
        try {
            if (table) {
                //获取关联关系
                let rels = schema.getRelation(this.modelName, this.config);
                if (table === true) {
                    this.__options.rel = rels;
                } else {
                    if (lib.isString(table)) {
                        table = table.replace(/ +/g, '').split(',');
                    }
                    if (lib.isArray(table)) {
                        this.__options.rel = {};
                        table.forEach(item => {
                            rels[item] && (this.__options.rel[item] = rels[item]);
                        });
                    }
                }
                //关联表字段
                if (!lib.isEmpty(field)) {
                    for (let n in field) {
                        if (n in this.__options.rel) {
                            this.__options.rel[n]['field'] = field[n];
                        }
                    }
                }
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */
    limit(offset, length) {
        try {
            if (offset === undefined) {
                return this;
            }
            if (lib.isArray(offset)) {
                length = offset[1] || length;
                offset = offset[0];
            } else if (length === undefined) {
                length = offset;
                offset = 0;
            }
            offset = Math.max(parseInt(offset) || 0, 0);
            if (length) {
                length = Math.max(parseInt(length) || 0, 0);
            }
            this.__options.limit = [offset, length];
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 排序
     * @param order
     * @returns {exports}
     */
    order(order) {
        try {
            if (order === undefined) {
                return this;
            }
            if (lib.isObject(order)) {
                this.__options.order = order;
            } else if (lib.isString(order)) {
                let strToObj = function (_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '')
                        .replace(/( +, +)+|( +,)+|(, +)/, ',')
                        .replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':')
                        .replace(/^/, '{"').replace(/$/, '"}')
                        .replace(/:/g, '":"').replace(/,/g, '","');
                };
                this.__options.order = JSON.parse(strToObj(order));
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */
    field(field) {
        try {
            if (lib.isEmpty(field)) {
                return this;
            }
            if (lib.isString(field)) {
                field = field.replace(/ +/g, '').split(',');
            }
            this.__options.field = field;
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * where条件
     * 书写方法:
     * or:  {or: [{...}, {...}]}
     * not: {not: {name: '', id: 1}}
     * notin: {notin: {'id': [1,2,3]}}
     * in: {id: [1,2,3]}
     * and: {id: 1, name: 'a'},
     * operator: {id: {'<>': 1}}
     * operator: {id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}}
     * like: {name: {'like': '%a'}}
     * @return {[type]} [description]
     */
    where(where) {
        try {
            if (!where) {
                return this;
            }
            this.__options.where = lib.extend(false, this.__options.where || {}, where);
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param group
     */
    group(group) {
        try {
            if (!group) {
                return this;
            }
            this.__options.group = group;
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param join
     */
    join(join) {
        try {
            if (!join || !lib.isArray(join) || join.length === 0) {
                return this;
            }
            this.__options.join = join;
            return this;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeAdd(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    async add(data, options) {
        try {
            if (lib.isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let parsedOptions = await this.__parseOptions(options);
            // init model
            let model = await this.initModel();
            //copy data
            let __data = lib.extend({}, data);
            __data = await this._beforeAdd(__data, parsedOptions);
            __data = await this.__checkData(model, __data, parsedOptions, 'ADD');
            if (lib.isEmpty(__data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let result = await model.add(__data, parsedOptions);
            let pk = await this.getPk();

            __data[pk] = __data[pk] ? __data[pk] : result;
            if (!lib.isEmpty(this.__relationData)) {
                await this.__postRelationData(model, result, parsedOptions, this.__relationData, 'ADD');
            }
            await this._afterAdd(__data, parsedOptions);
            return __data[pk] || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterAdd(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 查询后新增
     * @param data
     * @param options
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
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeDelete(options) {
        return Promise.resolve(options);
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    async delete(options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            if (lib.isEmpty(parsedOptions.where)) {
                return this.error('_OPERATION_WRONG_');
            }
            // init model
            let model = await this.initModel();
            await this._beforeDelete(parsedOptions);
            let result = await model.delete(parsedOptions);
            await this._afterDelete(parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */
    _afterDelete(options) {
        return Promise.resolve(options);
    }

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _beforeUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    async update(data, options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            // init model
            let model = await this.initModel();
            //copy data
            let __data = lib.extend({}, data);
            __data = await this._beforeUpdate(__data, parsedOptions);
            __data = await this.__checkData(model, __data, parsedOptions, 'UPDATE');
            if (lib.isEmpty(__data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let pk = await this.getPk();
            // 如果存在主键数据 则自动作为更新条件
            if (lib.isEmpty(parsedOptions.where)) {
                if (!lib.isEmpty(__data[pk])) {
                    parsedOptions.where = {};
                    parsedOptions.where[pk] = __data[pk];
                    delete __data[pk];
                } else {
                    return this.error('_OPERATION_WRONG_');
                }
            } else {
                if (!lib.isEmpty(__data[pk])) {
                    delete __data[pk];
                }
            }
            let result = await model.update(__data, parsedOptions);
            if (!lib.isEmpty(this.__relationData)) {
                await this.__postRelationData(model, result, parsedOptions, this.__relationData, 'UPDATE');
            }
            await this._afterUpdate(__data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 字段自增
     * @param field
     * @param step
     * @param options
     * @returns {*}
     */
    async increment(field, step = 1, options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            // init model
            let model = await this.initModel();
            //copy data
            let __data = lib.extend({}, {[field]: step});
            __data = await this._beforeUpdate(__data, parsedOptions);
            __data = await this.__checkData(model, __data, parsedOptions, 'UPDATE');
            if (lib.isEmpty(__data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }

            let result = await model.increment(__data, field, parsedOptions);
            await this._afterUpdate(__data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 字段自减
     * @param field
     * @param step
     * @param options
     * @returns {*}
     */
    async decrement(field, step = 1, options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            // init model
            let model = await this.initModel();
            //copy data
            let __data = lib.extend({}, {[field]: step});
            __data = await this._beforeUpdate(__data, parsedOptions);
            __data = await this.__checkData(model, __data, parsedOptions, 'UPDATE');
            if (lib.isEmpty(__data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }

            let result = await model.decrement(__data, field, parsedOptions);
            await this._afterUpdate(__data, parsedOptions);
            return result || [];
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 查询数据条数
     * count('xxx')
     * @param options
     * @returns {*}
     */
    async count(options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            let pk = await this.getPk();
            // init model
            let model = await this.initModel();
            let result = await model.count(pk, parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 统计数据数量和
     * sum('xxx')
     * @param field
     * @param options
     * @returns {*}
     */
    async sum(field, options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            let pk = await this.getPk();
            field = field || pk;
            // init model
            let model = await this.initModel();
            let result = await model.sum(field, parsedOptions);
            return result || 0;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    async find(options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            // init model
            let model = await this.initModel();
            let result = await model.find(parsedOptions);
            result = await this.__parseData(model, (lib.isArray(result) ? result[0] : result) || {}, parsedOptions);
            if (!lib.isEmpty(parsedOptions.rel)) {
                result = await this.__getRelationData(model, parsedOptions, result);
            }
            await this._afterFind(result, parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */
    _afterFind(result, options) {
        return Promise.resolve(result);
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    async select(options) {
        try {
            let parsedOptions = await this.__parseOptions(options);
            // init model
            let model = await this.initModel();
            let result = await model.select(parsedOptions);
            result = await this.__parseData(model, result || [], parsedOptions);
            if (!lib.isEmpty(parsedOptions.rel)) {
                result = await this.__getRelationData(model, parsedOptions, result);
            }
            await this._afterSelect(result, parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    _afterSelect(result, options) {
        return Promise.resolve(result);
    }

    /**
     * 返回数据里含有count信息的查询
     * @param  options
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */
    async countSelect(options, pageFlag) {
        try {
            if (lib.isBoolean(options)) {
                pageFlag = options;
                options = {};
            }
            let parsedOptions = await this.__parseOptions(options);
            let countNum = await this.count(parsedOptions);
            let pageOptions = parsedOptions.page || {page: 1, num: 10};
            let totalPage = Math.ceil(countNum / pageOptions.num);
            if (lib.isBoolean(pageFlag)) {
                if (pageOptions.page > totalPage) {
                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                }
                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
            }
            //传入分页参数
            let offset = (pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
            parsedOptions.limit = [offset, pageOptions.num];
            let result = lib.extend(false, {count: countNum, total: totalPage}, pageOptions);
            result.data = await this.select(parsedOptions);
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
            // init model
            let model = await this.initModel();
            let result = await model.native(this.tableName, sqlStr);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 解析参数
     * @param oriOpts
     * @param extraOptions
     * @returns {*}
     * @private
     */
    __parseOptions(oriOpts, extraOptions) {
        try {
            let options;
            if (lib.isScalar(oriOpts)) {
                options = lib.extend({}, this.__options);
            } else {
                options = lib.extend({}, this.__options, oriOpts, extraOptions);
            }
            //查询过后清空sql表达式组装 避免影响下次查询
            this.__options = {};
            //获取表名
            options.table = options.table || this.tableName;
            //模型名称
            options.name = options.name || this.modelName;
            //模型查询别名
            options.alias = this.modelName;
            //模型主键
            options.pk = options.pk || this.getPk();
            //解析field,根据model的fields进行过滤
            let field = [];
            if (lib.isEmpty(options.field) && !lib.isEmpty(options.fields)) options.field = options.fields;
            //解析分页
            if (options['page']) {
                let page = options.page + '';
                let num = 0;
                if (page.indexOf(',') > -1) {
                    page = page.split(',');
                    num = parseInt(page[1], 10);
                    page = page[0];
                }
                num = num || 10;
                page = parseInt(page, 10) || 1;
                options.page = {page: page, num: num};
            }
            return options;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 数据合法性检测
     * @param adapter
     * @param data
     * @param options
     * @param method
     * @returns {*}
     * @private
     */
    __checkData(adapter, data, options, method = '') {
        try {
            let dataCheckFlag = false, ruleCheckFlag = false,
                result = {status: 1, msg: ''}, fields = this.fields, vaildRules = this.validations;
            //根据模型定义字段类型进行数据检查
            for (let field in data) {
                if (!fields[field]) {
                    //分离关联模型数据
                    if (this.relation[field]) {
                        !this.__relationData[field] && (this.__relationData[field] = {});
                        this.__relationData[field] = data[field];
                    }
                    //移除未定义的字段
                    delete data[field];
                }
            }
            //字段默认值处理以及合法性检查
            for (let field in fields) {
                if (method === 'ADD') {//新增数据add
                    lib.isEmpty(data[field]) && (fields[field].defaultsTo !== undefined && fields[field].defaultsTo !== null) && (data[field] = fields[field].defaultsTo);
                    //非主键字段就检查
                    dataCheckFlag = !fields[field].primaryKey ? true : false;
                    //定义了规则就检查
                    ruleCheckFlag = vaildRules[field] ? true : false;
                } else if (method === 'UPDATE') {//编辑数据update
                    data.hasOwnProperty(field) && lib.isEmpty(data[field]) && (fields[field].defaultsTo !== undefined && fields[field].defaultsTo !== null) && (data[field] = fields[field].defaultsTo);
                    //更新包含字段就检查,主键除外(因为主键不会被更新)
                    dataCheckFlag = (data.hasOwnProperty(field) && !fields[field].primaryKey) ? true : false;
                    //更新包含字段且定义了规则就检查
                    ruleCheckFlag = (data.hasOwnProperty(field) && vaildRules[field]) ? true : false;
                }
                //自定义规则验证
                if (ruleCheckFlag) {
                    result = vaild.ruleCheck(field, data[field], vaildRules[field], method);
                    if (!result.status) {
                        return this.error(result.msg);
                    }
                }
                //严格数据类型检查
                if (dataCheckFlag) {
                    result = vaild.dataCheck(field, data[field], fields[field].type || 'string');
                    if (!result.status) {
                        return this.error(result.msg);
                    }
                }
                //处理数据源特殊字段
                if(adapter.__checkData){
                    data[field] = adapter.__checkData(data[field], fields[field].type || 'string');
                }
            }
            return data;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 查询结果处理
     * @param data
     * @param options
     * @param method
     * @returns {*}
     * @private
     */
    __parseData(adapter, data, options, method = '') {
        try {
            //处理数据源特殊字段
            if(adapter.__parseData){
                data = adapter.__parseData(data, this.fields);
            }
            return data;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * @param adapter
     * @param options
     * @param data
     * @returns {*}
     * @private
     */
    async __getRelationData(adapter, options, data) {
        try {
            let caseList = {
                HASONE: adapter.__getHasOneRelation,
                HASMANY: adapter.__getHasManyRelation,
                MANYTOMANY: adapter.__getManyToManyRelation
            };
            let relationData = data;
            if (!lib.isEmpty(data)) {
                let relation = options.rel, rtype, config = this.config, ps = [];
                let pk = await this.getPk();
                for (let n in relation) {
                    rtype = relation[n]['type'];
                    if (rtype && rtype in caseList) {
                        if (lib.isArray(data)) {
                            for (let [k,v] of data.entries()) {
                                ps.push(caseList[rtype](config, relation[n], data[k]).then(res => {
                                    data[k][relation[n]['name']] = res;
                                }));
                                //data[k][relation[n]['name']] = await caseList[rtype](config, relation[n], data[k]);
                            }
                            await Promise.all(ps);
                        } else {
                            data[relation[n]['name']] = await caseList[rtype](config, relation[n], data);
                        }
                    }
                }
            }
            return relationData;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     *
     * @param adapter
     * @param result
     * @param options
     * @param relationData
     * @param postType
     * @returns {*}
     * @private
     */
    async __postRelationData(adapter, result, options, relationData, postType) {
        try {
            let caseList = {
                HASONE: adapter.__postHasOneRelation,
                HASMANY: adapter.__postHasManyRelation,
                MANYTOMANY: adapter.__postManyToManyRelation
            }, ps = [];
            if (!lib.isEmpty(result)) {
                let relation = schema.getRelation(this.modelName, this.config), rtype, config = this.config;
                let pk = await this.getPk();
                for (let n in relationData) {
                    rtype = relation[n] ? relation[n]['type'] : null;
                    if (rtype && rtype in caseList) {
                        ps.push(caseList[rtype](config, result, options, relation[n], relationData[n], postType));
                    }
                }
            }
            return Promise.all(ps);
        } catch (e) {
            return this.error(e);
        }
    }

}
