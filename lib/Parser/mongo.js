'use strict';

exports.__esModule = true;

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _base = require('../base');

var _base2 = _interopRequireDefault(_base);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _mongodb = require('mongodb');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const identifiers = {
    OR: '$or',
    AND: '$and',
    NOT: '$ne',
    IN: '$in',
    NOTIN: '$nin',
    '>': '$gt',
    '<': '$lt',
    '<>': '$ne',
    '<=': '$lte',
    '>=': '$gte',
    'LIKE': '$regex'
};
/*eslint-disable func-style */
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
let whereParse = function (key, value, item, extkey) {
    let idt = key.toUpperCase(),
        temp;
    switch (identifiers[idt]) {
        case '$or':
            if (_lib2.default.isArray(value)) {
                return parseOr(item, value, temp);
            }
            break;
        case '$in':
            if (_lib2.default.isArray(value)) {
                return parseIn(item, value);
            } else if (_lib2.default.isObject(value)) {
                temp = {};
                for (let k in value) {
                    temp = _lib2.default.extend(temp, parseIn(k, value[k]));
                }
                return temp;
            }
            break;
        case '$nin':
            if (_lib2.default.isObject(value)) {
                temp = {};
                for (let k in value) {
                    temp = _lib2.default.extend(temp, parseNotIn(k, value[k]));
                }
                return temp;
            } else if (_lib2.default.isArray(value) && extkey !== undefined) {
                return parseNotIn(extkey, value);
            }
            break;
        case '$ne':
            if (_lib2.default.isObject(value)) {
                temp = {};
                for (let k in value) {
                    temp = _lib2.default.extend(temp, parseNot(k, value[k]));
                }
                return temp;
            } else if (extkey !== undefined) {
                return parseNot(extkey, value);
            }
            break;
        case '$regex':
            if (extkey !== undefined) {
                return parseLike(extkey, value);
            } else if (_lib2.default.isObject(value)) {
                temp = {};
                for (let n in value) {
                    temp = _lib2.default.extend(temp, whereParse(n, value[n], n, key));
                }
                return temp;
            }
            break;
        case '$gt':
        case '$lt':
        case '$lte':
        case '$gte':
            if (extkey !== undefined) {
                return parseOperator(extkey, identifiers[idt], value);
            } else if (_lib2.default.isObject(value)) {
                temp = {};
                for (let n in value) {
                    temp = _lib2.default.extend(temp, whereParse(n, value[n], n, key));
                }
                return temp;
            }
            break;
        case '$and':
        default:
            if (_lib2.default.isArray(value)) {
                return parseIn(item, value);
            } else if (_lib2.default.isObject(value)) {
                temp = {};
                for (let n in value) {
                    temp = _lib2.default.extend(temp, whereParse(n, value[n], n, key));
                }
                return temp;
            } else {
                return { [key]: value };
            }
    }
    return null;
};
//解析or条件
function parseOr(key, value, temp) {
    temp = [];
    value.map(item => {
        if (_lib2.default.isObject(item)) {
            for (let k in item) {
                temp.push(whereParse(k, item[k], k));
            }
        }
    });
    return { '$or': temp };
}
//解析in条件
function parseIn(key, value) {
    return { [key]: { '$in': value } };
}
//解析notin条件
function parseNotIn(key, value) {
    return { [key]: { '$nin': value } };
}
//解析not条件
function parseNot(key, value) {
    return { [key]: { '$ne': value } };
}
//解析operator条件
function parseOperator(key, operator, value) {
    return { [key]: { [operator]: value } };
}
//解析like条件
function parseLike(key, value) {
    if (_lib2.default.isString(value)) {
        if (value.indexOf('%') === 0 && value.substring(value.length - 1) === '%') {
            return { [key]: new RegExp(`${value.substring(1, -1)}`) };
        } else if (value.indexOf('%') === 0) {
            return { [key]: new RegExp(`${value.substring(1, value.length)}^`) };
        } else if (value.substring(value.length - 1) === '%') {
            return { [key]: new RegExp(`^${value.substring(0, -1)}`) };
        }
    }
    return {};
}

