'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/14
 */
var identifiers = {
    OR: 'OR',
    AND: 'AND',
    NOT: 'NOT',
    IN: 'IN',
    NOTIN: 'NOTIN',
    '>': 'OPERATOR',
    '<': 'OPERATOR',
    '<>': 'OPERATOR',
    '<=': 'OPERATOR',
    '>=': 'OPERATOR',
    'LIKE': 'OPERATOR'
};
/**
 * 书写方法:
 * or:  {or: [{...}, {...}]}
 * not: {not: {name: '', id: 1}}
 * notin: {notin: {'id': [1,2,3]}}
 * in: {id: [1,2,3]}
 * and: {id: 1, name: 'a'},
 * operator: {id: {'<>': 1}}
 * operator: {id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}}
 * like: {name: {'like': '%a'}}
 * @param knex
 * @param options
 * @param alias
 * @param extkey
 */
var parseKnexWhere = function parseKnexWhere(knex, options, alias, extkey) {
    var idt = '';
    for (var op in options) {
        idt = op.toUpperCase();
        switch (identifiers[idt]) {
            case 'OR':
                if (_lib2.default.isArray(options[op])) {
                    parseOr(knex, options[op], alias);
                }
                break;
            case 'IN':
                if (_lib2.default.isArray(options[op])) {
                    parseIn(knex, op, options[op], alias);
                } else if (_lib2.default.isObject(options[op])) {
                    for (var n in options[op]) {
                        parseIn(knex, n, options[op][n], alias);
                    }
                }
                break;
            case 'NOTIN':
                if (_lib2.default.isObject(options[op])) {
                    parseNotIn(knex, options[op], alias);
                } else if (_lib2.default.isArray(options[op]) && extkey !== undefined) {
                    var _parseNotIn;

                    parseNotIn(knex, (_parseNotIn = {}, _parseNotIn[extkey] = options[op], _parseNotIn), alias);
                }
                break;
            case 'NOT':
                if (_lib2.default.isObject(options[op])) {
                    parseNot(knex, options[op], alias);
                } else if (extkey !== undefined) {
                    var _parseNot;

                    parseNot(knex, (_parseNot = {}, _parseNot[extkey] = options[op], _parseNot), alias);
                }
                break;
            case 'OPERATOR':
                if (extkey !== undefined) {
                    parseOperator(knex, extkey, op, options[op], alias);
                } else if (_lib2.default.isObject(options[op])) {
                    for (var _n in options[op]) {
                        var _parseKnexWhere;

                        parseKnexWhere(knex, (_parseKnexWhere = {}, _parseKnexWhere[_n] = options[op][_n], _parseKnexWhere), alias, op);
                    }
                }
                break;
            case 'AND':
            default:
                if (_lib2.default.isArray(options[op])) {
                    parseIn(knex, op, options[op], alias);
                } else if (_lib2.default.isObject(options[op])) {
                    for (var _n2 in options[op]) {
                        var _parseKnexWhere2;

                        parseKnexWhere(knex, (_parseKnexWhere2 = {}, _parseKnexWhere2[_n2] = options[op][_n2], _parseKnexWhere2), alias, op);
                    }
                } else {
                    var _key = alias && op.indexOf('.') === -1 ? alias + '.' + op : op;
                    knex.where(_key, '=', options[op]);
                }
        }
    }
};
//解析or条件
function parseOr(knex, options, alias) {
    knex.where(function () {
        var _this = this;

        options.map(function (item) {
            if (_lib2.default.isObject(item)) {
                _this.orWhere(function () {
                    parseKnexWhere(this, item, alias);
                });
            }
        });
    });
}
//解析not条件
function parseNot(knex, options, alias) {
    knex.whereNot(function () {
        parseKnexWhere(this, options, alias);
    });
}
//解析in条件
function parseIn(knex, key, value, alias) {
    var _key = alias && key.indexOf('.') === -1 ? alias + '.' + key : key;
    knex.whereIn(_key, value);
}
//解析notin条件
function parseNotIn(knex, options, alias) {
    var _key = '';
    for (var n in options) {
        _key = alias && n.indexOf('.') === -1 ? alias + '.' + n : n;
        knex.whereNotIn(_key, options[n]);
    }
}
//解析operator等条件
function parseOperator(knex, key, operator, value, alias) {
    var _key = alias && key.indexOf('.') === -1 ? alias + '.' + key : key;
    knex.where(_key, operator, value);
}

/**
 *
 * @param onCondition
 * @param alias
 * @param joinAlias
 * @returns {string}
 */
