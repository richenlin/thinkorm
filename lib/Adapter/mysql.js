'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _mysql = require('../Parser/mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _mysql3 = require('../Socket/mysql');

var _mysql4 = _interopRequireDefault(_mysql3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _base.prototype.init.call(this, config);
        this.parser = new _mysql2.default(config);
        this.sql = '';
        this.lastInsertId = 0;
        this.transTimes = 0; //transaction times
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mysql4.default(this.config);
        return this.handel;
    };

    /**
     *
     * @param data
     * @param options
     * @param replace
     */


    _class.prototype.add = function add(data, options, replace) {
        var values = [];
        var fields = [];
        for (var key in data) {
            var val = data[key];
            val = this.parser.parseValue(val);
            if (ORM.isString(val) || ORM.isBoolean(val) || ORM.isNumber(val)) {
                values.push(val);
                fields.push(this.parser.parseKey(key));
            }
        }
        var sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parser.parseTable(options.table) + ' (' + fields.join(',') + ')';
        sql += ' VALUES (' + values.join(',') + ')';
        sql += this.parser.parseLock(options.lock) + this.parser.parseComment(options.comment);
        return this.execute(sql);
    };

    /**
     *
     * @param data
     * @param options
     * @param replace
     */


    _class.prototype.addMany = function addMany(data, options, replace) {
        var _this2 = this;

        var fields = (0, _keys2.default)(data[0].map(function (item) {
            return _this2.parser.parseKey(item);
        }).join(','));
        var values = data.map(function (item) {
            var value = [];
            for (var key in item) {
                var val = item[key];
                val = _this2.parser.parseValue(val);
                if (ORM.isString(val) || ORM.isBoolean(val) || ORM.isNumber(val)) {
                    value.push(val);
                }
            }
            return '(' + value.join(',') + ')';
        }).join(',');
        var sql = replace ? 'REPLACE' : 'INSERT';
        sql += ' INTO ' + this.parser.parseTable(options.table) + '(' + fields + ')';
        sql += ' VALUES ' + values;
        sql += this.parser.parseLock(options.lock) + this.parser.parseComment(options.comment);
        return this.execute(sql);
    };

    /**
     *
     * @param fields
     * @param table
     * @param options
     */


    _class.prototype.selectAdd = function selectAdd(fields, table) {
        var _this3 = this;

        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        if (ORM.isString(fields)) {
            fields = fields.split(/\s*,\s*/);
        }
        fields = fields.map(function (item) {
            return _this3.parser.parseKey(item);
        });
        var sql = 'INSERT INTO ' + this.parser.parseTable(table) + ' (' + fields.join(',') + ') ';
        sql += this.parser.buildSelectSql(options);
        return this.execute(sql);
    };

    /**
     *
     * @param options
     */


    _class.prototype.delete = function _delete(options) {
        var sql = ['DELETE FROM ', this.parser.parseTable(options.table), this.parser.parseWhere(options.where), this.parser.parseOrder(options.order), this.parser.parseLimit(options.limit), this.parser.parseLock(options.lock), this.parser.parseComment(options.comment)].join('');
        return this.execute(sql);
    };

    /**
     *
     * @param options
     * @param data
     */


    _class.prototype.update = function update(options, data) {
        var sql = ['UPDATE ', this.parser.parseTable(options.table), this.parser.parseSet(data), this.parser.parseWhere(options.where), this.parser.parseOrder(options.order), this.parser.parseLimit(options.limit), this.parser.parseLock(options.lock), this.parser.parseComment(options.comment)].join('');
        return this.execute(sql);
    };

    /**
     *
     * @param options
     */


    _class.prototype.select = function select(options) {
        var sql = void 0;
        if (ORM.isObject(options)) {
            sql = this.buildSelectSql(options);
        }
        return this.query(sql);
    };

    _class.prototype.getLastSql = function getLastSql() {
        return this.sql;
    };

    _class.prototype.getLastInsertId = function getLastInsertId() {
        return this.lastInsertId;
    };

    /**
     *
     * @param sql
     */


    _class.prototype.query = function query(sql) {
        var _this4 = this;

        this.sql = sql;
        return this.connect().query(sql).then(function (data) {
            return _this4.parser.bufferToString(data);
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.execute = function execute(sql) {
        var _this5 = this;

        this.sql = sql;
        return this.connect().execute(sql).then(function (data) {
            if (data.insertId) {
                _this5.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        });
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.startTrans = function startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('START TRANSACTION');
        }
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.commit = function commit() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return _promise2.default.resolve();
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.rollback = function rollback() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return _promise2.default.resolve();
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    return _class;
}(_base3.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    16/7/25
                    */


exports.default = _class;