/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import base from '../base';
import parser from '../Parser/mysql';
import socket from '../Socket/mysql';

export default class extends base {

    init(config = {}) {
        this.config = config;
        this.transTimes = 0; //transaction times
        this.lastInsertId = 0;

        this.handel = null;
        this.parsercls = null;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config);
        return this.handel;
    }

    close() {
        if (this.handel) {
            this.handel.close();
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

    schema() {
        //自动创建表\更新表\迁移数据
    }

    /**
     *
     * @param sql
     */
    query(sql) {
        return this.connect().query(sql).then(data => {
            return this.parsers().bufferToString(data);
        });
    }

    /**
     *
     * @param sql
     */
    execute(sql) {
        return this.connect().execute(sql).then(data => {
            if (data.insertId) {
                this.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    }

    /**
     *
     * @returns {*}
     */
    startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('START TRANSACTION');
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
        options.method = 'INSERT';
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return this.lastInsertId;
        });
    }

    /**
     * 插入多条数据(使用事务)
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */
    addAll(data, options = {}) {
        //start trans
        return this.startTrans().then(() => {
            let promised = data.map(item => {
                return this.add(item, options);
            });
            return Promise.all(promised);
        }).then(data => {
            //commit
            this.commit();
            return data;
        }).catch(e => {
            //rollback
            this.rollback();
            return [];
        });
    }

    /**
     * 删除数据
     * @return {[type]} [description]
     */
    delete(options = {}) {
        options.method = 'DELETE';
        return this.parsers().buildSql(options).then(sql => {
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
        return this.parsers().buildSql(data, options).then(sql => {
            return this.execute(sql);
        }).then(data => {
            //
            return data;
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
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            if (ORM.isArray(data)) {
                if (data[0]) {
                    return data[0]['count(`' + field + '`)'] ? (data[0]['count(`' + field + '`)'] || 0) : 0;
                } else {
                    return 0;
                }
            } else {
                return data['count(`' + field + '`)'] || 0;
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
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            if (ORM.isArray(data)) {
                if (data[0]) {
                    return data[0]['sum(`' + field + '`)'] ? (data[0]['sum(`' + field + '`)'] || 0) : 0;
                } else {
                    return 0;
                }
            } else {
                return data['sum(`' + field + '`)'] || 0;
            }
        });
    }

    /**
     * 查询一条数据
     * @return 返回一个promise
     */
    find(options = {}) {
        options.method = 'SELECT';
        options.field = options.field || ['*'];
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(sql => {
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
        options.field = options.field || ['*'];
        return this.parsers().buildSql(options).then(sql => {
            return this.query(sql);
        }).then(data => {
            //
            return data;
        });
    }

    /**
     * hasone
     * @param scope
     * @param rel
     * @param options
     * @param config
     * @private
     */
    _getHasOneRelation(scope, rel, options, config) {
        let relationModel = new scope(rel.model, config);
        if (!relationModel.trueTableName) {
            return options;
        }
        //join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'left')
        options.joinType = 'left';
        options.relationTables = {};
        options.relationTables[rel.model] = relationModel.trueTableName;
        options.join = [{
            field: rel.field || relationModel.fields,
            from: relationModel.trueTableName,
            on: {[rel.fkey]: relationModel.getPk()}//hasone fkey 主表外键: 子表主键
        }];
        return options;
    }

    /**
     * hasmany
     * @param scope
     * @param rel
     * @param options
     * @param config
     * @private
     */
    _getHasManyRelation(scope, rel, options, config) {

    }

    /**
     * manytomany
     * @param scope
     * @param rel
     * @param options
     * @param config
     * @private
     */
    _getManyToManyRelation(scope, rel, options, config) {

    }

    _parseHasOneRelationData(rel, modelName, options, data) {
        let tempObj = {}, tempName;
        for (let n in data) {
            if (n.indexOf(modelName) > -1) {
                tempName = n.replace(`${modelName}_`, '');
                tempName && (tempObj[tempName] = data[n]);
                delete data[n];
            }
        }
        return tempObj;
    }

    _parseHasManyRelationData(rel, modelName, options, data) {

    }

    _parseManyToManyRelationData(rel, modelName, options, data) {

    }
}