var preParseKnexJoin = function preParseKnexJoin(onCondition, alias, joinAlias) {
    var funcTemp = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'this';

    var _alias = alias ? alias + '.' : '';
    var _joinAlias = joinAlias ? joinAlias + '.' : '';
    //解析on
    for (var n in onCondition) {
        if (n === 'or' || n === 'OR') {
            if (!_lib2.default.isArray(onCondition[n])) {
                continue;
            }
            onCondition[n].forEach(function (it) {
                for (var i in it) {
                    //a join b, b join c的情况下,on条件内已经申明alias
                    if (i.indexOf('.') === -1) {
                        funcTemp += '.orOn(\'' + _alias + i + '\', \'=\', \'' + _joinAlias + it[i] + '\')';
                    } else {
                        funcTemp += '.orOn(\'' + i + '\', \'=\', \'' + _joinAlias + it[i] + '\')';
                    }
                }
            });
        } else {
            //a join b, b join c的情况下,on条件内已经申明alias
            if (n.indexOf('.') === -1) {
                funcTemp += '.on(\'' + _alias + n + '\', \'=\', \'' + _joinAlias + onCondition[n] + '\')';
            } else {
                funcTemp += '.on(\'' + n + '\', \'=\', \'' + _joinAlias + onCondition[n] + '\')';
            }
        }
    }
    return funcTemp;
};

/**
 *
 * @param field
 * @param value
 * @param dbType
 * @return {string}
 * let types = {
            integer: {},
            string: {size: 50},
            float: {precision: 8, size: 2},
            json: {},
            array: [],
            text: {}
        };
 */
