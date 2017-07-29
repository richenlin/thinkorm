/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/17
 */
const lib = require('./Util/lib.js');

/**
 * 
 * 
 * @param {any} type 
 * @returns 
 */
const parseType = function (type) {
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
    return type;
};

//static propertyes
// schema.instances = {};
// schema.collections = {};
// schema.connections = {};

module.exports = class schema {

    /**
     * get model relationship
     * 
     * @static
     * @param {any} name 
     * @param {any} config 
     * @returns 
     */
    static getRelation(name, config) {
        if (!schema.collections[name]) {
            throw new Error(`collection ${name} is undefined.`);
            // return null;
        }

        if (!schema.collections[name].relation) {
            schema.collections[name].relation = {};
        }
        let cls = new (schema.collections[name])(config),
            type, relation = cls.relation;
        for (let n in relation) {
            if (!schema.collections[n]) {
                throw new Error(`collection ${n} is undefined.`);
                // return null;
            } else {
                type = parseType(relation[n].type);
                schema.collections[name].relation[n] = {
                    type: type, //关联方式
                    name: n, //关联模型名称
                    model: schema.collections[n], //关联模型
                    field: relation[n].field || [],
                    fkey: relation[n].fkey, //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                    rkey: relation[n].rkey, //hasone子表主键,hasmany子表外键,manytomany map表子外键

                    primaryPk: cls.getPk(), //主表主键
                    primaryName: cls.modelName//主模型名称
                };
                //MANYTOMANY map
                if (type === 'MANYTOMANY') {
                    let mapName = relation[n].map;
                    if (!mapName || !schema.collections[mapName]) {
                        throw new Error(`collection ${mapName} is undefined.`);
                        // return null;
                    }
                    schema.collections[name].relation[n].mapModel = mapName;
                    schema.collections[name].relation[n].mapModel = schema.collections[mapName];
                }
            }
        }
        return schema.collections[name].relation;
    }

    /**
     * get collections
     * 
     * @static
     * @param {any} name 
     * @returns 
     */
    static getCollection(name) {
        return schema.collections[name];
    }

    /**
     * set collections
     * 
     * @static
     * @param {any} func 
     * @param {any} config 
     * @returns 
     */
    static setCollection(func, config) {
        if (lib.isFile(func)) {
            func = lib.require(func);
        }
        if (lib.isFunction(func)) {
            let collection = new func(config);
            let name = collection.modelName;
            
            !schema.collections && (schema.collections = {});
            if (!schema.collections[name]) {
                schema.collections[name] = func;
                schema.collections[name].schema = {
                    name: name,
                    pk: collection.getPk(),
                    fields: collection.fields,
                    dbType: config.db_type ? config.db_type.toLowerCase() : ''
                };
            }
            return schema.collections[name];
        }
        return null;
    }

    /**
     * auto migrate all model structure to database
     * 
     * @static
     * @param {any} config 
     * @returns 
     */
    static migrate(config) {
        let instance, ps = [];
        for (let n in schema.collections) {
            instance = new schema.collections[n](config);
            if (instance.safe === false) {
                /*eslint-disable no-loop-func*/
                ps.push(instance.initDB().then(model => {
                    return model.migrate(schema.collections[n].schema, config);
                }));
            }
        }
        return Promise.all(ps);
    }
};