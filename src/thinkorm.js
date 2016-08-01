/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from './base';
import vaild from './Util/valid';

export default class extends base {

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
        // 模型
        this.model = {};
        // 模型名称
        this.modelName = '';
        // 数据表前缀
        this.tablePrefix = '';
        // 数据表名（不包含表前缀）
        this.tableName = '';
        // 实际数据表名（包含表前缀）
        this.trueTableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = [];
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 验证规则
        this._valid = vaild;

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
        }

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

        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            this.tablePrefix = config.db_prefix;
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = (this.config.db_ext_config.safe === true);
        //配置hash
        this.adapterKey = ORM.hash(`${this.config.db_type}_${this.config.db_host}_${this.config.db_port}_${this.config.db_name}`);
        //构建连接
        this.db = null;
    }

    /**
     * 获取数据库连接实例
     * @returns {*}
     */
    initDb() {
        let adapterList = {
            mysql: __dirname + '/Adapter/mysql.js',
            postgresql: __dirname + '/Adapter/postgresql.js',
            mongo: __dirname + '/Adapter/mongo.js'
        };
        if (!this.config.db_type.toLowerCase() in adapterList) {
            return this.error('_ADAPTER_IS_NOT_SUPPORT_');
        }
        let instances = ORM.DB[this.adapterKey];
        if (!instances) {
            instances = new (ORM.safeRequire(adapterList[this.config.db_type]))(this.config);
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
        return this.instances.schema();
    }

    /**
     * 错误封装
     * @param err
     */
    error(err) {
        let msg = err || '';
        if (!ORM.isError(msg)) {
            if (!ORM.isString(msg)) {
                msg = JSON.stringify(msg);
            }
            msg = new Error(msg);
        }

        let stack = msg.message;
        // connection error
        if (~stack.indexOf('connect') || ~stack.indexOf('ECONNREFUSED')) {
            this.instances && this.instances.close && this.instances.close();
        }
        return Promise.reject(msg);
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        if (!this.trueTableName) {
            let tableName = this.config.db_prefix || '';
            let parseName = function (name) {
                name = name.trim();
                if (!name) {
                    return name;
                }
                //首字母如果是大写，不转义为_x
                name = name[0].toLowerCase() + name.substr(1);
                return name.replace(/[A-Z]/g, function (a) {
                    return '_' + a.toLowerCase();
                });
            };
            tableName += this.tableName || parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    }

    /**
     * 获取模型名
     * @access public
     * @return string
     */
    getModelName() {
        if (this.modelName) {
            return this.modelName;
        }
        let filename = this.__filename || __filename;
        let last = filename.lastIndexOf('/');
        this.modelName = filename.substr(last + 1, filename.length - last - 9);
        return this.modelName;
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
     * 解析参数
     * @param  {[type]} options [description]
     * @return promise         [description]
     */
    parseOptions(oriOpts, extraOptions) {
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
        //解析field,根据model的fields进行过滤
        let field = [];
        if (ORM.isEmpty(options.field) && !ORM.isEmpty(options.fields)) options.field = options.fields;
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
    parseData(data, options, preCheck = true, option = 1) {
        if (preCheck) {
            return data;
        } else {
            if (ORM.isJSONObj(data)) {
                return data;
            } else {
                return JSON.parse(JSON.stringify(data));
            }
        }
    }

    /**
     * 自动验证开关
     * @param data
     */
    verify(flag = false) {
        this._options.verify = !!flag;
        return this;
    }

    /**
     * 指定关联操作的表
     * @param table
     */
    rel(table = false) {
        this._options.rel = !ORM.isEmpty(this.relation) ? table : false;
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
        let _order = [];
        if(ORM.isObject(order)){
            _order.push(order);
        }else if (ORM.isString(order)) {
            if (order.indexOf(',') > -1) {
                let strToObj = function (_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '')
                        .replace(/( +, +)+|( +,)+|(, +)/, ',')
                        .replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':')
                        .replace(/^/, '{"').replace(/$/, '"}')
                        .replace(/:/g, '":"').replace(/,/g, '","');
                };
                this._options.order = JSON.parse(strToObj(order));
            } else {
                this._options.order = order;
            }
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
            if(ORM.isEmpty(data)){
                return this.error('_DATA_TYPE_INVALID_')
            }
            let parsedOptions = await this.parseOptions(options);
            //copy data
            this._data = ORM.extend({}, data);
            this._data = await this._beforeAdd(this._data, parsedOptions);
            this._data = await this.parseData(this._data, parsedOptions);
            let result = await this.initDb().add(this._data, parsedOptions);
            let pk = await this.getPk();
            this._data[pk] = this._data[pk] ? this._data[pk] : result;
            await this._afterAdd(this._data, parsedOptions);
            return this._data[pk];
        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
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
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    async addAll(data, options) {
        try {
            if (!ORM.isArray(data) || !ORM.isObject(data[0])) {
                return this.error('_DATA_TYPE_INVALID_');
            }
            let parsedOptions = await this.parseOptions(options);
            //copy data
            this._data = ORM.extend([], data);
            let promisesd = this._data.map(item => {
                return this._beforeAdd(item, parsedOptions);
            });
            this._data = await Promise.all(promisesd);
            let promiseso = this._data.map(item => {
                return this.parseData(item, parsedOptions);
            });
            this._data = await Promise.all(promiseso);
            let result = await this.initDb().addAll(this._data, parsedOptions);
            if (!ORM.isEmpty(result) && ORM.isArray(result)) {
                let pk = await this.getPk(), resData = [];
                result.forEach((v, k) => {
                    this._data[k][pk] = v;
                    resData.push(this._afterAdd(this._data[k], parsedOptions).then( () => {
                        return v;
                    }));
                });
                return Promise.all(resData);
            } else {
                return [];
            }
        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
        }
    }

    /**
     * 查询后新增
     * @param data
     * @param options
     */
    async thenAdd(data, options){
        try {
            if(ORM.isEmpty(data)){
                return this.error('_DATA_TYPE_INVALID_')
            }
            let record = await this.find(options);
            if(ORM.isEmpty(record)){
                return this.add(data, options);
            }
            return null;
        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
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
            let parsedOptions = await this.parseOptions(options);
            if(ORM.isEmpty(parsedOptions.where)){
                return this.error('_OPTION_TYPE_INVALID_');
            }
            await this._beforeDelete(parsedOptions);
            let result = await this.initDb().delete(parsedOptions);
            await this._afterDelete(parsedOptions);
            return result;
        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
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
            let parsedOptions = await this.parseOptions(options);
            if(ORM.isEmpty(parsedOptions.where)){
                return this.error('_OPTION_TYPE_INVALID_');
            }
        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
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
     * @param options
     * @returns {*}
     */
    async count(field, options) {
        try {

        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
        }
    }

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */
    async sum(field, options) {
        try {

        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
        }
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    async find(options) {
        try{
            let parsedOptions = await this.parseOptions(options);
            let result = await this.initDb().find(parsedOptions);
            result = await this.parseData(result || [], parsedOptions, false);
            return this._afterFind(ORM.isArray(result) ? result[0] : result, options);
        } catch(e) {
            return this.error(`${this.modelName}:${e.message}`);
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
        try{
            let parsedOptions = await this.parseOptions(options);
            let result = await this.initDb().select(parsedOptions);
            result = await this.parseData(result || [], parsedOptions, false);
            return this._afterSelect(result, options);
        } catch(e) {
            return this.error(`${this.modelName}:${e.message}`);
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

        } catch (e) {
            return this.error(`${this.modelName}:${e.message}`);
        }
    }


}
