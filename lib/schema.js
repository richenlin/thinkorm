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

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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
 * get connection key
 * @param config
 * @returns {*}
 */
var getKey = function getKey(config) {
    return config.db_type + '_' + config.db_host + '_' + config.db_port + '_' + config.db_name;
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
                fields: collection.fields
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
    var _this2 = this;

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

    var _loop = function _loop(n) {
        if (!ORM.collections[n]) {
            throw new Error('collection ' + n + ' is undefined.');
            return {
                v: void 0
            };
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
                (function () {
                    var mapName = '' + cls.modelName + n + 'Map';
                    if (!ORM.collections[mapName]) {
                        var model = lib.thinkRequire(__dirname + '/model.js');
                        var _class = function (_model) {
                            (0, _inherits3.default)(_class, _model);

                            function _class() {
                                (0, _classCallCheck3.default)(this, _class);
                                return (0, _possibleConstructorReturn3.default)(this, _model.apply(this, arguments));
                            }

                            _class.prototype.init = function init(config) {
                                var _fields;

                                _model.prototype.init.call(this, config);
                                // 是否开启迁移(migrate方法可用)
                                this.safe = true;
                                // 数据表字段信息
                                this.fields = (_fields = {}, _fields[relation[n]['fkey']] = {
                                    type: 'integer',
                                    index: true
                                }, _fields[relation[n]['rkey']] = {
                                    type: 'integer',
                                    index: true
                                }, _fields);
                                // 数据验证
                                this.validations = {};
                                // 关联关系
                                this.relation = {};

                                this.modelName = mapName;
                                this.tableName = '' + this.config.db_prefix + lib.parseName(mapName);
                            };

                            return _class;
                        }(model);
                        //初始化map模型
                        _this2.setCollection(_class, cls.config);
                    }
                    ORM.collections[name]['relation'][mapName] = ORM.collections[mapName];
                    ORM.collections[name]['relation'][n]['mapModel'] = ORM.collections[mapName];
                })();
            }
        }
    };

    for (var n in relation) {
        var _ret = _loop(n);

        if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
    }
    return ORM.collections[name]['relation'];
}

/**
 * set adapter connection
 * @param config
 * @returns {*}
 */
function setConnection(config) {
    var key = getKey(config);
    if (!ORM.connections[key]) {
        var adapterList = {
            mysql: __dirname + '/Adapter/mysql.js',
            postgresql: __dirname + '/Adapter/postgresql.js',
            mongo: __dirname + '/Adapter/mongo.js'
        };
        if (!config.db_type.toLowerCase() in adapterList) {
            throw new Error('adapter is not support.');
            return;
        }
        ORM.connections[key] = new (lib.thinkRequire(adapterList[config.db_type]))(config);
    }
    return ORM.connections[key];
}

/**
 * auto migrate all model structure to database
 * @param config
 */
function migrate(config) {
    var instance = void 0,
        ps = [];

    var _loop2 = function _loop2(n) {
        instance = new ORM.collections[n](config);
        if (instance.safe) {
            return 'continue';
        }
        ps.push(instance.initModel().then(function (model) {
            return model.migrate(ORM.collections[n].schema, config);
        }));
    };

    for (var n in ORM.collections) {
        var _ret3 = _loop2(n);

        if (_ret3 === 'continue') continue;
    }
    return _promise2.default.all(ps);
}

module.exports = {
    getKey: getKey,
    setCollection: setCollection,
    setConnection: setConnection,
    getRelation: getRelation,
    migrate: migrate
};