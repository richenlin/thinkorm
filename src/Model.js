/**
 * Created by lihao on 16/7/26.
 */
import base from './Base';
import Valid from './Util/valid';
export default class extends base {
    init(name, config = {}) {
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
        // 关联链接
        this._relationLink = [];
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 验证规则
        this._valid = Valid;

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
        }

        this.config = config;
        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            //this.tablePrefix = ORM.config('db_prefix');
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = this.config.db_ext_config.safe === true ? true : false;
        //配置hash
        this.adapterKey = ORM.hash(`${this.config.db_type}_${this.config.db_host}_${this.config.db_port}_${this.config.db_name}`);
    }

    /**
     * 获取数据库适配器单例
     */
    adapter() {
        if (this._adapter) return this._adapter;
        let Adapter = require(`./Adapter/${this.config.db_type || 'mysql'}Adapter`).default;
        this._adapter = new Adapter(this.config);
        return this._adapter;
    }

    initModel() {

    }


    /**
     * 获取表模型
     * @param table
     */
    async getSchema(table) {
        table = table || this.getTableName();
        let storeKey = `${this.config.db_type}_${table}_schema`;
        let schema = {};
        if (this.config.schema_force_update) {
            //强制更新schema
            schema = await this.db().getSchema(table);
        } else {
            //TODO缓存schema
            schema = await this.adapter().getSchema(table);
        }

        if (table !== this.getTableName()) {
            return schema;
        }
        //get primary key
        for (let name in schema) {
            if (schema[name].primary) {
                this.pk = name;
                break;
            }
        }
        //merge user set schema config
        this.schema = ORM.extend({}, schema, this.fields);
        return this.schema;
    }

    /**
     * 动态设置关联关系
     */
    setRelation(relation) {
        this.relation = relation;
    }

    /**
     * 获取主键
     * @returns {string}
     */
    getPk() {
        return 'id';
    }

    /**
     * 获取表名
     * @return {[type]} [description]
     */
    getTableName() {
        if (!this.trueTableName) {
            let tableName = this.config.db_prefix || '';
            tableName += this.tableName || this.parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    }

    /**
     * 字符串命名风格转换
     * @param  {[type]} name [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */
    parseName(name) {
        name = name.trim();
        if (!name) {
            return name;
        }
        //首字母如果是大写，不转义为_x
        name = name[0].toLowerCase() + name.substr(1);
        return name.replace(/[A-Z]/g, function (a) {
            return '_' + a.toLowerCase();
        });
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
     * 查询字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */
    field(fields) {
        if (!fields) {
            return this;
        }
        if (typeof fields === 'string') {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.fields = fields;
        return this;
    }

    /**
     * 查询条件where
     * @param where
     */
    where(where) {
        if (!where) return this;
        if (ORM.isEmpty(this._options.where)) this._options.where = {
            where: {
                and: [],
                not: [],
                in: [],
                notin: [],
                null: [],
                notnull: [],
                between: [],
                notbetween: [],
                operation: []
            },
            orwhere: {
                and: [],
                not: [],
                in: [],
                notin: [],
                null: [],
                notnull: [],
                between: [],
                notbetween: [],
                operation: []
            }
        };
        let identifiers = {
            or: 'OR',
            OR: 'OR',
            and: 'AND',
            'AND': 'AND',
            not: 'NOT',
            NOT: 'NOT',
            notin: 'NOTIN',
            NOTIN: 'NOTIN',
            in: 'IN',
            IN: 'IN',
            null: 'NULL',
            NULL: 'NULL',
            notnull: 'NOTNULL',
            NOTNULL: 'NOTNULL',
            between: 'BETWEEN',
            BETWEEN: 'BETWEEN',
            notbetween: 'NOTBETWEEN',
            NOTBETWEEN: 'NOTBETWEEN',
            '>': 'OPERATOR',
            '<': 'OPERATOR',
            '<>': 'OPERATOR',
            '<=': 'OPERATOR',
            '>=': 'OPERATOR',
        }
        /*******************此方法将要将where条件解析为knex可用格式**********************/
        //where = {
        //    //此项表示id=1,name=a
        //    and: [[id, 1], [name, a]],
        //    //此项表示id !=1
        //    not: [[id, 1], [name, a]],
        //    //此项表示id in(1,2)
        //    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
        //    //此项表示id not in(1,2)
        //    notin: [[id, [1, 2, 3]]],
        //    //此项不表示id >= 1
        //    operator: [[id, '>', 1]],
        //}
        //orwhere = {
        //    //此项表示id=1,name=a
        //    and: [[id, 1], [name, a]],
        //    //此项表示id !=1
        //    not: [[id, 1], [name, a]],
        //    //此项表示id in(1,2)
        //    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
        //    //此项表示id not in(1,2)
        //    notin: [[id, [1, 2, 3]]],
        //    //此项不表示id >= 1
        //    operator: [[id, '>', 1]],
        //}
        /**************************************************************************/
        let self = this;
        let parse = function (key, value, k, isor = false) {
            switch (identifiers[key]) {
                case 'OR':
                    for (let m of value) {
                        for (let o in m) {
                            parse(o, m[o], o, true);
                        }
                    }
                    return;
                    break;
                //id:{in:[1,2,3,4]}
                case 'IN':
                    for (let n in value) {
                        isor ? self._options.where.orwhere.in.push([n, value[n]]) : self._options.where.where.in.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.in.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.in.push([n, value[n]]);
                        //}
                    }
                    //return;
                    break;
                case 'NOTIN':
                    for (let n in value) {
                        isor ? self._options.where.orwhere.notin.push([n, value[n]]) : self._options.where.where.notin.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.notin.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.notin.push([n, value[n]]);
                        //}
                    }
                    return;
                    break;
                case 'NULL':
                    if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
                    isor ? self._options.where.orwhere.null.push(value) : self._options.where.where.null.push(value);
                    //if (isor) {
                    //    self._options.where.orwhere.null.push(value);
                    //} else {
                    //    self._options.where.where.null.push(value);
                    //}
                    return;
                    break;
                case 'NOTNULL':
                    if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
                    isor ? self._options.where.orwhere.notnull.push(value) : self._options.where.where.notnull.push(value);
                    //if (isor) {
                    //    self._options.where.orwhere.null.push(value);
                    //} else {
                    //    self._options.where.where.null.push(value);
                    //}
                    return;
                    break;

                case 'BETWEEN':
                    isor ? self._options.where.orwhere.between.push([k, value]) : self._options.where.where.between.push([k, value]);
                    return;
                    break;
                case 'NOTBETWEEN':
                    isor ? self._options.where.orwhere.notbetween.push([k, value]) : self._options.where.where.notbetween.push([k, value]);
                    return;
                    break;
                case 'NOT':
                    for (let n in value) {
                        isor ? self._options.where.orwhere.not.push([n, value[n]]) : self._options.where.where.not.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.not.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.not.push([n, value[n]]);
                        //}
                    }

                    break;
                    return;
                case 'OPERATOR':
                    isor ? self._options.where.orwhere.operation.push([k, key, value]) : self._options.where.where.operation.push([k, key, value]);
                    //if (isor) {
                    //    self._options.where.orwhere.operation.push([k, key, value])
                    //} else {
                    //    self._options.where.where.operation.push([k, key, value])
                    //}
                    break;
                    return;
                case 'AND':
                default:
                    if (ORM.isJSONObj(value)) {
                        for (let n in value) {
                            parse(n, value[n], key, isor);
                        }
                        //} else if (isor) {
                        //    self._options.where.orwhere.and.push([key, '=', value]);
                    } else {
                        isor ? self._options.where.orwhere.and.push([key, '=', value]) : self._options.where.where.and.push([key, '=', value]);
                        //self._options.where.where.and.push([key, '=', value]);
                    }
                    return;
                    break;
            }
        }
        for (let key in where) {
            parse(key, where[key]);
        }
        //console.log(this._options.where);
        return this;
    }

    /**
     * 指定查询数量
     * @param offset
     * @param length
     */
    limit(offset, length) {
        if (offset === undefined) {
            return this;
        }

        if (ORM.isArray(offset)) {
            offset = offset[0], length = offset[1];
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
     */
    order(order) {
        if (order === undefined) {
            return this;
        }
        //TODO进一步解析
        this._options.order = [];
        //如果是字符串id desc
        if (ORM.isString(order)) {
            //'id desc,name aes'
            if (order.indexOf(',') > -1) {
                let orderarr = order.split(',');
                for (let o of orderarr) {
                    if (o.indexOf(' desc') > -1 || o.indexOf(' DESC') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'desc']);
                    } else if (o.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'aes']);
                    } else {
                        this._options.order.push([o, 'aes']);
                    }
                }
            } else {
                //'id desc'
                if (order.indexOf(' desc') > -1 || order.indexOf(' DESC') > -1) {
                    this._options.order.push([[order.substring(0, order.length - 5)], 'desc']);
                } else if (order.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                    this._options.order.push([[order.substring(0, order.length - 5)], 'aes']);
                } else {
                    this._options.order.push([order, 'aes'])
                }
            }

        } else if (ORM.isArray(order)) {
            //[{id: 'asc', name: 'desc'}],
            for (let o of order) {
                for (let k in o) {
                    this._options.order.push([k, o[k]]);
                }
            }
        }
        return this;
    }

    /**
     * 分组
     * @param value
     */
    group(value) {
        this._options.group = value;
        return this;
    }

    /**
     * 关联
     * [{type:'left',from:'user',on:Object||Array}]
     * @param join
     */
    join(join) {
        if (!join) return this;
        let type, onCondition, from, joinArr = [], on, or, orArr;
        for (let j of join) {
            type = j.type || 'left';
            from = j.from;
            onCondition = j.on;
            if (ORM.isObject(onCondition)) {
                //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                if (onCondition.or != undefined) {
                    orArr = [`${this.tablePrefix}${from} AS ${this.tablePrefix}${from}`];
                    for (let o of onCondition.or) {
                        or = [];
                        for (let k in o) {
                            or.push(`${this.tablePrefix}${k}.${o[k]}`)
                        }
                        orArr.push(or);
                    }
                    //console.log(orArr)
                    //or:['user',[[user.id,info.user_id],[user.name,info.user_name]]]
                    joinArr.push({type: type, from: from, or: orArr})
                } else {
                    //or:{a:'id',b:'a_id'}
                    on = [`${this.tablePrefix}${from} AS ${this.tablePrefix}${from}`];
                    for (let k in onCondition) {
                        on.push(`${this.tablePrefix}${k}.${onCondition[k]}`);
                    }
                    joinArr.push({type: type, from: from, on: on})
                }
            }
        }
        this._options.join = joinArr;
        return this;
    }

    /**
     * 指定关联操作的表
     * @param table
     */
    rel(table = false) {
        if (ORM.isBoolean(table)) {
            if (table === false) {
                this._options.rel = [];
            } else {
                this._options.rel = true;
            }
        } else {
            if (ORM.isString(table)) {
                table = table.replace(/ +/g, '').split(',');
            }
            this._options.rel = ORM.isArray(table) ? table : [];
        }

        return this;
    }

    async count(field, options) {
        options = await this.parseOptions(options, {count: field});
        let result = await this.adapter().count(options);
    }

    async min(field, options) {
        options = await this.parseOptions(options, {min: field});
        let result = await this.adapter().min(options);
    }

    async max(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.max = field;
        let options = await this.parseOptions(this._options);
        let result = await this.adapter().max(options);
    }

    async avg(field, options) {
        options = await this.parseOptions(this._options, {avg: field});
        let result = await this.adapter().avg(options);
    }

    async avgDistinct(field, options) {
        options = await this.parseOptions(this._options, {avgDistinct: field});
        let result = await this.adapter().avgDistinct(options);
    }

    /**
     * 字段自增
     * @param field
     */
    async increment(field, inc = 1, options) {
        if (ORM.isEmpty(field)) return ORM.error('_INCREMENT_FIELD_EMPTY');
        options = await this.parseOptions(options, {increment: [field, inc]});
        let result = await this.adapter().increment(options);
    }

    /**
     * 字段自减
     * @param field
     */
    async decrement(field, dec = 1, options) {
        if (ORM.isEmpty(field)) return ORM.error('_DECREMENT_FIELD_EMPTY');
        options = await this.parseOptions(options, {decrement: [field, dec]});
        let result = await this.adapter().decrement(options);
    }


    /**
     * 查询一条数据
     * @param option
     */
    async find(options) {
        options = await this.parseOptions(options, {limit: [0, 1]});
        let result = await this.adapter().select(options);
        if (options.rel && !ORM.isEmpty(result)) {
            await this.__getRelationData(result[0] || {}, options);
        }
        result = await this.parseData(result[0] || {}, options);
        return this._afterFind(result, options);
    }

    /**
     * 查询后置操作
     * @param data
     * @param options
     * @returns {Promise.<*>}
     * @private
     */
    async _afterFind(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 查询多条数据
     * @param option
     */
    async select(options) {
        options = await this.parseOptions(options);
        let result = await this.adapter().select(options);
        if (options.rel && !ORM.isEmpty(result)) {//查询关联关系
            await this.__getRelationData(result, options);
        }
        result = await this.parseData(result || [], options);
        return this._afterSelect(result, options);
    }

    /**
     * 查询后只操作
     * @param result
     * @param options
     * @private
     */
    async _afterSelect(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 新增操作
     * @param data
     * @param options
     * @returns {*}
     */
    async add(data, options) {
        if (ORM.isEmpty(data)) return ORM.error('_DATA_TYPE_INVALID_');
        this._data = ORM.extend({}, data);
        options = await this.parseOptions(options);
        data = await this.parseData(data, options, 1);
        let result = await this.adapter().insert(data, options);
        let pk = this.getPk();
        this._data[pk] = data[pk] = this.adapter().getLastInsertId();
        if (!ORM.isEmpty(this.relation)) {
            await this.__postRelationData(data[this.pk], this._data, 'ADD', options);
        }
        this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
        await this._afterAdd(this._data, options);
        return data[pk];

    }

    /**
     * 新增后置操作
     * @param data
     * @param opitons
     * @returns {Promise.<*>}
     * @private
     */
    async _afterAdd(data, opitons) {
        return Promise.resolve(data);
    }

    /**
     * 批量写入,不提供关联写入
     * @param data
     * @param options
     * @returns {*}
     */
    async addAll(data, options) {
        //判断是否为数组
        if (!ORM.isArray(data))return ORM.error('DATA MUST BE ARRAY');
        options = await this.parseOptions(options);
        this._data = ORM.extend([], data);

        //若需要关联ADDALL,那么就需要将数组遍历后,再进行子对象的写入
        if (!ORM.isEmpty(this.relation)) {
            let pk = this.getPk(), count = 0, ps;
            ps = data.map(item=> {
                let _item = ORM.extend({}, item);
                return this.parseData(item, options, 1).then(item=> {
                    return this.adapter().insert(item, options);
                }).then(()=> {
                    _item[pk] = item[pk] = this.adapter().getLastInsertId();
                    return this.__postRelationData(_item[pk], _item, 'ADD', options);
                }).then(()=> {
                    return 1;
                });
            })
            let resule = await Promise.all(ps);
            return resule.length;
        } else {
            ps = this._data.map(item=> {
                return this.parseData(item, options);
            })
            this._data = await Promise.all(ps)
            return await this.adapter().insertAll(this._data, options);
        }
    }

    /**
     * 更新操作
     * @param data
     * @param options
     */
    async update(data, options) {
        if (ORM.isEmpty(data)) return ORM.error('_DATA_TYPE_INVALID_');
        options = await this.parseOptions(options);
        this._data = ORM.extend({}, data);
        data = await this.parseData(data, options, 2);
        let result = await this.adapter().update(data, options);
        if (!ORM.isEmpty(this.relation)) {
            await this.__postRelationData(result, this._data, 'UPDATE', options);
        }
        return await this._afterUpdate(this._data, options)
    }

    /**
     * 更新后置操作
     * @param data
     * @param options
     * @returns {Promise.<*>}
     * @private
     */
    async _afterUpdate(data, options) {
        return Promise.resolve(data);
    }

    /**
     * 删除前置操作
     * @param options
     * @private
     */
    async _beforeDelte(options) {
        return Promise.resolve(options);
    }

    /**
     * 删除操作
     * @param options
     */
    async delete(options) {
        options = this.parseOptions(options);
        options = await this._beforeDelte(options);
        let result = await this.adapter().delete(options);
        options = await this._afterDel(options);
        return result;
    }

    /**
     * 删除后置操作
     * @param options
     * @private
     */
    async _afterDelte(options) {

    }

    /**
     * 解析参数
     */
    async parseOptions(oriOpts, extraOptions) {
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
        //表前缀，Db里会使用
        options.tablePrefix = this.tablePrefix;
        options.modelName = this.getModelName();

        return options;
    }

    /**
     * 解析数据
     * @param data
     * @param options
     * @param beforeCheck 1:add操作前检查,2:update操作前检查
     */
    async parseData(data, options, beforeCheck = 0) {

        return data;
    }

    /**
     * 获取关联数据
     * @param result
     * @param options
     * @private
     */
    async __getRelationData(result, options) {
        let o;
        if (ORM.isBoolean(options.rel)) {
            if (options.rel === false) {
                return result
            } else {
                o = true
            }
        } else if (ORM.isString(options.rel)) {
            o = options.rel.replace(/ +/g, '').split(',');
        } else {
            o = options.rel;
        }

        await this.__getRelationOptions(result, o);
    }

    /**
     * 解析关联查询options
     * @param data
     * @param option
     * @private
     */
    async __getRelationOptions(data, option) {
        let relation = {};
        if (option === true) {//查询全部关联关系,且无任何条件
            relation = this.relation;
        } else if (ORM.isObject(option)) {//指定查询对象
            for (let k of Object.keys(option)) {
                if (this.relation[k]) relation[k] = ORM.extend({}, option[k], this.relation[k]);
            }
        } else if (ORM.isArray(option)) {//关联多个模型,但未指定任何条件
            for (let k of option) {
                if (this.relation[k]) relation[k] = this.relation[k];
            }
        }

        let caseList = {
            1: this.__getHasOneRelation,
            2: this.__getHasManyRelation,
            3: this.__getManyToManyRelation,
            4: this.__getBelongsToRealtion,
            HASONE: this.__getHasOneRelation,
            HASMANY: this.__getHasManyRelation,
            MANYTOMANY: this.__getManyToManyRelation,
            BELONGSTO: this.__getBelongsToRealtion,
        };
        let relationObj = {}, item;
        for (let k in relation) {
            item = relation[k];
            item.name = k;
            let type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;
            if (type && type in caseList) {
                relationObj = await caseList[type](this, data, item)
            }
        }
        return relationObj;
    }

    /**
     * 获取一对一关联数据
     * 附属表中有主表的一个外键
     * @param relation
     * @param option
     * @private
     */
    async __getHasOneRelation(self, data, relation) {
        var Model = require('../index');
        let model = new Model(relation.model, self.config);
        //let model = ORM.model(relation.model, {});
        if (relation.field) model = model.field(relation.field);
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        if (ORM.isArray(data)) {
            for (let [k,v] of data.entries()) {
                where[fkey] = v[key]
                if (relation.where) where = ORM.extend({}, where, relation.where);
                data[k][relation.name] = await model.where(where).find();
            }
        } else {
            where[fkey] = data[key]
            if (relation.where) where = ORM.extend({}, where, relation.where);
            data[relation.name] = await model.where(where).find();
        }
        return data;
    }

    /**
     * 获取一对多
     * @param self
     * @param data
     * @param relation
     * @private
     */
    async __getHasManyRelation(self, data, relation) {
        //let model = ORM.model(relation.model, {});
        var Model = require('../index');
        let model = new Model(relation.model, self.config);
        if (relation.field) model = model.field(relation.field);
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        if (ORM.isArray(data)) {
            for (let [k,v] of data.entries()) {
                where[fkey] = v[key]
                if (relation.where) where = ORM.extend({}, where, relation.where);
                data[k][relation.name] = await model.where(where).select();
            }
        } else {
            where[fkey] = data[key]
            if (relation.where) where = ORM.extend({}, where, relation.where);
            data[relation.name] = await model.where(where).select();
        }
        return data;
    }

    /**
     * 获取多对多,需要一张关联关系表
     * @param self
     * @param data
     * @param relation
     * @private
     */
    async __getManyToManyRelation(self, data, relation) {
        //let model = ORM.model(relation.model, {});
        var Model = require('../index');
        let model = new Model(relation.model, self.config);
        let modelTableName = model.getTableName();
        let option = {where: {}}, options = {};
        if (relation.field) {
            let field = []
            for (let f of relation.field.replace(/ +/g, '').split(',')) {
                field.push(`${modelTableName}.${f}`);
            }
            model = model.field(field);
        }
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        if (relation.relationtable) {
            options.table = relation.relationtable;
        } else {
            options.table = `${self.config.db_prefix}${self.getModelName().toLowerCase()}_${model.getModelName().toLowerCase()}_map`;
        }
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        //let rkey = model.relation.key || model.getPk();
        let rfkey = model.relation.fkey || `${model.getModelName().toLowerCase()}_id`;
        if (ORM.isArray(data)) {
            for (let [k,v] of data.entries()) {
                option.where[`${options.table}.${fkey}`] = v[key];
                if (relation.where) option.where = ORM.extend({}, where, option.where);
                //data[k][relation.name] = await self.db().select(option);

                option.join = [{
                    from: relation.model,
                    on: {
                        [relation.model]: key,
                        [`${options.table.substring(self.config.db_prefix.length)}`]: rfkey
                    }
                }];
                data[k][relation.name] = await model.where(option.where).join(option.join).select(options);
            }
        } else {
            option.where[`${options.table}.${fkey}`] = data[key];
            if (relation.where) option.where = ORM.extend({}, where, option.where);
            //option.join = `${option.table} ON ${modelTableName}.${key} = ${option.table}.${rfkey}`;
            option.join = [{
                from: relation.model,
                on: {
                    [relation.model]: key,
                    [`${options.table.substring(self.config.db_prefix.length)}`]: rfkey
                }
            }];
            data[relation.name] = await model.where(option.where).join(option.join).select(options);
            //data[relation.name] = await await self.db().select(option);
        }
        return data;
    }

    /**
     * 获取属于关系
     * 附属表中有主表的一个外键
     * @private
     */
    async __getBelongsToRealtion(self, data, relation) {
        //let model = ORM.model(relation.model, {});
        var Model = require('../index');
        let model = new Model(relation.model, self.config);
        if (relation.field) model = model.field(relation.field);
        if (relation.limit) model = model.field(relation.limit);
        if (relation.order) model = model.field(relation.order);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let where = {};
        if (ORM.isArray(data)) {
            for (let [k,v] of data.entries()) {
                where[key] = v[fkey]
                if (relation.where) where = ORM.extend({}, where, relation.where);
                data[k][relation.name] = await model.where(where).find();
            }
        } else {
            where[key] = data[fkey];
            if (relation.where) where = ORM.extend({}, where, relation.where);
            data[relation.name] = await model.where(where).find();
        }
        return data;
    }

    /**
     * 添加关联关系数据
     * @param result 主表操作返回结果
     * @param data 主表数据
     * @private
     */
    async __postRelationData(result, data, postType, options) {
        let pk = this.getPk();
        //data[pk] = result;
        let caseList = {
            1: this.__postHasOneRelation,
            2: this.__postHasManyRelation,
            3: this.__postManyToManyRelation,
            4: this.__postBelongsToRealtion,
            HASONE: this.__postHasOneRelation,
            HASMANY: this.__postHasManyRelation,
            MANYTOMANY: this.__postManyToManyRelation,
            BELONGSTO: this.__postBelongsToRealtion,
        };
        let promises = Object.keys(this.relation).map(key=> {
            let item = this.relation[key];
            //主表数据没有存储关联字段数据,直接返回
            if (ORM.isEmpty(data[key])) return;
            let type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;
            if (type && type in caseList) {
                return caseList[type](this, data, data[key], postType, item);
            }
        })
        await Promise.all(promises);
        return data;
    }

    /**
     * hasone子表数据新增更新
     * @param self
     * @param data
     * @param postType
     * @param item
     * @private
     */
    __postHasOneRelation(self, data, childdata, postType, relation) {
        //let model = ORM.model(relation.model, {});
        var Model = require('../index');
        let model = new Model(relation.model, self.config);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        //子表外键数据
        childdata[fkey] = data[key];
        switch (postType) {
            case 'ADD':
                return model.add(childdata);
                break;
            case 'UPDATE':
                //对于主表更新数据中,无对子表的外键数据,则不更新
                if (ORM.isEmpty(childdata[fkey])) return
                delete childdata[fkey];
                return model.where({[fkey]: data[key]}).update(childdata);
                break
        }
        return data;
    }


    /**
     * hasmany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */
    __postHasManyRelation(self, data, childdata, postType, relation) {
        //let model = ORM.model(relation.model, {});
        var Model = require('../index');
        let model = new Model(relation.model, self.config);
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        let pk = model.getPk();
        //子表外键数据
        if (!ORM.isArray(childdata)) {
            childdata = [childdata];
        }
        childdata.map(v=> {
            if (!ORM.isEmpty(data[key])) {
                v[fkey] = data[key];
            } else {
                return true;
            }
            switch (postType) {
                case 'ADD':
                    model.add(v);
                    break;
                case 'UPDATE':
                    //如果有子表的id,则对已有的子表数据进行更新
                    if (v[pk]) {
                        model.update(v);
                    } else if (data[key]) {
                        //若更新主表数据中有其关联子表的字段,则新增关联数据
                        v[fkey] = data[key];
                        model.add(v);
                    }
                    break
            }
        })
        //for (let [k,v] of childdata.entries()) {
        //    v[fkey] = data[key];
        //    switch (postType) {
        //        case 'ADD':
        //            await model.add(v);
        //            break;
        //        case 'UPDATE':
        //            //如果有子表的id,则对已有的子表数据进行更新
        //            if (v[pk]) {
        //                await model.update(v);
        //            } else if (data[key]) {
        //                //若更新主表数据中有其关联子表的字段,则新增关联数据
        //                v[fkey] = data[key];
        //                await model.add(v);
        //            }
        //            break
        //    }
        //}
        return data;
    }

    /**
     * manytomany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */
    __postManyToManyRelation(self, data, childdata, postType, relation) {
        //let model = ORM.model(relation.model, {});
        let Model = require('../index');
        let model = new Model(relation.model, self.config);
        let option = {};
        if (relation.relationtable) {
            option.table = relation.relationtable;
        } else {
            option.table = `${self.config.db_prefix}${self.getModelName().toLowerCase()}_${model.getModelName().toLowerCase()}_map`;
        }
        let key = relation.key || self.getPk();
        let fkey = relation.fkey || `${self.getModelName().toLowerCase()}_id`;
        //需要取到对应model的关联key,fkey
        let rpk = model.getPk(), cid;
        let rkey = model.relation.key || rpk;
        let rfkey = model.relation.fkey || `${model.getModelName().toLowerCase()}_id`;
        if (ORM.isArray(childdata)) {
            childdata.map(cdata=> {
                switch (postType) {
                    case 'ADD':
                        //先写入关联表
                        model.add(cdata).then(cid=> {
                            cdata[rpk] = cid;
                            //写入两个表关系表
                            self.adapter().insert({[fkey]: data[key], [rfkey]: cdata[rkey]}, option);
                        })
                        break;
                    case 'UPDATE':
                        break;
                }
            })
        } else if (ORM.isObject(childdata)) {
            switch (postType) {
                case 'ADD':
                    //先写入关联表
                    model.add(childdata).then(cid=> {
                        childdata[rpk] = cid;
                        self.adapter().insert({[fkey]: data[key], [rfkey]: childdata[rkey]}, option);
                    })
                    break;
                case 'UPDATE':
                    //先从两表关系表查出对应关系表的外键
                    //option.where = {[fkey]: data[key]};
                    //option.field = rfkey;
                    //for (let m of await self.db().select(option)) {
                    //    if (!ORM.isEmpty(await model.where({[rkey]: m[rfkey]}).find())) {
                    //        //已存在对应数据,更新
                    //        model.where({[rkey]: m[rfkey]}).update(childdata);
                    //    } else {
                    //        //无关联数据,新增
                    //        cid = await model.add(childdata);
                    //        childdata[rpk] = cid;
                    //        //写入两个表关系表
                    //        await self.db().add({[fkey]: data[key], [rfkey]: childdata[rkey]}, option);
                    //    }
                    //}
                    break;
            }

        }
        return data;
    }

    /**
     * belongsto 无需写入父表数据
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */
    __postBelongsToRealtion(self, data, childdata, postType, relation) {
        return data;
    }
}