'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _querystring = require('querystring');

var _querystring2 = _interopRequireDefault(_querystring);

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
        //operate
        this.comparison = {
            'EQ': '=',
            'NEQ': '!=',
            '<>': '!=',
            'GT': '>',
            'EGT': '>=',
            'LT': '<',
            'ELT': '<=',
            'NOTLIKE': 'NOT LIKE',
            'LIKE': 'LIKE',
            'IN': 'IN',
            'NOTIN': 'NOT IN'
        };
        this.selectSql = '%EXPLAIN%SELECT%DISTINCT% %FIELD% FROM %TABLE%%JOIN%%WHERE%%GROUP%%HAVING%%ORDER%%LIMIT%%UNION%%COMMENT%';
    };

    /**
     * parse explain
     * @param  {Boolean} explain []
     * @return {String}         []
     */


    _class.prototype.parseExplain = function parseExplain(explain) {
        if (!explain) {
            return '';
        }
        return 'EXPLAIN ';
    };

    /**
     * parse set
     * @param  {Object} data []
     * @return {String}      []
     */


    _class.prototype.parseSet = function parseSet() {
        var data = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        var set = [];
        for (var key in data) {
            var value = this.parseValue(data[key]);
            if (ORM.isString(value) || ORM.isNumber(value)) {
                set.push(this.parseKey(key) + '=' + value);
            }
        }
        if (set.length) {
            return ' SET ' + set.join(',');
        }
        return '';
    };

    /**
     * parse key
     * @param  {String} key []
     * @return {String}     []
     */


    _class.prototype.parseKey = function parseKey() {
        var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        key = key.trim();
        if (ORM.isEmpty(key)) {
            return '';
        }
        if (ORM.isNumberString(key)) {
            return key;
        }
        if (!/[,\'\"\*\(\)`.\s]/.test(key)) {
            key = '`' + key + '`';
        }
        return key;
    };

    /**
     * parse value
     * @param  {Mixed} value []
     * @return {Mixed}       []
     */


    _class.prototype.parseValue = function parseValue(value) {
        var _this2 = this;

        if (ORM.isString(value)) {
            value = '\'' + this.escapeString(value) + '\'';
        } else if (ORM.isArray(value)) {
            if (/^exp$/.test(value[0])) {
                value = value[1];
            } else {
                value = value.map(function (item) {
                    return _this2.parseValue(item);
                });
            }
        } else if (ORM.isBoolean(value)) {
            value = value ? '1' : '0';
        } else if (value === null) {
            value = 'null';
        }
        return value;
    };

    /**
     * parse field
     * parseField('name');
     * parseField('name,email');
     * parseField({
     *     xx_name: 'name',
     *     xx_email: 'email'
     * })
     * @return {String} []
     *
     */


    _class.prototype.parseField = function parseField(fields) {
        var _this3 = this;

        if (ORM.isString(fields)) {
            //fields('id, instr('30,35,31,',id+',') as d')
            if (fields.indexOf('(') > -1 && fields.indexOf(')') > -1) {
                return fields;
            }
            if (fields.indexOf(',') > -1) {
                fields = fields.split(/\s*,\s*/);
            }
        }
        if (ORM.isArray(fields)) {
            return fields.map(function (item) {
                return _this3.parseKey(item);
            }).join(',');
        } else if (ORM.isObject(fields)) {
            var data = [];
            for (var key in fields) {
                data.push(this.parseKey(key) + ' AS ' + this.parseKey(fields[key]));
            }
            return data.join(',');
        } else if (ORM.isString(fields) && fields) {
            return this.parseKey(fields);
        }
        return '*';
    };

    /**
     * parse table
     * @param  {Mixed} tables []
     * @return {}        []
     */


    _class.prototype.parseTable = function parseTable(table) {
        var _this4 = this;

        if (ORM.isString(table)) {
            table = table.split(/\s*,\s*/);
        }
        if (ORM.isArray(table)) {
            return table.map(function (item) {
                return _this4.parseKey(item);
            }).join(',');
        } else if (ORM.isObject(table)) {
            var data = [];
            for (var key in table) {
                data.push(this.parseKey(key) + ' AS ' + this.parseKey(table[key]));
            }
            return data.join(',');
        }
        return '';
    };

    /**
     * get logic
     * @param  {String} logic    []
     * @param  {String} _default []
     * @return {String}          []
     */


    _class.prototype.getLogic = function getLogic(logic) {
        var _default = arguments.length <= 1 || arguments[1] === undefined ? 'AND' : arguments[1];

        var list = ['AND', 'OR', 'XOR'];
        if (ORM.isObject(logic)) {
            var _logic = logic._logic;
            delete logic._logic;
            logic = _logic;
        }
        if (!logic || !ORM.isString(logic)) {
            return _default;
        }
        logic = logic.toUpperCase();
        if (list.indexOf(logic) > -1) {
            return logic;
        }
        return _default;
    };

    /**
     * parse where
     * @param  {Mixed} where []
     * @return {String}       []
     */


    _class.prototype.parseWhere = function parseWhere(where) {
        var _this5 = this;

        if (ORM.isEmpty(where)) {
            return '';
        } else if (ORM.isString(where)) {
            return ' WHERE ' + where;
        }
        var logic = this.getLogic(where);
        //safe key regexp
        var keySafeRegExp = /^[\w\|\&\-\.\(\)\,]+$/;
        var multi = where._multi;
        delete where._multi;

        var key = void 0,
            val = void 0,
            result = [],
            str = '';

        var fn = function fn(item, i) {
            var v = multi ? val[i] : val;
            return '(' + _this5.parseWhereItem(_this5.parseKey(item), v) + ')';
        };

        for (key in where) {
            val = where[key];
            str = '( ';
            //_string: ''
            if (['_string', '_complex', '_query'].indexOf(key) > -1) {
                str += this.parseThinkWhere(key, val);
            } else if (!keySafeRegExp.test(key)) {
                throw new Error('INVALID_WHERE_CONDITION_KEY');
            }
            //title|content
            else if (key.indexOf('|') > -1) {
                    str += key.split('|').map(fn).join(' OR ');
                }
                //title&content
                else if (key.indexOf('&') > -1) {
                        str += key.split('&').map(fn).join(' AND ');
                    } else {
                        str += this.parseWhereItem(this.parseKey(key), val);
                    }
            str += ' )';
            result.push(str);
        }
        result = result.join(' ' + logic + ' ');
        return result ? ' WHERE ' + result : '';
    };

    /**
     * parse where item
     * @param  {String} key []
     * @param  {Mixed} val []
     * @return {String}     []
     */


    _class.prototype.parseWhereItem = function parseWhereItem(key, val) {
        var _this6 = this;

        // {id: null}
        if (val === null) {
            return key + ' IS NULL';
        }
        // {id: {'<': 10, '>': 1}}
        else if (ORM.isObject(val)) {
                var logic = this.getLogic(val);
                var result = [];
                for (var opr in val) {
                    var nop = opr.toUpperCase();
                    nop = this.comparison[nop] || nop;
                    var parsedValue = this.parseValue(val[opr]);
                    //{id: {IN: [1, 2, 3]}}
                    if (ORM.isArray(parsedValue)) {
                        result.push(key + ' ' + nop + ' (' + parsedValue.join(', ') + ')');
                    } else if (parsedValue === 'null') {
                        result.push(key + ' ' + (nop === '!=' ? 'IS NOT NULL' : 'IS NULL'));
                    } else {
                        result.push(key + ' ' + nop + ' ' + parsedValue);
                    }
                }
                return result.join(' ' + logic + ' ');
            }
            // where({id: [1, 2, 3]})
            else if (ORM.isArray(val)) {
                    var flag = ORM.isNumber(val[0]) || ORM.isNumberString(val[0]);
                    if (flag) {
                        flag = val.every(function (item) {
                            return ORM.isNumber(item) || ORM.isNumberString(item);
                        });
                        if (flag) {
                            return key + ' IN ( ' + val.join(', ') + ' )';
                        }
                    }
                } else {
                    return key + ' = ' + this.parseValue(val);
                }

        var whereStr = '';
        var data = void 0;
        if (ORM.isString(val[0])) {
            (function () {
                var val0 = val[0].toUpperCase();
                val0 = _this6.comparison[val0] || val0;
                // compare
                if (/^(=|!=|>|>=|<|<=)$/.test(val0)) {
                    if (val[1] === null) {
                        whereStr += key + ' ' + (val[0] === '!=' ? 'IS NOT NULL' : 'IS NULL');
                    } else {
                        whereStr += key + ' ' + val0 + ' ' + _this6.parseValue(val[1]);
                    }
                }
                // like or not like
                else if (/^(NOT\s+LIKE|LIKE)$/.test(val0)) {
                        if (ORM.isArray(val[1])) {
                            //get like logic, default is OR
                            var likeLogic = _this6.getLogic(val[2], 'OR');
                            var like = val[1].map(function (item) {
                                return key + ' ' + val0 + ' ' + _this6.parseValue(item);
                            }).join(' ' + likeLogic + ' ');
                            whereStr += '(' + like + ')';
                        } else {
                            whereStr += key + ' ' + val0 + ' ' + _this6.parseValue(val[1]);
                        }
                    }
                    // exp
                    else if (val0 === 'EXP') {
                            whereStr += '(' + key + ' ' + val[1] + ')';
                        }
                        // in or not in
                        else if (val0 === 'IN' || val0 === 'NOT IN') {
                                if (val[2] === 'exp') {
                                    whereStr += key + ' ' + val0 + ' ' + val[1];
                                } else {
                                    if (ORM.isString(val[1])) {
                                        val[1] = val[1].split(',');
                                    }
                                    if (!ORM.isArray(val[1])) {
                                        val[1] = [val[1]];
                                    }
                                    val[1] = _this6.parseValue(val[1]);
                                    if (val[1].length === 1) {
                                        whereStr += key + (val0 === 'IN' ? ' = ' : ' != ') + val[1];
                                    } else {
                                        whereStr += key + ' ' + val0 + ' (' + val[1].join(',') + ')';
                                    }
                                }
                            }
                            //between
                            else if (val0 === 'BETWEEN') {
                                    data = ORM.isString(val[1]) ? val[1].split(',') : val[1];
                                    if (!ORM.isArray(data)) {
                                        data = [val[1], val[2]];
                                    }
                                    whereStr += ' (' + key + ' ' + val0 + ' ' + _this6.parseValue(data[0]);
                                    whereStr += ' AND ' + _this6.parseValue(data[1]) + ')';
                                } else {
                                    throw new Error('WHERE_CONDITION_INVALID');
                                }
            })();
        } else {

            var length = val.length;
            var _logic2 = this.getLogic(val[length - 1], '');
            if (_logic2) {
                length--;
            } else {
                _logic2 = 'AND';
            }
            var _result = [];
            for (var i = 0; i < length; i++) {
                var isArr = ORM.isArray(val[i]);
                data = isArr ? val[i][1] : val[i];
                var exp = ((isArr ? val[i][0] : '') + '').toUpperCase();
                if (exp === 'EXP') {
                    _result.push('(' + key + ' ' + data + ')');
                } else {
                    var op = isArr ? this.comparison[val[i][0].toUpperCase()] || val[i][0] : '=';
                    _result.push('(' + key + ' ' + op + ' ' + this.parseValue(data) + ')');
                }
            }
            whereStr = _result.join(' ' + _logic2 + ' ');
        }
        return whereStr;
    };

    /**
     * parse special condition
     * @param  {String} key []
     * @param  {Mixed} val []
     * @return {String}     []
     */


    _class.prototype.parseThinkWhere = function parseThinkWhere(key, val) {
        switch (key) {
            case '_string':
                return val;
            case '_complex':
                return this.parseWhere(val).substr(6);
            case '_query':
                var where = ORM.isString(val) ? _querystring2.default.parse(val) : val;
                var logic = this.getLogic(where);
                var arr = [];
                for (var name in where) {
                    val = this.parseKey(name) + ' = ' + this.parseValue(where[name]);
                    arr.push(val);
                }
                return arr.join(' ' + logic + ' ');
        }
        return '';
    };

    /**
     * parse limit
     * @param  {String} limit []
     * @return {}       []
     */


    _class.prototype.parseLimit = function parseLimit(limit) {
        if (ORM.isEmpty(limit)) {
            return '';
        }
        if (ORM.isNumber(limit)) {
            limit = Math.max(limit, 0);
            return ' LIMIT ' + limit;
        }
        if (ORM.isString(limit)) {
            limit = limit.split(/\s*,\s*/);
        }
        var data = [Math.max(limit[0] | 0, 0)];
        if (limit[1]) {
            data.push(Math.max(limit[1] | 0, 0));
        }
        return ' LIMIT ' + data.join(',');
    };

    /**
     * parse join
     * @param  {String} join []
     * @return {String}      []
     */


    _class.prototype.parseJoin = function parseJoin(join) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        if (ORM.isEmpty(join)) {
            return '';
        }
        var joinStr = '';
        var defaultJoin = ' LEFT JOIN ';
        if (ORM.isArray(join)) {
            (function () {
                var joins = {
                    'left': ' LEFT JOIN ',
                    'right': ' RIGHT JOIN ',
                    'inner': ' INNER JOIN '
                };
                join.forEach(function (val) {
                    if (ORM.isString(val)) {
                        var hasJoin = val.toLowerCase().indexOf(' join ') > -1;
                        joinStr += (hasJoin ? ' ' : defaultJoin) + val;
                    } else if (ORM.isObject(val)) {
                        var ret = [];
                        if (!('on' in val)) {
                            for (var key in val) {
                                var v = val[key];
                                if (ORM.isObject(v)) {
                                    v.table = key;
                                    ret.push(v);
                                } else {
                                    ret.push(val);
                                    break;
                                }
                            }
                        } else {
                            ret.push(val);
                        }
                        ret.forEach(function (item) {
                            var joinType = joins[item.join] || item.join || defaultJoin;
                            var table = item.table.trim();
                            //table is sql
                            if (table.indexOf(' ') > -1) {
                                if (table.indexOf('(') !== 0) {
                                    table = '(' + table + ')';
                                }
                                joinStr += joinType + table;
                            } else {
                                table = options.tablePrefix + table;
                                if (table.indexOf('.') === -1) {
                                    joinStr += joinType + '`' + table + '`';
                                } else {
                                    joinStr += joinType + table;
                                }
                            }
                            if (item.as) {
                                joinStr += ' AS `' + item.as + '`';
                            }
                            if (item.on) {
                                var mTable = options.alias || options.table;
                                if (mTable.indexOf('.') === -1) {
                                    mTable = '`' + mTable + '`';
                                }
                                var jTable = item.as || table;
                                if (jTable.indexOf('.') === -1) {
                                    jTable = '`' + jTable + '`';
                                }
                                if (ORM.isObject(item.on)) {
                                    var where = [];
                                    for (var _key in item.on) {
                                        where.push([_key.indexOf('.') > -1 ? _key : mTable + '.`' + _key + '`', '=', item.on[_key].indexOf('.') > -1 ? item.on[_key] : jTable + '.`' + item.on[_key] + '`'].join(''));
                                    }
                                    joinStr += ' ON (' + where.join(' AND ') + ')';
                                } else {
                                    if (ORM.isString(item.on)) {
                                        item.on = item.on.split(/\s*,\s*/);
                                    }
                                    joinStr += ' ON ' + (item.on[0].indexOf('.') > -1 ? item.on[0] : mTable + '.`' + item.on[0] + '`');
                                    joinStr += ' = ' + (item.on[1].indexOf('.') > -1 ? item.on[1] : jTable + '.`' + item.on[1] + '`');
                                }
                            }
                        });
                    }
                });
            })();
        } else {
            joinStr += defaultJoin + join;
        }
        return joinStr;
    };

    /**
     * parse order
     * @param  {String} order []
     * @return {String}       []
     */


    _class.prototype.parseOrder = function parseOrder(order) {
        var _this7 = this;

        if (ORM.isEmpty(order)) {
            return '';
        }
        if (ORM.isArray(order)) {
            order = order.map(function (item) {
                return _this7.parseKey(item);
            }).join(',');
        } else if (ORM.isObject(order)) {
            var arr = [];
            for (var key in order) {
                var val = order[key];
                val = this.parseKey(key) + ' ' + val;
                arr.push(val);
            }
            order = arr.join(',');
        }
        return ' ORDER BY ' + order;
    };

    /**
     * parse group
     * @param  {String} group []
     * @return {String}       []
     */


    _class.prototype.parseGroup = function parseGroup(group) {
        if (ORM.isEmpty(group)) {
            return '';
        }
        if (ORM.isString(group)) {
            //group may be `date_format(create_time,'%Y-%m-%d')`
            if (group.indexOf('(') !== -1) {
                return ' GROUP BY ' + group;
            }
            group = group.split(/\s*,\s*/);
        }
        var result = group.map(function (item) {
            if (item.indexOf('.') === -1) {
                return '`' + item + '`';
            } else {
                item = item.split('.');
                return item[0] + '.`' + item[1] + '`';
            }
        });
        return ' GROUP BY ' + result.join(',');
    };

    /**
     * parse having
     * @param  {String} having []
     * @return {}        []
     */


    _class.prototype.parseHaving = function parseHaving(having) {
        return having ? ' HAVING ' + having : '';
    };

    /**
     * parse comment
     * @param  {String} comment []
     * @return {String}         []
     */


    _class.prototype.parseComment = function parseComment(comment) {
        return comment ? ' /*' + comment + '*/' : '';
    };

    /**
     * parse distinct
     * @param  {} distinct []
     * @return {}          []
     */


    _class.prototype.parseDistinct = function parseDistinct(distinct) {
        return distinct ? ' DISTINCT' : '';
    };

    /**
     * parse union
     * @param  {String} union []
     * @return {}       []
     */


    _class.prototype.parseUnion = function parseUnion(union) {
        var _this8 = this;

        if (ORM.isEmpty(union)) {
            return '';
        }
        if (ORM.isArray(union)) {
            var sql = ' ';
            union.forEach(function (item) {
                sql += item.all ? 'UNION ALL ' : 'UNION ';
                sql += '(' + (ORM.isObject(item.union) ? _this8.buildSelectSql(item.union) : item.union) + ')';
            });
            return sql;
        } else {
            return ' UNION (' + (ORM.isObject(union) ? this.buildSelectSql(union) : union) + ')';
        }
    };

    /**
     * parse lock
     * @param  {Boolean} lock []
     * @return {}      []
     */


    _class.prototype.parseLock = function parseLock(lock) {
        if (!lock) {
            return '';
        }
        return ' FOR UPDATE ';
    };

    /**
     * parse sql
     * @param  {String} sql     []
     * @param  {Object} options []
     * @return {String}         []
     */


    _class.prototype.parseSql = function parseSql(sql, options) {
        var _this9 = this;

        //console.log(sql);
        //console.log(options);
        return sql.replace(/\%([A-Z]+)\%/g, function (a, type) {
            type = type.toLowerCase();
            var ucfirst = type[0].toUpperCase() + type.slice(1);
            if (ORM.isFunction(_this9['parse' + ucfirst])) {
                return _this9['parse' + ucfirst](options[type] || '', options);
            }
            return a;
        }).replace(/\s__([A-Z_-]+)__\s/g, function (a, b) {
            return ' `' + _this9.config.prefix + b.toLowerCase() + '` ';
        });
    };

    /**
     * escape string
     * @param  {String} str []
     * @return {String}     []
     */


    _class.prototype.escapeString = function escapeString(str) {
        if (!str) {
            return '';
        }
        return str.replace(/[\0\n\r\b\t\\\'\"\x1a]/g, function (s) {
            switch (s) {
                case '\0':
                    return '\\0';
                case '\n':
                    return '\\n';
                case '\r':
                    return '\\r';
                case '\b':
                    return '\\b';
                case '\t':
                    return '\\t';
                case '\x1a':
                    return '\\Z';
                default:
                    return '\\' + s;
            }
        });
    };

    /**
     *
     * @param data
     * @returns {*}
     */


    _class.prototype.bufferToString = function bufferToString(data) {
        if (!this.config.buffer_tostring || !ORM.isArray(data)) {
            return data;
        }
        for (var i = 0, length = data.length; i < length; i++) {
            for (var key in data[i]) {
                if (ORM.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    };

    /**
     * get select sql
     * @param  {Object} options []
     * @return {String}         [sql string]
     */


    _class.prototype.buildSelectSql = function buildSelectSql(options) {
        return this.parseSql(this.selectSql, options) + this.parseLock(options.lock);
    };

    return _class;
}(_base3.default);

exports.default = _class;