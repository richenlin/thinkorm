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

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseType = function parseType(type) {
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
/**
 *
 * @param name
 * @param config
 * @param collection
 * @returns {*}
 */
var loadCollection = function loadCollection(name, config) {
    var collection = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    try {
        if (!collection.modelName) {
            collection = new collection(name, config);
        }
        if (!ORM.Collection[name]) {
            ORM.Collection[name] = collection;
            ORM.Collection[name].schema = {
                name: collection.modelName,
                tableName: collection.getTableName(),
                fields: collection.fields,
                autoCreatedAt: false,
                autoUpdatedAt: false,
                autoPrimaryKey: true
            };
        }
        return ORM.Collection[name];
    } catch (e) {
        return _promise2.default.reject(e);
    }
};
/**
 *
 * @param name
 * @returns {*}
 */
function setRelation(name) {
    try {
        if (!ORM.Relation[name]) {
            ORM.Relation[name] = {};
            var cls = ORM.Collection[name];
            if (cls) {
                var type = void 0,
                    relation = cls.relation,
                    _name = cls.modelName;
                for (var n in relation) {
                    if (ORM.Collection[n]) {
                        type = parseType(relation[n]['type']);
                        ORM.Relation[_name][n] = {
                            name: n, //关联模型名称
                            model: ORM.Collection[n], //关联模型
                            type: type, //关联方式
                            pk: cls.getPk(), //主表主键
                            pname: cls.modelName, //主模型名称
                            field: relation[n]['field'] || [],
                            fkey: relation[n]['fkey'], //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                            rkey: relation[n]['rkey'] //hasone子表主键,hasmany子表外键,manytomany map表子外键
                        };
                    }
                }
            }
        }
        return ORM.Relation[name];
    } catch (e) {
        return _promise2.default.reject(e);
    }
}

/**
 *
 * @param name
 * @param config
 * @returns {*}
 */
function setConnection(name, config) {
    try {
        var key = config.db_type + '_' + config.db_host + '_' + config.db_port + '_' + config.db_name;
        if (!ORM.Connection[name]) {
            var adapterList = {
                mysql: __dirname + '/Adapter/mysql.js',
                postgresql: __dirname + '/Adapter/postgresql.js',
                mongo: __dirname + '/Adapter/mongo.js'
            };
            if (!config.db_type.toLowerCase() in adapterList) {
                return this.error('_ADAPTER_IS_NOT_SUPPORT_');
            }
            ORM.Connection[name] = new (ORM.safeRequire(adapterList[config.db_type]))(config);
        }
        return ORM.Connection[name];
    } catch (e) {
        return _promise2.default.reject(e);
    }
}

module.exports = {
    loadCollection: loadCollection,
    setConnection: setConnection,
    setRelation: setRelation
};