/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import knex from 'knex';
import base from '../base';
import lib from '../Util/lib';
import parser from '../Parser/base';
import socket from '../Socket/postgresql';

export default class extends base {

    init(config = {}) {
        this.config = config;
        this.logSql = config.db_ext_config.db_log_sql || false;
        this.transTimes = 0; //transaction times
        this.lastInsertId = 0;

        this.knexClient = knex({
            client: 'postgresql'
        });

        this.handel = null;
        this.parsercls = null;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        //读写分离配置
        if(this.config.db_ext_config.read_write_splitting && lib.isArray(this.config.db_host)){
            let configMaster = {
                db_name: lib.isArray(this.config.db_name) ? this.config.db_name[0] : this.config.db_name,
                db_host: lib.isArray(this.config.db_host) ? this.config.db_host[0] : this.config.db_host,
                db_user: lib.isArray(this.config.db_user) ? this.config.db_user[0] : this.config.db_user,
                db_pwd: lib.isArray(this.config.db_pwd) ? this.config.db_pwd[0] : this.config.db_pwd,
                db_port: lib.isArray(this.config.db_port) ? this.config.db_port[0] : this.config.db_port,
                db_charset: this.config.db_charset,
                db_timeout: this.config.db_timeout,
                db_ext_config: this.config.db_ext_config
            };
            let configSlave = {
                db_name: lib.isArray(this.config.db_name) ? this.config.db_name[1] : this.config.db_name,
                db_host: lib.isArray(this.config.db_host) ? this.config.db_host[1] : this.config.db_host,
                db_user: lib.isArray(this.config.db_user) ? this.config.db_user[1] : this.config.db_user,
                db_pwd: lib.isArray(this.config.db_pwd) ? this.config.db_pwd[1] : this.config.db_pwd,
                db_port: lib.isArray(this.config.db_port) ? this.config.db_port[1] : this.config.db_port,
                db_charset: this.config.db_charset,
                db_timeout: this.config.db_timeout,
                db_ext_config: this.config.db_ext_config
            };
            return Promise.all([new socket(configMaster).connect(), new socket(configSlave).connect()]).then(cons => {
                this.handel = {RW: true};
                this.handel.master = cons[0];
                this.handel.slave = cons[1];
                return this.handel;
            });
        } else {
            this.handel = new socket(this.config).connect();
        }
        return this.handel;
    }

    close() {
        if (this.handel) {
            if(this.handel.RW){
                this.handel.master && this.handel.master.close && this.handel.master.close();
                this.handel.slave && this.handel.slave.close && this.handel.slave.close();
            } else {
                this.handel.close && this.handel.close();
            }
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
     *
     * @param schema
     * @param config
     */
    migrate(schema, config) {
        if(lib.isEmpty(schema) || lib.isEmpty(config)){
            return;
        }
        let tableName = `${config.db_prefix}${lib.parseName(schema.name)}`;
        return this.query(this.knexClient.schema.hasTable(tableName).toString()).then(exists => {
            if(lib.isEmpty(exists)){
                return Promise.resolve();
            } else {
                return this.execute(this.knexClient.schema.dropTableIfExists(tableName).toString());
            }
        }).then(() => {
            let options = {
                method: 'MIGRATE',
                schema: schema
            };
            return this.parsers().buildSql(this.knexClient.schema, config, options).then(sql => {
                if (/\n/.test(sql)) {
                    let temp = sql.replace(/\n/g, '').split(';'), ps = [];
                    temp.map(item => {
                        ps.push(this.execute(item));
                    });
                    return Promise.all(ps);
                }
                return this.execute(sql);
            });
        });
    }

    /**
     *
     * @param sql
     */
    query(sql) {
        let startTime = Date.now();
        let connection;
        return this.connect().then(conn => {
            connection = conn.RW ? conn.slave : conn;
            let fn = lib.promisify(connection.query, connection);
            return fn(sql);
        }).then((rows = []) => {
            connection.release && connection.release();
            this.logSql && lib.log(sql, 'PostgreSQL', startTime);
            return this.bufferToString(rows);
        }).catch(err => {
            connection.release && connection.release();
            //when socket is closed, try it
            if(err.code === 'EPIPE'){
                this.close();
                return this.query(sql);
            }
            this.logSql && lib.log(sql, 'PostgreSQL', startTime);
            return Promise.reject(err);
        });
    }

    /**
     *
     * @param sql
     */
    execute(sql) {
        let startTime = Date.now();
        let connection;
        return this.connect().then(conn => {
            connection = conn.RW ? conn.master : conn;
            let fn = lib.promisify(connection.query, connection);
            return fn(sql);
        }).then((rows = []) => {
            connection.release && connection.release();
            this.logSql && lib.log(sql, 'PostgreSQL', startTime);
            return this.bufferToString(rows);
        }).then(data => {
            if (data.rows && data.rows[0] && data.rows[0].id) {
                this.lastInsertId = data.rows[0].id;
            }
            return data.rowCount || 0;
        }).catch(err => {
            connection.release && connection.release();
            //when socket is closed, try it
            if(err.code === 'EPIPE'){
                this.close();
                return this.execute(sql);
            }
            this.logSql && lib.log(sql, 'PostgreSQL', startTime);
            return Promise.reject(err);
        });
    }

    /**
     *
     * @param sqlStr
     */
    native(sqlStr){
        let ouputs = this.knexClient.raw(sqlStr).toSQL();
        if (lib.isEmpty(ouputs)) {
            return Promise.reject('SQL analytic result is empty');
        }
        let startTime = Date.now();
        let connection;
        return this.connect().then(conn => {
            connection = conn.RW ? conn.master : conn;
            let fn = lib.promisify(connection.query, connection);
            return fn(ouputs.sql, ouputs.bindings);
        }).then((rows = []) => {
            this.logSql && lib.log(ouputs.sql, 'PostgreSQL', startTime);
            return this.bufferToString(rows);
        }).catch(err => {
            this.logSql && lib.log(ouputs.sql, 'PostgreSQL', startTime);
            return Promise.reject(err);
        });
    }

    /**
     *
     * @returns {*}
     */
    startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('BEGIN');
        }
    }

