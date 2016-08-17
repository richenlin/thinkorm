'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

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
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
var thinkorm = function (_base) {
    (0, _inherits3.default)(thinkorm, _base);

    function thinkorm() {
        (0, _classCallCheck3.default)(this, thinkorm);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    /**
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    thinkorm.prototype.init = function init() {
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
        var config = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        // 主键名称
        this.pk = 'id';
        // 数据库配置信息
        this.config = null;
        // 模型名称(不能被重载)
        this._modelName = '';
        // 数据表名(不能被重载)
        this._tableName = '';
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {};
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
        // 参数
        this._options = {};
        // 数据
        this._data = {};
        // 关联模型数据
        this._relationData = {};
        // 验证规则
        this._valid = _valid2.default;

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
            db_ext_config: config.db_ext_config
        };
        // 获取模型名称
        if (name) {
            this._modelName = name;
            this._tableName = this.getTableName();
        } else {
            //空模型创建临时表
            this._modelName = '_temp';
            this._tableName = '_temp';
        }
        // 表主键
        if (this.config.db_type === 'mongo') {
            this.pk = '_id';
        }
        // 安全模式
        this.safe = this.config.db_ext_config.safe === true;
        // 配置hash(不能被重载)
        this.adapterKey = ORM.hash(this.config.db_type + '_' + this.config.db_host + '_' + this.config.db_port + '_' + this.config.db_name);
        // 链接句柄
        this.db = null;
    };

    /**
     * 获取数据库连接实例
     * @returns {*}
     */


    thinkorm.prototype.initDb = function initDb() {
        var instances = ORM.DB.conn[this.adapterKey];
        if (!instances) {
            var adapterList = {
                mysql: __dirname + '/Adapter/mysql.js',
                postgresql: __dirname + '/Adapter/postgresql.js',
                mongo: __dirname + '/Adapter/mongo.js'
            };
            if (!this.config.db_type.toLowerCase() in adapterList) {
                return this.error('_ADAPTER_IS_NOT_SUPPORT_');
            }
            instances = new (ORM.safeRequire(adapterList[this.config.db_type]))(this.config);
            ORM.DB.conn[this.adapterKey] = instances;
        }
        this.db = instances;
        return this.db;
    };

    /**
     * 模型构建
     * @returns {*}
     */


    thinkorm.prototype.schema = function schema() {
        var _this2 = this;

        //自动创建表\更新表\迁移数据
        return this.initDb().then(function (instances) {
            return instances.schema(_this2._tableName, _this2.fields);
        });
    };

    /**
     * 获取关联关系
     * @param relationObj
     * @returns {*}
     */


    thinkorm.prototype.getRelation = function getRelation(name) {
        var type = void 0;
        var parseType = function parseType(type) {
            type = type || 'HASONE';
            if (type == 1) {
                type = 'HASONE';
            } else if (type == 2) {
                type = 'HASMANY';
            } else if (type == 3) {
                type = 'MANYTOMANY';
            } else {
                type = (type + '').toUpperCase();
            }
            return type;
        };
        //初始化关联关系
        if (!ORM.DB.relation[this._tableName]) {
            if (!ORM.DB.relation[this._tableName]) {
                ORM.DB.relation[this._tableName] = {};
                for (var n in this.relation) {
                    type = parseType(this.relation[n]['type']);
                    ORM.DB.relation[this._tableName][n] = {
                        type: type, //关联方式
                        model: ORM.parseName(n), //关联表名,不带前缀
                        pk: this.getPk(), //主表主键
                        pmodel: this._modelName, //主表名,不带前缀
                        field: this.relation[n]['field'] || [],
                        fkey: this.relation[n]['fkey'], //外键
                        rkey: this.relation[n]['rkey'] //关联表主键
                    };
                }
            }
        }

        if (name) {
            return ORM.DB.relation[this._tableName][name];
        }
        return ORM.DB.relation[this._tableName];
    };

    /**
     * 错误封装
     * @param err
     */


    thinkorm.prototype.error = function error(err) {
        if (err) {
            var msg = err;
            if (!ORM.isError(msg)) {
                if (!ORM.isString(msg)) {
                    msg = (0, _stringify2.default)(msg);
                }
                msg = new Error(msg);
            }
            var stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            ORM.log(msg);
        }
        return ORM.getDefer().promise;
    };

    /**
     * 获取表名
     * @return {[type]} [description]
     */


    thinkorm.prototype.getTableName = function getTableName() {
        if (!this._tableName) {
            var tableName = this.config.db_prefix || '';
            tableName += ORM.parseName(this.getModelName());
            this._tableName = tableName.toLowerCase();
        }
        return this._tableName;
    };

    /**
     * 获取模型名
     * @access public
     * @return string
     */


    thinkorm.prototype.getModelName = function getModelName(name) {
        if (!this._modelName) {
            var filename = this.__filename || __filename;
            var last = filename.lastIndexOf('/');
            this._modelName = filename.substr(last + 1, filename.length - last - 4);
        }
        return this._modelName;
    };

    /**
     * 获取主键名称
     * @access public
     * @return string
     */


    thinkorm.prototype.getPk = function getPk() {
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


    thinkorm.prototype.page = function page(_page, listRows) {
        if (_page === undefined) {
            return this;
        }
        this._options.page = listRows === undefined ? _page : _page + ',' + listRows;
        return this;
    };

    /**
     * 开启关联操作
     * @param table
     * @param field
     */


    thinkorm.prototype.rel = function rel() {
        var _this3 = this;

        var table = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];
        var field = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        if (table) {
            (function () {
                //缓存关联关系
                var rels = _this3.getRelation();
                if (table === true) {
                    _this3._options.rel = rels;
                } else {
                    if (ORM.isString(table)) {
                        table = table.replace(/ +/g, '').split(',');
                    }
                    if (ORM.isArray(table)) {
                        _this3._options.rel = {};
                        table.forEach(function (item) {
                            rels[item] && (_this3._options.rel[item] = rels[item]);
                        });
                    }
                }
                //关联表字段
                if (!ORM.isEmpty(field)) {
                    for (var n in field) {
                        if (n in _this3._options.rel) {
                            _this3._options.rel[n]['field'] = field[n];
                        }
                    }
                }
            })();
        }
        return this;
    };

    /**
     * 指定查询数量
     * @param  {[type]} offset [description]
     * @param  {[type]} length [description]
     * @return {[type]}        [description]
     */


    thinkorm.prototype.limit = function limit(offset, length) {
        if (offset === undefined) {
            return this;
        }
        if (ORM.isArray(offset)) {
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
        this._options.limit = [offset, length];
        return this;
    };

    /**
     * 排序
     * @param order
     * @returns {exports}
     */


    thinkorm.prototype.order = function order(_order) {
        if (_order === undefined) {
            return this;
        }
        if (ORM.isObject(_order)) {
            this._options.order = _order;
        } else if (ORM.isString(_order)) {
            var strToObj = function strToObj(_str) {
                return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","');
            };
            this._options.order = JSON.parse(strToObj(_order));
        }
        return this;
    };

    /**
     * 要查询的字段
     * @param  {[type]} field   [description]
     * @return {[type]}         [description]
     */


    thinkorm.prototype.field = function field(_field) {
        if (ORM.isEmpty(_field)) {
            return this;
        }
        if (ORM.isString(_field)) {
            _field = _field.replace(/ +/g, '').split(',');
        }
        this._options.field = _field;
        return this;
    };

    /**
     * where条件
     * 书写方法:
     * and:      where({id: 1, name: 'a'})
     * or:       where({or: [{...}, {...}]})
     * in:       where({id: [1,2,3]})
     * not:      where({not: {name: '', id: 1}})
     * notin:    where({notin: {'id': [1,2,3]}})
     * operator: where({id: {'<>': 1, '>=': 0}})
     * @return {[type]} [description]
     */


    thinkorm.prototype.where = function where(_where) {
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


    thinkorm.prototype.group = function group(_group) {
        if (!_group) {
            return this;
        }
        this._options.group = _group;
        return this;
    };

    /**
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'inner'}])
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}, field: ['id', 'name'], type: 'left'}])
     * join([{from: 'test', on: {aaa: bbb, ccc: ddd}, field: ['id', 'name'], type: 'right'}])
     * @param join
     */


    thinkorm.prototype.join = function join(_join) {
        if (!_join || !ORM.isArray(_join)) {
            return this;
        }
        this._options.join = _join;
        return this;
    };

    /**
     * 数据插入之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    thinkorm.prototype._beforeAdd = function _beforeAdd(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    thinkorm.prototype.add = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parsedOptions, db, result, pk;
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
                            db = _context.sent;

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
                            return db.add(this._data, parsedOptions);

                        case 18:
                            result = _context.sent;
                            _context.next = 21;
                            return this._afterAdd(this._data, parsedOptions);

                        case 21:
                            _context.next = 23;
                            return this.getPk();

                        case 23:
                            pk = _context.sent;
                            _context.next = 26;
                            return this._parseData(this._data[pk] || 0, parsedOptions, false);

                        case 26:
                            result = _context.sent;
                            return _context.abrupt('return', result);

                        case 30:
                            _context.prev = 30;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(_context.t0));

                        case 33:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 30]]);
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


    thinkorm.prototype._afterAdd = function _afterAdd(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 查询后新增
     * @param data
     * @param options
     */


    thinkorm.prototype.thenAdd = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            var record;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;

                            if (!ORM.isEmpty(data)) {
                                _context2.next = 3;
                                break;
                            }

                            return _context2.abrupt('return', this.error('_DATA_TYPE_INVALID_'));

                        case 3:
                            _context2.next = 5;
                            return this.find(options);

                        case 5:
                            record = _context2.sent;

                            if (!ORM.isEmpty(record)) {
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

        function thenAdd(_x7, _x8) {
            return _ref2.apply(this, arguments);
        }

        return thenAdd;
    }();

    /**
     * 数据删除之前操作，可以返回一个promise
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    thinkorm.prototype._beforeDelete = function _beforeDelete(options) {
        return _promise2.default.resolve(options);
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    thinkorm.prototype.delete = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(options) {
            var parsedOptions, db, result;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context3.sent;
                            _context3.next = 6;
                            return this.initDb();

                        case 6:
                            db = _context3.sent;
                            _context3.next = 9;
                            return this._beforeDelete(parsedOptions);

                        case 9:
                            _context3.next = 11;
                            return db.delete(parsedOptions);

                        case 11:
                            result = _context3.sent;
                            _context3.next = 14;
                            return this._afterDelete(parsedOptions);

                        case 14:
                            _context3.next = 16;
                            return this._parseData(result || [], parsedOptions, false);

                        case 16:
                            result = _context3.sent;
                            return _context3.abrupt('return', result);

                        case 20:
                            _context3.prev = 20;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t0));

                        case 23:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 20]]);
        }));

        function _delete(_x9) {
            return _ref3.apply(this, arguments);
        }

        return _delete;
    }();

    /**
     * 删除后续操作
     * @return {[type]} [description]
     */


    thinkorm.prototype._afterDelete = function _afterDelete(options) {
        return _promise2.default.resolve(options);
    };

    /**
     * 更新前置操作
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    thinkorm.prototype._beforeUpdate = function _beforeUpdate(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    thinkorm.prototype.update = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(data, options) {
            var parsedOptions, db, pk, result;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            _context4.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context4.sent;
                            _context4.next = 6;
                            return this.initDb();

                        case 6:
                            db = _context4.sent;

                            //copy data
                            this._data = ORM.extend({}, data);
                            _context4.next = 10;
                            return this._beforeUpdate(this._data, parsedOptions);

                        case 10:
                            this._data = _context4.sent;
                            _context4.next = 13;
                            return this._parseData(this._data, parsedOptions);

                        case 13:
                            this._data = _context4.sent;
                            _context4.next = 16;
                            return this.getPk();

                        case 16:
                            pk = _context4.sent;

                            if (!ORM.isEmpty(parsedOptions.where)) {
                                _context4.next = 27;
                                break;
                            }

                            if (ORM.isEmpty(this._data[pk])) {
                                _context4.next = 24;
                                break;
                            }

                            parsedOptions.where = {};
                            parsedOptions.where[pk] = this._data[pk];
                            delete this._data[pk];
                            _context4.next = 25;
                            break;

                        case 24:
                            return _context4.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 25:
                            _context4.next = 28;
                            break;

                        case 27:
                            if (!ORM.isEmpty(this._data[pk])) {
                                delete this._data[pk];
                            }

                        case 28:
                            _context4.next = 30;
                            return db.update(this._data, parsedOptions);

                        case 30:
                            result = _context4.sent;

                            if (ORM.isEmpty(this._relationData)) {
                                _context4.next = 34;
                                break;
                            }

                            _context4.next = 34;
                            return this._postRelationData(result, parsedOptions, this._relationData, 'UPDATE');

                        case 34:
                            _context4.next = 36;
                            return this._afterUpdate(this._data, parsedOptions);

                        case 36:
                            _context4.next = 38;
                            return this._parseData(result || [], parsedOptions, false);

                        case 38:
                            result = _context4.sent;
                            return _context4.abrupt('return', result);

                        case 42:
                            _context4.prev = 42;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(_context4.t0));

                        case 45:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 42]]);
        }));

        function update(_x10, _x11) {
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


    thinkorm.prototype._afterUpdate = function _afterUpdate(data, options) {
        return _promise2.default.resolve(data);
    };

    /**
     * 查询数据条数
     * count('xxx')
     * @param options
     * @returns {*}
     */


    thinkorm.prototype.count = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(options) {
            var parsedOptions, pk, db, result;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            _context5.next = 3;
                            return this._parseOptions(options);

                        case 3:
                            parsedOptions = _context5.sent;
                            _context5.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context5.sent;
                            _context5.next = 9;
                            return this.initDb();

                        case 9:
                            db = _context5.sent;
                            _context5.next = 12;
                            return db.count(pk, parsedOptions);

                        case 12:
                            result = _context5.sent;
                            _context5.next = 15;
                            return this._parseData(result || 0, parsedOptions, false);

                        case 15:
                            result = _context5.sent;
                            return _context5.abrupt('return', result);

                        case 19:
                            _context5.prev = 19;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(_context5.t0));

                        case 22:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 19]]);
        }));

        function count(_x12) {
            return _ref5.apply(this, arguments);
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


    thinkorm.prototype.sum = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(field, options) {
            var parsedOptions, pk, db, result;
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
                            return this.getPk();

                        case 6:
                            pk = _context6.sent;

                            field = field || pk;
                            // init db
                            _context6.next = 10;
                            return this.initDb();

                        case 10:
                            db = _context6.sent;
                            _context6.next = 13;
                            return db.sum(field, parsedOptions);

                        case 13:
                            result = _context6.sent;
                            _context6.next = 16;
                            return this._parseData(result || 0, parsedOptions, false);

                        case 16:
                            result = _context6.sent;
                            return _context6.abrupt('return', result);

                        case 20:
                            _context6.prev = 20;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 23:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 20]]);
        }));

        function sum(_x13, _x14) {
            return _ref6.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    thinkorm.prototype.find = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
            var parsedOptions, db, result;
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
                            db = _context7.sent;
                            _context7.next = 9;
                            return db.find(parsedOptions);

                        case 9:
                            result = _context7.sent;
                            _context7.next = 12;
                            return this._parseData(result, parsedOptions, false);

                        case 12:
                            result = _context7.sent;

                            result = (ORM.isArray(result) ? result[0] : result) || {};

                            if (ORM.isEmpty(parsedOptions.rel)) {
                                _context7.next = 18;
                                break;
                            }

                            _context7.next = 17;
                            return this._getRelationData(parsedOptions, result);

                        case 17:
                            result = _context7.sent;

                        case 18:
                            _context7.next = 20;
                            return this._afterFind(result, parsedOptions);

                        case 20:
                            return _context7.abrupt('return', result);

                        case 23:
                            _context7.prev = 23;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t0));

                        case 26:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 23]]);
        }));

        function find(_x15) {
            return _ref7.apply(this, arguments);
        }

        return find;
    }();

    /**
     * find查询后置操作
     * @return {[type]} [description]
     */


    thinkorm.prototype._afterFind = function _afterFind(result, options) {
        return _promise2.default.resolve(result);
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    thinkorm.prototype.select = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            var parsedOptions, db, result;
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
                            return this.initDb();

                        case 6:
                            db = _context8.sent;
                            _context8.next = 9;
                            return db.select(parsedOptions);

                        case 9:
                            result = _context8.sent;
                            _context8.next = 12;
                            return this._parseData(result || [], parsedOptions, false);

                        case 12:
                            result = _context8.sent;

                            if (ORM.isEmpty(parsedOptions.rel)) {
                                _context8.next = 17;
                                break;
                            }

                            _context8.next = 16;
                            return this._getRelationData(parsedOptions, result);

                        case 16:
                            result = _context8.sent;

                        case 17:
                            _context8.next = 19;
                            return this._afterSelect(result, parsedOptions);

                        case 19:
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

        function select(_x16) {
            return _ref8.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 查询后置操作
     * @param  {[type]} result  [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    thinkorm.prototype._afterSelect = function _afterSelect(result, options) {
        return _promise2.default.resolve(result);
    };

    /**
     * 返回数据里含有count信息的查询
     * @param  options
     * @param  pageFlag 当页面不合法时的处理方式，true为获取第一页，false为获取最后一页，undefined获取为空
     * @return promise
     */


    thinkorm.prototype.countSelect = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options, pageFlag) {
            var parsedOptions, countNum, pageOptions, totalPage, offset, result;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;

                            if (ORM.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            _context9.next = 4;
                            return this._parseOptions(options);

                        case 4:
                            parsedOptions = _context9.sent;
                            _context9.next = 7;
                            return this.count(parsedOptions);

                        case 7:
                            countNum = _context9.sent;
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
                            _context9.next = 16;
                            return this.select(parsedOptions);

                        case 16:
                            result.data = _context9.sent;
                            _context9.next = 19;
                            return this._parseData(result, parsedOptions, false);

                        case 19:
                            result = _context9.sent;
                            return _context9.abrupt('return', result);

                        case 23:
                            _context9.prev = 23;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 26:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 23]]);
        }));

        function countSelect(_x17, _x18) {
            return _ref9.apply(this, arguments);
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


    thinkorm.prototype._parseOptions = function _parseOptions(oriOpts, extraOptions) {
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
        //模型名称
        options.name = options.name || this._modelName;
        //解析field,根据model的fields进行过滤
        var field = [];
        if (ORM.isEmpty(options.field) && !ORM.isEmpty(options.fields)) options.field = options.fields;
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
    };

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @param option
     * @returns {*}
     */


    thinkorm.prototype._parseData = function _parseData(data, options) {
        var preCheck = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];
        var option = arguments.length <= 3 || arguments[3] === undefined ? 1 : arguments[3];

        if (preCheck) {
            //根据模型定义字段类型进行数据检查
            var result = [];
            for (var _field2 in data) {
                //分离关联模型数据
                if (this.relation[_field2]) {
                    !this._relationData[_field2] && (this._relationData[_field2] = {});
                    this._relationData[_field2] = data[_field2];
                    delete data[_field2];
                }
                //移除未定义的字段
                if (!this.fields[_field2]) {
                    delete data[_field2];
                }
            }
            //根据规则自动验证数据
            if (ORM.isEmpty(this.validations)) {
                return data;
            }
            var field = void 0,
                value = void 0,
                checkData = [];
            for (field in this.validations) {
                value = ORM.extend(this.validations[field], { name: field, value: data[field] });
                checkData.push(value);
            }
            if (ORM.isEmpty(checkData)) {
                return data;
            }
            result = {};
            result = this._valid(checkData);
            if (ORM.isEmpty(result)) {
                return data;
            }
            return this.error((0, _values2.default)(result)[0]);
        } else {
            if (ORM.isJSONObj(data)) {
                return data;
            } else {
                return JSON.parse((0, _stringify2.default)(data));
            }
        }
    };

    /**
     *
     * @param options
     * @returns {*}
     * @private
     */


    thinkorm.prototype._getRelationData = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(options, data) {
            var caseList, relationData, relation, newClass, rtype, scope, pk, n, _iterator, _isArray, _i, _ref11, _ref12, k, v;

            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            caseList = {
                                HASONE: this._getHasOneRelation,
                                HASMANY: this._getHasManyRelation,
                                MANYTOMANY: this._getManyToManyRelation
                            };
                            relationData = data;

                            if (ORM.isEmpty(data)) {
                                _context10.next = 40;
                                break;
                            }

                            relation = options.rel, newClass = function (_thinkorm) {
                                (0, _inherits3.default)(newClass, _thinkorm);

                                function newClass() {
                                    (0, _classCallCheck3.default)(this, newClass);
                                    return (0, _possibleConstructorReturn3.default)(this, _thinkorm.apply(this, arguments));
                                }

                                return newClass;
                            }(thinkorm), rtype = void 0, scope = void 0;
                            _context10.next = 6;
                            return this.getPk();

                        case 6:
                            pk = _context10.sent;
                            _context10.t0 = _regenerator2.default.keys(relation);

                        case 8:
                            if ((_context10.t1 = _context10.t0()).done) {
                                _context10.next = 40;
                                break;
                            }

                            n = _context10.t1.value;

                            rtype = relation[n]['type'];

                            if (!(relation[n].fkey && rtype && rtype in caseList)) {
                                _context10.next = 38;
                                break;
                            }

                            scope = new newClass(relation[n].model, this.config);

                            if (!ORM.isArray(data)) {
                                _context10.next = 35;
                                break;
                            }

                            _iterator = data.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                        case 15:
                            if (!_isArray) {
                                _context10.next = 21;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context10.next = 18;
                                break;
                            }

                            return _context10.abrupt('break', 33);

                        case 18:
                            _ref11 = _iterator[_i++];
                            _context10.next = 25;
                            break;

                        case 21:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context10.next = 24;
                                break;
                            }

                            return _context10.abrupt('break', 33);

                        case 24:
                            _ref11 = _i.value;

                        case 25:
                            _ref12 = _ref11;
                            k = _ref12[0];
                            v = _ref12[1];
                            _context10.next = 30;
                            return caseList[rtype](scope, relation[n], data[k]);

                        case 30:
                            data[k][relation[n].fkey] = _context10.sent;

                        case 31:
                            _context10.next = 15;
                            break;

                        case 33:
                            _context10.next = 38;
                            break;

                        case 35:
                            _context10.next = 37;
                            return caseList[rtype](scope, relation[n], data);

                        case 37:
                            data[relation[n].fkey] = _context10.sent;

                        case 38:
                            _context10.next = 8;
                            break;

                        case 40:
                            return _context10.abrupt('return', relationData);

                        case 41:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function _getRelationData(_x21, _x22) {
            return _ref10.apply(this, arguments);
        }

        return _getRelationData;
    }();

    /**
     *
     * @param scope
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */


    thinkorm.prototype._getHasOneRelation = function _getHasOneRelation(scope, rel, data) {
        var _where2;

        if (!scope || ORM.isEmpty(data) || ORM.isEmpty(data[rel.fkey])) {
            return {};
        }
        var options = { field: rel.field, where: (_where2 = {}, _where2[rel.rkey] = data[rel.fkey], _where2), table: '' + scope.config.db_prefix + rel.model, name: rel.model };
        return scope.find(options);
    };

    /**
     *
     * @param scope
     * @param rel
     * @param data
     * @returns {{}}
     * @private
     */


    thinkorm.prototype._getHasManyRelation = function _getHasManyRelation(scope, rel, data) {
        var _where3;

        if (!scope || ORM.isEmpty(data) || ORM.isEmpty(data[rel.pk])) {
            return [];
        }
        var options = { field: rel.field, where: (_where3 = {}, _where3[rel.rkey] = data[rel.pk], _where3), table: '' + scope.config.db_prefix + rel.model, name: rel.model };
        return scope.select(options);
    };

    /**
     *
     * @param scope
     * @param rel
     * @param data
     * @returns {{}}
     * @private
     */


    thinkorm.prototype._getManyToManyRelation = function _getManyToManyRelation(scope, rel, data) {
        var _on, _where4;

        if (!scope || ORM.isEmpty(data) || ORM.isEmpty(data[rel.pk])) {
            return [];
        }
        var rpk = scope.getPk();
        var mapModel = rel.pmodel + '_' + rel.model + '_map';
        var options = {
            table: '' + scope.config.db_prefix + mapModel,
            name: mapModel,
            join: [{ from: '' + rel.model, on: (_on = {}, _on[rel.rkey] = rpk, _on), field: rel.field, type: 'inner' }],
            where: (_where4 = {}, _where4[rel.fkey] = data[rel.pk], _where4)
        };
        return scope.select(options);
    };

    /**
     *
     * @param result
     * @param options
     * @param relationData
     * @param postType
     * @returns {*}
     * @private
     */


    thinkorm.prototype._postRelationData = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(result, options, relationData, postType) {
            var caseList, relation, newClass, rtype, scope, pk, n;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            caseList = {
                                HASONE: this._postHasOneRelation,
                                HASMANY: this._postHasManyRelation,
                                MANYTOMANY: this._postManyToManyRelation
                            };

                            if (ORM.isEmpty(result)) {
                                _context11.next = 16;
                                break;
                            }

                            relation = options.rel, newClass = function (_thinkorm2) {
                                (0, _inherits3.default)(newClass, _thinkorm2);

                                function newClass() {
                                    (0, _classCallCheck3.default)(this, newClass);
                                    return (0, _possibleConstructorReturn3.default)(this, _thinkorm2.apply(this, arguments));
                                }

                                return newClass;
                            }(thinkorm), rtype = void 0, scope = void 0;
                            _context11.next = 5;
                            return this.getPk();

                        case 5:
                            pk = _context11.sent;
                            _context11.t0 = _regenerator2.default.keys(relation);

                        case 7:
                            if ((_context11.t1 = _context11.t0()).done) {
                                _context11.next = 16;
                                break;
                            }

                            n = _context11.t1.value;

                            rtype = relation[n]['type'];

                            if (!(relation[n].fkey && rtype && rtype in caseList)) {
                                _context11.next = 14;
                                break;
                            }

                            scope = new newClass(n, this.config);
                            _context11.next = 14;
                            return caseList[rtype](scope, result, relation[n], relationData[n], postType);

                        case 14:
                            _context11.next = 7;
                            break;

                        case 16:
                            return _context11.abrupt('return');

                        case 17:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function _postRelationData(_x23, _x24, _x25, _x26) {
            return _ref13.apply(this, arguments);
        }

        return _postRelationData;
    }();

    /**
     *
     * @param scope
     * @param result
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */


    thinkorm.prototype._postHasOneRelation = function () {
        var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(scope, result, rel, relationData, postType) {
            var _scope$update, _where5;

            var relationOptions, fkey;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            if (!(!scope || ORM.isEmpty(result) || ORM.isEmpty(relationData))) {
                                _context12.next = 2;
                                break;
                            }

                            return _context12.abrupt('return');

                        case 2:
                            relationOptions = { table: '' + scope.config.db_prefix + rel.model, name: rel.model };
                            _context12.t0 = postType;
                            _context12.next = _context12.t0 === 'ADD' ? 6 : _context12.t0 === 'UPDATE' ? 14 : 18;
                            break;

                        case 6:
                            _context12.next = 8;
                            return scope.add(relationData, relationOptions);

                        case 8:
                            fkey = _context12.sent;
                            _context12.t1 = fkey;

                            if (!_context12.t1) {
                                _context12.next = 13;
                                break;
                            }

                            _context12.next = 13;
                            return scope.update((_scope$update = {}, _scope$update[rel.fkey] = fkey, _scope$update), { where: (_where5 = {}, _where5[rel.pk] = result, _where5), table: '' + scope.config.db_prefix + rel.pmodel, name: rel.pmodel });

                        case 13:
                            return _context12.abrupt('break', 18);

                        case 14:
                            if (!relationData[rel.fkey]) {
                                _context12.next = 17;
                                break;
                            }

                            _context12.next = 17;
                            return scope.update(relationData, relationOptions);

                        case 17:
                            return _context12.abrupt('break', 18);

                        case 18:
                            return _context12.abrupt('return');

                        case 19:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        }));

        function _postHasOneRelation(_x27, _x28, _x29, _x30, _x31) {
            return _ref14.apply(this, arguments);
        }

        return _postHasOneRelation;
    }();

    /**
     *
     * @param scope
     * @param result
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */


    thinkorm.prototype._postHasManyRelation = function () {
        var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(scope, result, rel, relationData, postType) {
            var relationOptions, _iterator2, _isArray2, _i2, _ref16, _ref17, k, v;

            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            if (!(!scope || ORM.isEmpty(result) || ORM.isEmpty(relationData))) {
                                _context13.next = 2;
                                break;
                            }

                            return _context13.abrupt('return');

                        case 2:
                            relationOptions = { table: '' + scope.config.db_prefix + rel.model, name: rel.model };
                            _iterator2 = relationData.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);

                        case 4:
                            if (!_isArray2) {
                                _context13.next = 10;
                                break;
                            }

                            if (!(_i2 >= _iterator2.length)) {
                                _context13.next = 7;
                                break;
                            }

                            return _context13.abrupt('break', 31);

                        case 7:
                            _ref16 = _iterator2[_i2++];
                            _context13.next = 14;
                            break;

                        case 10:
                            _i2 = _iterator2.next();

                            if (!_i2.done) {
                                _context13.next = 13;
                                break;
                            }

                            return _context13.abrupt('break', 31);

                        case 13:
                            _ref16 = _i2.value;

                        case 14:
                            _ref17 = _ref16;
                            k = _ref17[0];
                            v = _ref17[1];
                            _context13.t0 = postType;
                            _context13.next = _context13.t0 === 'ADD' ? 20 : _context13.t0 === 'UPDATE' ? 25 : 29;
                            break;

                        case 20:
                            if (!v[rel.pk]) {
                                _context13.next = 24;
                                break;
                            }

                            v[rel.rkey] = v[rel.pk];
                            _context13.next = 24;
                            return scope.add(v, relationOptions);

                        case 24:
                            return _context13.abrupt('break', 29);

                        case 25:
                            if (!v[rel.rkey]) {
                                _context13.next = 28;
                                break;
                            }

                            _context13.next = 28;
                            return scope.update(v, relationOptions);

                        case 28:
                            return _context13.abrupt('break', 29);

                        case 29:
                            _context13.next = 4;
                            break;

                        case 31:
                            return _context13.abrupt('return');

                        case 32:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this);
        }));

        function _postHasManyRelation(_x32, _x33, _x34, _x35, _x36) {
            return _ref15.apply(this, arguments);
        }

        return _postHasManyRelation;
    }();

    /**
     *
     * @param scope
     * @param result
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */


    thinkorm.prototype._postManyToManyRelation = function () {
        var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(scope, result, rel, relationData, postType) {
            var _relationOptions$wher, _scope$thenAdd;

            var rpk, mapModel, relationOptions, _iterator3, _isArray3, _i3, _ref19, _ref20, k, v, fkey, _relationOptions$wher2;

            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            if (!(!scope || ORM.isEmpty(result) || ORM.isEmpty(relationData))) {
                                _context14.next = 2;
                                break;
                            }

                            return _context14.abrupt('return');

                        case 2:
                            //子表主键
                            rpk = scope.getPk();
                            //关系表

                            mapModel = rel.pmodel + '_' + rel.model + '_map';
                            relationOptions = { table: '' + scope.config.db_prefix + mapModel, name: mapModel };
                            _iterator3 = relationData.entries(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);

                        case 6:
                            if (!_isArray3) {
                                _context14.next = 12;
                                break;
                            }

                            if (!(_i3 >= _iterator3.length)) {
                                _context14.next = 9;
                                break;
                            }

                            return _context14.abrupt('break', 38);

                        case 9:
                            _ref19 = _iterator3[_i3++];
                            _context14.next = 16;
                            break;

                        case 12:
                            _i3 = _iterator3.next();

                            if (!_i3.done) {
                                _context14.next = 15;
                                break;
                            }

                            return _context14.abrupt('break', 38);

                        case 15:
                            _ref19 = _i3.value;

                        case 16:
                            _ref20 = _ref19;
                            k = _ref20[0];
                            v = _ref20[1];
                            _context14.t0 = postType;
                            _context14.next = _context14.t0 === 'ADD' ? 22 : _context14.t0 === 'UPDATE' ? 31 : 36;
                            break;

                        case 22:
                            _context14.next = 24;
                            return scope.add(v, { table: '' + scope.config.db_prefix + rel.model, name: rel.model });

                        case 24:
                            fkey = _context14.sent;

                            //关系表增加数据,使用thenAdd
                            relationOptions.where = (_relationOptions$wher = {}, _relationOptions$wher[rel.fkey] = result, _relationOptions$wher[rel.rkey] = fkey, _relationOptions$wher);
                            _context14.t1 = fkey;

                            if (!_context14.t1) {
                                _context14.next = 30;
                                break;
                            }

                            _context14.next = 30;
                            return scope.thenAdd((_scope$thenAdd = {}, _scope$thenAdd[rel.fkey] = result, _scope$thenAdd[rel.rkey] = fkey, _scope$thenAdd), relationOptions);

                        case 30:
                            return _context14.abrupt('break', 36);

                        case 31:
                            if (!(v[rel.fkey] && v[rel.rkey])) {
                                _context14.next = 35;
                                break;
                            }

                            relationOptions.where = (_relationOptions$wher2 = {}, _relationOptions$wher2[rel.fkey] = v[rel.fkey], _relationOptions$wher2[rel.rkey] = v[rel.rkey], _relationOptions$wher2);
                            _context14.next = 35;
                            return scope.thenAdd(v, relationOptions);

                        case 35:
                            return _context14.abrupt('break', 36);

                        case 36:
                            _context14.next = 6;
                            break;

                        case 38:
                            return _context14.abrupt('return');

                        case 39:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this);
        }));

        function _postManyToManyRelation(_x37, _x38, _x39, _x40, _x41) {
            return _ref18.apply(this, arguments);
        }

        return _postManyToManyRelation;
    }();

    return thinkorm;
}(_base3.default);

exports.default = thinkorm;