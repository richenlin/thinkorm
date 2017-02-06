/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/17
 */
"use strict";

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var lib = require('./Util/lib.js');

/**
 *
 * @param type
 * @returns {*|string}
 */
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
 * set collections
 * @param func
 * @param config
 * @returns {*}
 */
var setCollection = function setCollection(func, config) {
    if (lib.isFile(func)) {
        func = lib.thinkRequire(func);
    }
    if (lib.isFunction(func)) {
        var collection = new func(config);
        var name = collection.modelName;

        if (!ORM.collections[name]) {
            ORM.collections[name] = func;
            ORM.collections[name].schema = {
                name: name,
                pk: collection.getPk(),
                fields: collection.fields,
                dbType: config.db_type ? config.db_type.toLowerCase() : ''
            };
        }
        return ORM.collections[name];
    }
    return;
};
/**
 * get model relationship
 * @param name
 * @param config
 * @returns {*}
 */
function getRelation(name, config) {
    if (!ORM.collections[name]) {
        throw new Error('collection ' + name + ' is undefined.');
        return;
    }

    if (!ORM.collections[name]['relation']) {
        ORM.collections[name]['relation'] = {};
    }
    var cls = new ORM.collections[name](config),
        type = void 0,
        relation = cls.relation;
    for (var n in relation) {
        if (!ORM.collections[n]) {
            throw new Error('collection ' + n + ' is undefined.');
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

                primaryPk: cls.getPk(), //主表主键
                primaryName: cls.modelName //主模型名称
            };
            //MANYTOMANY map
            if (type === 'MANYTOMANY') {
                var mapName = relation[n]['map'];
                if (!mapName || !ORM.collections[mapName]) {
                    throw new Error('collection ' + mapName + ' is undefined.');
                    return;
                }
                ORM.collections[name]['relation'][n]['mapModel'] = mapName;
                ORM.collections[name]['relation'][n]['mapModel'] = ORM.collections[mapName];

                // let mapName = `${cls.modelName}${n}Map`;
                // if(!ORM.collections[mapName]){
                //     let model = lib.thinkRequire(__dirname + '/model.js');
                //     let _class = class extends model{
                //         init(config){
                //             super.init(config);
                //             // 是否开启迁移(migrate方法可用)
                //             this.safe = cls.safe;
                //             // 数据表字段信息
                //             this.fields = {
                //                 [relation[n]['fkey']]: {
                //                     type: 'integer',
                //                     index: true
                //                 },
                //                 [relation[n]['rkey']]: {
                //                     type: 'integer',
                //                     index: true
                //                 }
                //             };
                //             // 数据验证
                //             this.validations = {};
                //             // 关联关系
                //             this.relation = {};
                //
                //             this.modelName = mapName;
                //             this.tableName = `${this.config.db_prefix}${lib.parseName(mapName)}`;
                //         }
                //     };
                //     //初始化map模型
                //     this.setCollection(_class, cls.config);
                // }
                // ORM.collections[name]['relation'][n]['mapModel'] = ORM.collections[mapName];
            }
        }
    }
    return ORM.collections[name]['relation'];
}

/**
 * auto migrate all model structure to database
 * @param config
 */
function migrate(config) {
    var instance = void 0,
        ps = [];

    var _loop = function _loop(n) {
        instance = new ORM.collections[n](config);
        if (instance.safe === false) {
            ps.push(instance.initDB().then(function (model) {
                return model.migrate(ORM.collections[n].schema, config);
            }));
        }
    };

    for (var n in ORM.collections) {
        _loop(n);
    }
    return _promise2.default.all(ps);
}

module.exports = {
    setCollection: setCollection,
    getRelation: getRelation,
    migrate: migrate
};