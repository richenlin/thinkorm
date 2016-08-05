'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _valid = require('./Util/valid');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * 字符串命名风格转换
 * @param  {[type]} name [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
var parseName = function parseName(name) {
    name = name.trim();
    if (!name) {
        return name;
    }
    //首字母如果是大写，不转义为_x
    name = name[0].toLowerCase() + name.substr(1);
    return name.replace(/[A-Z]/g, function (a) {
        return '_' + a.toLowerCase();
    });
};

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    /**
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    _class.prototype.init = function init() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 模型
        this.model = {};
        // 模型名称
        this.modelName = '';
        // 数据表前缀
        this.tablePrefix = '';
        // 数据表名（不包含表前缀）
        this.tableName = '';
        // 实际数据表名（包含表前缀）
        this.trueTableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = [];
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 验证规则
        this._valid = _valid2.default;

        // 获取模型名称
        if (name) {
            this.modelName = name;
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.trueTableName = '_temp';
        }

        this.config = {
            db_type: config.db_type,
            db_host: config.db_host,
            db_port: config.db_port,
            db_name: config.db_name,
            db_user: config.db_user,
            db_pwd: config.db_pwd,
            db_prefix: config.db_prefix,
            db_charset: config.db_charset,
            db_ext_config: config.db_ext_config
        };

        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {
            this.tablePrefix = config.db_prefix;
        }
        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = this.config.db_ext_config.safe === true;
        //配置hash
        this.adapterKey = ORM.hash(this.config.db_type + '_' + this.config.db_host + '_' + this.config.db_port + '_' + this.config.db_name);
        //构建连接
        this.db = null;
    };

    /**
     * 获取数据库连接实例
     * @returns {*}
     */


    _class.prototype.initDb = function initDb() {
        var adapterList = {
            mysql: __dirname + '/Adapter/mysql.js',
            postgresql: __dirname + '/Adapter/postgresql.js',
            mongo: __dirname + '/Adapter/mongo.js'
        };
        if (!this.config.db_type.toLowerCase() in adapterList) {
            return this.error('_ADAPTER_IS_NOT_SUPPORT_');
        }
        var instances = ORM.DB[this.adapterKey];
        if (!instances) {
            instances = new (ORM.safeRequire(adapterList[this.config.db_type]))(this.config);
            ORM.DB[this.adapterKey] = instances;
        }
        this.db = instances;
        return this.db;
    };

    /**
     * 模型构建
     * @returns {*}
     */


    _class.prototype.schema = function schema() {
        //自动创建表\更新表\迁移数据
        return this.instances.schema();
    };

    /**
     * 错误封装
     * @param err
     */


    _class.prototype.error = function error(err) {
        var msg = err || '';
        if (!ORM.isError(msg)) {
            if (!ORM.isString(msg)) {
                msg = (0, _stringify2.default)(msg);
            }
            msg = new Error(msg);
        }

        var stack = msg.message;
        // connection error
        if (~stack.indexOf('connect') || ~stack.indexOf('ECONNREFUSED')) {
            this.instances && this.instances.close && this.instances.close();
        }
        return _promise2.default.reject(msg);
    };

    /**
     * 获取表名
     * @return {[type]} [description]
     */


    _class.prototype.getTableName = function getTableName() {
        if (!this.trueTableName) {
            var tableName = this.config.db_prefix || '';
            tableName += this.tableName || parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    };

    /**
     * 获取模型名
     * @access public
     * @return string
     */


    _class.prototype.getModelName = function getModelName() {
        if (this.modelName) {
            return this.modelName;
        }
        var filename = this.__filename || __filename;
        var last = filename.lastIndexOf('/');
        this.modelName = filename.substr(last + 1, filename.length - last - 9);
        return this.modelName;
    };

    /**
     * 获取主键名称
     * @access public
     * @return string
     */


    _class.prototype.getPk = function getPk() {
        if (!ORM.isEmpty(this.fields)) {
            for (var v in this.fields) {
                if (this.fields[v].hasOwnProperty('primaryKey') && this.fields[v].primaryKey === true) {
                    this.pk = v;
                }
            }
        }
        return this.pk;
    };

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */


    _class.prototype.page = function page(_page, listRows) {
        if (_page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? _page : _page + ',' + listRows;
        return this;
    };

    /**
     * 指定关联操作的表
     * @param table
     */


    _class.prototype.rel = function rel() {
        var table = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        this._options.rel = !ORM.isEmpty(this.relation) ? table : false;
        return this;
    };

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */


    _class.prototype.limit = function limit(offset, length) {
        if (offset === undefined) {
            return this;
        }
        if (ORM.isArray(offset)) {
            length = offset[1] || length;
            offset = offset[0];
        }
        offset = Math.max(parseInt(offset) || 0, 0);
        if (length) {
            length = Math.max(parseInt(length) || 0, 0);
        }
        this._options.limit = [offset, length];
        return this;
    };

    /**
     * 排序
     * @param order
     * @returns {exports}
     */


    _class.prototype.order = function order(_order2) {
        if (_order2 === undefined) {
            return this;
        }
        var _order = [];
        if (ORM.isObject(_order2)) {
            _order.push(_order2);
        } else if (ORM.isString(_order2)) {
            if (_order2.indexOf(',') > -1) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","');
                };
                this._options.order = JSON.parse(strToObj(_order2));
            } else {
                this._options.order = _order2;
            }
        }
        return this;
    };

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(_field) {
        var _this2 = this;

        if (ORM.isEmpty(_field)) {
            return this;
        }
        if (ORM.isString(_field)) {
            _field = _field.replace(/ +/g, '').split(',');
        }
        var fds = [],
            temp = '';
        _field.forEach(function (item) {
            if (item.indexOf('.') > -1) {
                temp = item.split('.');
                if (temp[0].indexOf(_this2.config.db_prefix) > -1) {
                    fds.push(item);
                } else {
                    fds.push('' + _this2.config.db_prefix + item);
                }
            } else {
                fds.push((_this2._options.table || _this2.getTableName()) + '.' + item);
            }
        });
        this._options.field = fds;
        return this;
    };

    /**
     * where条件
     * @return {[type]} [description]
     */


    _class.prototype.where = function where(_where) {
        if (!_where) {
            return this;
        }
        this._options.where = ORM.extend(false, this._options.where || {}, _where);
        return this;
    };

    /**
     *
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param group
     */


    _class.prototype.group = function group(_group) {
        if (!_group) {
            return this;
        }
        this._options.group = _group;
        return this;
    };

    /**
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}}], 'left')
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'right')
     * @param join
     * @param type  inner/left/right
     */


    _class.prototype.join = function join(_join) {
        var type = arguments.length <= 1 || arguments[1] === undefined ? 'inner' : arguments[1];

        if (!_join) {
            return this;
        }
        this._options.joinType = type;
        this._options.join = _join;
        return this;
    };

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeAdd = function _beforeAdd(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parsedOptions, model, result, pk;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;

                            if (!ORM.isEmpty(data)) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context.sent;
                            _context.next = 8;
                            return this.initDb();

                        case 8:
                            model = _context.sent;

                            //copy data
                            this._data = ORM.extend({}, data);
                            _context.next = 12;
                            return this._beforeAdd(this._data, parsedOptions);

                        case 12:
                            this._data = _context.sent;
                            _context.next = 15;
                            return this._parseData(this._data, parsedOptions);

                        case 15:
                            this._data = _context.sent;
                            _context.next = 18;
                            return model.add(this._data, parsedOptions);

                        case 18:
                            result = _context.sent;
                            pk = this.getPk();

                            this._data[pk] = result;
                            _context.next = 23;
                            return this._afterAdd(this._data, parsedOptions);

                        case 23:
                            _context.next = 25;
                            return this._parseData(this._data[pk] || 0, parsedOptions, false);

                        case 25:
                            result = _context.sent;
                            return _context.abrupt('return', result);

                        case 29:
                            _context.prev = 29;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(this.modelName + ':' + _context.t0.message));

                        case 32:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 29]]);
        }));

        function add(_x5, _x6) {
            return _ref.apply(this, arguments);
        }

        return add;
    }();

    /**
     * 数据插入之后操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._afterAdd = function _afterAdd(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 插入多条数据
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype.addAll = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(data, options) {
            var _this3 = this;

            var _ret;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            return _context4.delegateYield(_regenerator2.default.mark(function _callee3() {
                                var parsedOptions, model, promisesd, promiseso, result, _ret2;

                                return _regenerator2.default.wrap(function _callee3$(_context3) {
                                    while (1) {
                                        switch (_context3.prev = _context3.next) {
                                            case 0:
                                                if (!(!ORM.isArray(data) || !ORM.isObject(data[0]))) {
                                                    _context3.next = 2;
                                                    break;
                                                }

                                                return _context3.abrupt('return', {
                                                    v: _this3.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                _context3.next = 4;
                                                return _this3._parseOptions(options);

                                            case 4:
                                                parsedOptions = _context3.sent;
                                                _context3.next = 7;
                                                return _this3.initDb();

                                            case 7:
                                                model = _context3.sent;

                                                //copy data
                                                _this3._data = ORM.extend([], data);
                                                promisesd = _this3._data.map(function (item) {
                                                    return _this3._beforeAdd(item, parsedOptions);
                                                });
                                                _context3.next = 12;
                                                return _promise2.default.all(promisesd);

                                            case 12:
                                                _this3._data = _context3.sent;
                                                promiseso = _this3._data.map(function (item) {
                                                    return _this3._parseData(item, parsedOptions);
                                                });
                                                _context3.next = 16;
                                                return _promise2.default.all(promiseso);

                                            case 16:
                                                _this3._data = _context3.sent;
                                                _context3.next = 19;
                                                return model.addAll(_this3._data, parsedOptions);

                                            case 19:
                                                result = _context3.sent;
                                                _context3.next = 22;
                                                return _this3._parseData(result || [], parsedOptions, false);

                                            case 22:
                                                result = _context3.sent;

                                                if (!(!ORM.isEmpty(result) && ORM.isArray(result))) {
                                                    _context3.next = 30;
                                                    break;
                                                }

                                                return _context3.delegateYield(_regenerator2.default.mark(function _callee2() {
                                                    var pk, resData;
                                                    return _regenerator2.default.wrap(function _callee2$(_context2) {
                                                        while (1) {
                                                            switch (_context2.prev = _context2.next) {
                                                                case 0:
                                                                    _context2.next = 2;
                                                                    return _this3.getPk();

                                                                case 2:
                                                                    pk = _context2.sent;
                                                                    resData = [];

                                                                    result.forEach(function (v, k) {
                                                                        _this3._data[k][pk] = v;
                                                                        resData.push(_this3._afterAdd(_this3._data[k], parsedOptions).then(function () {
                                                                            return v;
                                                                        }));
                                                                    });
                                                                    return _context2.abrupt('return', {
                                                                        v: {
                                                                            v: _promise2.default.all(resData)
                                                                        }
                                                                    });

                                                                case 6:
                                                                case 'end':
                                                                    return _context2.stop();
                                                            }
                                                        }
                                                    }, _callee2, _this3);
                                                })(), 't0', 25);

                                            case 25:
                                                _ret2 = _context3.t0;

                                                if (!((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object")) {
                                                    _context3.next = 28;
                                                    break;
                                                }

                                                return _context3.abrupt('return', _ret2.v);

                                            case 28:
                                                _context3.next = 31;
                                                break;

                                            case 30:
                                                return _context3.abrupt('return', {
                                                    v: []
                                                });

                                            case 31:
                                            case 'end':
                                                return _context3.stop();
                                        }
                                    }
                                }, _callee3, _this3);
                            })(), 't0', 2);

                        case 2:
                            _ret = _context4.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                                _context4.next = 5;
                                break;
                            }

                            return _context4.abrupt('return', _ret.v);

                        case 5:
                            _context4.next = 10;
                            break;

                        case 7:
                            _context4.prev = 7;
                            _context4.t1 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(this.modelName + ':' + _context4.t1.message));

                        case 10:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 7]]);
        }));

        function addAll(_x7, _x8) {
            return _ref2.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 查询后新增
     * @param data
     * @param options
     */


    _class.prototype.thenAdd = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(data, options) {
            var record;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;

                            if (!ORM.isEmpty(data)) {
                                _context5.next = 3;
                                break;
                            }

                            return _context5.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context5.next = 5;
                            return this.find(options);

                        case 5:
                            record = _context5.sent;

                            if (!ORM.isEmpty(record)) {
                                _context5.next = 8;
                                break;
                            }

                            return _context5.abrupt('return', this.add(data, options));

                        case 8:
                            return _context5.abrupt('return', null);

                        case 11:
                            _context5.prev = 11;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(this.modelName + ':' + _context5.t0.message));

                        case 14:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 11]]);
        }));

        function thenAdd(_x9, _x10) {
            return _ref3.apply(this, arguments);
        }

        return thenAdd;
    }();

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeDelete = function _beforeDelete(options) {
        return _promise2.default.resolve(options);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(options) {
            var parsedOptions, model, result;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;
                            _context6.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context6.sent;
                            _context6.next = 6;
                            return this.initDb();

                        case 6:
                            model = _context6.sent;
                            _context6.next = 9;
                            return this._beforeDelete(parsedOptions);

                        case 9:
                            _context6.next = 11;
                            return model.delete(parsedOptions);

                        case 11:
                            result = _context6.sent;
                            _context6.next = 14;
                            return this._afterDelete(parsedOptions);

                        case 14:
                            _context6.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context6.sent;
                            return _context6.abrupt('return', result);

                        case 20:
                            _context6.prev = 20;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(this.modelName + ':' + _context6.t0.message));

                        case 23:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 20]]);
        }));

        function _delete(_x11) {
            return _ref4.apply(this, arguments);
        }

        return _delete;
    }();

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */


    _class.prototype._afterDelete = function _afterDelete(options) {
        return _promise2.default.resolve(options);
    };

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._beforeUpdate = function _beforeUpdate(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(data, options) {
            var parsedOptions, model, pk, result;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            _context7.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context7.sent;
                            _context7.next = 6;
                            return this.initDb();

                        case 6:
                            model = _context7.sent;

                            //copy data
                            this._data = ORM.extend({}, data);
                            _context7.next = 10;
                            return this._beforeUpdate(this._data, parsedOptions);

                        case 10:
                            this._data = _context7.sent;
                            _context7.next = 13;
                            return this._parseData(this._data, parsedOptions);

                        case 13:
                            this._data = _context7.sent;
                            _context7.next = 16;
                            return this.getPk();

                        case 16:
                            pk = _context7.sent;

                            if (!ORM.isEmpty(parsedOptions.where)) {
                                _context7.next = 27;
                                break;
                            }

                            if (ORM.isEmpty(this._data[pk])) {
                                _context7.next = 24;
                                break;
                            }

                            parsedOptions.where = {};
                            parsedOptions.where[pk] = this._data[pk];
                            delete this._data[pk];
                            _context7.next = 25;
                            break;

                        case 24:
                            return _context7.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 25:
                            _context7.next = 28;
                            break;

                        case 27:
                            if (!ORM.isEmpty(this._data[pk])) {
                                delete this._data[pk];
                            }

                        case 28:
                            _context7.next = 30;
                            return model.update(this._data, parsedOptions);

                        case 30:
                            result = _context7.sent;
                            _context7.next = 33;
                            return this._afterUpdate(this._data, parsedOptions);

                        case 33:
                            _context7.next = 35;
                            return this._parseData(result || [], parsedOptions, false);

                        case 35:
                            result = _context7.sent;
                            return _context7.abrupt('return', result);

                        case 39:
                            _context7.prev = 39;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(this.modelName + ':' + _context7.t0.message));

                        case 42:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 39]]);
        }));

        function update(_x12, _x13) {
            return _ref5.apply(this, arguments);
        }

        return update;
    }();

    /**
     * 更新后置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._afterUpdate = function _afterUpdate(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 查询数据条数
     * count('xxx')
     * count(['xxx', 'xxx'])
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(field, options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.prev = 0;
                            _context8.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context8.sent;
                            _context8.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context8.sent;

                            field = field || pk;
                            // init model
                            _context8.next = 10;
                            return this.initDb();

                        case 10:
                            model = _context8.sent;
                            _context8.next = 13;
                            return model.count(field, parsedOptions);

                        case 13:
                            result = _context8.sent;
                            _context8.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context8.sent;
                            return _context8.abrupt('return', result);

                        case 20:
                            _context8.prev = 20;
                            _context8.t0 = _context8['catch'](0);
                            return _context8.abrupt('return', this.error(this.modelName + ':' + _context8.t0.message));

                        case 23:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this, [[0, 20]]);
        }));

        function count(_x14, _x15) {
            return _ref6.apply(this, arguments);
        }

        return count;
    }();

    /**
     * 统计数据数量和
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(field, options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;
                            _context9.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context9.sent;
                            _context9.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context9.sent;

                            field = field || pk;
                            // init model
                            _context9.next = 10;
                            return this.initDb();

                        case 10:
                            model = _context9.sent;
                            _context9.next = 13;
                            return model.sum(field, parsedOptions);

                        case 13:
                            result = _context9.sent;
                            _context9.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context9.sent;
                            return _context9.abrupt('return', result);

                        case 20:
                            _context9.prev = 20;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(this.modelName + ':' + _context9.t0.message));

                        case 23:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 20]]);
        }));

        function sum(_x16, _x17) {
            return _ref7.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 最小值
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.min = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(field, options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            _context10.prev = 0;
                            _context10.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context10.sent;
                            _context10.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context10.sent;

                            field = field || pk;
                            // init model
                            _context10.next = 10;
                            return this.initDb();

                        case 10:
                            model = _context10.sent;
                            _context10.next = 13;
                            return model.min(field, parsedOptions);

                        case 13:
                            result = _context10.sent;
                            _context10.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context10.sent;
                            return _context10.abrupt('return', result);

                        case 20:
                            _context10.prev = 20;
                            _context10.t0 = _context10['catch'](0);
                            return _context10.abrupt('return', this.error(this.modelName + ':' + _context10.t0.message));

                        case 23:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this, [[0, 20]]);
        }));

        function min(_x18, _x19) {
            return _ref8.apply(this, arguments);
        }

        return min;
    }();

    /**
     * 最大值
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.max = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(field, options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.prev = 0;
                            _context11.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context11.sent;
                            _context11.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context11.sent;

                            field = field || pk;
                            // init model
                            _context11.next = 10;
                            return this.initDb();

                        case 10:
                            model = _context11.sent;
                            _context11.next = 13;
                            return model.max(field, parsedOptions);

                        case 13:
                            result = _context11.sent;
                            _context11.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context11.sent;
                            return _context11.abrupt('return', result);

                        case 20:
                            _context11.prev = 20;
                            _context11.t0 = _context11['catch'](0);
                            return _context11.abrupt('return', this.error(this.modelName + ':' + _context11.t0.message));

                        case 23:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this, [[0, 20]]);
        }));

        function max(_x20, _x21) {
            return _ref9.apply(this, arguments);
        }

        return max;
    }();

    /**
     * 平均值
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.avg = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(field, options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _context12.prev = 0;
                            _context12.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context12.sent;
                            _context12.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context12.sent;

                            field = field || pk;
                            // init model
                            _context12.next = 10;
                            return this.initDb();

                        case 10:
                            model = _context12.sent;
                            _context12.next = 13;
                            return model.avg(field, parsedOptions);

                        case 13:
                            result = _context12.sent;
                            _context12.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context12.sent;
                            return _context12.abrupt('return', result);

                        case 20:
                            _context12.prev = 20;
                            _context12.t0 = _context12['catch'](0);
                            return _context12.abrupt('return', this.error(this.modelName + ':' + _context12.t0.message));

                        case 23:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this, [[0, 20]]);
        }));

        function avg(_x22, _x23) {
            return _ref10.apply(this, arguments);
        }

        return avg;
    }();

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(options) {
            var parsedOptions, model, result;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            _context13.prev = 0;
                            _context13.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context13.sent;
                            _context13.next = 6;
                            return this.initDb();

                        case 6:
                            model = _context13.sent;
                            _context13.next = 9;
                            return model.find(parsedOptions);

                        case 9:
                            result = _context13.sent;
                            _context13.next = 12;
                            return this._parseData(result || [], parsedOptions, false);

                        case 12:
                            result = _context13.sent;
                            _context13.next = 15;
                            return this._afterFind(ORM.isArray(result) ? result[0] : result, options);

                        case 15:
                            _context13.next = 17;
                            return this._parseData(result || {}, parsedOptions, false);

                        case 17:
                            result = _context13.sent;
                            return _context13.abrupt('return', result);

                        case 21:
                            _context13.prev = 21;
                            _context13.t0 = _context13['catch'](0);
                            return _context13.abrupt('return', this.error(this.modelName + ':' + _context13.t0.message));

                        case 24:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[0, 21]]);
        }));

        function find(_x24) {
            return _ref11.apply(this, arguments);
        }

        return find;
    }();

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */


    _class.prototype._afterFind = function _afterFind(result, options) {
        return _promise2.default.resolve(result);
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(options) {
            var parsedOptions, model, result;
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            _context14.prev = 0;
                            _context14.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context14.sent;
                            _context14.next = 6;
                            return this.initDb();

                        case 6:
                            model = _context14.sent;
                            _context14.next = 9;
                            return model.select(parsedOptions);

                        case 9:
                            result = _context14.sent;
                            _context14.next = 12;
                            return this._parseData(result || [], parsedOptions, false);

                        case 12:
                            result = _context14.sent;
                            _context14.next = 15;
                            return this._afterSelect(result, options);

                        case 15:
                            _context14.next = 17;
                            return this._parseData(result || [], parsedOptions, false);

                        case 17:
                            result = _context14.sent;
                            return _context14.abrupt('return', result);

                        case 21:
                            _context14.prev = 21;
                            _context14.t0 = _context14['catch'](0);
                            return _context14.abrupt('return', this.error(this.modelName + ':' + _context14.t0.message));

                        case 24:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this, [[0, 21]]);
        }));

        function select(_x25) {
            return _ref12.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype._afterSelect = function _afterSelect(result, options) {
        return _promise2.default.resolve(result);
    };

    /**
     * 返回数据里含有count信息的查询
     * @param  options
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */


    _class.prototype.countSelect = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(options, pageFlag) {
            var parsedOptions, countNum, pageOptions, totalPage, offset, result;
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            _context15.prev = 0;

                            if (ORM.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            _context15.next = 4;
                            return this._parseOptions(options);

                        case 4:
                            parsedOptions = _context15.sent;
                            _context15.next = 7;
                            return this.count('', parsedOptions);

                        case 7:
                            countNum = _context15.sent;
                            pageOptions = parsedOptions.page;
                            totalPage = Math.ceil(countNum / pageOptions.num);

                            if (ORM.isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                            }
                            //传入分页参数
                            offset = pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;

                            parsedOptions.limit = [offset, pageOptions.num];
                            result = ORM.extend(false, { count: countNum, total: totalPage }, pageOptions);
                            _context15.next = 16;
                            return this.select(parsedOptions);

                        case 16:
                            result.data = _context15.sent;
                            _context15.next = 19;
                            return this._parseData(result, parsedOptions, false);

                        case 19:
                            result = _context15.sent;
                            return _context15.abrupt('return', result);

                        case 23:
                            _context15.prev = 23;
                            _context15.t0 = _context15['catch'](0);
                            return _context15.abrupt('return', this.error(this.modelName + ':' + _context15.t0.message));

                        case 26:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this, [[0, 23]]);
        }));

        function countSelect(_x26, _x27) {
            return _ref13.apply(this, arguments);
        }

        return countSelect;
    }();

    /*#######################################################################################*/

    /**
     * 解析参数
     * @param  {[type]} options [description]
     * @return promise         [description]
     */


    _class.prototype._parseOptions = function _parseOptions(oriOpts, extraOptions) {
        var options = void 0;
        if (ORM.isScalar(oriOpts)) {
            options = ORM.extend({}, this._options);
        } else {
            options = ORM.extend({}, this._options, oriOpts, extraOptions);
        }
        //查询过后清空sql表达式组装 避免影响下次查询
        this._options = {};
        //获取表名
        options.table = options.table || this.getTableName();
        //解析field,根据model的fields进行过滤
        var field = [];
        if (ORM.isEmpty(options.field) && !ORM.isEmpty(options.fields)) options.field = options.fields;
        //解析分页
        if ('page' in options) {
            var page = options.page + '';
            var num = 0;
            if (page.indexOf(',') > -1) {
                page = page.split(',');
                num = parseInt(page[1], 10);
                page = page[0];
            }
            num = num || 10;
            page = parseInt(page, 10) || 1;
            options.page = { page: page, num: num };
        } else {
            options.page = { page: 1, num: 10 };
        }
        return options;
    };

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @param option
     * @returns {*}
     */


    _class.prototype._parseData = function _parseData(data, options) {
        var preCheck = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
        var option = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

        if (preCheck) {
            return data;
        } else {
            if (ORM.isJSONObj(data)) {
                return data;
            } else {
                return JSON.parse((0, _stringify2.default)(data));
            }
        }
    };

    return _class;
}(_base3.default);

exports.default = _class;