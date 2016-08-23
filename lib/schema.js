/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/17
 */
"use strict";

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
 *
 * @param config
 * @returns {*}
 */
var getKey = function getKey(config) {
    return config.db_type + '_' + config.db_host + '_' + config.db_port + '_' + config.db_name;
};
/**
 *
 * @param func
 * @param config
 * @returns {*}
 */
var setCollection = function setCollection(func, config) {
    var key = getKey(config),
        name = void 0;
    if (lib.isFile(func)) {
        func = lib.thinkRequire(func);
    }
    if (lib.isFunction(func)) {
        if (!ORM.collections[key]) {
            ORM.collections[key] = { relationShip: {} };
        }
        var collection = new func(config);
        name = collection.modelName;

        if (!ORM.collections[key][name]) {
            ORM.collections[key][name] = func;
        }
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
    var _this2 = this;

    var key = getKey(config);
    if (!ORM.collections[key]) {
        ORM.collections[key] = {};
    }
    if (!ORM.collections[key][name]) {
        throw new Error('collection ' + name + ' is undefined.');
        return;
    }
    !ORM.collections[key].relationShip[name] && (ORM.collections[key].relationShip[name] = {});
    var cls = new ORM.collections[key][name](config),
        type = void 0,
        relation = cls.relation;

    var _loop = function _loop(n) {
        if (!ORM.collections[key][n]) {
            throw new Error('collection ' + n + ' is undefined.');
            return {
                v: void 0
            };
        } else {
            type = parseType(relation[n]['type']);
            ORM.collections[key].relationShip[name][n] = {
                type: type, //关联方式
                name: n, //关联模型名称
                model: ORM.collections[key][n], //关联模型
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
                    if (!ORM.collections[key][mapName]) {
                        var model = lib.thinkRequire(__dirname + '/model.js');
                        var _class = function (_model) {
                            (0, _inherits3.default)(_class, _model);

                            function _class() {
                                (0, _classCallCheck3.default)(this, _class);
                                return (0, _possibleConstructorReturn3.default)(this, _model.apply(this, arguments));
                            }

                            _class.prototype.init = function init(name, config) {
                                var _fields;

                                _model.prototype.init.call(this, name, config);
                                // 是否自动迁移(默认安全模式)
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
                                this.tableName = '' + cls.config.db_prefix + lib.parseName(mapName);
                            };

                            return _class;
                        }(model);
                        //初始化map模型
                        _this2.setCollection(_class, cls.config);
                    }
                    ORM.collections[key].relationShip[name][n]['mapModel'] = ORM.collections[key][mapName];
                })();
            }
        }
    };

    for (var n in relation) {
        var _ret = _loop(n);

        if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
    }
    return ORM.collections[key].relationShip[name];
}

/**
 *
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

module.exports = {
    getKey: getKey,
    setCollection: setCollection,
    setConnection: setConnection,
    getRelation: getRelation
};