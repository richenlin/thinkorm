'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

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
            //lib.log(msg);
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

                            if (!this.safe) {
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
                            return this.__parseOptions(options);

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
                            return this.__checkData(this.__data, parsedOptions, 'ADD');

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
                            return _context6.abrupt('return', this.__data[pk] || 0);

                        case 33:
                            _context6.prev = 33;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 36:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 33]]);
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
                            return this.__parseOptions(options);

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
                            return _context8.abrupt('return', result || []);

                        case 19:
                            _context8.prev = 19;
                            _context8.t0 = _context8['catch'](0);
                            return _context8.abrupt('return', this.error(_context8.t0));

                        case 22:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this, [[0, 19]]);
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
                            return this.__parseOptions(options);

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
                            return this.__checkData(this.__data, parsedOptions, 'UPDATE');

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
                            return _context9.abrupt('return', result || []);

                        case 41:
                            _context9.prev = 41;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 44:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 41]]);
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
     * 字段自增
     * @param field
     * @param step
     * @param options
     * @returns {*}
     */


    _class.prototype.increment = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(field) {
            var step = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
            var options = arguments[2];

            var _lib$extend, parsedOptions, model, result;

            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            _context10.prev = 0;
                            _context10.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context10.sent;
                            _context10.next = 6;
                            return this.initModel();

                        case 6:
                            model = _context10.sent;

                            //copy data
                            this.__data = _lib2.default.extend({}, (_lib$extend = {}, _lib$extend[field] = step, _lib$extend));
                            _context10.next = 10;
                            return this._beforeUpdate(this.__data, parsedOptions);

                        case 10:
                            this.__data = _context10.sent;
                            _context10.next = 13;
                            return this.__checkData(this.__data, parsedOptions, 'UPDATE');

                        case 13:
                            this.__data = _context10.sent;

                            if (!_lib2.default.isEmpty(this.__data)) {
                                _context10.next = 16;
                                break;
                            }

                            return _context10.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 16:
                            _context10.next = 18;
                            return model.increment(this.__data, field, parsedOptions);

                        case 18:
                            result = _context10.sent;
                            _context10.next = 21;
                            return this._afterUpdate(this.__data, parsedOptions);

                        case 21:
                            return _context10.abrupt('return', result || []);

                        case 24:
                            _context10.prev = 24;
                            _context10.t0 = _context10['catch'](0);
                            return _context10.abrupt('return', this.error(_context10.t0));

                        case 27:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this, [[0, 24]]);
        }));

        function increment(_x13, _x14, _x15) {
            return _ref10.apply(this, arguments);
        }

        return increment;
    }();

    /**
     * 字段自减
     * @param field
     * @param step
     * @param options
     * @returns {*}
     */


    _class.prototype.decrement = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(field) {
            var step = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
            var options = arguments[2];

            var _lib$extend2, parsedOptions, model, result;

            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.prev = 0;
                            _context11.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context11.sent;
                            _context11.next = 6;
                            return this.initModel();

                        case 6:
                            model = _context11.sent;

                            //copy data
                            this.__data = _lib2.default.extend({}, (_lib$extend2 = {}, _lib$extend2[field] = step, _lib$extend2));
                            _context11.next = 10;
                            return this._beforeUpdate(this.__data, parsedOptions);

                        case 10:
                            this.__data = _context11.sent;
                            _context11.next = 13;
                            return this.__checkData(this.__data, parsedOptions, 'UPDATE');

                        case 13:
                            this.__data = _context11.sent;

                            if (!_lib2.default.isEmpty(this.__data)) {
                                _context11.next = 16;
                                break;
                            }

                            return _context11.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 16:
                            _context11.next = 18;
                            return model.decrement(this.__data, field, parsedOptions);

                        case 18:
                            result = _context11.sent;
                            _context11.next = 21;
                            return this._afterUpdate(this.__data, parsedOptions);

                        case 21:
                            return _context11.abrupt('return', result || []);

                        case 24:
                            _context11.prev = 24;
                            _context11.t0 = _context11['catch'](0);
                            return _context11.abrupt('return', this.error(_context11.t0));

                        case 27:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this, [[0, 24]]);
        }));

        function decrement(_x17, _x18, _x19) {
            return _ref11.apply(this, arguments);
        }

        return decrement;
    }();

    /**
     * 查询数据条数
     * count('xxx')
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _context12.prev = 0;
                            _context12.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context12.sent;
                            _context12.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context12.sent;
                            _context12.next = 9;
                            return this.initModel();

                        case 9:
                            model = _context12.sent;
                            _context12.next = 12;
                            return model.count(pk, parsedOptions);

                        case 12:
                            result = _context12.sent;
                            return _context12.abrupt('return', result || 0);

                        case 16:
                            _context12.prev = 16;
                            _context12.t0 = _context12['catch'](0);
                            return _context12.abrupt('return', this.error(_context12.t0));

                        case 19:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this, [[0, 16]]);
        }));

        function count(_x21) {
            return _ref12.apply(this, arguments);
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
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(field, options) {
            var parsedOptions, pk, model, result;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            _context13.prev = 0;
                            _context13.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context13.sent;
                            _context13.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context13.sent;

                            field = field || pk;
                            // init model
                            _context13.next = 10;
                            return this.initModel();

                        case 10:
                            model = _context13.sent;
                            _context13.next = 13;
                            return model.sum(field, parsedOptions);

                        case 13:
                            result = _context13.sent;
                            return _context13.abrupt('return', result || 0);

                        case 17:
                            _context13.prev = 17;
                            _context13.t0 = _context13['catch'](0);
                            return _context13.abrupt('return', this.error(_context13.t0));

                        case 20:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[0, 17]]);
        }));

        function sum(_x22, _x23) {
            return _ref13.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(options) {
            var parsedOptions, model, result;
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            _context14.prev = 0;
                            _context14.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context14.sent;
                            _context14.next = 6;
                            return this.initModel();

                        case 6:
                            model = _context14.sent;
                            _context14.next = 9;
                            return model.find(parsedOptions);

                        case 9:
                            result = _context14.sent;
                            _context14.next = 12;
                            return this.__parseData((_lib2.default.isArray(result) ? result[0] : result) || {}, parsedOptions);

                        case 12:
                            result = _context14.sent;

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context14.next = 17;
                                break;
                            }

                            _context14.next = 16;
                            return this.__getRelationData(model, parsedOptions, result);

                        case 16:
                            result = _context14.sent;

                        case 17:
                            _context14.next = 19;
                            return this._afterFind(result, parsedOptions);

                        case 19:
                            return _context14.abrupt('return', result);

                        case 22:
                            _context14.prev = 22;
                            _context14.t0 = _context14['catch'](0);
                            return _context14.abrupt('return', this.error(_context14.t0));

                        case 25:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this, [[0, 22]]);
        }));

        function find(_x24) {
            return _ref14.apply(this, arguments);
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
        var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(options) {
            var parsedOptions, model, result;
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            _context15.prev = 0;
                            _context15.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context15.sent;
                            _context15.next = 6;
                            return this.initModel();

                        case 6:
                            model = _context15.sent;
                            _context15.next = 9;
                            return model.select(parsedOptions);

                        case 9:
                            result = _context15.sent;
                            _context15.next = 12;
                            return this.__parseData(result || [], parsedOptions);

                        case 12:
                            result = _context15.sent;

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context15.next = 17;
                                break;
                            }

                            _context15.next = 16;
                            return this.__getRelationData(model, parsedOptions, result);

                        case 16:
                            result = _context15.sent;

                        case 17:
                            _context15.next = 19;
                            return this._afterSelect(result, parsedOptions);

                        case 19:
                            return _context15.abrupt('return', result);

                        case 22:
                            _context15.prev = 22;
                            _context15.t0 = _context15['catch'](0);
                            return _context15.abrupt('return', this.error(_context15.t0));

                        case 25:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this, [[0, 22]]);
        }));

        function select(_x25) {
            return _ref15.apply(this, arguments);
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
        var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(options, pageFlag) {
            var parsedOptions, countNum, pageOptions, totalPage, offset, result;
            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            _context16.prev = 0;

                            if (_lib2.default.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            _context16.next = 4;
                            return this.__parseOptions(options);

                        case 4:
                            parsedOptions = _context16.sent;
                            _context16.next = 7;
                            return this.count(parsedOptions);

                        case 7:
                            countNum = _context16.sent;
                            pageOptions = parsedOptions.page || { page: 1, num: 10 };
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
                            _context16.next = 16;
                            return this.select(parsedOptions);

                        case 16:
                            result.data = _context16.sent;
                            return _context16.abrupt('return', result);

                        case 20:
                            _context16.prev = 20;
                            _context16.t0 = _context16['catch'](0);
                            return _context16.abrupt('return', this.error(_context16.t0));

                        case 23:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, this, [[0, 20]]);
        }));

        function countSelect(_x26, _x27) {
            return _ref16.apply(this, arguments);
        }

        return countSelect;
    }();

    /**
     * 原生语句查询
     * mysql  TestModel.query('select * from test');
     * mongo  TestModel.query('db.test.find()');
     * @param sqlStr
     */


    _class.prototype.query = function () {
        var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(sqlStr) {
            var model, adpCase, result, quer, tableName;
            return _regenerator2.default.wrap(function _callee17$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            _context17.prev = 0;

                            if (!_lib2.default.isEmpty(sqlStr)) {
                                _context17.next = 3;
                                break;
                            }

                            return _context17.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 3:
                            if (/[&(--);]/.test(sqlStr)) {
                                sqlStr = sqlStr.replace(/&/g, '&amp;').replace(/;/g, '').replace(/--/g, '&minus;&minus;');
                            }
                            // init model
                            _context17.next = 6;
                            return this.initModel();

                        case 6:
                            model = _context17.sent;
                            adpCase = { mongo: 1 }, result = null;

                            if (!adpCase[this.config.db_type]) {
                                _context17.next = 21;
                                break;
                            }

                            quer = sqlStr.split('.');

                            if (!(_lib2.default.isEmpty(quer) || _lib2.default.isEmpty(quer[0]) || quer[0] !== 'db' || _lib2.default.isEmpty(quer[1]))) {
                                _context17.next = 12;
                                break;
                            }

                            return _context17.abrupt('return', this.error('query language error'));

                        case 12:
                            quer.shift();
                            tableName = quer.shift();

                            if (!(tableName !== this.tableName)) {
                                _context17.next = 16;
                                break;
                            }

                            return _context17.abrupt('return', this.error('table name error'));

                        case 16:
                            _context17.next = 18;
                            return model.native(tableName, quer);

                        case 18:
                            result = _context17.sent;
                            _context17.next = 26;
                            break;

                        case 21:
                            if (!(sqlStr.indexOf(this.tableName) === -1)) {
                                _context17.next = 23;
                                break;
                            }

                            return _context17.abrupt('return', this.error('table name error'));

                        case 23:
                            _context17.next = 25;
                            return model.native(sqlStr);

                        case 25:
                            result = _context17.sent;

                        case 26:
                            return _context17.abrupt('return', result);

                        case 29:
                            _context17.prev = 29;
                            _context17.t0 = _context17['catch'](0);
                            return _context17.abrupt('return', this.error(_context17.t0));

                        case 32:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee17, this, [[0, 29]]);
        }));

        function query(_x28) {
            return _ref17.apply(this, arguments);
        }

        return query;
    }();

    /**
     * 解析参数
     * @param oriOpts
     * @param extraOptions
     * @returns {*}
     * @private
     */


    _class.prototype.__parseOptions = function __parseOptions(oriOpts, extraOptions) {
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
            //模型查询别名
            options.alias = this.modelName;
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
            }
            return options;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 数据合法性检测
     * @param data
     * @param options
     * @param method
     * @private
     */


    _class.prototype.__checkData = function __checkData(data, options) {
        var method = arguments.length <= 2 || arguments[2] === undefined ? '' : arguments[2];

        try {
            var adpCase = { mysql: 1 },
                typeCase = { json: 1, array: 1 },
                dataCheckFlag = false,
                ruleCheckFlag = false,
                result = { status: 1, msg: '' },
                fields = this.fields,
                vaildRules = this.validations;
            //根据模型定义字段类型进行数据检查
            for (var field in data) {
                if (!fields[field]) {
                    //分离关联模型数据
                    if (this.relation[field]) {
                        !this.__relationData[field] && (this.__relationData[field] = {});
                        this.__relationData[field] = data[field];
                    }
                    //移除未定义的字段
                    delete data[field];
                }
            }
            //字段默认值处理以及合法性检查
            for (var _field2 in fields) {
                if (method === 'ADD') {
                    //新增数据add
                    _lib2.default.isEmpty(data[_field2]) && fields[_field2].defaultsTo !== undefined && fields[_field2].defaultsTo !== null && (data[_field2] = fields[_field2].defaultsTo);
                    //非主键字段就检查
                    dataCheckFlag = !fields[_field2].primaryKey ? true : false;
                    //定义了规则就检查
                    ruleCheckFlag = vaildRules[_field2] ? true : false;
                } else if (method === 'UPDATE') {
                    //编辑数据update
                    data.hasOwnProperty(_field2) && _lib2.default.isEmpty(data[_field2]) && fields[_field2].defaultsTo !== undefined && fields[_field2].defaultsTo !== null && (data[_field2] = fields[_field2].defaultsTo);
                    //更新包含字段就检查,主键除外(因为主键不会被更新)
                    dataCheckFlag = data.hasOwnProperty(_field2) && !fields[_field2].primaryKey ? true : false;
                    //更新包含字段且定义了规则就检查
                    ruleCheckFlag = data.hasOwnProperty(_field2) && vaildRules[_field2] ? true : false;
                }
                //自定义规则验证
                if (ruleCheckFlag) {
                    result = _valid2.default.ruleCheck(_field2, data[_field2], vaildRules[_field2], method);
                    if (!result.status) {
                        return this.error(result.msg);
                    }
                }

                //严格数据类型检查
                if (dataCheckFlag) {
                    result = _valid2.default.dataCheck(_field2, data[_field2], fields[_field2].type);
                    if (!result.status) {
                        return this.error(result.msg);
                    }
                }

                //处理特殊类型字段
                if (adpCase[this.config.db_type] && data[_field2] && fields[_field2] && typeCase[fields[_field2].type]) {
                    !_lib2.default.isString(data[_field2]) && (data[_field2] = (0, _stringify2.default)(data[_field2]));
                }
            }
            return data;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 操作结果处理
     * @param data
     * @param options
     * @param preCheck
     * @param method
     * @returns {*}
     * @private
     */


    _class.prototype.__parseData = function __parseData(data, options) {
        var _this3 = this;

        var method = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        try {
            var _ret2 = function () {
                var adpCase = { mysql: 1 },
                    typeCase = { json: 1, array: 1 },
                    fields = _this3.fields;
                //处理特殊类型字段
                if (adpCase[_this3.config.db_type]) {
                    if (_lib2.default.isArray(data)) {
                        data.map(function (item) {
                            for (var n in item) {
                                if (fields[n] && typeCase[fields[n].type]) {
                                    switch (fields[n].type) {
                                        case 'json':
                                            item[n] = _lib2.default.isEmpty(item[n]) ? {} : JSON.parse(item[n]);
                                            break;
                                        case 'array':
                                            item[n] = _lib2.default.isEmpty(item[n]) ? [] : JSON.parse(item[n]);
                                            break;
                                    }
                                }
                            }
                        });
                    } else if (_lib2.default.isObject(data)) {
                        for (var n in data) {
                            if (fields[n] && typeCase[fields[n].type]) {
                                switch (fields[n].type) {
                                    case 'json':
                                        data[n] = _lib2.default.isEmpty(data[n]) ? {} : JSON.parse(data[n]);
                                        break;
                                    case 'array':
                                        data[n] = _lib2.default.isEmpty(data[n]) ? [] : JSON.parse(data[n]);
                                        break;
                                }
                            }
                        }
                    }
                }
                return {
                    v: data
                };
            }();

            if ((typeof _ret2 === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret2)) === "object") return _ret2.v;
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
        var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(adapter, options, data) {
            var _this4 = this;

            var caseList, relationData;
            return _regenerator2.default.wrap(function _callee19$(_context20) {
                while (1) {
                    switch (_context20.prev = _context20.next) {
                        case 0:
                            _context20.prev = 0;
                            caseList = {
                                HASONE: adapter.__getHasOneRelation,
                                HASMANY: adapter.__getHasManyRelation,
                                MANYTOMANY: adapter.__getManyToManyRelation
                            };
                            relationData = data;

                            if (_lib2.default.isEmpty(data)) {
                                _context20.next = 5;
                                break;
                            }

                            return _context20.delegateYield(_regenerator2.default.mark(function _callee18() {
                                var relation, rtype, fkey, config, ps, pk, _loop, n;

                                return _regenerator2.default.wrap(function _callee18$(_context19) {
                                    while (1) {
                                        switch (_context19.prev = _context19.next) {
                                            case 0:
                                                relation = options.rel, rtype = void 0, fkey = void 0, config = _this4.config, ps = [];
                                                _context19.next = 3;
                                                return _this4.getPk();

                                            case 3:
                                                pk = _context19.sent;
                                                _loop = _regenerator2.default.mark(function _loop(n) {
                                                    var _loop2, _iterator, _isArray, _i, _ref19, _ret5;

                                                    return _regenerator2.default.wrap(function _loop$(_context18) {
                                                        while (1) {
                                                            switch (_context18.prev = _context18.next) {
                                                                case 0:
                                                                    rtype = relation[n]['type'];

                                                                    if (!(relation[n].fkey && rtype && rtype in caseList)) {
                                                                        _context18.next = 18;
                                                                        break;
                                                                    }

                                                                    fkey = rtype === 'MANYTOMANY' ? _lib2.default.parseName(relation[n].name) : relation[n].fkey;

                                                                    if (!_lib2.default.isArray(data)) {
                                                                        _context18.next = 15;
                                                                        break;
                                                                    }

                                                                    _loop2 = function _loop2() {
                                                                        if (_isArray) {
                                                                            if (_i >= _iterator.length) return 'break';
                                                                            _ref19 = _iterator[_i++];
                                                                        } else {
                                                                            _i = _iterator.next();
                                                                            if (_i.done) return 'break';
                                                                            _ref19 = _i.value;
                                                                        }

                                                                        var _ref20 = _ref19;
                                                                        var k = _ref20[0];
                                                                        var v = _ref20[1];

                                                                        ps.push(caseList[rtype](config, relation[n], data[k]).then(function (res) {
                                                                            data[k][relation[n]['name']] = res;
                                                                        }));
                                                                        //data[k][relation[n]['name']] = await caseList[rtype](config, relation[n], data[k]);
                                                                    };

                                                                    _iterator = data.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                                                                case 6:
                                                                    _ret5 = _loop2();

                                                                    if (!(_ret5 === 'break')) {
                                                                        _context18.next = 9;
                                                                        break;
                                                                    }

                                                                    return _context18.abrupt('break', 11);

                                                                case 9:
                                                                    _context18.next = 6;
                                                                    break;

                                                                case 11:
                                                                    _context18.next = 13;
                                                                    return _promise2.default.all(ps);

                                                                case 13:
                                                                    _context18.next = 18;
                                                                    break;

                                                                case 15:
                                                                    _context18.next = 17;
                                                                    return caseList[rtype](config, relation[n], data);

                                                                case 17:
                                                                    data[relation[n]['name']] = _context18.sent;

                                                                case 18:
                                                                case 'end':
                                                                    return _context18.stop();
                                                            }
                                                        }
                                                    }, _loop, _this4);
                                                });
                                                _context19.t0 = _regenerator2.default.keys(relation);

                                            case 6:
                                                if ((_context19.t1 = _context19.t0()).done) {
                                                    _context19.next = 11;
                                                    break;
                                                }

                                                n = _context19.t1.value;
                                                return _context19.delegateYield(_loop(n), 't2', 9);

                                            case 9:
                                                _context19.next = 6;
                                                break;

                                            case 11:
                                            case 'end':
                                                return _context19.stop();
                                        }
                                    }
                                }, _callee18, _this4);
                            })(), 't0', 5);

                        case 5:
                            return _context20.abrupt('return', relationData);

                        case 8:
                            _context20.prev = 8;
                            _context20.t1 = _context20['catch'](0);
                            return _context20.abrupt('return', this.error(_context20.t1));

                        case 11:
                        case 'end':
                            return _context20.stop();
                    }
                }
            }, _callee19, this, [[0, 8]]);
        }));

        function __getRelationData(_x31, _x32, _x33) {
            return _ref18.apply(this, arguments);
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
        var _ref21 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(adapter, result, options, relationData, postType) {
            var caseList, ps, relation, rtype, config, pk, n;
            return _regenerator2.default.wrap(function _callee20$(_context21) {
                while (1) {
                    switch (_context21.prev = _context21.next) {
                        case 0:
                            _context21.prev = 0;
                            caseList = {
                                HASONE: adapter.__postHasOneRelation,
                                HASMANY: adapter.__postHasManyRelation,
                                MANYTOMANY: adapter.__postManyToManyRelation
                            }, ps = [];

                            if (_lib2.default.isEmpty(result)) {
                                _context21.next = 8;
                                break;
                            }

                            relation = _schema2.default.getRelation(this.modelName, this.config), rtype = void 0, config = this.config;
                            _context21.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context21.sent;

                            for (n in relationData) {
                                rtype = relation[n] ? relation[n]['type'] : null;
                                if (relation[n].fkey && rtype && rtype in caseList) {
                                    ps.push(caseList[rtype](config, result, options, relation[n], relationData[n], postType));
                                }
                            }

                        case 8:
                            return _context21.abrupt('return', _promise2.default.all(ps));

                        case 11:
                            _context21.prev = 11;
                            _context21.t0 = _context21['catch'](0);
                            return _context21.abrupt('return', this.error(_context21.t0));

                        case 14:
                        case 'end':
                            return _context21.stop();
                    }
                }
            }, _callee20, this, [[0, 11]]);
        }));

        function __postRelationData(_x34, _x35, _x36, _x37, _x38) {
            return _ref21.apply(this, arguments);
        }

        return __postRelationData;
    }();

    return _class;
}(_base3.default);

exports.default = _class;