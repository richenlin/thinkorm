/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';
import schema from './schema';
import vaild from './Util/valid';

var parseType = function (type) {
    type = type || 'HASONE';
    if (type == 1) {
        type = 'HASONE';
    } else if (type == 2) {
        type = 'HASMANY';
    } else if (type == 3) {
        type = 'MANYTOMANY';
    } else {
        type = (type + '').toUpperCase();
    }
    return type
};

export default class extends base {
    /**
     * init
     * @param name
     * @param config
     */
    init(name, config = {}) {
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
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 关联模型数据
        this._relationData = {};
        // 验证规则
        this._valid = vaild;

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
            db_ext_config: config.db_ext_config
        };
        // 模型名
        if (name) {
            this.modelName = name;
        } else {
            this.modelName = this.getModelName();
        }
        // 表名
        this.tableName = this.getTableName();
        // 安全模式
        this.safe = (this.config.db_ext_config.safe === true);
        // colleciton key
        this.clsKey = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
        // collection instance
        this.instances = null;
    }

    /**
     *
     * @param args
     * @returns {*}
     */
    static load(...args){
        return schema.setCollection(...args);
    }

    /**
     * 初始化模型
     */
    async initModel() {
        try {
            //check collection
            if(!ORM.collections[this.clsKey]){
                return this.error('Collections is undefined, please run setCollection before.');
            }
            if(!ORM.collections[this.clsKey][this.modelName]){
                return this.error(`Collections ${this.modelName} is undefined.`);
            }
            this.instances = ORM.connections[this.clsKey];
            if (!this.instances) {
                this.instances = await schema.setConnection(this.config);
            }
            return this.instances;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 错误封装
     * @param err
     */
    error(err) {
        if (err) {
            let msg = err;
            if (!ORM.isError(msg)) {
                if (!ORM.isString(msg)) {
                    msg = JSON.stringify(msg);
                }
                msg = new Error(msg);
            }
            let stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            ORM.log(msg);
        }
        return ORM.getDefer().promise;
    }

    /**
     * 数据迁移
     */
    async migrate() {
        try{
            // init model
            let model = await this.initModel();
            return model.migrate(ORM.collections[this.clsKey]);
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 事务开始
     */
    async startTrans() {
        try{
            // init model
            let model = await this.initModel();
            return model.startTrans();
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 事务提交
     */
    async commit() {
        try{
            // init model
            let model = await this.initModel();
            return model.commit();
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 事务回滚
     */
    async rollback() {
        try{
            // init model
            let model = await this.initModel();
            return model.rollback();
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        try{
            if (!this.tableName) {
                let tableName = this.config.db_prefix || '';
                tableName += ORM.parseName(this.getModelName());
                this.tableName = tableName.toLowerCase();
            }
            return this.tableName;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName(name) {
        try{
            if (!this.modelName) {
                let filename = this.__filename || __filename;
                let last = filename.lastIndexOf('/');
                this.modelName = filename.substr(last + 1, filename.length - last - 4);
            }
            return this.modelName;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 获取主键名称
     * @access public
     * @return string
     */
    getPk() {
        try{
            if (!ORM.isEmpty(this.fields)) {
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
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */
    page(page, listRows) {
        try{
            if (page === undefined) {
                return this;
            }
            this._options.page = listRows === undefined ? page : page + ',' + listRows;
            return this;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 关联操作
     * @param table
     * @param field
     */
    rel(table = false, field = {}) {
        try{
            if (table) {
                //获取关联关系
                let rels = schema.getRelation(this.modelName, this.config);
                if (table === true) {
                    this._options.rel = rels;
                } else {
                    if (ORM.isString(table)) {
                        table = table.replace(/ +/g, '').split(',');
                    }
                    if (ORM.isArray(table)) {
                        this._options.rel = {};
                        table.forEach(item => {
                            rels[item] && (this._options.rel[item] = rels[item]);
                        });
                    }
                }
                //关联表字段
                if (!ORM.isEmpty(field)) {
                    for (let n in field) {
                        if (n in this._options.rel) {
                            this._options.rel[n]['field'] = field[n];
                        }
                    }
                }
            }
            return this;
        }catch (e){
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
        try{
            if (offset === undefined) {
                return this;
            }
            if (ORM.isArray(offset)) {
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
            this._options.limit = [offset, length];
            return this;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 排序
     * @param order
     * @returns {exports}
     */
    order(order) {
        try{
            if (order === undefined) {
                return this;
            }
            if (ORM.isObject(order)) {
                this._options.order = order;
            } else if (ORM.isString(order)) {
                let strToObj = function (_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '')
                        .replace(/( +, +)+|( +,)+|(, +)/, ',')
                        .replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':')
                        .replace(/^/, '{"').replace(/$/, '"}')
                        .replace(/:/g, '":"').replace(/,/g, '","');
                };
                this._options.order = JSON.parse(strToObj(order));
            }
            return this;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */
    field(field) {
        try{
            if (ORM.isEmpty(field)) {
                return this;
            }
            if (ORM.isString(field)) {
                field = field.replace(/ +/g, '').split(',');
            }
            this._options.field = field;
            return this;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     * where条件
     * 书写方法:
     * and:      where({id: 1, name: 'a'})
     * or:       where({or: [{...}, {...}]})
     * in:       where({id: [1,2,3]})
     * not:      where({not: {name: '', id: 1}})
     * notin:    where({notin: {'id': [1,2,3]}})
     * operator: where({id: {'<>': 1, '>=': 0}})
     * @return {[type]} [description]
     */
    where(where) {
        try{
            if (!where) {
                return this;
            }
            this._options.where = ORM.extend(false, this._options.where || {}, where);
            return this;
        }catch (e){
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
        try{
            if (!group) {
                return this;
            }
            this._options.group = group;
            return this;
        }catch (e){
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
        try{
            if (!join || !ORM.isArray(join) || join.length === 0) {
                return this;
            }
            this._options.join = join;
            return this;
        }catch (e){
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
            if (ORM.isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let parsedOptions = await this._parseOptions(options);
            // init model
            let model = await this.initModel();
            //copy data
            this._data = ORM.extend({}, data);
            this._data = await this._beforeAdd(this._data, parsedOptions);
            this._data = await this._parseData(this._data, parsedOptions);
            if (ORM.isEmpty(this._data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let result = await model.add(this._data, parsedOptions);
            let pk = await this.getPk();
            this._data[pk] = this._data[pk] ? this._data[pk] : result;
            if (!ORM.isEmpty(this._relationData)) {
                await this._postRelationData(result, parsedOptions, this._relationData, 'ADD');
            }
            await this._afterAdd(this._data, parsedOptions);
            result = await this._parseData(this._data[pk] || 0, parsedOptions, false);
            return result;
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
            if (ORM.isEmpty(data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let record = await this.find(options);
            if (ORM.isEmpty(record)) {
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
            let parsedOptions = await this._parseOptions(options);
            if (ORM.isEmpty(parsedOptions.where)) {
                return this.error('_OPERATION_WRONG_');
            }
            // init model
            let model = await this.initModel();
            await this._beforeDelete(parsedOptions);
            let result = await model.delete(parsedOptions);
            await this._afterDelete(parsedOptions);
            result = await this._parseData(result || [], parsedOptions, false);
            return result;
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
            let parsedOptions = await this._parseOptions(options);
            // init model
            let model = await this.initModel();
            //copy data
            this._data = ORM.extend({}, data);
            this._data = await this._beforeUpdate(this._data, parsedOptions);
            this._data = await this._parseData(this._data, parsedOptions);
            if (ORM.isEmpty(this._data)) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let pk = await this.getPk();
            // 如果存在主键数据 则自动作为更新条件
            if (ORM.isEmpty(parsedOptions.where)) {
                if (!ORM.isEmpty(this._data[pk])) {
                    parsedOptions.where = {};
                    parsedOptions.where[pk] = this._data[pk];
                    delete this._data[pk];
                } else {
                    return this.error('_OPERATION_WRONG_');
                }
            } else {
                if (!ORM.isEmpty(this._data[pk])) {
                    delete this._data[pk];
                }
            }
            let result = await model.update(this._data, parsedOptions);
            if (!ORM.isEmpty(this._relationData)) {
                await this._postRelationData(result, parsedOptions, this._relationData, 'UPDATE');
            }
            await this._afterUpdate(this._data, parsedOptions);
            result = await this._parseData(result || [], parsedOptions, false);
            return result;
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
     * 查询数据条数
     * count('xxx')
     * @param options
     * @returns {*}
     */
    async count(options) {
        try {
            let parsedOptions = await this._parseOptions(options);
            let pk = await this.getPk();
            // init model
            let model = await this.initModel();
            let result = await model.count(pk, parsedOptions);
            result = await this._parseData(result || 0, parsedOptions, false);
            return result;
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
            let parsedOptions = await this._parseOptions(options);
            let pk = await this.getPk();
            field = field || pk;
            // init model
            let model = await this.initModel();
            let result = await model.sum(field, parsedOptions);
            result = await this._parseData(result || 0, parsedOptions, false);
            return result;
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
            let parsedOptions = await this._parseOptions(options);
            // init model
            let model = await this.initModel();
            let result = await model.find(parsedOptions);
            result = await this._parseData(result, parsedOptions, false);
            result = (ORM.isArray(result) ? result[0] : result) || {};
            if (!ORM.isEmpty(parsedOptions.rel)) {
                result = await this._getRelationData(parsedOptions, result);
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
            let parsedOptions = await this._parseOptions(options);
            // init model
            let model = await this.initModel();
            let result = await model.select(parsedOptions);
            result = await this._parseData(result || [], parsedOptions, false);
            if (!ORM.isEmpty(parsedOptions.rel)) {
                result = await this._getRelationData(parsedOptions, result);
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
            if (ORM.isBoolean(options)) {
                pageFlag = options;
                options = {};
            }
            let parsedOptions = await this._parseOptions(options);
            let countNum = await this.count(parsedOptions);
            let pageOptions = parsedOptions.page;
            let totalPage = Math.ceil(countNum / pageOptions.num);
            if (ORM.isBoolean(pageFlag)) {
                if (pageOptions.page > totalPage) {
                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                }
                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
            }
            //传入分页参数
            let offset = (pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
            parsedOptions.limit = [offset, pageOptions.num];
            let result = ORM.extend(false, {count: countNum, total: totalPage}, pageOptions);
            result.data = await this.select(parsedOptions);
            result = await this._parseData(result, parsedOptions, false);
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
    _parseOptions(oriOpts, extraOptions) {
        let options;
        if (ORM.isScalar(oriOpts)) {
            options = ORM.extend({}, this._options);
        } else {
            options = ORM.extend({}, this._options, oriOpts, extraOptions);
        }
        //查询过后清空sql表达式组装 避免影响下次查询
        this._options = {};
        //获取表名
        options.table = options.table || this.getTableName();
        //模型名称
        options.name = options.name || this.modelName;
        //解析field,根据model的fields进行过滤
        let field = [];
        if (ORM.isEmpty(options.field) && !ORM.isEmpty(options.fields)) options.field = options.fields;
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
        } else {
            options.page = {page: 1, num: 10};
        }
        return options;
    }

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @param option
     * @returns {*}
     */
    _parseData(data, options, preCheck = true, option = 1) {
        if (preCheck) {
            //根据模型定义字段类型进行数据检查
            let result = [];
            for (let field in data) {
                //分离关联模型数据
                if (this.relation[field]) {
                    !this._relationData[field] && (this._relationData[field] = {});
                    this._relationData[field] = data[field];
                    delete data[field];
                }
                //移除未定义的字段
                if (!this.fields[field]) {
                    delete data[field];
                }
            }
            //根据规则自动验证数据
            if (ORM.isEmpty(this.validations)) {
                return data;
            }
            let field, value, checkData = [];
            for (field in this.validations) {
                value = ORM.extend(this.validations[field], {name: field, value: data[field]});
                checkData.push(value);
            }
            if (ORM.isEmpty(checkData)) {
                return data;
            }
            result = {};
            result = this._valid(checkData);
            if (ORM.isEmpty(result)) {
                return data;
            }
            return this.error(Object.values(result)[0]);
        } else {
            if (ORM.isJSONObj(data)) {
                return data;
            } else {
                return JSON.parse(JSON.stringify(data));
            }
        }
    }

    /**
     *
     * @param options
     * @returns {*}
     * @private
     */
    async _getRelationData(options, data) {
        try{
            let caseList = {
                HASONE: this._getHasOneRelation,
                HASMANY: this._getHasManyRelation,
                MANYTOMANY: this._getManyToManyRelation
            };
            let relationData = data;
            if (!ORM.isEmpty(data)) {
                let relation = options.rel, rtype, fkey;
                let pk = await this.getPk();
                for (let n in relation) {
                    rtype = relation[n]['type'];
                    if (relation[n].fkey && rtype && rtype in caseList) {
                        fkey = (rtype === 'MANYTOMANY') ? ORM.parseName(relation[n].name) : relation[n].fkey;
                        if (ORM.isArray(data)) {
                            for (let [k,v] of data.entries()) {
                                data[k][fkey] = await caseList[rtype](relation[n], data[k]);
                            }
                        } else {
                            data[fkey] = await caseList[rtype](relation[n], data);
                        }
                    }
                }
            }

            return relationData;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     *
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */
    _getHasOneRelation(rel, data) {
        if (ORM.isEmpty(data) || ORM.isEmpty(data[rel.fkey])) {
            return {};
        }
        let model = rel.model;
        return model.find({field: rel.field, where: {[rel.rkey]: data[rel.fkey]}});
    }

    /**
     *
     * @param rel
     * @param data
     * @returns {{}}
     * @private
     */
    _getHasManyRelation(rel, data) {
        if (ORM.isEmpty(data) || ORM.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        let model = rel.model;
        let options = {field: rel.field, where: {[rel.rkey]: data[rel.primaryPk]}};
        return model.select(options);
    }

    /**
     *
     * @param rel
     * @param data
     * @returns {{}}
     * @private
     */
    _getManyToManyRelation(rel, data) {
        if (ORM.isEmpty(data) || ORM.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        let model = rel.model;
        let rpk = model.getPk();
        //let mapModel = `${rel.primaryName}${rel.name}Map`;
        //if(model.config.db_type === 'mongo'){
            return rel.mapModel.field(rel.fkey).select({where: {[rel.fkey]: data[rel.primaryPk]}}).then(data => {
                let keys = [];
                data.map(item => {
                    item[rel.fkey] && keys.push(item[rel.fkey]);
                });
                return model.select({where: {[rpk]: keys}});
            });
        //} else {
        //    let options = {
        //        table: `${model.config.db_prefix}${ORM.parseName(mapModel)}`,
        //        name: mapModel,
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
     * @param result
     * @param options
     * @param relationData
     * @param postType
     * @returns {*}
     * @private
     */
    async _postRelationData(result, options, relationData, postType) {
        try{
            let caseList = {
                HASONE: this._postHasOneRelation,
                HASMANY: this._postHasManyRelation,
                MANYTOMANY: this._postManyToManyRelation
            };
            if (!ORM.isEmpty(result)) {
                let relation = schema.getRelation(this.modelName, this.config), rtype;
                let pk = await this.getPk();
                for (let n in relationData) {
                    rtype = relation[n] ? relation[n]['type'] : null;
                    if (relation[n].fkey && rtype && rtype in caseList) {
                        relation[n]['clsKey'] = this.clsKey;
                        await caseList[rtype](result, options, relation[n], relationData[n], postType)
                    }
                }
            }
            return;
        }catch (e){
            return this.error(e);
        }
    }

    /**
     *
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async _postHasOneRelation(result, options, rel, relationData, postType) {
        if (ORM.isEmpty(result) || ORM.isEmpty(relationData)) {
            return;
        }
        let model  = rel.model;
        switch (postType) {
            case 'ADD':
                //子表插入数据
                let fkey = await model.add(relationData);
                //更新主表关联字段
                fkey && ORM.collections[rel.clsKey][rel.primaryName] && (await ORM.collections[rel.clsKey][rel.primaryName].update({[rel.fkey]: fkey}, {where: {[rel.primaryPk]: result}}));
                break;
            case 'UPDATE':
                if (!relationData[rel.fkey]) {
                    if(ORM.collections[rel.clsKey][rel.primaryName]){
                        let info = await ORM.collections[rel.clsKey][rel.primaryName].field(rel.fkey).find(options);
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
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async _postHasManyRelation(result, options, rel, relationData, postType) {
        if (ORM.isEmpty(result) || ORM.isEmpty(relationData)) {
            return;
        }
        let model  = rel.model, rpk = model.getPk();
        for (let [k, v] of relationData.entries()) {
            switch (postType) {
                case 'ADD':
                    //子表插入数据
                    v[rel.rkey] = result;
                    await model.add(v);
                    break;
                case 'UPDATE':
                    //子表主键数据存在才更新
                    if (v[rpk]) {
                        await model.update(v, {where: {[rpk]: v[rpk]}});
                    }
                    break;
            }
        }
        return;
    }

    /**
     *
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async _postManyToManyRelation(result, options, rel, relationData, postType) {
        if (ORM.isEmpty(result) || ORM.isEmpty(relationData)) {
            return;
        }
        //子表主键
        let model = rel.model, rpk = model.getPk();
        //关系表
        for (let [k, v] of relationData.entries()) {
            switch (postType) {
                case 'ADD':
                    //子表增加数据
                    let fkey = await model.add(v);
                    //关系表增加数据,使用thenAdd
                    fkey && rel['mapModel'] && (await rel['mapModel'].thenAdd({[rel.fkey]: result, [rel.rkey]: fkey}, {where: {[rel.fkey]: result, [rel.rkey]: fkey}}));
                    break;
                case 'UPDATE':
                    //关系表两个外键都存在,更新关系表
                    if (v[rel.fkey] && v[rel.rkey]) {
                        //关系表增加数据,此处不考虑两个外键是否在相关表存在数据,因为关联查询会忽略
                        rel['mapModel'] && (await rel['mapModel'].thenAdd({[rel.fkey]: v[rel.fkey], [rel.rkey]: v[rel.rkey]}, {where: {[rel.fkey]: v[rel.fkey], [rel.rkey]: v[rel.rkey]}}));
                    } else if(v[rpk]){//仅存在子表主键情况下,更新子表
                        await model.update(v, {where: {[rpk]: v[rpk]}});
                    }
                    break;
            }
        }
        return;
    }

}
