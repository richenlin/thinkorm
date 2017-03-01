'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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
var forceNewNum = 1;

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    /**
     * init
     * @param config
     */
    _class.prototype.init = function init() {
        var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

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
            db_timeout: config.db_timeout,
            db_ext_config: config.db_ext_config || {}
        };
        // 模型名
        this.modelName = this.getModelName();
        // 表名
        this.tableName = this.getTableName();
    };

    /**
     * load realpath model class files
     * @param args
     * @returns {type[]}
     */


    _class.require = function require() {
        return _lib2.default.thinkRequire.apply(_lib2.default, arguments);
    };

    /**
     * load collection
     * @param args
     * @returns {*}
     */


    _class.setCollection = function setCollection() {
        return _schema2.default.setCollection.apply(_schema2.default, arguments);
    };

    /**
     * auto migrate all model structure to database
     * @param args
     * @returns {*|{get}}
     */


    _class.migrate = function migrate() {
        return _schema2.default.migrate.apply(_schema2.default, arguments);
    };

    /**
     * 初始化
     * @param forceNew
     * @returns {*}
     */


    _class.prototype.initDB = function initDB() {
        var forceNew = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        try {
            //check collection
            if (!ORM.collections[this.modelName]) {
                return this.error('Collections ' + this.modelName + ' is undefined.');
            }
            //set db
            if (_lib2.default.isObject(forceNew)) {
                this.instances = forceNew;
                return _promise2.default.resolve(this);
            }
            if (this.instances && !forceNew) {
                return _promise2.default.resolve(this.instances);
            }
            var adapterList = {
                mysql: __dirname + _lib2.default.sep + 'Adapter' + _lib2.default.sep + 'mysql.js',
                postgresql: __dirname + _lib2.default.sep + 'Adapter' + _lib2.default.sep + 'postgresql.js',
                mongo: __dirname + _lib2.default.sep + 'Adapter' + _lib2.default.sep + 'mongo.js'
            },
                config = this.config,
                dbType = config.db_type ? config.db_type.toLowerCase() : '';
            if (!dbType in adapterList) {
                return this.error('adapter ' + dbType + ' is not support.');
            }

            if (forceNew) {
                config.db_ext_config['forceNewNum'] = forceNewNum++;
            }
            this.instances = new (_lib2.default.thinkRequire(adapterList[dbType]))(config);
            return _promise2.default.resolve(this.instances);
        } catch (e) {
            return this.error(e);
        }
    };

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
     * @returns {*}
     */


    _class.prototype.getModelName = function getModelName() {
        try {
            if (!this.modelName) {
                var filename = this.__filename;
                var last = filename.lastIndexOf(_lib2.default.sep);
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
        var _this2 = this;

        try {
            if (!_lib2.default.isEmpty(this.fields)) {
                for (var v in this.fields) {
                    (function (t) {
                        if (_this2.fields[t].hasOwnProperty('primaryKey') && _this2.fields[t].primaryKey === true) {
                            _this2.pk = t;
                        }
                    })(v);
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
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(_field) {
        try {
            if (!_field) {
                return this;
            }
            if (_lib2.default.isString(_field)) {
                _field = _field.replace(/ +/g, '').split(',');
            }
            if (_lib2.default.isArray(_field)) {
                this.__options.field = this.__options.field ? _lib2.default.extend(false, this.__options.field, _field) : _field;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 表别名
     * @param alias
     */


    _class.prototype.alias = function alias(_alias) {
        try {
            if (!_alias) {
                return this;
            }
            if (_lib2.default.isString(_alias)) {
                this.__options.alias = this.__options.alias ? _lib2.default.extend(false, this.__options.alias, _alias) : _alias;
            }
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
            if (_lib2.default.isObject(_where)) {
                this.__options.where = this.__options.where ? _lib2.default.extend(false, this.__options.where, _where) : _where;
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
            this.__options.limit = this.__options.limit ? _lib2.default.extend(false, this.__options.limit, [offset, length]) : [offset, length];
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
            if (!_order) {
                return this;
            }
            if (_lib2.default.isString(_order)) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","');
                };
                _order = JSON.parse(strToObj(_order));
            }
            if (_lib2.default.isObject(_order)) {
                this.__options.order = this.__options.order ? _lib2.default.extend(false, this.__options.order, _order) : _order;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * group查询
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param group
     */


    _class.prototype.group = function group(_group) {
        try {
            if (!_group) {
                return this;
            }
            if (_lib2.default.isString(_group) || _lib2.default.isArray(_group)) {
                this.__options.group = this.__options.group ? _lib2.default.extend(false, this.__options.group, _group) : _group;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * join查询
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'Test', alias: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'Test', alias: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param join
     */


    _class.prototype.join = function join(_join) {
        try {
            if (!_join) {
                return this;
            }
            if (_lib2.default.isArray(_join)) {
                this.__options.join = this.__options.join ? _lib2.default.extend(false, this.__options.join, _join) : _join;
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 分页
     * @return {[type]} [description]
     */


    _class.prototype.page = function page(_page, listRows) {
        try {
            if (_page === undefined) {
                return this;
            }
            if (_lib2.default.isArray(_page)) {
                listRows = _page[1];
                _page = _page[0];
            }
            this.__options.page = this.__options.page ? _lib2.default.extend(false, this.__options.page, {
                page: _page || 1,
                num: listRows || 10
            }) : { page: _page || 1, num: listRows || 10 };
            return this;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 关联操作
     * @param relation
     * @param field
     */


    _class.prototype.rel = function rel() {
        var _this3 = this;

        var relation = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
        var field = arguments[1];

        try {
            if (_lib2.default.isObject(relation)) {
                this.__options.rel = relation;
                return this;
            }
            if (_lib2.default.isArray(relation) && field === undefined) {
                field = relation[0];
                relation = relation[1];
            }
            if (!_lib2.default.isEmpty(relation)) {
                //获取关联关系
                var rels = _schema2.default.getRelation(this.modelName, this.config);
                if (relation === true) {
                    this.__options.rel = rels;
                } else {
                    if (_lib2.default.isString(relation)) {
                        relation = relation.replace(/ +/g, '').split(',');
                    }
                    if (_lib2.default.isArray(relation)) {
                        this.__options.rel = {};
                        relation.forEach(function (item) {
                            if (rels[item]) {
                                _this3.__options.rel[item] = rels[item];
                                //关联表自动筛选
                                if (field && field[item]) {
                                    _this3.__options.rel[item]['field'] = field[item];
                                }
                            }
                        });
                    }
                }
            }
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
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.add = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parsedOptions, db, __data, result, pk;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;

                            if (!_lib2.default.isEmpty(data)) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context.next = 5;
                            return this.__parseOptions(options);

                        case 5:
                            parsedOptions = _context.sent;
                            _context.next = 8;
                            return this.initDB();

                        case 8:
                            db = _context.sent;

                            //copy data
                            __data = _lib2.default.extend({}, data);
                            _context.next = 12;
                            return this._beforeAdd(__data, parsedOptions);

                        case 12:
                            __data = _context.sent;
                            _context.next = 15;
                            return this.__checkData(db, __data, parsedOptions, 'ADD');

                        case 15:
                            __data = _context.sent;

                            if (!_lib2.default.isEmpty(__data)) {
                                _context.next = 18;
                                break;
                            }

                            return _context.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 18:
                            _context.next = 20;
                            return db.add(__data, parsedOptions);

                        case 20:
                            result = _context.sent;
                            pk = this.getPk();


                            __data[pk] = __data[pk] ? __data[pk] : result;
                            // if (!lib.isEmpty(this.__relationData)) {

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context.next = 26;
                                break;
                            }

                            _context.next = 26;
                            return this.__postRelationData(db, result, parsedOptions, data, 'ADD');

                        case 26:
                            _context.next = 28;
                            return this._afterAdd(__data, parsedOptions);

                        case 28:
                            return _context.abrupt('return', __data[pk] || 0);

                        case 31:
                            _context.prev = 31;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(_context.t0));

                        case 34:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 31]]);
        }));

        function add(_x4, _x5) {
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
     * 查询后新增
     * @param data
     * @param options
     */


    _class.prototype.thenAdd = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            var record;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;

                            if (!_lib2.default.isEmpty(data)) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context2.next = 5;
                            return this.find(options);

                        case 5:
                            record = _context2.sent;

                            if (!_lib2.default.isEmpty(record)) {
                                _context2.next = 8;
                                break;
                            }

                            return _context2.abrupt('return', this.add(data, options));

                        case 8:
                            return _context2.abrupt('return', null);

                        case 11:
                            _context2.prev = 11;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', this.error(_context2.t0));

                        case 14:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[0, 11]]);
        }));

        function thenAdd(_x6, _x7) {
            return _ref2.apply(this, arguments);
        }

        return thenAdd;
    }();

    /**
     * 数据删除之前操作，可以返回一个promise
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
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(options) {
            var parsedOptions, db, result;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context3.sent;

                            if (!_lib2.default.isEmpty(parsedOptions.where)) {
                                _context3.next = 6;
                                break;
                            }

                            return _context3.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 6:
                            _context3.next = 8;
                            return this.initDB();

                        case 8:
                            db = _context3.sent;
                            _context3.next = 11;
                            return this._beforeDelete(parsedOptions);

                        case 11:
                            _context3.next = 13;
                            return db.delete(parsedOptions);

                        case 13:
                            result = _context3.sent;
                            _context3.next = 16;
                            return this._afterDelete(parsedOptions);

                        case 16:
                            return _context3.abrupt('return', result || []);

                        case 19:
                            _context3.prev = 19;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t0));

                        case 22:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 19]]);
        }));

        function _delete(_x8) {
            return _ref3.apply(this, arguments);
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
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(data, options) {
            var parsedOptions, db, __data, pk, result;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context4.sent;
                            _context4.next = 6;
                            return this.initDB();

                        case 6:
                            db = _context4.sent;

                            //copy data
                            __data = _lib2.default.extend({}, data);
                            _context4.next = 10;
                            return this._beforeUpdate(__data, parsedOptions);

                        case 10:
                            __data = _context4.sent;
                            _context4.next = 13;
                            return this.__checkData(db, __data, parsedOptions, 'UPDATE');

                        case 13:
                            __data = _context4.sent;

                            if (!_lib2.default.isEmpty(__data)) {
                                _context4.next = 16;
                                break;
                            }

                            return _context4.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 16:
                            pk = this.getPk();
                            // 如果存在主键数据 则自动作为更新条件

                            if (!_lib2.default.isEmpty(parsedOptions.where)) {
                                _context4.next = 27;
                                break;
                            }

                            if (_lib2.default.isEmpty(__data[pk])) {
                                _context4.next = 24;
                                break;
                            }

                            parsedOptions.where = {};
                            parsedOptions.where[pk] = __data[pk];
                            delete __data[pk];
                            _context4.next = 25;
                            break;

                        case 24:
                            return _context4.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 25:
                            _context4.next = 28;
                            break;

                        case 27:
                            if (!_lib2.default.isEmpty(__data[pk])) {
                                delete __data[pk];
                            }

                        case 28:
                            _context4.next = 30;
                            return db.update(__data, parsedOptions);

                        case 30:
                            result = _context4.sent;

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context4.next = 34;
                                break;
                            }

                            _context4.next = 34;
                            return this.__postRelationData(db, result, parsedOptions, data, 'UPDATE');

                        case 34:
                            _context4.next = 36;
                            return this._afterUpdate(__data, parsedOptions);

                        case 36:
                            return _context4.abrupt('return', result || []);

                        case 39:
                            _context4.prev = 39;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(_context4.t0));

                        case 42:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 39]]);
        }));

        function update(_x9, _x10) {
            return _ref4.apply(this, arguments);
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
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(field) {
            var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var options = arguments[2];

            var _lib$extend, parsedOptions, db, __data, result;

            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context5.sent;
                            _context5.next = 6;
                            return this.initDB();

                        case 6:
                            db = _context5.sent;

                            //copy data
                            __data = _lib2.default.extend({}, (_lib$extend = {}, _lib$extend[field] = step, _lib$extend));
                            _context5.next = 10;
                            return this._beforeUpdate(__data, parsedOptions);

                        case 10:
                            __data = _context5.sent;
                            _context5.next = 13;
                            return this.__checkData(db, __data, parsedOptions, 'UPDATE');

                        case 13:
                            __data = _context5.sent;

                            if (!_lib2.default.isEmpty(__data)) {
                                _context5.next = 16;
                                break;
                            }

                            return _context5.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 16:
                            _context5.next = 18;
                            return db.increment(__data, field, parsedOptions);

                        case 18:
                            result = _context5.sent;
                            _context5.next = 21;
                            return this._afterUpdate(__data, parsedOptions);

                        case 21:
                            return _context5.abrupt('return', result || []);

                        case 24:
                            _context5.prev = 24;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(_context5.t0));

                        case 27:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 24]]);
        }));

        function increment(_x11) {
            return _ref5.apply(this, arguments);
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
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(field) {
            var step = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
            var options = arguments[2];

            var _lib$extend2, parsedOptions, db, __data, result;

            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;
                            _context6.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context6.sent;
                            _context6.next = 6;
                            return this.initDB();

                        case 6:
                            db = _context6.sent;

                            //copy data
                            __data = _lib2.default.extend({}, (_lib$extend2 = {}, _lib$extend2[field] = step, _lib$extend2));
                            _context6.next = 10;
                            return this._beforeUpdate(__data, parsedOptions);

                        case 10:
                            __data = _context6.sent;
                            _context6.next = 13;
                            return this.__checkData(db, __data, parsedOptions, 'UPDATE');

                        case 13:
                            __data = _context6.sent;

                            if (!_lib2.default.isEmpty(__data)) {
                                _context6.next = 16;
                                break;
                            }

                            return _context6.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 16:
                            _context6.next = 18;
                            return db.decrement(__data, field, parsedOptions);

                        case 18:
                            result = _context6.sent;
                            _context6.next = 21;
                            return this._afterUpdate(__data, parsedOptions);

                        case 21:
                            return _context6.abrupt('return', result || []);

                        case 24:
                            _context6.prev = 24;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 27:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 24]]);
        }));

        function decrement(_x13) {
            return _ref6.apply(this, arguments);
        }

        return decrement;
    }();

    /**
     * 查询数据条数
     * count('xxx', {})
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(field, options) {
            var parsedOptions, db, result;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            _context7.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context7.sent;
                            _context7.next = 6;
                            return this.initDB();

                        case 6:
                            db = _context7.sent;
                            _context7.next = 9;
                            return db.count(field, parsedOptions);

                        case 9:
                            result = _context7.sent;
                            return _context7.abrupt('return', result || 0);

                        case 13:
                            _context7.prev = 13;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t0));

                        case 16:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 13]]);
        }));

        function count(_x15, _x16) {
            return _ref7.apply(this, arguments);
        }

        return count;
    }();

    /**
     * 统计数据数量和
     * sum('xxx', {})
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(field, options) {
            var parsedOptions, db, result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.prev = 0;
                            _context8.next = 3;
                            return this.__parseOptions(options);

                        case 3:
                            parsedOptions = _context8.sent;
                            _context8.next = 6;
                            return this.initDB();

                        case 6:
                            db = _context8.sent;
                            _context8.next = 9;
                            return db.sum(field, parsedOptions);

                        case 9:
                            result = _context8.sent;
                            return _context8.abrupt('return', result || 0);

                        case 13:
                            _context8.prev = 13;
                            _context8.t0 = _context8['catch'](0);
                            return _context8.abrupt('return', this.error(_context8.t0));

                        case 16:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this, [[0, 13]]);
        }));

        function sum(_x17, _x18) {
            return _ref8.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options) {
            var parsedOptions, db, result;
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
                            return this.initDB();

                        case 6:
                            db = _context9.sent;
                            _context9.next = 9;
                            return db.find(parsedOptions);

                        case 9:
                            result = _context9.sent;
                            _context9.next = 12;
                            return this.__parseData(db, (_lib2.default.isArray(result) ? result[0] : result) || {}, parsedOptions);

                        case 12:
                            result = _context9.sent;

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context9.next = 17;
                                break;
                            }

                            _context9.next = 16;
                            return this.__getRelationData(db, parsedOptions, result);

                        case 16:
                            result = _context9.sent;

                        case 17:
                            _context9.next = 19;
                            return this._afterFind(result, parsedOptions);

                        case 19:
                            return _context9.abrupt('return', result);

                        case 22:
                            _context9.prev = 22;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 25:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 22]]);
        }));

        function find(_x19) {
            return _ref9.apply(this, arguments);
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
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(options) {
            var parsedOptions, db, result;
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
                            return this.initDB();

                        case 6:
                            db = _context10.sent;
                            _context10.next = 9;
                            return db.select(parsedOptions);

                        case 9:
                            result = _context10.sent;
                            _context10.next = 12;
                            return this.__parseData(db, result || [], parsedOptions);

                        case 12:
                            result = _context10.sent;

                            if (_lib2.default.isEmpty(parsedOptions.rel)) {
                                _context10.next = 17;
                                break;
                            }

                            _context10.next = 16;
                            return this.__getRelationData(db, parsedOptions, result);

                        case 16:
                            result = _context10.sent;

                        case 17:
                            _context10.next = 19;
                            return this._afterSelect(result, parsedOptions);

                        case 19:
                            return _context10.abrupt('return', result);

                        case 22:
                            _context10.prev = 22;
                            _context10.t0 = _context10['catch'](0);
                            return _context10.abrupt('return', this.error(_context10.t0));

                        case 25:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this, [[0, 22]]);
        }));

        function select(_x20) {
            return _ref10.apply(this, arguments);
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
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(options, pageFlag) {
            var parsedOptions, countNum, pageOptions, totalPage, offset, result;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.prev = 0;

                            if (_lib2.default.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            _context11.next = 4;
                            return this.__parseOptions(options);

                        case 4:
                            parsedOptions = _context11.sent;
                            _context11.next = 7;
                            return this.count(null, parsedOptions);

                        case 7:
                            countNum = _context11.sent;
                            pageOptions = parsedOptions.page || { page: 1, num: 10 };
                            totalPage = Math.ceil(countNum / pageOptions.num);

                            if (_lib2.default.isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                parsedOptions.page = [pageOptions.page, pageOptions.num];
                            }
                            //传入分页参数
                            offset = pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;

                            parsedOptions.limit = [offset, pageOptions.num];
                            result = _lib2.default.extend(false, { count: countNum, total: totalPage }, pageOptions);
                            _context11.next = 16;
                            return this.select(parsedOptions);

                        case 16:
                            result.data = _context11.sent;
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

        function countSelect(_x21, _x22) {
            return _ref11.apply(this, arguments);
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
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(sqlStr) {
            var db, result;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            _context12.prev = 0;
                            _context12.next = 3;
                            return this.initDB();

                        case 3:
                            db = _context12.sent;
                            _context12.next = 6;
                            return db.native(this.tableName, sqlStr);

                        case 6:
                            result = _context12.sent;
                            return _context12.abrupt('return', result);

                        case 10:
                            _context12.prev = 10;
                            _context12.t0 = _context12['catch'](0);
                            return _context12.abrupt('return', this.error(_context12.t0));

                        case 13:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this, [[0, 10]]);
        }));

        function query(_x23) {
            return _ref12.apply(this, arguments);
        }

        return query;
    }();

    /**
     * transaction exec functions
     * @param  {Function} fn [exec function]
     * @return {Promise}      []
     */


    _class.prototype.transaction = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(fn) {
            var db, result;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            _context13.next = 2;
                            return this.initDB(true);

                        case 2:
                            db = _context13.sent;
                            _context13.prev = 3;
                            _context13.next = 6;
                            return db.startTrans();

                        case 6:
                            _context13.next = 8;
                            return _lib2.default.thinkCo(fn(db));

                        case 8:
                            result = _context13.sent;
                            _context13.next = 11;
                            return db.commit();

                        case 11:
                            return _context13.abrupt('return', result);

                        case 14:
                            _context13.prev = 14;
                            _context13.t0 = _context13['catch'](3);
                            _context13.next = 18;
                            return db.rollback();

                        case 18:
                            return _context13.abrupt('return', this.error(_context13.t0));

                        case 19:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this, [[3, 14]]);
        }));

        function transaction(_x24) {
            return _ref13.apply(this, arguments);
        }

        return transaction;
    }();

    /**
     * 解析查询参数
     * @param oriOpts
     * @param extraOptions
     * @returns {*}
     * @private
     */


    _class.prototype.__parseOptions = function __parseOptions(oriOpts) {
        var _this4 = this;

        var extraOptions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        try {
            //解析扩展写法参数
            if (_lib2.default.isObject(oriOpts)) {
                (function () {
                    var parseCase = { alias: 1, field: 1, where: 1, limit: 1, order: 1, group: 1, join: 1, page: 1, rel: 1 };
                    for (var n in oriOpts) {
                        (function (t) {
                            if (parseCase[t]) {
                                //需要保证上述非中断方法为同步方法
                                _this4[t](oriOpts[t]);
                            }
                        })(n);
                    }
                })();
            }
            var options = void 0;
            options = _lib2.default.extend({}, this.__options, extraOptions);
            //清空__options,避免影响下次查询
            this.__options = {};
            //获取表名
            options.table = this.tableName;
            //模型名称
            options.name = this.modelName;
            //模型查询别名
            options.alias = options.alias || this.modelName;
            //模型主键
            options.pk = this.getPk();
            return options;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 数据合法性检测
     * @param adapter
     * @param data
     * @param options
     * @param method
     * @returns {*}
     * @private
     */


    _class.prototype.__checkData = function __checkData(adapter, data, options) {
        var method = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

        try {
            var dataCheckFlag = false,
                ruleCheckFlag = false,
                result = { status: 1, msg: '' },
                fields = this.fields,
                vaildRules = this.validations;
            // for (let field in data) {
            //     //分离关联模型数据
            //     if (this.relation[field]) {
            //         !this.__relationData[field] && (this.__relationData[field] = {});
            //         this.__relationData[field] = data[field];
            //         if (lib.isArray(this.__relationData[field])) {
            //             for (let [k, v] in this.__relationData[field]) {
            //                 this.__relationData[field][k][this.relation[field]['rkey']] = data[this.relation[field]['rkey']]
            //             }
            //         } else {
            //             this.__relationData[field][this.relation[field]['rkey']] = data[this.relation[field]['rkey']]
            //         }
            //     }
            //     if (!fields[field]) {
            //         //移除未定义的字段
            //         delete data[field];
            //     }
            // }
            //字段默认值处理以及合法性检查
            var _data = {};
            for (var field in fields) {
                if (method === 'ADD') {
                    //新增数据add
                    _lib2.default.isEmpty(data[field]) && fields[field].defaultsTo !== undefined && fields[field].defaultsTo !== null && (data[field] = fields[field].defaultsTo);
                    //非主键字段就检查
                    dataCheckFlag = !fields[field].primaryKey ? true : false;
                    //定义了规则就检查
                    ruleCheckFlag = vaildRules[field] ? true : false;
                } else if (method === 'UPDATE') {
                    //编辑数据update
                    data.hasOwnProperty(field) && _lib2.default.isEmpty(data[field]) && fields[field].defaultsTo !== undefined && fields[field].defaultsTo !== null && (data[field] = fields[field].defaultsTo);
                    //更新包含字段就检查,主键除外(因为主键不会被更新)
                    dataCheckFlag = data.hasOwnProperty(field) && !fields[field].primaryKey ? true : false;
                    //更新包含字段且定义了规则就检查
                    ruleCheckFlag = data.hasOwnProperty(field) && vaildRules[field] ? true : false;
                }
                //自定义规则验证
                if (ruleCheckFlag) {
                    result = _valid2.default.ruleCheck(field, data[field], vaildRules[field], method);
                    if (!result.status) {
                        return this.error(result.msg);
                    }
                }
                //严格数据类型检查
                if (dataCheckFlag) {
                    result = _valid2.default.dataCheck(field, data[field], fields[field].type || 'string');
                    if (!result.status) {
                        return this.error(result.msg);
                    }
                }
                //处理数据源特殊字段
                if (adapter.__checkData && data[field]) {
                    data[field] = adapter.__checkData(data[field], fields[field].type || 'string');
                }
                //新赋值
                data.hasOwnProperty(field) && (_data[field] = data[field]);
            }
            return _data;
        } catch (e) {
            return this.error(e);
        }
    };

    /**
     * 查询结果处理
     * @param adapter
     * @param data
     * @param options
     * @param method
     * @returns {*}
     * @private
     */


    _class.prototype.__parseData = function __parseData(adapter, data, options) {
        var method = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

        try {
            //处理数据源特殊字段
            if (adapter.__parseData) {
                data = adapter.__parseData(data, this.fields);
            }
            return data;
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
        var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(adapter, options, data) {
            var _this5 = this;

            var caseList, relationData;
            return _regenerator2.default.wrap(function _callee15$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            _context16.prev = 0;
                            caseList = {
                                HASONE: adapter.__getHasOneRelation,
                                HASMANY: adapter.__getHasManyRelation,
                                MANYTOMANY: adapter.__getManyToManyRelation
                            };
                            relationData = data;

                            if (_lib2.default.isEmpty(data)) {
                                _context16.next = 5;
                                break;
                            }

                            return _context16.delegateYield(_regenerator2.default.mark(function _callee14() {
                                var relation, rtype, config, ps, pk, _loop, n;

                                return _regenerator2.default.wrap(function _callee14$(_context15) {
                                    while (1) {
                                        switch (_context15.prev = _context15.next) {
                                            case 0:
                                                relation = options.rel, rtype = void 0, config = _this5.config, ps = [];
                                                pk = _this5.getPk();
                                                _loop = _regenerator2.default.mark(function _loop(n) {
                                                    var _loop2, _iterator, _isArray, _i, _ref15, _ret4;

                                                    return _regenerator2.default.wrap(function _loop$(_context14) {
                                                        while (1) {
                                                            switch (_context14.prev = _context14.next) {
                                                                case 0:
                                                                    rtype = relation[n]['type'];

                                                                    if (!(rtype && rtype in caseList)) {
                                                                        _context14.next = 17;
                                                                        break;
                                                                    }

                                                                    if (!_lib2.default.isArray(data)) {
                                                                        _context14.next = 14;
                                                                        break;
                                                                    }

                                                                    _loop2 = function _loop2() {
                                                                        if (_isArray) {
                                                                            if (_i >= _iterator.length) return 'break';
                                                                            _ref15 = _iterator[_i++];
                                                                        } else {
                                                                            _i = _iterator.next();
                                                                            if (_i.done) return 'break';
                                                                            _ref15 = _i.value;
                                                                        }

                                                                        var _ref16 = _ref15,
                                                                            k = _ref16[0],
                                                                            v = _ref16[1];

                                                                        ps.push(caseList[rtype](config, relation[n], data[k]).then(function (res) {
                                                                            data[k][relation[n]['name']] = res;
                                                                        }));
                                                                        //data[k][relation[n]['name']] = await caseList[rtype](config, relation[n], data[k]);
                                                                    };

                                                                    _iterator = data.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                                                                case 5:
                                                                    _ret4 = _loop2();

                                                                    if (!(_ret4 === 'break')) {
                                                                        _context14.next = 8;
                                                                        break;
                                                                    }

                                                                    return _context14.abrupt('break', 10);

                                                                case 8:
                                                                    _context14.next = 5;
                                                                    break;

                                                                case 10:
                                                                    _context14.next = 12;
                                                                    return _promise2.default.all(ps);

                                                                case 12:
                                                                    _context14.next = 17;
                                                                    break;

                                                                case 14:
                                                                    _context14.next = 16;
                                                                    return caseList[rtype](config, relation[n], data);

                                                                case 16:
                                                                    data[relation[n]['name']] = _context14.sent;

                                                                case 17:
                                                                case 'end':
                                                                    return _context14.stop();
                                                            }
                                                        }
                                                    }, _loop, _this5);
                                                });
                                                _context15.t0 = _regenerator2.default.keys(relation);

                                            case 4:
                                                if ((_context15.t1 = _context15.t0()).done) {
                                                    _context15.next = 9;
                                                    break;
                                                }

                                                n = _context15.t1.value;
                                                return _context15.delegateYield(_loop(n), 't2', 7);

                                            case 7:
                                                _context15.next = 4;
                                                break;

                                            case 9:
                                            case 'end':
                                                return _context15.stop();
                                        }
                                    }
                                }, _callee14, _this5);
                            })(), 't0', 5);

                        case 5:
                            return _context16.abrupt('return', relationData);

                        case 8:
                            _context16.prev = 8;
                            _context16.t1 = _context16['catch'](0);
                            return _context16.abrupt('return', this.error(_context16.t1));

                        case 11:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee15, this, [[0, 8]]);
        }));

        function __getRelationData(_x28, _x29, _x30) {
            return _ref14.apply(this, arguments);
        }

        return __getRelationData;
    }();

    /**
     *
     * @param adapter
     * @param result
     * @param options
     * @param data
     * @param postType
     * @returns {*}
     * @private
     */


    _class.prototype.__postRelationData = function () {
        var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(adapter, result, options, data, postType) {
            var caseList, ps, relation, rtype, config, relationData, pk, n;
            return _regenerator2.default.wrap(function _callee16$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            _context17.prev = 0;
                            caseList = {
                                HASONE: adapter.__postHasOneRelation,
                                HASMANY: adapter.__postHasManyRelation,
                                MANYTOMANY: adapter.__postManyToManyRelation
                            }, ps = [];

                            if (!_lib2.default.isEmpty(result)) {
                                // let relation = schema.getRelation(this.modelName, this.config), rtype, config = this.config;
                                relation = options.rel, rtype = void 0, config = this.config, relationData = null;
                                pk = this.getPk();

                                for (n in relation) {
                                    rtype = relation[n] && relation[n]['type'] ? relation[n]['type'] : null;
                                    relationData = relation[n] && data[n] ? data[n] : null;
                                    if (rtype && relationData && rtype in caseList) {
                                        ps.push(caseList[rtype](config, result, options, relation[n], relationData, postType));
                                    }
                                }
                                // for (let n in relationData) {
                                //     rtype = relation[n] ? relation[n]['type'] : null;
                                //     if (rtype && rtype in caseList) {
                                //         ps.push(caseList[rtype](config, result, options, relation[n], relationData[n], postType));
                                //     }
                                // }
                            }
                            return _context17.abrupt('return', _promise2.default.all(ps));

                        case 6:
                            _context17.prev = 6;
                            _context17.t0 = _context17['catch'](0);
                            return _context17.abrupt('return', this.error(_context17.t0));

                        case 9:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee16, this, [[0, 6]]);
        }));

        function __postRelationData(_x31, _x32, _x33, _x34, _x35) {
            return _ref17.apply(this, arguments);
        }

        return __postRelationData;
    }();

    return _class;
}(_base3.default);

exports.default = _class;