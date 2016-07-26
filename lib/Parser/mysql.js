'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

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
    };

    _class.prototype.sequelizer = function sequelizer(sql) {};

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
        return sprintf(sql.replace(/\__TABLE\__/g, '%s'), options);
    };

    /**
     *
     * @param sql
     * @param options
     */


    _class.prototype.parseSql = function parseSql(sql, options) {
        for (var n in options) {
            var mt = ORM.ucFirst(n);
            if (this['parse' + mt] && ORM.isFunction(this['parse' + mt])) {
                sql = this['parse' + mt](sql, options[n]);
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
        return this.parseSql(this.methodCase[options.method] || '', options);
    };

    return _class;
}(_base3.default);

exports.default = _class;