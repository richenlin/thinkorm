'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _mongo_bak = require('../Parser/mongo_bak');

var _mongo_bak2 = _interopRequireDefault(_mongo_bak);

var _mongo = require('../Socket/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
        this.lastInsertId = 0;
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mongo2.default(this.config);
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    _class.prototype.parsers = function parsers() {
        if (!this.parsercls) {
            this.parsercls = new _mongo_bak2.default(this.config);
        }
        return this.parsercls;
    };

    _class.prototype.schema = function schema() {}
    //自动创建表\更新表\迁移数据


    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */
    ;

    _class.prototype.add = function add(data, options) {
        options.method = 'INSERT';
        //
    };

    /**
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype.addAll = function addAll(data, options) {
        var _this2 = this;

        var promised = data.map(function (item) {
            return _this2.add(item, options);
        });
        return _promise2.default.all(promised);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete(options) {
        options.method = 'DELETE';
        //
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function update(data, options) {
        options.method = 'UPDATE';
        //
    };

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(field, options) {
        options.method = 'SELECT';
        options.count = field;
        options.limit = [0, 1];
        //
    };

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function sum(field, options) {
        options.method = 'SELECT';
        options.sum = field;
        options.limit = [0, 1];
        //
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function find(options) {
        options.method = 'SELECT';
        options.limit = [0, 1];
        //
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function select(options) {
        options.method = 'SELECT';
        //
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