exports.default = class extends _base2.default {
    init(config = {}) {
        this.config = config;
        this.sql = '';
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseLimit(data, options) {
        options.skip = options.limit[0] || 0;
        options.limit = options.limit[1] || 10;
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseOrder(data, options) {
        for (let n in options.order) {
            options.sort[n] = options.order[n] == 'asc' || options.order[n] == 'ASC' ? 1 : -1;
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*|Cursor|AggregationCursor}
     */
    parseField(data, options) {
        for (let n of options.field) {
            if (n.indexOf('.') > -1) {
                options.field[n.split('.')[1]] = 1;
            } else {
                options.field[n] = 1;
            }
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */
    parseWhere(data, options) {
        let where = {};
        if (options.where) {
            for (let key in options.where) {
                where = _lib2.default.extend(where, whereParse(key, options.where[key], key));
            }
            options.where = where || {};
        }
    }

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseGroup(data, options) {
        //db.getCollection('demo').group({
        //    "key": {
        //        "id": true,
        //            ...
        //    },
        //    "initial": {},
        //    "reduce": function(obj, prev) {},
        //    "cond": {
        //        "score": {
        //            "$gt": 0
        //        }
        //    }
        //});
        if (options.group) {
            let group = {};
            if (_lib2.default.isArray(options.group)) {
                options.group.map(item => {
                    group[item] = true;
                });
            } else {
                group = [options.group];
            }
            options.group = {
                'key': group,
                'initial': { 'count': 0 },
                'reduce': 'function (obj, prev) { prev.count++; }',
                'cond': {}
            };
        }
    }

    /**
     *
     * @param data
     * @param options
     * @returns {Promise}
     */
    parseJoin(data, options) {
        //未实现
        return _promise2.default.reject('adapter not support join');
    }
    /**
     *
      * @param data
     * @param options
     * @returns {*}
     */
    parseSql(data, options) {
        var _this = this;

        return (0, _asyncToGenerator3.default)(function* () {
            try {
                let caseList = {
                    FIND: { join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1 },
                    SELECT: { join: 1, where: 1, field: 1, limit: 1, order: 1, group: 1 },
                    ADD: { data: 1 },
                    //ADDALL: {data: 1},
                    UPDATE: { where: 1, data: 1 },
                    DELETE: { where: 1 },
                    COUNT: { join: 1, where: 1, limit: 1, group: 1 },
                    SUM: { join: 1, where: 1, limit: 1, group: 1 }
                };

                let optType = options.method;
                //处理join
                if (options.join && caseList[optType].join) {
                    yield _this.parseJoin(data, options);
                    caseList[optType].join && (caseList[optType].join = 0);
                }
                //解析where
                if (options.where && caseList[optType].where) {
                    yield _this.parseWhere(data, options);
                    caseList[optType].where && (caseList[optType].where = 0);
                }
                //解析group
                if (options.group && caseList[optType].group) {
                    yield _this.parseGroup(data, options);
                    caseList[optType].group && (caseList[optType].group = 0);
                }
                //处理其他options
                for (let n in options) {
                    if (caseList[optType][n]) {
                        let mt = `parse${_lib2.default.ucFirst(n)}`;
                        if (mt && _lib2.default.isFunction(_this[mt])) {
                            yield _this[mt](data, options);
                        }
                    }
                }
                return { data: data, options: options };
            } catch (e) {
                throw new Error(e);
            }
        })();
    }

    /**
     *
     * @param data
     * @param options
     * @returns {{data, options}|*}
     */
    buildSql(data, options) {
        var _this2 = this;

        return (0, _asyncToGenerator3.default)(function* () {
            if (options === undefined) {
                options = data;
            }
            //防止外部options被更改
            let parseOptions = _lib2.default.extend(options, {}, true);
            return _this2.parseSql(data, parseOptions);
        })();
    }
};