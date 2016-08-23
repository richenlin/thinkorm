/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/17
 */
"use strict";
var lib = require('./Util/lib.js');

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
 * @param config
 * @returns {*}
 */
let getKey = function (config) {
   return `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
};
/**
 *
 * @param func
 * @param config
 * @returns {*}
 */
let setCollection = function (func, config) {
    let name;
    if(lib.isFile(func)){
        func = lib.thinkRequire(func);
    }
    if(lib.isFunction(func)){
        let collection = new func(config);
        name = collection.modelName;

        if(!ORM.collections[name]){
            ORM.collections[name] = func;
            ORM.collections[name].schema = {
                name: name,
                tableName: collection.getTableName(),
                fields: collection.fields,
                autoCreatedAt: false,
                autoUpdatedAt: false,
                autoPrimaryKey: true
            };
        }
        return ORM.collections[name];
    }
    return;
};
/**
 *
 * @param name
 * @param config
 * @returns {*}
 */
function getRelation(name, config) {
    if(!ORM.collections[name]){
        throw new Error(`collection ${name} is undefined.`);
        return;
    }

    if(!ORM.collections[name]['relation']){
        ORM.collections[name]['relation'] = {};
    }
    let cls = new (ORM.collections[name])(config),
        type, relation = cls.relation;
    for (let n in relation) {
        if(!ORM.collections[n]){
            throw new Error(`collection ${n} is undefined.`);
            return;
        } else {
            type = parseType(relation[n]['type']);
            ORM.collections[name]['relation'][n] = {
                type: type, //关联方式
                name: n, //关联模型名称
                model: ORM.collections[n], //关联模型
                field: relation[n]['field'] || [],
                fkey: relation[n]['fkey'], //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                rkey: relation[n]['rkey'], //hasone子表主键,hasmany子表外键,manytomany map表子外键

                primaryPk: cls.getPk(),//主表主键
                primaryName: cls.modelName//主模型名称
            };
            //MANYTOMANY map
            if(type === 'MANYTOMANY'){
                let mapName = `${cls.modelName}${n}Map`;
                if(!ORM.collections[mapName]){
                    let model = lib.thinkRequire(__dirname + '/model.js');
                    let _class = class extends model{
                        init(config){
                            super.init(config);
                            // 是否自动迁移(默认安全模式)
                            this.safe = true;
                            // 数据表字段信息
                            this.fields = {
                                [relation[n]['fkey']]: {
                                    type: 'integer',
                                    index: true
                                },
                                [relation[n]['rkey']]: {
                                    type: 'integer',
                                    index: true
                                }
                            };
                            // 数据验证
                            this.validations = {};
                            // 关联关系
                            this.relation = {};

                            this.modelName = mapName;
                            this.tableName = `${cls.config.db_prefix}${lib.parseName(mapName)}`;
                        }
                    };
                    //初始化map模型
                    this.setCollection(_class, cls.config);
                }
                ORM.collections[name]['relation'][n]['mapModel'] = ORM.collections[mapName];
            }
        }
    }
    return ORM.collections[name]['relation'];
}

/**
 *
 * @param config
 * @returns {*}
 */
function setConnection(config){
    let key = getKey(config);
    if(!ORM.connections[key]){
        let adapterList = {
            mysql: __dirname + '/Adapter/mysql.js',
            postgresql: __dirname + '/Adapter/postgresql.js',
            mongo: __dirname + '/Adapter/mongo.js'
        };
        if (!config.db_type.toLowerCase() in adapterList) {
            throw new Error(`adapter is not support.`);
            return;
        }
        ORM.connections[key] = new (lib.thinkRequire(adapterList[config.db_type]))(config);
    }
    return ORM.connections[key];
}

module.exports = {
    getKey: getKey,
    setCollection: setCollection,
    setConnection: setConnection,
    getRelation: getRelation
};