var preParseSchema = function preParseSchema(field, value, dbType) {
    var str = '',
        primary = false,
        defaults = false,

    //需要特殊处理的数据源类型,例如Mysql
    isSpecial = { "mysql": true, "postgresql": false };
    if (value.hasOwnProperty('primaryKey') && value.primaryKey === true) {
        primary = true;
    }
    //默认值
    if (value.hasOwnProperty('defaultsTo') && _lib2.default.isScalar(value['defaultsTo'])) {
        defaults = true;
    }
    switch (value.type) {
        case 'integer':
            if (primary === true) {
                str += 't.increments(\'' + field + '\').primary()';
            } else {
                str += 't.integer(\'' + field + '\')';
            }
            if (defaults) {
                str += '.defaultTo(' + value.defaultsTo + ')';
            }
            break;
        case 'float':
            str += 't.float(\'' + field + '\', 8, ' + (value.size || 2) + ')' + (primary === true ? '.primary()' : '');
            if (defaults) {
                str += '.defaultTo(' + value.defaultsTo + ')';
            }
            break;
        case 'string':
            str += 't.string(\'' + field + '\', ' + (value.size || 50) + ')' + (primary === true ? '.primary()' : '');
            if (defaults) {
                str += '.defaultTo(' + value.defaultsTo + ')';
            }
            break;
        case 'json':
        case 'array':
            str += 't.json(\'' + field + '\')';
            if (defaults) {
                str += '.defaultTo(' + (dbType && isSpecial[dbType] ? (0, _stringify2.default)(value.defaultsTo) : value.defaultsTo) + ')';
            }
            break;
        case 'text':
            str += 't.text(\'' + field + '\')';
            if (defaults) {
                str += '.defaultTo(' + value.defaultsTo + ')';
            }
            break;
        default:
            str += 't.string(\'' + field + '\')' + (primary === true ? '.primary()' : '');
            if (defaults) {
                str += '.defaultTo(' + value.defaultsTo + ')';
            }
            break;
    }
    if (value.hasOwnProperty('index') && value.index === true) {
        str += '.index(\'' + field + '\')';
    }
    if (value.hasOwnProperty('unique') && value.unique === true) {
        str += '.unique()';
    }

    return str + ';';
};

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        this.config = config;
    };

    /**
     *
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseLimit = function parseLimit(cls, data, options) {
        if (_lib2.default.isEmpty(options.limit)) {
            return;
        }
        cls.limit(options.limit[1] || 10).offset(options.limit[0] || 0);
    };

    /**
     *
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseOrder = function parseOrder(cls, data, options) {
        if (_lib2.default.isEmpty(options.order)) {
            return;
        }
        for (var n in options.order) {
            if (n.indexOf('.') > -1) {
                cls.orderBy(n, options.order[n]);
            } else {
                cls.orderBy(options.alias + '.' + n, options.order[n]);
            }
        }
    };

    /**
     *
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseField = function parseField(cls, data, options) {
        if (_lib2.default.isEmpty(options.field)) {
            return;
        }
        // let fds = [], temp = [];
        // options.field.forEach(item => {
        //     //跳过*
        //     if (item !== '*') {
        //         if (item.indexOf('.') > -1) {
        //             temp = item.trim().split('.');
        //             if (temp[0] !== options.alias && temp[1] !== '*') {
        //                 fds.push(`${item} AS ${item.replace('.', '_')}`);
        //             }
        //         } else {
        //             fds.push(`${options.alias}.${item}`);
        //         }
        //     }
        // });
        // cls.column(fds);
        cls.column(options.field);
    };

    /**
     *
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseWhere = function parseWhere(cls, data, options) {
        if (_lib2.default.isEmpty(options.where)) {
            return;
        }
        //parse where options
        parseKnexWhere(cls, options.where, options.alias);
    };

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseGroup = function parseGroup(cls, data, options) {
        if (_lib2.default.isEmpty(options.group)) {
            return;
        }
        cls.groupBy(options.group);
    };

    /**
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'Test', alias: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseJoin = function parseJoin(cls, data, options) {
        //解析后结果
        //.innerJoin('accounts', function() {
        //    this.on('accounts.id', '=', 'users.account_id').on('accounts.owner_id', '=', 'users.id').orOn('accounts.owner_id', '=', 'users.id')
        //})
        if (_lib2.default.isArray(options.join)) {
            var type = void 0,
                config = this.config,
                name = options.alias,
                joinAlias = '',
                joinTable = '',
                onCondition = void 0,
                func = '',
                _field = [];
            options.join.map(function (item) {
                if (item && item.from && item.on) {
                    onCondition = item.on;
                    joinAlias = item.alias || item.from;
                    joinTable = '' + config.db_prefix + _lib2.default.parseName(item.from);
                    !options.field && (options.field = ['*']);
                    //关联表字段
                    if (_lib2.default.isArray(item.field)) {
                        item.field.forEach(function (it) {
                            options.field.push(it.indexOf('.') > -1 ? it : joinAlias + '.' + it);
                        });
                    }
                    //构造函数
                    func = new Function('', preParseKnexJoin(onCondition, name, joinAlias));
                    //拼装knex
                    type = item.type ? item.type.toLowerCase() : 'inner';
                    cls[type + 'Join'](joinTable + ' AS ' + joinAlias, func);
                }
            });
            options.field.forEach(function (it) {
                _field.push(it.indexOf('.') > -1 ? it : name + '.' + it);
            });
            options.field = _field;
        }
    };

    /**
     *
     * @param cls
     * @param data
     * @param options
     */


    _class.prototype.parseSchema = function parseSchema(cls, data, options) {
        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(options.schema)) {
            return;
        }
        var tableName = '' + data.db_prefix + _lib2.default.parseName(options.schema.name);
        var str = [],
            fields = options.schema.fields,
            dbType = options.schema.dbType;
        for (var v in fields) {
            str.push(preParseSchema(v, fields[v], dbType));
        }
        var func = new Function('t', str.join('\n'));
        cls.createTableIfNotExists(tableName, func);
    };

    /**
     *
     * @param cls
     * @param data
     * @param options
     * @returns {string}
     */


    _class.prototype.parseSql = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(cls, data, options) {
            var caseList, optType, n, mt;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            caseList = {
                                SELECT: { join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1 },
                                ADD: { data: 1 },
                                UPDATE: { where: 1, data: 1 },
                                DELETE: { where: 1 },
                                COUNT: { join: 1, where: 1, limit: 1, group: 1 },
                                SUM: { join: 1, where: 1, limit: 1, group: 1 },
                                MIGRATE: { schema: 1 }
                            };

                            if (!cls) {
                                _context.next = 20;
                                break;
                            }

                            optType = options.method;
                            //处理join

                            if (!(options['join'] && caseList[optType]['join'])) {
                                _context.next = 8;
                                break;
                            }

                            _context.next = 7;
                            return this.parseJoin(cls, data, options);

                        case 7:
                            caseList[optType]['join'] && (caseList[optType]['join'] = 0);

                        case 8:
                            _context.t0 = _regenerator2.default.keys(options);

                        case 9:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 19;
                                break;
                            }

                            n = _context.t1.value;

                            if (!caseList[optType][n]) {
                                _context.next = 17;
                                break;
                            }

                            mt = 'parse' + _lib2.default.ucFirst(n);
                            _context.t2 = mt && _lib2.default.isFunction(this[mt]);

                            if (!_context.t2) {
                                _context.next = 17;
                                break;
                            }

                            _context.next = 17;
                            return this[mt](cls, data, options);

                        case 17:
                            _context.next = 9;
                            break;

                        case 19:
                            return _context.abrupt('return', cls.toString());

                        case 20:
                            _context.next = 25;
                            break;

                        case 22:
                            _context.prev = 22;
                            _context.t3 = _context['catch'](0);
                            throw new Error(_context.t3);

                        case 25:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 22]]);
        }));

        function parseSql(_x3, _x4, _x5) {
            return _ref.apply(this, arguments);
        }

        return parseSql;
    }();

    /**
     *
     * @param cls
     * @param data
     * @param options
     * @returns {string}
     */


    _class.prototype.buildSql = function buildSql(cls, data, options) {
        if (options === undefined) {
            options = data;
        }
        //防止外部options被更改
        var parseOptions = _lib2.default.extend({}, options);
        return this.parseSql(cls, data, parseOptions);
    };

    return _class;
}(_base3.default);

exports.default = _class;