'use strict';

exports.__esModule = true;

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

var _valid = require('./Util/valid');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
    /**
     * constructor
     * @param  {Object} http []
     * @return {}      []
     */
    function _class() {
        (0, _classCallCheck3.default)(this, _class);

        this.init.apply(this, arguments);
    }

    /**
     * get current class filename
     * @return {} []
     */


    _class.prototype.filename = function filename() {
        var fname = this.__filename || __filename;
        return path.basename(fname, '.js');
    };

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
        //构建连接池
        this.instances = null;
    };

    _class.prototype.db = function db() {
        var adapterList = {
            mysql: './Adapter/mysql.js',
            postgresql: './Adapter/postgresql.js',
            mongo: './Adapter/mongo.js'
        };
        if (!this.config.db_type.toLowerCase() in adapterList) {
            return this.error('Adapter ' + this.config.db_type + ' is not support.');
        }
        var instances = ORM.DB[this.adapterKey];
        if (!instances) {
            instances = new (ORM.safeRequire(adapterList[this.config.db_type]))(this.config);
            //挂载adapter特有方法
            if (!ORM.isEmpty(instances.methods)) {
                for (var n in instances.methods) {
                    this[n] = instances.methods[n];
                }
            }
            ORM.DB[this.adapterKey] = instances;
        }
        this.instances = instances;
        return this.instances;
    };

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
            tableName += this.tableName || this.parseName(this.getModelName());
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
     * 解析参数
     * @param  {[type]} options [description]
     * @return promise         [description]
     */


    _class.prototype.parseOptions = function parseOptions(oriOpts, extraOptions) {
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
        return options;
    };

    /**
     * 检测数据是否合法
     * @param data
     * @param options
     * @param preCheck
     * @returns {*}
     */


    _class.prototype.parseData = function parseData(data, options) {
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

    /**
     * 自动验证开关
     * @param data
     */


    _class.prototype.verify = function verify() {
        var flag = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        this._options.verify = !!flag;
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
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.prev = 0;
                            _context.next = 6;
                            break;

                        case 3:
                            _context.prev = 3;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(_context.t0));

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 3]]);
        }));

        function add(_x7, _x8) {
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
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.prev = 0;
                            _context2.next = 6;
                            break;

                        case 3:
                            _context2.prev = 3;
                            _context2.t0 = _context2['catch'](0);
                            return _context2.abrupt('return', this.error(_context2.t0));

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this, [[0, 3]]);
        }));

        function addAll(_x9, _x10) {
            return _ref2.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 查询后新增
     * @param data
     * @param options
     */


    _class.prototype.thenAdd = function thenAdd(data, options) {
        try {} catch (e) {
            return this.error(e);
        }
    };

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
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(options) {
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            _context3.next = 6;
                            break;

                        case 3:
                            _context3.prev = 3;
                            _context3.t0 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t0));

                        case 6:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 3]]);
        }));

        function _delete(_x11) {
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
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;
                            _context4.next = 6;
                            break;

                        case 3:
                            _context4.prev = 3;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(_context4.t0));

                        case 6:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 3]]);
        }));

        function update(_x12, _x13) {
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
     * 查询数据条数
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(field, options) {
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.prev = 0;
                            _context5.next = 6;
                            break;

                        case 3:
                            _context5.prev = 3;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(_context5.t0));

                        case 6:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 3]]);
        }));

        function count(_x14, _x15) {
            return _ref5.apply(this, arguments);
        }

        return count;
    }();

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(field, options) {
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;
                            _context6.next = 6;
                            break;

                        case 3:
                            _context6.prev = 3;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 6:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 3]]);
        }));

        function sum(_x16, _x17) {
            return _ref6.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            _context7.next = 6;
                            break;

                        case 3:
                            _context7.prev = 3;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t0));

                        case 6:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 3]]);
        }));

        function find(_x18) {
            return _ref7.apply(this, arguments);
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
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.prev = 0;
                            _context8.next = 6;
                            break;

                        case 3:
                            _context8.prev = 3;
                            _context8.t0 = _context8['catch'](0);
                            return _context8.abrupt('return', this.error(_context8.t0));

                        case 6:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this, [[0, 3]]);
        }));

        function select(_x19) {
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
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options, pageFlag) {
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;
                            _context9.next = 6;
                            break;

                        case 3:
                            _context9.prev = 3;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 6:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 3]]);
        }));

        function countSelect(_x20, _x21) {
            return _ref9.apply(this, arguments);
        }

        return countSelect;
    }();

    return _class;
}(); /**
      *
      * @author     richen
      * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
      * @license    MIT
      * @version    16/7/25
      */


exports.default = _class;