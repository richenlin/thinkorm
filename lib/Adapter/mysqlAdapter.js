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

var _Base = require('../Base');

var _Base2 = _interopRequireDefault(_Base);

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 数据库适配器,将查询有对象转变为查询语句的query bulider
 * Created by lihao on 16/7/26.
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    //配置数据库实例
    _class.prototype.init = function init(config) {
        _base.prototype.init.call(this, config);
        this.config = config;
        this.knex;
        this.knexClient = (0, _knex2.default)({
            client: this.config.db_type
        });
    };

    //实例化数据库Socket


    _class.prototype.socket = function socket() {};

    _class.prototype.find = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options) {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            try {
                                //this.knex = this.knexClient.from('lihao1');
                                //this.knex = this.knex.where({id:1})
                                //console.log(this.knex.select().toString())
                                this.queryBuilder(options);
                                console.log(this.knex.toString());
                            } catch (e) {
                                console.log(e);
                            }

                        case 1:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function find(_x) {
            return _ref.apply(this, arguments);
        }

        return find;
    }();

    /**
     * 查询对象转变为查询语句
     * 基于knex.js http://knexjs.org
     */


    _class.prototype.queryBuilder = function queryBuilder(options) {
        this.builderTable('' + options.tablePrefix + options.table);
        this.builderWhere(options.where);
        this.builderField(options.fields);
        this.builderLimit(options.limit);
        this.builderOrder(options.order);
        this.builderGroup(options.group);
    };

    /**
     * 解析表名
     * @param optionTable
     */


    _class.prototype.builderTable = function builderTable(optionTable) {
        this.knex = this.knexClient.from(optionTable);
    };

    /**
     * 解析字段
     * @param optionField
     */


    _class.prototype.builderField = function builderField(optionField) {
        if (!optionField) return;
        this.knex.column(optionField);
    };

    /**
     * 解析limit
     * @param optionLimit
     */


    _class.prototype.builderLimit = function builderLimit(optionLimit) {
        if (!optionLimit || optionLimit.length < 1) return;
        this.knex.limit(optionLimit[1]).offset(optionLimit[0]);
    };

    /**
     * 解析Order
     * @param optionOrder
     */


    _class.prototype.builderOrder = function builderOrder(optionOrder) {
        if (!optionOrder || optionOrder.length < 1) return;
        this.knex.orderBy(optionOrder[0], optionOrder[1]);
    };

    _class.prototype.builderGroup = function builderGroup(optionGroup) {
        if (!optionGroup) return;
        this.knex.groupBy(optionGroup);
    };

    /**
     * 解析where条件
     * where:[
     *  where,whereNot,whereNotIn,whereNull,whereNotNull,whereExists,whereNotExists,whereBetween,whereNotBetween,
     * ]
     * @param optionWhere
     */


    _class.prototype.builderWhere = function builderWhere(optionWhere) {
        if (!optionWhere) return;
        if (optionWhere.where) this.knex.where(optionWhere.where);
        if (optionWhere.whereNot) this.knex.whereNot(optionWhere.whereNot);
        if (optionWhere.whereNotIn) this.knex.whereNotIn(optionWhere.whereNotIn);
        if (optionWhere.whereNull) this.knex.whereNull(optionWhere.whereNull);
        if (optionWhere.whereNotNull) this.knex.whereNotNull(optionWhere.whereNotNull);
        if (optionWhere.whereExists) this.knex.whereExists(optionWhere.whereExists);
        if (optionWhere.whereNotExists) this.knex.whereNotExists(optionWhere.whereNotExists);
        if (optionWhere.whereBetween) this.knex.whereBetween(optionWhere.whereBetween);
        if (optionWhere.whereNotBetween) this.knex.whereNotBetween(optionWhere.whereNotBetween);
    };

    return _class;
}(_Base2.default);

exports.default = _class;