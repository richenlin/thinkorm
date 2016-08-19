/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/17
 */
"use strict";

/**
 *
 * @param type
 * @returns {*|string}
 */
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
/**
 *
 * @param name
 * @param config
 * @param collection
 * @returns {*}
 */
let setCollection = function (name, config, collection = {}) {
    if(!collection.modelName){
        collection = new collection(name, config);
    }
    let key = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
    if(!ORM.collections[key]){
        ORM.collections[key] = {};
    }
    if(!ORM.collections[key][name]){
        ORM.collections[key][name] = collection;
        ORM.collections[key][name].schema = {
            name: collection.modelName,
            tableName: collection.getTableName(),
            fields: collection.fields,
            autoCreatedAt: false,
            autoUpdatedAt: false,
            autoPrimaryKey: true
        };
    }
    return ORM.collections[key][name];
};
/**
 *
 * @param name
 * @param config
 * @returns {*}
 */
function getRelation(name, config) {
    let key = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
    if(!ORM.collections[key]){
        ORM.collections[key] = {};
    }
    if(!ORM.collections[key][name]){
        throw new Error(`collection ${name} is undefined.`);
        return;
    }
    !ORM.collections[key][name].relationShip && (ORM.collections[key][name].relationShip = {});
    let cls = ORM.collections[key][name], type, relation = cls.relation;
    for (let n in relation) {
        if(!ORM.collections[key][n]){
            throw new Error(`collection ${n} is undefined.`);
            return;
        } else {
            type = parseType(relation[n]['type']);
            ORM.collections[key][name].relationShip[n] = {
                type: type, //关联方式
                name: n, //关联模型名称
                model: ORM.collections[key][n], //关联模型
                field: relation[n]['field'] || [],
                fkey: relation[n]['fkey'], //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                rkey: relation[n]['rkey'], //hasone子表主键,hasmany子表外键,manytomany map表子外键

                primaryPk: cls.getPk(),//主表主键
                primaryName: cls.modelName//主模型名称
            };
            //MANYTOMANY map
            if(type === 'MANYTOMANY'){
                let mapName = `${cls.modelName}${n}Map`;
                if(!ORM.collections[key][mapName]){
                    let _class = class extends ORM.model{
                        init(name, config){
                            super.init(name, config);
                            // 是否自动迁移(默认安全模式)
                            this.safe = true;
                            // 数据表字段信息
                            this.fields = {
                                [relation[n]['fkey']]: {
                                    type: 'integer'
                                },
                                [relation[n]['rkey']]: {
                                    type: 'integer'
                                }
                            };
                            // 数据验证
                            this.validations = {};
                            // 关联关系
                            this.relation = {};
                        }
                    };
                    //初始化map模型
                    this.setCollection(mapName, cls.config, _class);
                }
                ORM.collections[key][name].relationShip[n]['mapModel'] = ORM.collections[key][mapName];
            }
        }
    }
    return ORM.collections[key][name].relationShip;
}

/**
 *
 * @param config
 * @returns {*}
 */
function setConnection(config){
    let key = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
    if(!ORM.connections[key]){
        let adapterList = {
            mysql: __dirname + '/Adapter/mysql.js',
            postgresql: __dirname + '/Adapter/postgresql.js',
            mongo: __dirname + '/Adapter/mongo.js'
        };
        if (!config.db_type.toLowerCase() in adapterList) {
            return this.error('_ADAPTER_IS_NOT_SUPPORT_');
        }
        ORM.connections[key] = new (ORM.safeRequire(adapterList[config.db_type]))(config);
    }
    return ORM.connections[key];
}

module.exports = {
    setCollection: setCollection,
    setConnection: setConnection,
    getRelation: getRelation
};
