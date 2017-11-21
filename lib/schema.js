/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const lib = require('think_lib');


module.exports = class schema {

    /**
     * 
     * 
     * @param {any} model 
     * @param {any} config 
     */
    static setSchema(model, config) {
        model.config = {
            db_type: config.db_type ? config.db_type.toLowerCase() : 'mysql',
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
        model.pk = model.getPk() || 'id';
        model.safe = model.safe === false ? false : true;
        model.fields = lib.isEmpty(model.fields) ? {
            id: {
                type: 'integer',
                primaryKey: true
            }
        } : model.fields;
        model.validations = model.validations || {};
        model.relation = model.relation || {};
    }

    /**
     * 
     * 
     * @static
     * @param {any} model 
     * @param {any} config 
     * @returns 
     */
    static setCollection(model, config) {
        if (lib.isFunction(model)) {
            let cls = new model(config);
            if (cls.modelName) {
                !__thinkorm.collections && (__thinkorm.collections = {});
                __thinkorm.collections[cls.modelName] = model;
                __thinkorm.collections[cls.modelName].schema = {
                    table: cls.tableName,
                    name: cls.modelName,
                    pk: cls.pk,
                    fields: cls.fields,
                    dbType: cls.config.db_type
                };
            }
        }
        return null;
    }

    /**
     * 
     * 
     * @static
     * @param {any} name 
     * @returns 
     */
    static getCollection(name) {
        !__thinkorm.collections && (__thinkorm.collections = {});
        return __thinkorm.collections[name];
    }

};