'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _sprintfJs = require('sprintf-js');

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _analyze = require('../Util/analyze');

var _analyze2 = _interopRequireDefault(_analyze);

var _sequelizer = require('../Util/sequelizer');

var _sequelizer2 = _interopRequireDefault(_sequelizer);

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
    };

    /**
     *
     * @param sql
     * @param options
     */


    _class.prototype.parseLimit = function parseLimit(sql, options) {};

    /**
     *
     * @param sql
     * @param options
     */


    _class.prototype.parseOrder = function parseOrder(sql, options) {};

    /**
     *
     * @param sql
     * @param options
     */


    _class.prototype.parseField = function parseField(sql, options) {};

    /**
     *
     * @param sql
     * @param options
     */


    _class.prototype.parseWhere = function parseWhere(sql, options) {
        if (ORM.isEmpty(options.where)) {
            return sql;
        }
        var str = '',
            values = options.where;
        for (var n in values) {
            var key = n.trim();
            //or
            if (key === 'or') {
                if (ORM.isArray(values[n])) {
                    values[n].forEach(function (item) {
                        if (item) {
                            //sql +=
                        }
                    });
                }
            }
        }
    };

    /**
     *
     * @param sql
     * @param options
     */


    _class.prototype.parseTable = function parseTable(sql, options) {
        return (0, _sprintfJs.sprintf)(sql.replace(/\__TABLE\__/g, '%s'), options);
    };

    /**
     *
     * @param options
     */


    _class.prototype.parseSql = function parseSql(options) {
        //for(let n in options){
        //    let mt = ORM.ucFirst(n);
        //    if(this[`parse${mt}`] && ORM.isFunction(this[`parse${mt}`])){
        //        sql = this[`parse${mt}`](sql, options[n]);
        //    }
        //}
        var seqs = (0, _analyze2.default)({
            select: '*',
            from: 'users',
            where: {
                name: "ccc", id: 1
            },
            orderBy: [{ id: 'desc' }, { name: 'asc' }]
        });
        var builder = (0, _sequelizer2.default)({
            dialect: 'mysql',
            tree: seqs
        });

        var sql = '';
        if (!ORM.isEmpty(builder.sql)) {
            sql = builder.sql;
            if (!ORM.isEmpty(builder.bindings)) {
                builder.bindings.forEach(function (item) {
                    sql = sql.replace(/\?/, '\'' + item + '\'');
                });
            }
        }
        return sql;
    };

    /**
     *
     * @param options
     * @returns {Promise.<T>}
     */


    _class.prototype.buildSql = function buildSql(options) {
        return this.parseSql(options);
    };

    return _class;
}(_base3.default);

exports.default = _class;