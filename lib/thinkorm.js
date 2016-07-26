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
        if (ORM.isObject(_order2)) {
            _order2 = ORM.extend(false, {}, _order2);
            var _order = {};
            for (var v in _order2) {
                if (ORM.isNumber(_order2[v])) {
                    _order[v] = _order2[v];
                } else {
                    if (_order2[v].toLowerCase() === 'desc') {
                        _order[v] = 0;
                    } else if (_order2[v].toLowerCase() === 'asc') {
                        _order[v] = 1;
                    }
                }
            }
            if (!ORM.isEmpty(_order)) {
                this._options.sort = _order;
            }
        } else if (ORM.isString(_order2)) {
            if (_order2.indexOf(',') > -1) {
                var strToObj = function strToObj(_str) {
                    return _str.replace(/^ +/, '').replace(/ +$/, '').replace(/( +, +)+|( +,)+|(, +)/, ',').replace(/ +/g, '-').replace(/,-/g, ',').replace(/-/g, ':').replace(/^/, '{"').replace(/$/, '"}').replace(/:/g, '":"').replace(/,/g, '","').replace(/("desc")+|("DESC")/g, 0).replace(/("asc")+|("ASC")/g, 1);
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
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(fields) {
        if (ORM.isEmpty(fields)) {
            return this;
        }
        if (ORM.isString(fields)) {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.fields = fields;
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
            var _this = this;

            var parsedOptions, result, pk;
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
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            //copy data

                            this._data = ORM.extend({}, data);
                            _context.next = 7;
                            return this._beforeAdd(this._data, parsedOptions);

                        case 7:
                            this._data = _context.sent;
                            _context.next = 10;
                            return this.parseData(this._data, parsedOptions);

                        case 10:
                            this._data = _context.sent;
                            _context.next = 13;
                            return this.db().add(this._data, parsedOptions).catch(function (e) {
                                return _this.error(_this.modelName + ':' + e.message);
                            });

                        case 13:
                            result = _context.sent;

                            this._data[this.pk] = this.db().getLastInsertId();

                            if (ORM.isEmpty(this.relation)) {
                                _context.next = 18;
                                break;
                            }

                            _context.next = 18;
                            return this.__postRelationData(this._data[this.pk], this._data, 'ADD', parsedOptions);

                        case 18:
                            _context.next = 20;
                            return this.getPk();

                        case 20:
                            pk = _context.sent;

                            this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
                            _context.next = 24;
                            return this._afterAdd(this._data, parsedOptions);

                        case 24:
                            return _context.abrupt('return', this._data[pk]);

                        case 27:
                            _context.prev = 27;
                            _context.t0 = _context['catch'](0);
                            return _context.abrupt('return', this.error(_context.t0));

                        case 30:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this, [[0, 27]]);
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
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(data, options) {
            var _this2 = this;

            var _ret;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.prev = 0;
                            return _context3.delegateYield(_regenerator2.default.mark(function _callee2() {
                                var parsedOptions, promisesd, promiseso, result;
                                return _regenerator2.default.wrap(function _callee2$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                if (!(!ORM.isArray(data) || !ORM.isObject(data[0]))) {
                                                    _context2.next = 2;
                                                    break;
                                                }

                                                return _context2.abrupt('return', {
                                                    v: _this2.error('_DATA_TYPE_INVALID_')
                                                });

                                            case 2:
                                                //parse options
                                                parsedOptions = _this2.parseOptions(options);
                                                //copy data

                                                _this2._data = ORM.extend([], data);

                                                promisesd = _this2._data.map(function (item) {
                                                    return _this2._beforeAdd(item, parsedOptions);
                                                });
                                                _context2.next = 7;
                                                return _promise2.default.all(promisesd);

                                            case 7:
                                                _this2._data = _context2.sent;
                                                promiseso = _this2._data.map(function (item) {
                                                    return _this2.parseData(item, parsedOptions);
                                                });
                                                _context2.next = 11;
                                                return _promise2.default.all(promiseso);

                                            case 11:
                                                _this2._data = _context2.sent;
                                                _context2.next = 14;
                                                return _this2.db().addAll(_this2._data, parsedOptions).catch(function (e) {
                                                    return _this2.error(_this2.modelName + ':' + e.message);
                                                });

                                            case 14:
                                                result = _context2.sent;
                                                return _context2.abrupt('return', {
                                                    v: result
                                                });

                                            case 16:
                                            case 'end':
                                                return _context2.stop();
                                        }
                                    }
                                }, _callee2, _this2);
                            })(), 't0', 2);

                        case 2:
                            _ret = _context3.t0;

                            if (!((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object")) {
                                _context3.next = 5;
                                break;
                            }

                            return _context3.abrupt('return', _ret.v);

                        case 5:
                            _context3.next = 10;
                            break;

                        case 7:
                            _context3.prev = 7;
                            _context3.t1 = _context3['catch'](0);
                            return _context3.abrupt('return', this.error(_context3.t1));

                        case 10:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this, [[0, 7]]);
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


    _class.prototype.thenAdd = function thenAdd(data, options) {};

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
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(options) {
            var _this3 = this;

            var parsedOptions, result;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;

                            //parse options
                            parsedOptions = this.parseOptions(options);
                            // init model

                            _context4.next = 4;
                            return this._beforeDelete(parsedOptions);

                        case 4:
                            _context4.next = 6;
                            return this.db().delete(parsedOptions).catch(function (e) {
                                return _this3.error(_this3.modelName + ':' + e.message);
                            });

                        case 6:
                            result = _context4.sent;
                            _context4.next = 9;
                            return this._afterDelete(parsedOptions.where || {});

                        case 9:
                            return _context4.abrupt('return', result);

                        case 12:
                            _context4.prev = 12;
                            _context4.t0 = _context4['catch'](0);
                            return _context4.abrupt('return', this.error(_context4.t0));

                        case 15:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this, [[0, 12]]);
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
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(data, options) {
            var _this4 = this;

            var parsedOptions, pk, _parsedOptions$where, result;

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
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            //copy data

                            this._data = ORM.extend({}, data);

                            _context5.next = 7;
                            return this._beforeUpdate(this._data, parsedOptions);

                        case 7:
                            this._data = _context5.sent;
                            _context5.next = 10;
                            return this.parseData(this._data, parsedOptions, true, 2);

                        case 10:
                            this._data = _context5.sent;
                            _context5.next = 13;
                            return this.getPk();

                        case 13:
                            pk = _context5.sent;

                            if (!ORM.isEmpty(parsedOptions.where)) {
                                _context5.next = 23;
                                break;
                            }

                            if (ORM.isEmpty(this._data[pk])) {
                                _context5.next = 20;
                                break;
                            }

                            parsedOptions.where = (_parsedOptions$where = {}, _parsedOptions$where[pk] = this._data[pk], _parsedOptions$where);
                            delete this._data[pk];
                            _context5.next = 21;
                            break;

                        case 20:
                            return _context5.abrupt('return', this.error('_OPERATION_WRONG_'));

                        case 21:
                            _context5.next = 24;
                            break;

                        case 23:
                            if (!ORM.isEmpty(this._data[pk])) {
                                delete this._data[pk];
                            }

                        case 24:
                            _context5.next = 26;
                            return this.db().update(parsedOptions, this._data).catch(function (e) {
                                return _this4.error(_this4.modelName + ':' + e.message);
                            });

                        case 26:
                            result = _context5.sent;

                            if (ORM.isEmpty(this.relation)) {
                                _context5.next = 30;
                                break;
                            }

                            _context5.next = 30;
                            return this.__postRelationData(result, data, 'UPDATE', parsedOptions);

                        case 30:
                            _context5.next = 32;
                            return this._afterUpdate(this._data, parsedOptions);

                        case 32:
                            return _context5.abrupt('return', result);

                        case 35:
                            _context5.prev = 35;
                            _context5.t0 = _context5['catch'](0);
                            return _context5.abrupt('return', this.error(_context5.t0));

                        case 38:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this, [[0, 35]]);
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
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.prev = 0;
                            _context6.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context6.sent;

                            field = field || pk;
                            this._options.field = 'count(\'' + field + '\') AS Count';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context6.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context6.sent;
                            _context6.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context6.sent;
                            return _context6.abrupt('return', result[0].Count || 0);

                        case 16:
                            _context6.prev = 16;
                            _context6.t0 = _context6['catch'](0);
                            return _context6.abrupt('return', this.error(_context6.t0));

                        case 19:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this, [[0, 16]]);
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
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(field, options) {
            var pk, parsedOptions, result;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.prev = 0;
                            _context7.next = 3;
                            return this.getPk();

                        case 3:
                            pk = _context7.sent;

                            field = field || pk;
                            this._options.field = 'SUM(`' + field + '`) AS Sum';
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context7.next = 9;
                            return this.db().select(parsedOptions);

                        case 9:
                            result = _context7.sent;
                            _context7.next = 12;
                            return this.parseData(result, parsedOptions, false);

                        case 12:
                            result = _context7.sent;
                            return _context7.abrupt('return', result[0].Sum || 0);

                        case 16:
                            _context7.prev = 16;
                            _context7.t0 = _context7['catch'](0);
                            return _context7.abrupt('return', this.error(_context7.t0));

                        case 19:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this, [[0, 16]]);
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
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            var result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.prev = 0;
                            _context8.next = 3;
                            return this.parseOptions(options, { limit: 1 });

                        case 3:
                            options = _context8.sent;
                            _context8.next = 6;
                            return this._beforeFind(options);

                        case 6:
                            options = _context8.sent;
                            _context8.next = 9;
                            return this.db().select(options);

                        case 9:
                            result = _context8.sent;

                            if (!(options.rel && !ORM.isEmpty(result))) {
                                _context8.next = 13;
                                break;
                            }

                            _context8.next = 13;
                            return this.__getRelationData(result[0], options);

                        case 13:
                            _context8.next = 15;
                            return this.parseData(result || {}, options, false);

                        case 15:
                            result = _context8.sent;
                            return _context8.abrupt('return', this._afterFind(result[0], options));

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
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options) {
            var result;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.prev = 0;
                            _context9.next = 3;
                            return this.parseOptions(options);

                        case 3:
                            options = _context9.sent;
                            _context9.next = 6;
                            return this._beforeSelect(options);

                        case 6:
                            options = _context9.sent;
                            _context9.next = 9;
                            return this.db().select(options);

                        case 9:
                            result = _context9.sent;

                            if (!(options.rel && !ORM.isEmpty(result))) {
                                _context9.next = 13;
                                break;
                            }

                            _context9.next = 13;
                            return this.__getRelationData(result, options);

                        case 13:
                            _context9.next = 15;
                            return this.parseData(result, options, false);

                        case 15:
                            result = _context9.sent;
                            return _context9.abrupt('return', this._afterSelect(result, options));

                        case 19:
                            _context9.prev = 19;
                            _context9.t0 = _context9['catch'](0);
                            return _context9.abrupt('return', this.error(_context9.t0));

                        case 22:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this, [[0, 19]]);
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
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(options, pageFlag) {
            var parsedOptions, count, pageOptions, totalPage, result;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            _context10.prev = 0;

                            if (ORM.isBoolean(options)) {
                                pageFlag = options;
                                options = {};
                            }
                            //parse options
                            parsedOptions = this.parseOptions(options);
                            _context10.next = 5;
                            return this.count(parsedOptions);

                        case 5:
                            count = _context10.sent;
                            pageOptions = this.parsePage(parsedOptions);
                            totalPage = Math.ceil(count / pageOptions.num);

                            if (ORM.isBoolean(pageFlag)) {
                                if (pageOptions.page > totalPage) {
                                    pageOptions.page = pageFlag === true ? 1 : totalPage;
                                }
                                parsedOptions.page = pageOptions.page + ',' + pageOptions.num;
                            }
                            //传入分页参数
                            this.limit(pageOptions.page - 1 < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num, pageOptions.num);
                            result = ORM.extend(false, { count: count, total: totalPage }, pageOptions);

                            if (!parsedOptions.page) {
                                parsedOptions.page = pageOptions.page;
                            }
                            _context10.next = 14;
                            return this.select(parsedOptions);

                        case 14:
                            result.data = _context10.sent;
                            _context10.next = 17;
                            return this.parseData(result, parsedOptions, false);

                        case 17:
                            result = _context10.sent;
                            return _context10.abrupt('return', result);

                        case 21:
                            _context10.prev = 21;
                            _context10.t0 = _context10['catch'](0);
                            return _context10.abrupt('return', this.error(_context10.t0));

                        case 24:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this, [[0, 21]]);
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