    /**
     *
     * @returns {*}
     */
    commit() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return Promise.resolve();
    }

    /**
     *
     * @returns {*}
     */
    rollback() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return Promise.resolve();
    }

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    add(data, options = {}) {
        options.method = 'ADD';
        let knexCls = this.knexClient.insert(data).from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return this.lastInsertId;
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        let knexCls = this.knexClient.del().from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 更新数据
     * @return {[type]} [description]
     */
    update(data, options = {}) {
        options.method = 'UPDATE';
        let knexCls = this.knexClient.update(data).from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     *
     * @param data
     * @param field
     * @param options
     */
    increment(data, field, options = {}){
        options.method = 'UPDATE';
        let knexCls = this.knexClient;
        if(data[field]){
            knexCls = knexCls.increment(field, data[field]);
            delete data[field];
        }
        knexCls = knexCls.from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, data, options).then(sql => {
            return this.execute(sql);
        }).then(res => {
            //更新前置操作内会改变data的值
            if(!lib.isEmpty(data)){
                this.update(data, options);
            }
            return res;
        });
    }

    /**
     *
     * @param data
     * @param field
     * @param options
     */
    decrement(data, field, options = {}){
        options.method = 'UPDATE';
        let knexCls = this.knexClient;
        if(data[field]){
            knexCls = knexCls.decrement(field, data[field]);
            delete data[field];
        }
        knexCls = knexCls.from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, data, options).then(sql => {
            return this.execute(sql);
        }).then(res => {
            //更新前置操作内会改变data的值
            if(!lib.isEmpty(data)){
                this.update(data, options);
            }
            return res;
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
        options.limit = [0, 1];
        let knexCls = this.knexClient.count(`${field} AS count`).from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
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
        options.limit = [0, 1];
        let knexCls = this.knexClient.sum(`${options.sum} AS sum`).from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
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
        options.method = 'SELECT';
        options.limit = [0, 1];
        let knexCls = this.knexClient.select().from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * 查询数据
     * @return 返回一个promise
     */
    select(options = {}) {
        options.method = 'SELECT';
        let knexCls = this.knexClient.select().from(`${options.table} AS ${options.name}`);
        return this.parsers().buildSql(knexCls, options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     *
     * @param data
     * @returns {*}
     */
    bufferToString(data) {
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
        return model.find({field: rel.field, where: {[rel.rkey]: data[rel.fkey]}});
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
        let options = {field: rel.field, where: {[rel.rkey]: data[rel.primaryPk]}};
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
            return;
        }
        let model = new (rel.model)(config);
        let primaryModel = new (ORM.collections[rel.primaryName])(config);
        switch (postType) {
            case 'ADD':
                //子表插入数据
                let fkey = await model.add(relationData);
                //更新主表关联字段
                fkey && (await primaryModel.update({[rel.fkey]: fkey}, {where: {[rel.primaryPk]: result}}));
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
        if (lib.isEmpty(result) || lib.isEmpty(relationData)) {
            return;
        }
        let model = new (rel.model)(config), rpk = model.getPk();
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
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */
    async __postManyToManyRelation(config, result, options, rel, relationData, postType) {
        if (lib.isEmpty(result) || lib.isEmpty(relationData)) {
            return;
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
