/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';
import vaild from './Util/valid';

let thinkorm = class extends base {

    /**
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    init(name = '', config = {}) {
        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 模型名称(不能被重载)
        this._modelName = '';
        // 数据表名(不能被重载)
        this._tableName = '';
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
        // 获取模型名称
        if (name) {
            this._modelName = name;
            this._tableName = this.getTableName();
        } else {
            //空模型创建临时表
            this._modelName = '_temp';
            this._tableName = '_temp';
        }
        // 表主键
        if (this.config.db_type === 'mongo') {
            this.pk = '_id';
        }
        // 安全模式
        this.safe = (this.config.db_ext_config.safe === true);
        // 配置hash(不能被重载)
        this.adapterKey = ORM.hash(`${this.config.db_type}_${this.config.db_host}_${this.config.db_port}_${this.config.db_name}`);
        // 链接句柄
        this.db = null;
    }

    /**
     * 获取数据库连接实例
     * @returns {*}
     */
    initDb() {
        let instances = ORM.DB.conn[this.adapterKey];
        if (!instances) {
            let adapterList = {
                mysql: __dirname + '/Adapter/mysql.js',
                postgresql: __dirname + '/Adapter/postgresql.js',
                mongo: __dirname + '/Adapter/mongo.js'
            };
            if (!this.config.db_type.toLowerCase() in adapterList) {
                return this.error('_ADAPTER_IS_NOT_SUPPORT_');
            }
            instances = new (ORM.safeRequire(adapterList[this.config.db_type]))(this.config);
            ORM.DB.conn[this.adapterKey] = instances;
        }
        this.db = instances;
        return this.db;
    }

    /**
     * 模型构建
     * @returns {*}
     */
    schema() {
        //自动创建表\更新表\迁移数据
        return this.initDb().then(instances => {
            return instances.schema(this._tableName, this.fields);
        })
    }

    /**
     * 获取关联关系
     * @param relationObj
     * @returns {*}
     */
    getRelation(name) {
        let type;
        let parseType = function (type) {
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
        //初始化关联关系
        if (!ORM.DB.relation[this._tableName]) {
            if (!ORM.DB.relation[this._tableName]) {
                ORM.DB.relation[this._tableName] = {};
                for (let n in this.relation) {
                    type = parseType(this.relation[n]['type']);
                    ORM.DB.relation[this._tableName][n] = {
                        type: type, //关联方式
                        model: ORM.parseName(n), //关联表名,不带前缀
                        pk: this.getPk(),//主表主键
                        pmodel: this._modelName,//主表名,不带前缀
                        field: this.relation[n]['field'] || [],
                        fkey: this.relation[n]['fkey'], //外键
                        rkey: this.relation[n]['rkey'] //关联表主键
                    }
                }
            }
        }

        if (name) {
            return ORM.DB.relation[this._tableName][name];
        }
        return ORM.DB.relation[this._tableName];
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
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        if (!this._tableName) {
            let tableName = this.config.db_prefix || '';
            tableName += ORM.parseName(this.getModelName());
            this._tableName = tableName.toLowerCase();
        }
        return this._tableName;
    }

    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName(name) {
        if (!this._modelName) {
            let filename = this.__filename || __filename;
            let last = filename.lastIndexOf('/');
            this._modelName = filename.substr(last + 1, filename.length - last - 4);
        }
        return this._modelName;
    }

    /**
     * 获取主键名称
     * @access public
     * @return string
     */
    getPk() {
        if (!ORM.isEmpty(this.fields)) {
            for (let v in this.fields) {
                if (this.fields[v].hasOwnProperty('primaryKey') && this.fields[v].primaryKey === true) {
                    this.pk = v;
                }
            }
        }
        return this.pk;
    }

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */
    page(page, listRows) {
        if (page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? page : page + ',' + listRows;
        return this;
    }

    /**
     * 开启关联操作
     * @param table
     * @param field
     */
    rel(table = false, field = {}) {
        if (table) {
            //缓存关联关系
            let rels = this.getRelation();
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
            if(!ORM.isEmpty(field)){
                for(let n in field){
                    if(n in this._options.rel){
                        this._options.rel[n]['field'] = field[n];
                    }
                }
            }
        }
        return this;
    }

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */
    limit(offset, length) {
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
    }

    /**
     * 排序
     * @param order
     * @returns {exports}
     */
    order(order) {
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
    }

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */
    field(field) {
        if (ORM.isEmpty(field)) {
            return this;
        }
        if (ORM.isString(field)) {
            field = field.replace(/ +/g, '').split(',');
        }
        this._options.field = field;
        return this;
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
        if (!where) {
            return this;
        }
        this._options.where = ORM.extend(false, this._options.where || {}, where);
        return this;
    }

    /**
     *
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param group
     */
    group(group) {
        if (!group) {
            return this;
        }
        this._options.group = group;
        return this;
    }

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param join
     */
    join(join) {
        if (!join || !ORM.isArray(join)) {
            return this;
        }
        this._options.join = join;
        return this;
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
                return this.error('_DATA_TYPE_INVALID_')
            }
            let parsedOptions = await this._parseOptions(options);
            // init db
            let db = await this.initDb();
            //copy data
            this._data = ORM.extend({}, data);
            this._data = await this._beforeAdd(this._data, parsedOptions);
            this._data = await this._parseData(this._data, parsedOptions);
            let result = await db.add(this._data, parsedOptions);
            //if(!ORM.isEmpty(this._relationData)){
            //    await this._postRelationData(result, parsedOptions, this._relationData, 'ADD');
            //}
            await this._afterAdd(this._data, parsedOptions);
            let pk = await this.getPk();
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
                return this.error('_DATA_TYPE_INVALID_')
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
            // init db
            let db = await this.initDb();
            await this._beforeDelete(parsedOptions);
            let result = await db.delete(parsedOptions);
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
            // init db
            let db = await this.initDb();
            //copy data
            this._data = ORM.extend({}, data);
            this._data = await this._beforeUpdate(this._data, parsedOptions);
            this._data = await this._parseData(this._data, parsedOptions);
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
            let result = await db.update(this._data, parsedOptions);
            if(!ORM.isEmpty(this._relationData)){
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
            // init db
            let db = await this.initDb();
            let result = await db.count(pk, parsedOptions);
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
            // init db
            let db = await this.initDb();
            let result = await db.sum(field, parsedOptions);
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
            // init db
            let db = await this.initDb();
            let result = await db.find(parsedOptions);
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
            // init db
            let db = await this.initDb();
            let result = await db.select(parsedOptions);
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
        options.name = options.name || this._modelName;
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
                if(this.relation[field]){
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
        let caseList = {
            HASONE: this._getHasOneRelation,
            HASMANY: this._getHasManyRelation,
            MANYTOMANY: this._getManyToManyRelation
        };
        let relationData = data;
        if (!ORM.isEmpty(data)) {
            let relation = options.rel, newClass = class extends thinkorm {}, rtype, scope;
            let pk = await this.getPk();
            for (let n in relation) {
                rtype = relation[n]['type'];
                if (relation[n].fkey && rtype && rtype in caseList) {
                    scope = new newClass(relation[n].model, this.config);
                    if (ORM.isArray(data)) {
                        for (let [k,v] of data.entries()) {
                            data[k][relation[n].fkey] = await caseList[rtype](scope, relation[n], data[k]);
                        }
                    } else {
                        data[relation[n].fkey] = await caseList[rtype](scope, relation[n], data);
                    }
                }
            }
        }

        return relationData;
    }

    /**
     *
     * @param scope
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */
    _getHasOneRelation(scope, rel, data) {
        if(!scope || ORM.isEmpty(data) || ORM.isEmpty(data[rel.fkey])){
            return {};
        }
        let options = {field: rel.field,where: {[rel.rkey]: data[rel.fkey]}, table: `${scope.config.db_prefix}${rel.model}`, name: rel.model};
        return scope.find(options);
    }

    /**
     *
     * @param scope
     * @param rel
     * @param data
     * @returns {{}}
     * @private
     */
    _getHasManyRelation(scope, rel, data) {
        if(!scope || ORM.isEmpty(data) || ORM.isEmpty(data[rel.pk])){
            return [];
        }
        let options = {field: rel.field,where: {[rel.rkey]: data[rel.pk]}, table: `${scope.config.db_prefix}${rel.model}`, name: rel.model};
        return scope.select(options);
    }

    /**
     *
     * @param scope
     * @param rel
     * @param data
     * @returns {{}}
     * @private
     */
    _getManyToManyRelation(scope, rel, data) {
        if(!scope || ORM.isEmpty(data) || ORM.isEmpty(data[rel.pk])){
            return [];
        }
        let rpk = scope.getPk();
        let mapModel = `${rel.pmodel}_${rel.model}_map`;
        let options = {
            table: `${scope.config.db_prefix}${mapModel}`,
            name: mapModel,
            join: [
                {from: `${rel.model}`, on: {[rel.rkey]: rpk}, field: rel.field, type: 'inner'}
            ],
            where: {
                [rel.fkey] : data[rel.pk]
            }
        };
        return scope.select(options);
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
    async _postRelationData(result, options, relationData, postType){
        let caseList = {
            HASONE: this._postHasOneRelation,
            HASMANY: this._postHasManyRelation,
            MANYTOMANY: this._postManyToManyRelation
        };

        if (!ORM.isEmpty(result)) {
            let relation = options.rel, newClass = class extends thinkorm {}, rtype, scope;
            let pk = await this.getPk();
            for (let n in relation) {
                rtype = relation[n]['type'];
                if (relation[n].fkey && rtype && rtype in caseList) {
                    scope = new newClass(n, this.config);
                    await caseList[rtype](scope, result, relation[n], relationData[n], postType)
                }
            }
        }
        return;
    }

    /**
     *
     * @param scope
     * @param result
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async _postHasOneRelation(scope, result, rel, relationData, postType){
        if(!scope || ORM.isEmpty(result) || ORM.isEmpty(relationData)){
            return;
        }
        let relationOptions = {table: `${scope.config.db_prefix}${rel.model}`, name: rel.model};
        switch (postType){
            case 'ADD':
                //子表插入数据
                let fkey = await scope.add(relationData, relationOptions);
                //更新主表关联字段
                fkey && (await scope.update({[rel.fkey]: fkey}, {where: {[rel.pk]: result}, table: `${scope.config.db_prefix}${rel.pmodel}`, name: rel.pmodel}));
                break;
            case 'UPDATE':
                //子表主键数据存在才更新
                if(relationData[rel.fkey]){
                    await scope.update(relationData, relationOptions);
                }
                break;
        }
        return;
    }

    /**
     *
     * @param scope
     * @param result
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async _postHasManyRelation(scope, result, rel, relationData, postType){
        if(!scope || ORM.isEmpty(result) || ORM.isEmpty(relationData)){
            return;
        }
        let relationOptions = {table: `${scope.config.db_prefix}${rel.model}`, name: rel.model};
        for(let [k, v] of relationData.entries()){
            switch (postType){
                case 'ADD':
                    //子表插入数据
                    if(v[rel.pk]){
                        v[rel.rkey] = v[rel.pk];
                        await scope.add(v, relationOptions);
                    }
                    break;
                case 'UPDATE':
                    //子表主键数据存在才更新
                    if(v[rel.rkey]){
                        await scope.update(v, relationOptions);
                    }
                    break;
            }
        }
        return;
    }

    /**
     *
     * @param scope
     * @param result
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async _postManyToManyRelation(scope, result, rel, relationData, postType){
        if(!scope || ORM.isEmpty(result) || ORM.isEmpty(relationData)){
            return;
        }
        //子表主键
        let rpk = scope.getPk();
        //关系表
        let mapModel = `${rel.pmodel}_${rel.model}_map`;
        let relationOptions = {table: `${scope.config.db_prefix}${mapModel}`, name: mapModel};
        for(let [k, v] of relationData.entries()){
            switch (postType){
                case 'ADD':
                    //子表增加数据
                    let fkey = await scope.add(v, {table: `${scope.config.db_prefix}${rel.model}`, name: rel.model});
                    //关系表增加数据,使用thenAdd
                    relationOptions.where = {[rel.fkey]: result, [rel.rkey]: fkey};
                    fkey && (await scope.thenAdd({[rel.fkey]: result, [rel.rkey]: fkey}, relationOptions));
                    break;
                case 'UPDATE':
                    //关系表两个外键都存在,使用thenAdd,不存在关系就新建
                    if(v[rel.fkey] && v[rel.rkey]){
                        relationOptions.where = {[rel.fkey]: v[rel.fkey], [rel.rkey]: v[rel.rkey]};
                        await scope.thenAdd(v, relationOptions);
                    }
                    break;
            }
        }
        return;
    }
}

export default thinkorm;
