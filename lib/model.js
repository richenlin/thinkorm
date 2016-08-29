'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _schema = require('./schema');

var _schema2 = _interopRequireDefault(_schema);

var _lib = require('./Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _valid = require('./Util/valid');

var _valid2 = _interopRequireDefault(_valid);

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

    /**
     * init
     * @param name
     * @param config
     */
    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 模型名称(不能被重载)
        this.modelName = '';
        // 数据表名(不能被重载)
        this.tableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
        // 参数
        this.__options = {};
        // 数据
        this.__data = {};
        // 关联模型数据
        this.__relationData = {};
        // 验证规则
        this.__valid = _valid2.default;

        // 配置
        this.config = {
            db_type: config.db_type,
            db_host: config.db_host,
            db_port: config.db_port,
            db_name: config.db_name,
            db_user: config.db_user,
            db_pwd: config.db_pwd,
            db_prefix: config.db_prefix,
            db_charset: config.db_charset,
            db_ext_config: config.db_ext_config || {}
        };
        // 模型名
        this.modelName = this.getModelName();
        // 表名
        this.tableName = this.getTableName();
        // 安全模式
        this.safe = this.config.db_ext_config.safe === true;
        // collection instance
        this.instances = null;
    };

    /**
     *
     * @param args
     * @returns {type[]}
     */


    _class.require = function require() {
        return _lib2.default.thinkRequire.apply(_lib2.default, arguments);
    };

    /**
     *
     * @param args
     * @returns {*}
     */


    _class.setCollection = function setCollection() {
        return _schema2.default.setCollection.apply(_schema2.default, arguments);
    };

    /**
     *
     * @param args
     * @returns {*}
     */


    _class.setConnection = function setConnection() {
        return _schema2.default.setConnection.apply(_schema2.default, arguments);
    };

    /**
     * 初始化模型
     */


    _class.prototype.initModel = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;

                            if (ORM.collections[this.modelName]) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return', this.error('Collections ' + this.modelName + ' is undefined.'));

                        case 3:
                            this.instances = ORM.connections[_schema2.default.getKey(this.config)];

                            if (this.instances) {
                                _context.next = 8;
                                break;
                            }

                            _context.next = 7;
                            return _schema2.default.setConnection(this.config);

                        case 7:
                            this.instances = _context.sent;

                        case 8:
                            return _context.abrupt('return', this.instances);

                        case 11:
                            _context.prev = 11;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(_context.t0));

                        case 14:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 11]]);
        }));

        function initModel() {
            return _ref.apply(this, arguments);
        }

        return initModel;
    }();

    /**
     * 错误封装
     * @param err
     */


    _class.prototype.error = function error(err) {
        var msg = err;
        if (msg) {
            if (!_lib2.default.isError(msg)) {
                if (!_lib2.default.isString(msg)) {
                    msg = (0, _stringify2.default)(msg);
                }
                msg = new Error(msg);
            }
            var stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            _lib2.default.log(msg);
        }
        return _promise2.default.reject(msg);
    };

    /**
     * 结构迁移
     * @param rel 是否创建关联表
     * @returns {*}
     */


    _class.prototype.migrate = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var rel = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
            var model, relation, ps, n;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;

                            if (!this.config.safe) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return');

                        case 3:
                            _context2.next = 5;
                            return this.initModel();

                        case 5:
                            model = _context2.sent;

                            if (!rel) {
                                _context2.next = 12;
                                break;
                            }

                            relation = _schema2.default.getRelation(this.modelName, this.config), ps = [];

                            if (_lib2.default.isEmpty(relation)) {
                                _context2.next = 12;
                                break;
                            }

                            for (n in relation) {
                                ps.push(model.migrate(ORM.collections[n].schema, this.config));
                            }
                            _context2.next = 12;
                            return _promise2.default.all(ps);

                        case 12:
                            _context2.next = 14;
                            return model.migrate(ORM.collections[this.modelName].schema, this.config);

                        case 14:
                            return _context2.abrupt('return');

                        case 17:
                            _context2.prev = 17;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', this.error(_context2.t0));

                        case 20:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[0, 17]]);
        }));

        function migrate(_x2) {
            return _ref2.apply(this, arguments);
        }

        return migrate;
    }();

    /**
     * 事务开始
     */


    _class.prototype.startTrans = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
            var model;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return this.initModel();

                        case 3:
                            model = _context3.sent;
                            return _context3.abrupt('return', model.startTrans());

                        case 7:
                            _context3.prev = 7;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t0));

                        case 10:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 7]]);
        }));

        function startTrans() {
            return _ref3.apply(this, arguments);
        }

        return startTrans;
    }();

    /**
     * 事务提交
     */


    _class.prototype.commit = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
            var model;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return this.initModel();

                        case 3:
                            model = _context4.sent;
                            return _context4.abrupt('return', model.commit());

                        case 7:
                            _context4.prev = 7;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(_context4.t0));

                        case 10:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 7]]);
        }));

        function commit() {
            return _ref4.apply(this, arguments);
        }

        return commit;
    }();

    /**
     * 事务回滚
     */


    _class.prototype.rollback = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
            var model;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return this.initModel();

                        case 3:
                            model = _context5.sent;
                            return _context5.abrupt('return', model.rollback());

                        case 7:
                            _context5.prev = 7;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(_context5.t0));

                        case 10:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 7]]);
        }));

        function rollback() {
            return _ref5.apply(this, arguments);
        }

        return rollback;
    }();

    /**
     * 获取表名
     * @return {[type]} [description]
     */


    _class.prototype.getTableName = function getTableName() {
        try {
            if (!this.tableName) {
                var tableName = this.config.db_prefix || '';
                tableName += _lib2.default.parseName(this.getModelName());
                this.tableName = tableName.toLowerCase();
            }
            return this.tableName;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 获取模型名
     * @access public
     * @return string
     */


    _class.prototype.getModelName = function getModelName(name) {
        try {
            if (!this.modelName) {
                var filename = this.__filename;
                var last = filename.lastIndexOf('/');
                this.modelName = filename.substr(last + 1, filename.length - last - 4);
            }
            return this.modelName;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 获取主键名称
     * @access public
     * @return string
     */


    _class.prototype.getPk = function getPk() {
        try {
            if (!_lib2.default.isEmpty(this.fields)) {
                for (var v in this.fields) {
                    if (this.fields[v].hasOwnProperty('primaryKey') && this.fields[v].primaryKey === true) {
                        this.pk = v;
                    }
                }
            } else {
                if (this.config.db_type === 'mongo') {
                    this.pk = '_id';
                }
            }
            return this.pk;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 根据查询结果生成分页
     * @return {[type]} [description]
     */


    _class.prototype.page = function page(_page, listRows) {
        try {
            if (_page === undefined) {
                return this;
            }
            this.__options.page = listRows === undefined ? _page : _page + ',' + listRows;
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 关联操作
     * @param table
     * @param field
     */


    _class.prototype.rel = function rel() {
        var _this2 = this;

        var table = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var field = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        try {
            if (table) {
                (function () {
                    //获取关联关系
                    var rels = _schema2.default.getRelation(_this2.modelName, _this2.config);
                    if (table === true) {
                        _this2.__options.rel = rels;
                    } else {
                        if (_lib2.default.isString(table)) {
                            table = table.replace(/ +/g, '').split(',');
                        }
                        if (_lib2.default.isArray(table)) {
                            _this2.__options.rel = {};
                            table.forEach(function (item) {
                                rels[item] && (_this2.__options.rel[item] = rels[item]);
                            });
                        }
                    }
                    //关联表字段
                    if (!_lib2.default.isEmpty(field)) {
                        for (var n in field) {
                            if (n in _this2.__options.rel) {
                                _this2.__options.rel[n]['field'] = field[n];
                            }
                        }
                    }
                })();
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */


    _class.prototype.limit = function limit(offset, length) {
        try {
            if (offset === undefined) {
                return this;
            }
            if (_lib2.default.isArray(offset)) {
                length = offset[1] || length;
                offset = offset[0];
            } else if (length === undefined) {
                length = offset;
                offset = 0;
            }
            offset = Math.max(parseInt(offset) || 0, 0);
            if (length) {
                length = Math.max(parseInt(length) || 0, 0);
            }
            this.__options.limit = [offset, length];
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 排序
     * @param order
     * @returns {exports}
     */


    _class.prototype.order = function order(_order) {
        try {
            if (_order === undefined) {
                return this;
            }
            if (_lib2.default.isObject(_order)) {
                this.__options.order = _order;
            } else if (_lib2.default.isString(_order)) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","');
                };
                this.__options.order = JSON.parse(strToObj(_order));
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(_field) {
        try {
            if (_lib2.default.isEmpty(_field)) {
                return this;
            }
            if (_lib2.default.isString(_field)) {
                _field = _field.replace(/ +/g, '').split(',');
            }
            this.__options.field = _field;
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * where条件
     * 书写方法:
     * or:  {or: [{...}, {...}]}
     * not: {not: {name: '', id: 1}}
     * notin: {notin: {'id': [1,2,3]}}
     * in: {id: [1,2,3]}
     * and: {id: 1, name: 'a'},
     * operator: {id: {'<>': 1}}
     * operator: {id: {'<>': 1, '>=': 0, '<': 100, '<=': 10}}
     * like: {name: {'like': '%a'}}
     * @return {[type]} [description]
     */


    _class.prototype.where = function where(_where) {
        try {
            if (!_where) {
                return this;
            }
            this.__options.where = _lib2.default.extend(false, this.__options.where || {}, _where);
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     *
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param group
     */


    _class.prototype.group = function group(_group) {
        try {
            if (!_group) {
                return this;
            }
            this.__options.group = _group;
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param join
     */


    _class.prototype.join = function join(_join) {
        try {
            if (!_join || !_lib2.default.isArray(_join) || _join.length === 0) {
                return this;
            }
            this.__options.join = _join;
            return this;
        } catch (e) {
            return this.error(e);
        }
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
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(data, options) {
            var parsedOptions, model, result, pk;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;

                            if (!_lib2.default.isEmpty(data)) {
                                _context6.next = 3;
                                break;
                            }

                            return _context6.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context6.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context6.sent;
                            _context6.next = 8;
                            return this.initModel();

                        case 8:
                            model = _context6.sent;

                            //copy data
                            this.__data = _lib2.default.extend({}, data);
                            _context6.next = 12;
                            return this._beforeAdd(this.__data, parsedOptions);

                        case 12:
                            this.__data = _context6.sent;
                            _context6.next = 15;
                            return this._parseData(this.__data, parsedOptions);

                        case 15:
                            this.__data = _context6.sent;

                            if (!_lib2.default.isEmpty(this.__data)) {
                                _context6.next = 18;
                                break;
                            }

                            return _context6.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 18:
                            _context6.next = 20;
                            return model.add(this.__data, parsedOptions);

                        case 20:
                            result = _context6.sent;
                            _context6.next = 23;
                            return this.getPk();

                        case 23:
                            pk = _context6.sent;


                            this.__data[pk] = this.__data[pk] ? this.__data[pk] : result;

                            if (_lib2.default.isEmpty(this.__relationData)) {
                                _context6.next = 28;
                                break;
                            }

                            _context6.next = 28;
                            return this.__postRelationData(model, result, parsedOptions, this.__relationData, 'ADD');

                        case 28:
                            _context6.next = 30;
                            return this._afterAdd(this.__data, parsedOptions);

                        case 30:
                            _context6.next = 32;
                            return this._parseData(this.__data[pk] || 0, parsedOptions, false);

                        case 32:
                            result = _context6.sent;
                            return _context6.abrupt('return', result);

                        case 36:
                            _context6.prev = 36;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 39:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 36]]);
        }));

        function add(_x6, _x7) {
            return _ref6.apply(this, arguments);
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
     * 查询后新增
     * @param data
     * @param options
     */


    _class.prototype.thenAdd = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(data, options) {
            var record;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;

                            if (!_lib2.default.isEmpty(data)) {
                                _context7.next = 3;
                                break;
                            }

                            return _context7.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context7.next = 5;
                            return this.find(options);

                        case 5:
                            record = _context7.sent;

                            if (!_lib2.default.isEmpty(record)) {
                                _context7.next = 8;
                                break;
                            }

                            return _context7.abrupt('return', this.add(data, options));

                        case 8:
                            return _context7.abrupt('return', null);

                        case 11:
                            _context7.prev = 11;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t0));

                        case 14:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 11]]);
        }));

        function thenAdd(_x8, _x9) {
            return _ref7.apply(this, arguments);
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
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            var parsedOptions, model, result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.prev = 0;
                            _context8.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context8.sent;

                            if (!_lib2.default.isEmpty(parsedOptions.where)) {
                                _context8.next = 6;
                                break;
                            }

                            return _context8.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 6:
                            _context8.next = 8;
                            return this.initModel();

                        case 8:
                            model = _context8.sent;
                            _context8.next = 11;
                            return this._beforeDelete(parsedOptions);

                        case 11:
                            _context8.next = 13;
                            return model.delete(parsedOptions);

                        case 13:
                            result = _context8.sent;
                            _context8.next = 16;
                            return this._afterDelete(parsedOptions);

                        case 16:
                            _context8.next = 18;
                            return this._parseData(result || [], parsedOptions, false);

                        case 18:
                            result = _context8.sent;
                            return _context8.abrupt('return', result);

                        case 22:
                            _context8.prev = 22;
                            _context8.t0 = _context8['catch'](0);
                            return _context8.abrupt('return', this.error(_context8.t0));

                        case 25:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this, [[0, 22]]);
        }));

        function _delete(_x10) {
            return _ref8.apply(this, arguments);
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
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(data, options) {
            var parsedOptions, model, pk, result;
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
                            return this.initModel();

                        case 6:
                            model = _context9.sent;

                            //copy data
                            this.__data = _lib2.default.extend({}, data);
                            _context9.next = 10;
                            return this._beforeUpdate(this.__data, parsedOptions);

                        case 10:
                            this.__data = _context9.sent;
                            _context9.next = 13;
                            return this._parseData(this.__data, parsedOptions);

                        case 13:
                            this.__data = _context9.sent;

                            if (!_lib2.default.isEmpty(this.__data)) {
                                _context9.next = 16;
                                break;
                            }

                            return _context9.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 16:
                            _context9.next = 18;
                            return this.getPk();

                        case 18:
                            pk = _context9.sent;

                            if (!_lib2.default.isEmpty(parsedOptions.where)) {
                                _context9.next = 29;
                                break;
                            }

                            if (_lib2.default.isEmpty(this.__data[pk])) {
                                _context9.next = 26;
                                break;
                            }

                            parsedOptions.where = {};
                            parsedOptions.where[pk] = this.__data[pk];
                            delete this.__data[pk];
                            _context9.next = 27;
                            break;

                        case 26:
                            return _context9.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 27:
                            _context9.next = 30;
                            break;

                        case 29:
                            if (!_lib2.default.isEmpty(this.__data[pk])) {
                                delete this.__data[pk];
                            }

                        case 30:
                            _context9.next = 32;
                            return model.update(this.__data, parsedOptions);

                        case 32:
                            result = _context9.sent;

                            if (_lib2.default.isEmpty(this.__relationData)) {
                                _context9.next = 36;
                                break;
                            }

                            _context9.next = 36;
                            return this.__postRelationData(model, result, parsedOptions, this.__relationData, 'UPDATE');

                        case 36:
                            _context9.next = 38;
                            return this._afterUpdate(this.__data, parsedOptions);

                        case 38:
                            _context9.next = 40;
                            return this._parseData(result || [], parsedOptions, false);

                        case 40:
                            result = _context9.sent;
                            return _context9.abrupt('return', result);

                        case 44:
                            _context9.prev = 44;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 47:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 44]]);
        }));

        function update(_x11, _x12) {
            return _ref9.apply(this, arguments);
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
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(options) {
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
                            _context10.next = 9;
                            return this.initModel();

                        case 9:
                            model = _context10.sent;
                            _context10.next = 12;
                            return model.count(pk, parsedOptions);

                        case 12:
                            result = _context10.sent;
                            _context10.next = 15;
                            return this._parseData(result || 0, parsedOptions, false);

                        case 15:
                            result = _context10.sent;
                            return _context10.abrupt('return', result);

                        case 19:
                            _context10.prev = 19;
                            _context10.t0 = _context10['catch'](0);
                            return _context10.abrupt('return', this.error(_context10.t0));

                        case 22:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this, [[0, 19]]);
        }));

        function count(_x13) {
            return _ref10.apply(this, arguments);
        }

        return count;
    }();

    /**
     * 统计数据数量和
     * sum('xxx')
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(field, options) {
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
                            return this.initModel();

                        case 10:
                            model = _context11.sent;
                            _context11.next = 13;
                            return model.sum(field, parsedOptions);

                        case 13:
                            result = _context11.sent;
                            _context11.next = 16;
                            return this._parseData(result || 0, parsedOptions, false);

                        case 16:
                            result = _context11.sent;
                            return _context11.abrupt('return', result);

                        case 20:
                            _context11.prev = 20;
                            _context11.t0 = _context11['catch'](0);
                            return _context11.abrupt('return', this.error(_context11.t0));

                        case 23:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this, [[0, 20]]);
        }));

        function sum(_x14, _x15) {
            return _ref11.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(options) {
            var parsedOptions, model, result;
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
                            return this.initModel();

                        case 6:
                            model = _context12.sent;
                            _context12.next = 9;
                            return model.find(parsedOptions);

                        case 9:
                            result = _context12.sent;
                            _context12.next = 12;
                            return this._parseData(result, parsedOptions, false);

                        case 12:
                            result = _context12.sent;

                            result = (_lib2.default.isArray(result) ? result[0] : result) || {};

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context12.next = 18;
                                break;
                            }

                            _context12.next = 17;
                            return this.__getRelationData(model, parsedOptions, result);

                        case 17:
                            result = _context12.sent;

                        case 18:
                            _context12.next = 20;
                            return this._afterFind(result, parsedOptions);

                        case 20:
                            return _context12.abrupt('return', result);

                        case 23:
                            _context12.prev = 23;
                            _context12.t0 = _context12['catch'](0);
                            return _context12.abrupt('return', this.error(_context12.t0));

                        case 26:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this, [[0, 23]]);
        }));

        function find(_x16) {
            return _ref12.apply(this, arguments);
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
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(options) {
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
                            return this.initModel();

                        case 6:
                            model = _context13.sent;
                            _context13.next = 9;
                            return model.select(parsedOptions);

                        case 9:
                            result = _context13.sent;
                            _context13.next = 12;
                            return this._parseData(result || [], parsedOptions, false);

                        case 12:
                            result = _context13.sent;

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context13.next = 17;
                                break;
                            }

                            _context13.next = 16;
                            return this.__getRelationData(model, parsedOptions, result);

                        case 16:
                            result = _context13.sent;

                        case 17:
                            _context13.next = 19;
                            return this._afterSelect(result, parsedOptions);

                        case 19:
                            return _context13.abrupt('return', result);

                        case 22:
                            _context13.prev = 22;
                            _context13.t0 = _context13['catch'](0);
                            return _context13.abrupt('return', this.error(_context13.t0));

                        case 25:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[0, 22]]);
        }));

        function select(_x17) {
            return _ref13.apply(this, arguments);
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
        var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(options, pageFlag) {
            var parsedOptions, countNum, pageOptions, totalPage, offset, result;
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            _context14.prev = 0;

                            if (_lib2.default.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            _context14.next = 4;
                            return this._parseOptions(options);

                        case 4:
                            parsedOptions = _context14.sent;
                            _context14.next = 7;
                            return this.count(parsedOptions);

                        case 7:
                            countNum = _context14.sent;
                            pageOptions = parsedOptions.page;
                            totalPage = Math.ceil(countNum / pageOptions.num);

                            if (_lib2.default.isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                            }
                            //传入分页参数
                            offset = pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;

                            parsedOptions.limit = [offset, pageOptions.num];
                            result = _lib2.default.extend(false, { count: countNum, total: totalPage }, pageOptions);
                            _context14.next = 16;
                            return this.select(parsedOptions);

                        case 16:
                            result.data = _context14.sent;
                            _context14.next = 19;
                            return this._parseData(result, parsedOptions, false);

                        case 19:
                            result = _context14.sent;
                            return _context14.abrupt('return', result);

                        case 23:
                            _context14.prev = 23;
                            _context14.t0 = _context14['catch'](0);
                            return _context14.abrupt('return', this.error(_context14.t0));

                        case 26:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this, [[0, 23]]);
        }));

        function countSelect(_x18, _x19) {
            return _ref14.apply(this, arguments);
        }

        return countSelect;
    }();

    /**
     * 解析参数
     * @param oriOpts
     * @param extraOptions
     * @returns {*}
     * @private
     */


    _class.prototype._parseOptions = function _parseOptions(oriOpts, extraOptions) {
        try {
            var options = void 0;
            if (_lib2.default.isScalar(oriOpts)) {
                options = _lib2.default.extend({}, this.__options);
            } else {
                options = _lib2.default.extend({}, this.__options, oriOpts, extraOptions);
            }
            //查询过后清空sql表达式组装 避免影响下次查询
            this.__options = {};
            //获取表名
            options.table = options.table || this.tableName;
            //模型名称
            options.name = options.name || this.modelName;
            //模型主键
            options.pk = options.pk || this.getPk();
            //解析field,根据model的fields进行过滤
            var field = [];
            if (_lib2.default.isEmpty(options.field) && !_lib2.default.isEmpty(options.fields)) options.field = options.fields;
            //解析分页
            if (options['page']) {
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
        } catch (e) {
            return this.error(e);
        }
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

        try {
            if (preCheck) {
                //根据模型定义字段类型进行数据检查
                var result = [];
                for (var _field2 in data) {
                    if (this.fields[_field2] && this.fields[_field2].type) {
                        //字段默认值处理
                        _lib2.default.isEmpty(data[_field2]) && (data[_field2] = this.fields[_field2].defaultTo ? this.fields[_field2].defaultTo : data[_field2]);
                        //字段类型严格验证
                        switch (this.fields[_field2].type) {
                            case 'integer':
                            case 'float':
                                !_lib2.default.isNumber(data[_field2]) && result.push(_field2 + '值类型错误');
                                break;
                            case 'json':
                                !_lib2.default.isJSONObj(data[_field2]) && !_lib2.default.isJSONStr(data[_field2]) && result.push(_field2 + '值类型错误');
                                break;
                            case 'string':
                            case 'text':
                                !_lib2.default.isString(data[_field2]) && result.push(_field2 + '值类型错误');
                                break;
                            default:
                                break;
                        }
                    } else {
                        //分离关联模型数据
                        if (this.relation[_field2]) {
                            !this.__relationData[_field2] && (this.__relationData[_field2] = {});
                            this.__relationData[_field2] = data[_field2];
                        }
                        //移除未定义的字段
                        delete data[_field2];
                    }
                }
                if (result.length > 0) {
                    return this.error(result[0]);
                }
                //根据自定义规则自动验证数据
                if (_lib2.default.isEmpty(this.validations)) {
                    return data;
                }
                var field = void 0,
                    value = void 0,
                    checkData = [];
                for (field in this.validations) {
                    value = _lib2.default.extend(this.validations[field], { name: field, value: data[field] });
                    checkData.push(value);
                }
                if (_lib2.default.isEmpty(checkData)) {
                    return data;
                }
                result = {};
                result = this.__valid(checkData);
                if (_lib2.default.isEmpty(result)) {
                    return data;
                }
                return this.error((0, _values2.default)(result)[0]);
            } else {
                if (_lib2.default.isJSONObj(data)) {
                    return data;
                } else {
                    return JSON.parse((0, _stringify2.default)(data));
                }
            }
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     *
     * @param adapter
     * @param options
     * @param data
     * @returns {*}
     * @private
     */


    _class.prototype.__getRelationData = function () {
        var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(adapter, options, data) {
            var caseList, relationData, relation, rtype, fkey, config, pk, n, _iterator, _isArray, _i, _ref16, _ref17, k, v;

            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            _context15.prev = 0;
                            caseList = {
                                HASONE: adapter.__getHasOneRelation,
                                HASMANY: adapter.__getHasManyRelation,
                                MANYTOMANY: adapter.__getManyToManyRelation
                            };
                            relationData = data;

                            if (_lib2.default.isEmpty(data)) {
                                _context15.next = 41;
                                break;
                            }

                            relation = options.rel, rtype = void 0, fkey = void 0, config = this.config;
                            _context15.next = 7;
                            return this.getPk();

                        case 7:
                            pk = _context15.sent;
                            _context15.t0 = _regenerator2.default.keys(relation);

                        case 9:
                            if ((_context15.t1 = _context15.t0()).done) {
                                _context15.next = 41;
                                break;
                            }

                            n = _context15.t1.value;

                            rtype = relation[n]['type'];

                            if (!(relation[n].fkey && rtype && rtype in caseList)) {
                                _context15.next = 39;
                                break;
                            }

                            fkey = rtype === 'MANYTOMANY' ? _lib2.default.parseName(relation[n].name) : relation[n].fkey;

                            if (!_lib2.default.isArray(data)) {
                                _context15.next = 36;
                                break;
                            }

                            _iterator = data.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                        case 16:
                            if (!_isArray) {
                                _context15.next = 22;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context15.next = 19;
                                break;
                            }

                            return _context15.abrupt('break', 34);

                        case 19:
                            _ref16 = _iterator[_i++];
                            _context15.next = 26;
                            break;

                        case 22:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context15.next = 25;
                                break;
                            }

                            return _context15.abrupt('break', 34);

                        case 25:
                            _ref16 = _i.value;

                        case 26:
                            _ref17 = _ref16;
                            k = _ref17[0];
                            v = _ref17[1];
                            _context15.next = 31;
                            return caseList[rtype](config, relation[n], data[k]);

                        case 31:
                            data[k][fkey] = _context15.sent;

                        case 32:
                            _context15.next = 16;
                            break;

                        case 34:
                            _context15.next = 39;
                            break;

                        case 36:
                            _context15.next = 38;
                            return caseList[rtype](config, relation[n], data);

                        case 38:
                            data[fkey] = _context15.sent;

                        case 39:
                            _context15.next = 9;
                            break;

                        case 41:
                            return _context15.abrupt('return', relationData);

                        case 44:
                            _context15.prev = 44;
                            _context15.t2 = _context15['catch'](0);
                            return _context15.abrupt('return', this.error(_context15.t2));

                        case 47:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this, [[0, 44]]);
        }));

        function __getRelationData(_x22, _x23, _x24) {
            return _ref15.apply(this, arguments);
        }

        return __getRelationData;
    }();

    /**
     *
     * @param adapter
     * @param result
     * @param options
     * @param relationData
     * @param postType
     * @returns {*}
     * @private
     */


    _class.prototype.__postRelationData = function () {
        var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(adapter, result, options, relationData, postType) {
            var caseList, relation, rtype, config, pk, n;
            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            _context16.prev = 0;
                            caseList = {
                                HASONE: adapter.__postHasOneRelation,
                                HASMANY: adapter.__postHasManyRelation,
                                MANYTOMANY: adapter.__postManyToManyRelation
                            };

                            if (_lib2.default.isEmpty(result)) {
                                _context16.next = 16;
                                break;
                            }

                            relation = _schema2.default.getRelation(this.modelName, this.config), rtype = void 0, config = this.config;
                            _context16.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context16.sent;
                            _context16.t0 = _regenerator2.default.keys(relationData);

                        case 8:
                            if ((_context16.t1 = _context16.t0()).done) {
                                _context16.next = 16;
                                break;
                            }

                            n = _context16.t1.value;

                            rtype = relation[n] ? relation[n]['type'] : null;

                            if (!(relation[n].fkey && rtype && rtype in caseList)) {
                                _context16.next = 14;
                                break;
                            }

                            _context16.next = 14;
                            return caseList[rtype](config, result, options, relation[n], relationData[n], postType);

                        case 14:
                            _context16.next = 8;
                            break;

                        case 16:
                            return _context16.abrupt('return');

                        case 19:
                            _context16.prev = 19;
                            _context16.t2 = _context16['catch'](0);
                            return _context16.abrupt('return', this.error(_context16.t2));

                        case 22:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, this, [[0, 19]]);
        }));

        function __postRelationData(_x25, _x26, _x27, _x28, _x29) {
            return _ref18.apply(this, arguments);
        }

        return __postRelationData;
    }();

    return _class;
}(_base3.default);

exports.default = _class;