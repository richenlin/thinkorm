'use strict';

exports.__esModule = true;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

var _valid = require('./Util/valid');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by lihao on 16/7/26.
 */
var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(name) {
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
        // 关联链接
        this._relationLink = [];
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

        this.config = config;
        //数据表前缀
        if (this.tablePrefix) {
            this.config.db_prefix = this.tablePrefix;
        } else if (this.config.db_prefix) {
            this.tablePrefix = this.config.db_prefix;
        } else {}
        //this.tablePrefix = ORM.config('db_prefix');

        //表名
        if (!this.trueTableName) {
            this.trueTableName = this.getTableName();
        }
        //安全模式
        this.safe = this.config.db_ext_config.safe === true ? true : false;
        //配置hash
        this.adapterKey = ORM.hash(this.config.db_type + '_' + this.config.db_host + '_' + this.config.db_port + '_' + this.config.db_name);
    };

    /**
     * 获取数据库适配器单例
     */


    _class.prototype.adapter = function adapter() {
        if (this._adapter) return this._adapter;
        var Adapter = require('./Adapter/' + (this.config.db_type || 'mysql') + 'Adapter').default;
        this._adapter = new Adapter(this.config);
        return this._adapter;
    };

    _class.prototype.initModel = function initModel() {};

    /**
     * 获取表模型
     * @param table
     */


    _class.prototype.getSchema = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(table) {
            var storeKey, schema, name;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            table = table || this.getTableName();
                            storeKey = this.config.db_type + '_' + table + '_schema';
                            schema = {};

                            if (!this.config.schema_force_update) {
                                _context.next = 9;
                                break;
                            }

                            _context.next = 6;
                            return this.db().getSchema(table);

                        case 6:
                            schema = _context.sent;
                            _context.next = 12;
                            break;

                        case 9:
                            _context.next = 11;
                            return this.adapter().getSchema(table);

                        case 11:
                            schema = _context.sent;

                        case 12:
                            if (!(table !== this.getTableName())) {
                                _context.next = 14;
                                break;
                            }

                            return _context.abrupt('return', schema);

                        case 14:
                            _context.t0 = _regenerator2.default.keys(schema);

                        case 15:
                            if ((_context.t1 = _context.t0()).done) {
                                _context.next = 22;
                                break;
                            }

                            name = _context.t1.value;

                            if (!schema[name].primary) {
                                _context.next = 20;
                                break;
                            }

                            this.pk = name;
                            return _context.abrupt('break', 22);

                        case 20:
                            _context.next = 15;
                            break;

                        case 22:
                            //merge user set schema config
                            this.schema = ORM.extend({}, schema, this.fields);
                            return _context.abrupt('return', this.schema);

                        case 24:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function getSchema(_x2) {
            return _ref.apply(this, arguments);
        }

        return getSchema;
    }();

    /**
     * 动态设置关联关系
     */


    _class.prototype.setRelation = function setRelation(relation) {
        this.relation = relation;
    };

    /**
     * 获取主键
     * @returns {string}
     */


    _class.prototype.getPk = function getPk() {
        return 'id';
    };

    /**
     * 获取表名
     * @return {[type]} [description]
     */


    _class.prototype.getTableName = function getTableName() {
        if (!this.trueTableName) {
            var tableName = this.config.db_prefix || '';
            tableName += this.tableName || this.parseName(this.getModelName());
            this.trueTableName = tableName.toLowerCase();
        }
        return this.trueTableName;
    };

    /**
     * 字符串命名风格转换
     * @param  {[type]} name [description]
     * @param  {[type]} type [description]
     * @return {[type]}      [description]
     */


    _class.prototype.parseName = function parseName(name) {
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
     * 查询字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(fields) {
        if (!fields) {
            return this;
        }
        if (typeof fields === 'string') {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.fields = fields;
        return this;
    };

    /**
     * 查询条件where
     * @param where
     */


    _class.prototype.where = function where(_where) {
        if (!_where) return this;
        if (ORM.isEmpty(this._options.where)) this._options.where = {
            where: {
                and: [],
                not: [],
                in: [],
                notin: [],
                null: [],
                notnull: [],
                between: [],
                notbetween: [],
                operation: []
            },
            orwhere: {
                and: [],
                not: [],
                in: [],
                notin: [],
                null: [],
                notnull: [],
                between: [],
                notbetween: [],
                operation: []
            }
        };
        var identifiers = {
            or: 'OR',
            OR: 'OR',
            and: 'AND',
            'AND': 'AND',
            not: 'NOT',
            NOT: 'NOT',
            notin: 'NOTIN',
            NOTIN: 'NOTIN',
            in: 'IN',
            IN: 'IN',
            null: 'NULL',
            NULL: 'NULL',
            notnull: 'NOTNULL',
            NOTNULL: 'NOTNULL',
            between: 'BETWEEN',
            BETWEEN: 'BETWEEN',
            notbetween: 'NOTBETWEEN',
            NOTBETWEEN: 'NOTBETWEEN',
            '>': 'OPERATOR',
            '<': 'OPERATOR',
            '<>': 'OPERATOR',
            '<=': 'OPERATOR',
            '>=': 'OPERATOR'
        };
        /*******************此方法将要将where条件解析为knex可用格式**********************/
        //where = {
        //    //此项表示id=1,name=a
        //    and: [[id, 1], [name, a]],
        //    //此项表示id !=1
        //    not: [[id, 1], [name, a]],
        //    //此项表示id in(1,2)
        //    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
        //    //此项表示id not in(1,2)
        //    notin: [[id, [1, 2, 3]]],
        //    //此项不表示id >= 1
        //    operator: [[id, '>', 1]],
        //}
        //orwhere = {
        //    //此项表示id=1,name=a
        //    and: [[id, 1], [name, a]],
        //    //此项表示id !=1
        //    not: [[id, 1], [name, a]],
        //    //此项表示id in(1,2)
        //    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
        //    //此项表示id not in(1,2)
        //    notin: [[id, [1, 2, 3]]],
        //    //此项不表示id >= 1
        //    operator: [[id, '>', 1]],
        //}
        /**************************************************************************/
        var self = this;
        var parse = function parse(key, value, k) {
            var isor = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];

            switch (identifiers[key]) {
                case 'OR':
                    for (var _iterator = value, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                        var _ref2;

                        if (_isArray) {
                            if (_i >= _iterator.length) break;
                            _ref2 = _iterator[_i++];
                        } else {
                            _i = _iterator.next();
                            if (_i.done) break;
                            _ref2 = _i.value;
                        }

                        var m = _ref2;

                        for (var o in m) {
                            parse(o, m[o], o, true);
                        }
                    }
                    return;
                    break;
                //id:{in:[1,2,3,4]}
                case 'IN':
                    for (var n in value) {
                        isor ? self._options.where.orwhere.in.push([n, value[n]]) : self._options.where.where.in.push([n, value[n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.in.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.in.push([n, value[n]]);
                        //}
                    }
                    //return;
                    break;
                case 'NOTIN':
                    for (var _n in value) {
                        isor ? self._options.where.orwhere.notin.push([_n, value[_n]]) : self._options.where.where.notin.push([_n, value[_n]]);
                        //if (isor) {
                        //    self._options.where.orwhere.notin.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.notin.push([n, value[n]]);
                        //}
                    }
                    return;
                    break;
                case 'NULL':
                    if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
                    isor ? self._options.where.orwhere.null.push(value) : self._options.where.where.null.push(value);
                    //if (isor) {
                    //    self._options.where.orwhere.null.push(value);
                    //} else {
                    //    self._options.where.where.null.push(value);
                    //}
                    return;
                    break;
                case 'NOTNULL':
                    if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
                    isor ? self._options.where.orwhere.notnull.push(value) : self._options.where.where.notnull.push(value);
                    //if (isor) {
                    //    self._options.where.orwhere.null.push(value);
                    //} else {
                    //    self._options.where.where.null.push(value);
                    //}
                    return;
                    break;

                case 'BETWEEN':
                    isor ? self._options.where.orwhere.between.push([k, value]) : self._options.where.where.between.push([k, value]);
                    return;
                    break;
                case 'NOTBETWEEN':
                    isor ? self._options.where.orwhere.notbetween.push([k, value]) : self._options.where.where.notbetween.push([k, value]);
                    return;
                    break;
                case 'NOT':
                    for (var _n2 in value) {
                        isor ? self._options.where.orwhere.not.push([_n2, value[_n2]]) : self._options.where.where.not.push([_n2, value[_n2]]);
                        //if (isor) {
                        //    self._options.where.orwhere.not.push([n, value[n]]);
                        //} else {
                        //    self._options.where.where.not.push([n, value[n]]);
                        //}
                    }

                    break;
                    return;
                case 'OPERATOR':
                    isor ? self._options.where.orwhere.operation.push([k, key, value]) : self._options.where.where.operation.push([k, key, value]);
                    //if (isor) {
                    //    self._options.where.orwhere.operation.push([k, key, value])
                    //} else {
                    //    self._options.where.where.operation.push([k, key, value])
                    //}
                    break;
                    return;
                case 'AND':
                default:
                    if (ORM.isJSONObj(value)) {
                        for (var _n3 in value) {
                            parse(_n3, value[_n3], key, isor);
                        }
                        //} else if (isor) {
                        //    self._options.where.orwhere.and.push([key, '=', value]);
                    } else {
                        isor ? self._options.where.orwhere.and.push([key, '=', value]) : self._options.where.where.and.push([key, '=', value]);
                        //self._options.where.where.and.push([key, '=', value]);
                    }
                    return;
                    break;
            }
        };
        for (var key in _where) {
            parse(key, _where[key]);
        }
        //console.log(this._options.where);
        return this;
    };

    /**
     * 指定查询数量
     * @param offset
     * @param length
     */


    _class.prototype.limit = function limit(offset, length) {
        if (offset === undefined) {
            return this;
        }

        if (ORM.isArray(offset)) {
            offset = offset[0], length = offset[1];
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
     */


    _class.prototype.order = function order(_order) {
        if (_order === undefined) {
            return this;
        }
        //TODO进一步解析
        this._options.order = [];
        //如果是字符串id desc
        if (ORM.isString(_order)) {
            //'id desc,name aes'
            if (_order.indexOf(',') > -1) {
                var orderarr = _order.split(',');
                for (var _iterator2 = orderarr, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
                    var _ref3;

                    if (_isArray2) {
                        if (_i2 >= _iterator2.length) break;
                        _ref3 = _iterator2[_i2++];
                    } else {
                        _i2 = _iterator2.next();
                        if (_i2.done) break;
                        _ref3 = _i2.value;
                    }

                    var o = _ref3;

                    if (o.indexOf(' desc') > -1 || o.indexOf(' DESC') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'desc']);
                    } else if (o.indexOf(' aes') > -1 || _order.indexOf(' AES') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'aes']);
                    } else {
                        this._options.order.push([o, 'aes']);
                    }
                }
            } else {
                //'id desc'
                if (_order.indexOf(' desc') > -1 || _order.indexOf(' DESC') > -1) {
                    this._options.order.push([[_order.substring(0, _order.length - 5)], 'desc']);
                } else if (_order.indexOf(' aes') > -1 || _order.indexOf(' AES') > -1) {
                    this._options.order.push([[_order.substring(0, _order.length - 5)], 'aes']);
                } else {
                    this._options.order.push([_order, 'aes']);
                }
            }
        } else if (ORM.isArray(_order)) {
            //[{id: 'asc', name: 'desc'}],
            for (var _iterator3 = _order, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
                var _ref4;

                if (_isArray3) {
                    if (_i3 >= _iterator3.length) break;
                    _ref4 = _iterator3[_i3++];
                } else {
                    _i3 = _iterator3.next();
                    if (_i3.done) break;
                    _ref4 = _i3.value;
                }

                var _o = _ref4;

                for (var k in _o) {
                    this._options.order.push([k, _o[k]]);
                }
            }
        }
        return this;
    };

    /**
     * 分组
     * @param value
     */


    _class.prototype.group = function group(value) {
        this._options.group = value;
        return this;
    };

    /**
     * 关联
     * [{type:'left',from:'user',on:Object||Array}]
     * @param join
     */


    _class.prototype.join = function join(_join) {
        if (!_join) return this;
        var type = void 0,
            onCondition = void 0,
            from = void 0,
            joinArr = [],
            on = void 0,
            or = void 0,
            orArr = void 0;
        for (var _iterator4 = _join, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
            var _ref5;

            if (_isArray4) {
                if (_i4 >= _iterator4.length) break;
                _ref5 = _iterator4[_i4++];
            } else {
                _i4 = _iterator4.next();
                if (_i4.done) break;
                _ref5 = _i4.value;
            }

            var j = _ref5;

            type = j.type || 'left';
            from = j.from;
            onCondition = j.on;
            if (ORM.isObject(onCondition)) {
                //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                if (onCondition.or != undefined) {
                    orArr = ['' + this.tablePrefix + from + ' AS ' + from];
                    for (var _iterator5 = onCondition.or, _isArray5 = Array.isArray(_iterator5), _i5 = 0, _iterator5 = _isArray5 ? _iterator5 : (0, _getIterator3.default)(_iterator5);;) {
                        var _ref6;

                        if (_isArray5) {
                            if (_i5 >= _iterator5.length) break;
                            _ref6 = _iterator5[_i5++];
                        } else {
                            _i5 = _iterator5.next();
                            if (_i5.done) break;
                            _ref6 = _i5.value;
                        }

                        var o = _ref6;

                        or = [];
                        for (var k in o) {
                            or.push(k + '.' + o[k]);
                        }
                        orArr.push(or);
                    }
                    //console.log(orArr)
                    //or:['user',[[user.id,info.user_id],[user.name,info.user_name]]]
                    joinArr.push({ type: type, from: from, or: orArr });
                } else {
                    //or:{a:'id',b:'a_id'}
                    on = ['' + this.tablePrefix + from + ' AS ' + from];
                    for (var _k in onCondition) {
                        on.push(_k + '.' + onCondition[_k]);
                    }
                    joinArr.push({ type: type, from: from, on: on });
                }
            }
        }
        this._options.join = joinArr;
        return this;
    };

    /**
     * 指定关联操作的表
     * @param table
     */


    _class.prototype.rel = function rel() {
        var table = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

        if (ORM.isBoolean(table)) {
            if (table === false) {
                this._options.rel = [];
            } else {
                this._options.rel = true;
            }
        } else {
            if (ORM.isString(table)) {
                table = table.replace(/ +/g, '').split(',');
            }
            this._options.rel = ORM.isArray(table) ? table : [];
        }

        return this;
    };

    _class.prototype.count = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(field, options) {
            var result;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return this.parseOptions(options, { count: field });

                        case 2:
                            options = _context2.sent;
                            _context2.next = 5;
                            return this.adapter().count(options);

                        case 5:
                            result = _context2.sent;

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function count(_x5, _x6) {
            return _ref7.apply(this, arguments);
        }

        return count;
    }();

    _class.prototype.min = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(field, options) {
            var result;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return this.parseOptions(options, { min: field });

                        case 2:
                            options = _context3.sent;
                            _context3.next = 5;
                            return this.adapter().min(options);

                        case 5:
                            result = _context3.sent;

                        case 6:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function min(_x7, _x8) {
            return _ref8.apply(this, arguments);
        }

        return min;
    }();

    _class.prototype.max = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(field) {
            var options, result;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.max = field;
                            _context4.next = 4;
                            return this.parseOptions(this._options);

                        case 4:
                            options = _context4.sent;
                            _context4.next = 7;
                            return this.adapter().max(options);

                        case 7:
                            result = _context4.sent;

                        case 8:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function max(_x9) {
            return _ref9.apply(this, arguments);
        }

        return max;
    }();

    _class.prototype.avg = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(field, options) {
            var result;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return this.parseOptions(this._options, { avg: field });

                        case 2:
                            options = _context5.sent;
                            _context5.next = 5;
                            return this.adapter().avg(options);

                        case 5:
                            result = _context5.sent;

                        case 6:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function avg(_x10, _x11) {
            return _ref10.apply(this, arguments);
        }

        return avg;
    }();

    _class.prototype.avgDistinct = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(field, options) {
            var result;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return this.parseOptions(this._options, { avgDistinct: field });

                        case 2:
                            options = _context6.sent;
                            _context6.next = 5;
                            return this.adapter().avgDistinct(options);

                        case 5:
                            result = _context6.sent;

                        case 6:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function avgDistinct(_x12, _x13) {
            return _ref11.apply(this, arguments);
        }

        return avgDistinct;
    }();

    /**
     * 字段自增
     * @param field
     */


    _class.prototype.increment = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(field) {
            var inc = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
            var options = arguments[2];
            var result;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            if (!ORM.isEmpty(field)) {
                                _context7.next = 2;
                                break;
                            }

                            return _context7.abrupt('return', ORM.error('_INCREMENT_FIELD_EMPTY'));

                        case 2:
                            _context7.next = 4;
                            return this.parseOptions(options, { increment: [field, inc] });

                        case 4:
                            options = _context7.sent;
                            _context7.next = 7;
                            return this.adapter().increment(options);

                        case 7:
                            result = _context7.sent;

                        case 8:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function increment(_x14, _x15, _x16) {
            return _ref12.apply(this, arguments);
        }

        return increment;
    }();

    /**
     * 字段自减
     * @param field
     */


    _class.prototype.decrement = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(field) {
            var dec = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];
            var options = arguments[2];
            var result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            if (!ORM.isEmpty(field)) {
                                _context8.next = 2;
                                break;
                            }

                            return _context8.abrupt('return', ORM.error('_DECREMENT_FIELD_EMPTY'));

                        case 2:
                            _context8.next = 4;
                            return this.parseOptions(options, { decrement: [field, dec] });

                        case 4:
                            options = _context8.sent;
                            _context8.next = 7;
                            return this.adapter().decrement(options);

                        case 7:
                            result = _context8.sent;

                        case 8:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function decrement(_x18, _x19, _x20) {
            return _ref13.apply(this, arguments);
        }

        return decrement;
    }();

    /**
     * 查询一条数据
     * @param option
     */


    _class.prototype.find = function () {
        var _ref14 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options) {
            var result;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            _context9.next = 2;
                            return this.parseOptions(options, { limit: [0, 1] });

                        case 2:
                            options = _context9.sent;
                            _context9.next = 5;
                            return this.adapter().select(options);

                        case 5:
                            result = _context9.sent;

                            if (!(options.rel && !ORM.isEmpty(result))) {
                                _context9.next = 9;
                                break;
                            }

                            _context9.next = 9;
                            return this.__getRelationData(result[0] || {}, options);

                        case 9:
                            _context9.next = 11;
                            return this.parseData(result[0] || {}, options);

                        case 11:
                            result = _context9.sent;
                            return _context9.abrupt('return', this._afterFind(result, options));

                        case 13:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function find(_x22) {
            return _ref14.apply(this, arguments);
        }

        return find;
    }();

    /**
     * 查询后置操作
     * @param data
     * @param options
     * @returns {Promise.<*>}
     * @private
     */


    _class.prototype._afterFind = function () {
        var _ref15 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(data, options) {
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            return _context10.abrupt('return', _promise2.default.resolve(data));

                        case 1:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function _afterFind(_x23, _x24) {
            return _ref15.apply(this, arguments);
        }

        return _afterFind;
    }();

    /**
     * 查询多条数据
     * @param option
     */


    _class.prototype.select = function () {
        var _ref16 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(options) {
            var result;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            _context11.next = 2;
                            return this.parseOptions(options);

                        case 2:
                            options = _context11.sent;
                            _context11.next = 5;
                            return this.adapter().select(options);

                        case 5:
                            result = _context11.sent;
                            _context11.next = 8;
                            return this.parseData(result || [], options);

                        case 8:
                            result = _context11.sent;
                            return _context11.abrupt('return', this._afterSelect(result, options));

                        case 10:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function select(_x25) {
            return _ref16.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 查询后只操作
     * @param result
     * @param options
     * @private
     */


    _class.prototype._afterSelect = function () {
        var _ref17 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(data, options) {
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            return _context12.abrupt('return', _promise2.default.resolve(data));

                        case 1:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        }));

        function _afterSelect(_x26, _x27) {
            return _ref17.apply(this, arguments);
        }

        return _afterSelect;
    }();

    /**
     * 新增操作
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.add = function () {
        var _ref18 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee13(data, options) {
            var result, pk;
            return _regenerator2.default.wrap(function _callee13$(_context13) {
                while (1) {
                    switch (_context13.prev = _context13.next) {
                        case 0:
                            if (!ORM.isEmpty(data)) {
                                _context13.next = 2;
                                break;
                            }

                            return _context13.abrupt('return', ORM.error('_DATA_TYPE_INVALID_'));

                        case 2:
                            _context13.next = 4;
                            return this.parseOptions(options);

                        case 4:
                            options = _context13.sent;

                            this._data = data;
                            _context13.next = 8;
                            return this.parseData(this._data, options, 1);

                        case 8:
                            this._data = _context13.sent;
                            _context13.next = 11;
                            return this.adapter().insert(this._data, options);

                        case 11:
                            result = _context13.sent;
                            pk = this.getPk();

                            this._data[pk] = this.adapter().getLastInsertId();
                            //TODO关联写入
                            if (!ORM.isEmpty(this.relation)) {}
                            this._data[pk] = this._data[pk] ? this._data[pk] : result[pk];
                            _context13.next = 18;
                            return this._afterAdd(this._data, options);

                        case 18:
                            return _context13.abrupt('return', this._data[pk]);

                        case 19:
                        case 'end':
                            return _context13.stop();
                    }
                }
            }, _callee13, this);
        }));

        function add(_x28, _x29) {
            return _ref18.apply(this, arguments);
        }

        return add;
    }();

    /**
     * 新增后置操作
     * @param data
     * @param opitons
     * @returns {Promise.<*>}
     * @private
     */


    _class.prototype._afterAdd = function () {
        var _ref19 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee14(data, opitons) {
            return _regenerator2.default.wrap(function _callee14$(_context14) {
                while (1) {
                    switch (_context14.prev = _context14.next) {
                        case 0:
                            return _context14.abrupt('return', _promise2.default.resolve(data));

                        case 1:
                        case 'end':
                            return _context14.stop();
                    }
                }
            }, _callee14, this);
        }));

        function _afterAdd(_x30, _x31) {
            return _ref19.apply(this, arguments);
        }

        return _afterAdd;
    }();

    /**
     * 批量写入,不提供关联写入
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.addAll = function () {
        var _ref20 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee15(data, options) {
            var _this2 = this;

            var ps;
            return _regenerator2.default.wrap(function _callee15$(_context15) {
                while (1) {
                    switch (_context15.prev = _context15.next) {
                        case 0:
                            if (ORM.isArray(data)) {
                                _context15.next = 2;
                                break;
                            }

                            return _context15.abrupt('return', ORM.error('DATA MUST BE ARRAY'));

                        case 2:
                            _context15.next = 4;
                            return this.parseOptions(options);

                        case 4:
                            options = _context15.sent;

                            this._data = data;
                            ps = this._data.map(function (item) {
                                return _this2.parseData(item, options);
                            });
                            _context15.next = 9;
                            return _promise2.default.all(ps);

                        case 9:
                            this._data = _context15.sent;
                            _context15.next = 12;
                            return this.adapter().insertAll(this._data, options);

                        case 12:
                            return _context15.abrupt('return', _context15.sent);

                        case 13:
                        case 'end':
                            return _context15.stop();
                    }
                }
            }, _callee15, this);
        }));

        function addAll(_x32, _x33) {
            return _ref20.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 更新操作
     * @param data
     * @param options
     */


    _class.prototype.update = function () {
        var _ref21 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee16(data, options) {
            return _regenerator2.default.wrap(function _callee16$(_context16) {
                while (1) {
                    switch (_context16.prev = _context16.next) {
                        case 0:
                            if (!ORM.isEmpty(data)) {
                                _context16.next = 2;
                                break;
                            }

                            return _context16.abrupt('return', ORM.error('_DATA_TYPE_INVALID_'));

                        case 2:
                            _context16.next = 4;
                            return this.parseOptions(options);

                        case 4:
                            options = _context16.sent;

                            this._data = data;
                            _context16.next = 8;
                            return this.parseData(this._data, options, 2);

                        case 8:
                            this._data = _context16.sent;
                            _context16.next = 11;
                            return this.adapter().update(this._data, options);

                        case 11:
                            this._data = _context16.sent;

                            //TODO关联写入
                            if (!ORM.isEmpty(this.relation)) {}
                            _context16.next = 15;
                            return this._afterUpdate(this._data, options);

                        case 15:
                            return _context16.abrupt('return', _context16.sent);

                        case 16:
                        case 'end':
                            return _context16.stop();
                    }
                }
            }, _callee16, this);
        }));

        function update(_x34, _x35) {
            return _ref21.apply(this, arguments);
        }

        return update;
    }();

    /**
     * 更新后置操作
     * @param data
     * @param options
     * @returns {Promise.<*>}
     * @private
     */


    _class.prototype._afterUpdate = function () {
        var _ref22 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee17(data, options) {
            return _regenerator2.default.wrap(function _callee17$(_context17) {
                while (1) {
                    switch (_context17.prev = _context17.next) {
                        case 0:
                            return _context17.abrupt('return', _promise2.default.resolve(data));

                        case 1:
                        case 'end':
                            return _context17.stop();
                    }
                }
            }, _callee17, this);
        }));

        function _afterUpdate(_x36, _x37) {
            return _ref22.apply(this, arguments);
        }

        return _afterUpdate;
    }();

    /**
     * 删除前置操作
     * @param options
     * @private
     */


    _class.prototype._beforeDelte = function () {
        var _ref23 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee18(options) {
            return _regenerator2.default.wrap(function _callee18$(_context18) {
                while (1) {
                    switch (_context18.prev = _context18.next) {
                        case 0:
                            return _context18.abrupt('return', _promise2.default.resolve(options));

                        case 1:
                        case 'end':
                            return _context18.stop();
                    }
                }
            }, _callee18, this);
        }));

        function _beforeDelte(_x38) {
            return _ref23.apply(this, arguments);
        }

        return _beforeDelte;
    }();

    /**
     * 删除操作
     * @param options
     */


    _class.prototype.delete = function () {
        var _ref24 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee19(options) {
            var result;
            return _regenerator2.default.wrap(function _callee19$(_context19) {
                while (1) {
                    switch (_context19.prev = _context19.next) {
                        case 0:
                            options = this.parseOptions(options);
                            _context19.next = 3;
                            return this._beforeDelte(options);

                        case 3:
                            options = _context19.sent;
                            _context19.next = 6;
                            return this.adapter().delete(options);

                        case 6:
                            result = _context19.sent;
                            _context19.next = 9;
                            return this._afterDel(options);

                        case 9:
                            options = _context19.sent;
                            return _context19.abrupt('return', result);

                        case 11:
                        case 'end':
                            return _context19.stop();
                    }
                }
            }, _callee19, this);
        }));

        function _delete(_x39) {
            return _ref24.apply(this, arguments);
        }

        return _delete;
    }();

    /**
     * 删除后置操作
     * @param options
     * @private
     */


    _class.prototype._afterDelte = function () {
        var _ref25 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee20(options) {
            return _regenerator2.default.wrap(function _callee20$(_context20) {
                while (1) {
                    switch (_context20.prev = _context20.next) {
                        case 0:
                        case 'end':
                            return _context20.stop();
                    }
                }
            }, _callee20, this);
        }));

        function _afterDelte(_x40) {
            return _ref25.apply(this, arguments);
        }

        return _afterDelte;
    }();

    /**
     * 解析参数
     */


    _class.prototype.parseOptions = function () {
        var _ref26 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee21(oriOpts, extraOptions) {
            var options;
            return _regenerator2.default.wrap(function _callee21$(_context21) {
                while (1) {
                    switch (_context21.prev = _context21.next) {
                        case 0:
                            options = void 0;

                            if (ORM.isScalar(oriOpts)) {
                                options = ORM.extend({}, this._options);
                            } else {
                                options = ORM.extend({}, this._options, oriOpts, extraOptions);
                            }
                            //查询过后清空sql表达式组装 避免影响下次查询
                            this._options = {};
                            //获取表名
                            options.table = options.table || this.getTableName();
                            //表前缀，Db里会使用
                            options.tablePrefix = this.tablePrefix;
                            options.modelName = this.getModelName();

                            return _context21.abrupt('return', options);

                        case 7:
                        case 'end':
                            return _context21.stop();
                    }
                }
            }, _callee21, this);
        }));

        function parseOptions(_x41, _x42) {
            return _ref26.apply(this, arguments);
        }

        return parseOptions;
    }();

    /**
     * 解析数据
     * @param data
     * @param options
     * @param beforeCheck 1:add操作前检查,2:update操作前检查
     */


    _class.prototype.parseData = function () {
        var _ref27 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee22(data, options) {
            var beforeCheck = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];
            return _regenerator2.default.wrap(function _callee22$(_context22) {
                while (1) {
                    switch (_context22.prev = _context22.next) {
                        case 0:
                            return _context22.abrupt('return', data);

                        case 1:
                        case 'end':
                            return _context22.stop();
                    }
                }
            }, _callee22, this);
        }));

        function parseData(_x43, _x44, _x45) {
            return _ref27.apply(this, arguments);
        }

        return parseData;
    }();

    /**
     * 获取关联数据
     * @param result
     * @param options
     * @private
     */


    _class.prototype.__getRelationData = function () {
        var _ref28 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee23(result, options) {
            var o;
            return _regenerator2.default.wrap(function _callee23$(_context23) {
                while (1) {
                    switch (_context23.prev = _context23.next) {
                        case 0:
                            o = void 0;

                            if (!ORM.isBoolean(options.rel)) {
                                _context23.next = 9;
                                break;
                            }

                            if (!(options.rel === false)) {
                                _context23.next = 6;
                                break;
                            }

                            return _context23.abrupt('return', result);

                        case 6:
                            o = true;

                        case 7:
                            _context23.next = 10;
                            break;

                        case 9:
                            if (ORM.isString(options.rel)) {
                                o = options.rel.replace(/ +/g, '').split(',');
                            } else {
                                o = options.rel;
                            }

                        case 10:
                            _context23.next = 12;
                            return this.__getRelationOptions(result, o);

                        case 12:
                        case 'end':
                            return _context23.stop();
                    }
                }
            }, _callee23, this);
        }));

        function __getRelationData(_x47, _x48) {
            return _ref28.apply(this, arguments);
        }

        return __getRelationData;
    }();

    /**
     * 解析关联查询options
     * @param data
     * @param option
     * @private
     */


    _class.prototype.__getRelationOptions = function () {
        var _ref29 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee24(data, option) {
            var relation, _iterator6, _isArray6, _i6, _ref30, k, _iterator7, _isArray7, _i7, _ref31, _k2, caseList, relationObj, item, _k3, type;

            return _regenerator2.default.wrap(function _callee24$(_context24) {
                while (1) {
                    switch (_context24.prev = _context24.next) {
                        case 0:
                            relation = {};

                            if (!(option === true)) {
                                _context24.next = 5;
                                break;
                            }

                            //查询全部关联关系,且无任何条件
                            relation = this.relation;
                            _context24.next = 39;
                            break;

                        case 5:
                            if (!ORM.isObject(option)) {
                                _context24.next = 23;
                                break;
                            }

                            _iterator6 = (0, _keys2.default)(option), _isArray6 = Array.isArray(_iterator6), _i6 = 0, _iterator6 = _isArray6 ? _iterator6 : (0, _getIterator3.default)(_iterator6);

                        case 7:
                            if (!_isArray6) {
                                _context24.next = 13;
                                break;
                            }

                            if (!(_i6 >= _iterator6.length)) {
                                _context24.next = 10;
                                break;
                            }

                            return _context24.abrupt('break', 21);

                        case 10:
                            _ref30 = _iterator6[_i6++];
                            _context24.next = 17;
                            break;

                        case 13:
                            _i6 = _iterator6.next();

                            if (!_i6.done) {
                                _context24.next = 16;
                                break;
                            }

                            return _context24.abrupt('break', 21);

                        case 16:
                            _ref30 = _i6.value;

                        case 17:
                            k = _ref30;

                            if (this.relation[k]) relation[k] = ORM.extend({}, option[k], this.relation[k]);

                        case 19:
                            _context24.next = 7;
                            break;

                        case 21:
                            _context24.next = 39;
                            break;

                        case 23:
                            if (!ORM.isArray(option)) {
                                _context24.next = 39;
                                break;
                            }

                            _iterator7 = option, _isArray7 = Array.isArray(_iterator7), _i7 = 0, _iterator7 = _isArray7 ? _iterator7 : (0, _getIterator3.default)(_iterator7);

                        case 25:
                            if (!_isArray7) {
                                _context24.next = 31;
                                break;
                            }

                            if (!(_i7 >= _iterator7.length)) {
                                _context24.next = 28;
                                break;
                            }

                            return _context24.abrupt('break', 39);

                        case 28:
                            _ref31 = _iterator7[_i7++];
                            _context24.next = 35;
                            break;

                        case 31:
                            _i7 = _iterator7.next();

                            if (!_i7.done) {
                                _context24.next = 34;
                                break;
                            }

                            return _context24.abrupt('break', 39);

                        case 34:
                            _ref31 = _i7.value;

                        case 35:
                            _k2 = _ref31;

                            if (this.relation[_k2]) relation[_k2] = this.relation[_k2];

                        case 37:
                            _context24.next = 25;
                            break;

                        case 39:
                            caseList = {
                                1: this.__getHasOneRelation,
                                2: this.__getHasManyRelation,
                                3: this.__getManyToManyRelation,
                                4: this.__getBelongsToRealtion,
                                HASONE: this.__getHasOneRelation,
                                HASMANY: this.__getHasManyRelation,
                                MANYTOMANY: this.__getManyToManyRelation,
                                BELONGSTO: this.__getBelongsToRealtion
                            };
                            relationObj = {}, item = void 0;
                            _context24.t0 = _regenerator2.default.keys(relation);

                        case 42:
                            if ((_context24.t1 = _context24.t0()).done) {
                                _context24.next = 53;
                                break;
                            }

                            _k3 = _context24.t1.value;

                            item = relation[_k3];
                            item.name = _k3;
                            type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;

                            if (!(type && type in caseList)) {
                                _context24.next = 51;
                                break;
                            }

                            _context24.next = 50;
                            return caseList[type](this, data, item);

                        case 50:
                            relationObj = _context24.sent;

                        case 51:
                            _context24.next = 42;
                            break;

                        case 53:
                            return _context24.abrupt('return', relationObj);

                        case 54:
                        case 'end':
                            return _context24.stop();
                    }
                }
            }, _callee24, this);
        }));

        function __getRelationOptions(_x49, _x50) {
            return _ref29.apply(this, arguments);
        }

        return __getRelationOptions;
    }();

    /**
     * 获取一对一关联数据
     * 附属表中有主表的一个外键
     * @param relation
     * @param option
     * @private
     */


    _class.prototype.__getHasOneRelation = function () {
        var _ref32 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee25(self, data, relation) {
            var Model, model, key, fkey, where, _iterator8, _isArray8, _i8, _ref33, _ref34, k, v;

            return _regenerator2.default.wrap(function _callee25$(_context25) {
                while (1) {
                    switch (_context25.prev = _context25.next) {
                        case 0:
                            Model = require('../index');
                            model = new Model(relation.model, self.config);
                            //let model = ORM.model(relation.model, {});

                            if (relation.field) model = model.field(relation.field);
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};

                            if (!ORM.isArray(data)) {
                                _context25.next = 32;
                                break;
                            }

                            _iterator8 = data.entries(), _isArray8 = Array.isArray(_iterator8), _i8 = 0, _iterator8 = _isArray8 ? _iterator8 : (0, _getIterator3.default)(_iterator8);

                        case 10:
                            if (!_isArray8) {
                                _context25.next = 16;
                                break;
                            }

                            if (!(_i8 >= _iterator8.length)) {
                                _context25.next = 13;
                                break;
                            }

                            return _context25.abrupt('break', 30);

                        case 13:
                            _ref33 = _iterator8[_i8++];
                            _context25.next = 20;
                            break;

                        case 16:
                            _i8 = _iterator8.next();

                            if (!_i8.done) {
                                _context25.next = 19;
                                break;
                            }

                            return _context25.abrupt('break', 30);

                        case 19:
                            _ref33 = _i8.value;

                        case 20:
                            _ref34 = _ref33;
                            k = _ref34[0];
                            v = _ref34[1];

                            where[fkey] = v[key];
                            if (relation.where) where = ORM.extend({}, where, relation.where);
                            _context25.next = 27;
                            return model.where(where).find();

                        case 27:
                            data[k][relation.name] = _context25.sent;

                        case 28:
                            _context25.next = 10;
                            break;

                        case 30:
                            _context25.next = 37;
                            break;

                        case 32:
                            where[fkey] = data[key];
                            if (relation.where) where = ORM.extend({}, where, relation.where);
                            _context25.next = 36;
                            return model.where(where).find();

                        case 36:
                            data[relation.name] = _context25.sent;

                        case 37:
                            return _context25.abrupt('return', data);

                        case 38:
                        case 'end':
                            return _context25.stop();
                    }
                }
            }, _callee25, this);
        }));

        function __getHasOneRelation(_x51, _x52, _x53) {
            return _ref32.apply(this, arguments);
        }

        return __getHasOneRelation;
    }();

    /**
     * 获取一对多
     * @param self
     * @param data
     * @param relation
     * @private
     */


    _class.prototype.__getHasManyRelation = function () {
        var _ref35 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee26(self, data, relation) {
            var Model, model, key, fkey, where, _iterator9, _isArray9, _i9, _ref36, _ref37, k, v;

            return _regenerator2.default.wrap(function _callee26$(_context26) {
                while (1) {
                    switch (_context26.prev = _context26.next) {
                        case 0:
                            //let model = ORM.model(relation.model, {});
                            Model = require('../index');
                            model = new Model(relation.model, self.config);

                            if (relation.field) model = model.field(relation.field);
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};

                            if (!ORM.isArray(data)) {
                                _context26.next = 32;
                                break;
                            }

                            _iterator9 = data.entries(), _isArray9 = Array.isArray(_iterator9), _i9 = 0, _iterator9 = _isArray9 ? _iterator9 : (0, _getIterator3.default)(_iterator9);

                        case 10:
                            if (!_isArray9) {
                                _context26.next = 16;
                                break;
                            }

                            if (!(_i9 >= _iterator9.length)) {
                                _context26.next = 13;
                                break;
                            }

                            return _context26.abrupt('break', 30);

                        case 13:
                            _ref36 = _iterator9[_i9++];
                            _context26.next = 20;
                            break;

                        case 16:
                            _i9 = _iterator9.next();

                            if (!_i9.done) {
                                _context26.next = 19;
                                break;
                            }

                            return _context26.abrupt('break', 30);

                        case 19:
                            _ref36 = _i9.value;

                        case 20:
                            _ref37 = _ref36;
                            k = _ref37[0];
                            v = _ref37[1];

                            where[fkey] = v[key];
                            if (relation.where) where = ORM.extend({}, where, relation.where);
                            _context26.next = 27;
                            return model.where(where).select();

                        case 27:
                            data[k][relation.name] = _context26.sent;

                        case 28:
                            _context26.next = 10;
                            break;

                        case 30:
                            _context26.next = 37;
                            break;

                        case 32:
                            where[fkey] = data[key];
                            if (relation.where) where = ORM.extend({}, where, relation.where);
                            _context26.next = 36;
                            return model.where(where).select();

                        case 36:
                            data[relation.name] = _context26.sent;

                        case 37:
                            return _context26.abrupt('return', data);

                        case 38:
                        case 'end':
                            return _context26.stop();
                    }
                }
            }, _callee26, this);
        }));

        function __getHasManyRelation(_x54, _x55, _x56) {
            return _ref35.apply(this, arguments);
        }

        return __getHasManyRelation;
    }();

    /**
     * 获取多对多,需要一张关联关系表
     * @param self
     * @param data
     * @param relation
     * @private
     */


    _class.prototype.__getManyToManyRelation = function () {
        var _ref38 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee27(self, data, relation) {
            var Model, model, modelTableName, option, options, field, _iterator10, _isArray10, _i10, _ref39, f, key, fkey, where, rfkey, _iterator11, _isArray11, _i11, _on, _ref40, _ref41, k, v, _on2;

            return _regenerator2.default.wrap(function _callee27$(_context27) {
                while (1) {
                    switch (_context27.prev = _context27.next) {
                        case 0:
                            //let model = ORM.model(relation.model, {});
                            Model = require('../index');
                            model = new Model(relation.model, self.config);
                            modelTableName = model.getTableName();
                            option = { where: {} }, options = {};

                            if (!relation.field) {
                                _context27.next = 22;
                                break;
                            }

                            field = [];
                            _iterator10 = relation.field.replace(/ +/g, '').split(','), _isArray10 = Array.isArray(_iterator10), _i10 = 0, _iterator10 = _isArray10 ? _iterator10 : (0, _getIterator3.default)(_iterator10);

                        case 7:
                            if (!_isArray10) {
                                _context27.next = 13;
                                break;
                            }

                            if (!(_i10 >= _iterator10.length)) {
                                _context27.next = 10;
                                break;
                            }

                            return _context27.abrupt('break', 21);

                        case 10:
                            _ref39 = _iterator10[_i10++];
                            _context27.next = 17;
                            break;

                        case 13:
                            _i10 = _iterator10.next();

                            if (!_i10.done) {
                                _context27.next = 16;
                                break;
                            }

                            return _context27.abrupt('break', 21);

                        case 16:
                            _ref39 = _i10.value;

                        case 17:
                            f = _ref39;

                            field.push(modelTableName + '.' + f);

                        case 19:
                            _context27.next = 7;
                            break;

                        case 21:
                            model = model.field(field);

                        case 22:
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            if (relation.relationtable) {
                                options.table = relation.relationtable;
                            } else {
                                options.table = '' + ORM.config('db_prefix') + self.getModelName().toLowerCase() + '_' + model.getModelName().toLowerCase() + '_map';
                            }
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};
                            //let rkey = model.relation.key || model.getPk();

                            rfkey = model.relation.fkey || model.getModelName().toLowerCase() + '_id';

                            if (!ORM.isArray(data)) {
                                _context27.next = 54;
                                break;
                            }

                            _iterator11 = data.entries(), _isArray11 = Array.isArray(_iterator11), _i11 = 0, _iterator11 = _isArray11 ? _iterator11 : (0, _getIterator3.default)(_iterator11);

                        case 31:
                            if (!_isArray11) {
                                _context27.next = 37;
                                break;
                            }

                            if (!(_i11 >= _iterator11.length)) {
                                _context27.next = 34;
                                break;
                            }

                            return _context27.abrupt('break', 52);

                        case 34:
                            _ref40 = _iterator11[_i11++];
                            _context27.next = 41;
                            break;

                        case 37:
                            _i11 = _iterator11.next();

                            if (!_i11.done) {
                                _context27.next = 40;
                                break;
                            }

                            return _context27.abrupt('break', 52);

                        case 40:
                            _ref40 = _i11.value;

                        case 41:
                            _ref41 = _ref40;
                            k = _ref41[0];
                            v = _ref41[1];

                            option.where[options.table + '.' + fkey] = v[key];
                            if (relation.where) option.where = ORM.extend({}, where, option.where);
                            //data[k][relation.name] = await self.db().select(option);
                            option.join = [{
                                from: relation.model,
                                on: (_on = {}, _on[relation.model] = key, _on['' + options.table] = rfkey, _on)
                            }];
                            _context27.next = 49;
                            return model.where(option.where).join(option.join).select(options);

                        case 49:
                            data[k][relation.name] = _context27.sent;

                        case 50:
                            _context27.next = 31;
                            break;

                        case 52:
                            _context27.next = 60;
                            break;

                        case 54:
                            option.where[options.table + '.' + fkey] = data[key];
                            if (relation.where) option.where = ORM.extend({}, where, option.where);
                            //option.join = `${option.table} ON ${modelTableName}.${key} = ${option.table}.${rfkey}`;
                            option.join = [{
                                from: relation.model,
                                on: (_on2 = {}, _on2[relation.model] = key, _on2['' + options.table] = rfkey, _on2)
                            }];
                            _context27.next = 59;
                            return model.where(option.where).join(option.join).select(options);

                        case 59:
                            data[relation.name] = _context27.sent;

                        case 60:
                            return _context27.abrupt('return', data);

                        case 61:
                        case 'end':
                            return _context27.stop();
                    }
                }
            }, _callee27, this);
        }));

        function __getManyToManyRelation(_x57, _x58, _x59) {
            return _ref38.apply(this, arguments);
        }

        return __getManyToManyRelation;
    }();

    /**
     * 获取属于关系
     * 附属表中有主表的一个外键
     * @private
     */


    _class.prototype.__getBelongsToRealtion = function () {
        var _ref42 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee28(self, data, relation) {
            var Model, model, key, fkey, where, _iterator12, _isArray12, _i12, _ref43, _ref44, k, v;

            return _regenerator2.default.wrap(function _callee28$(_context28) {
                while (1) {
                    switch (_context28.prev = _context28.next) {
                        case 0:
                            //let model = ORM.model(relation.model, {});
                            Model = require('../index');
                            model = new Model(relation.model, self.config);

                            if (relation.field) model = model.field(relation.field);
                            if (relation.limit) model = model.field(relation.limit);
                            if (relation.order) model = model.field(relation.order);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            where = {};

                            if (!ORM.isArray(data)) {
                                _context28.next = 32;
                                break;
                            }

                            _iterator12 = data.entries(), _isArray12 = Array.isArray(_iterator12), _i12 = 0, _iterator12 = _isArray12 ? _iterator12 : (0, _getIterator3.default)(_iterator12);

                        case 10:
                            if (!_isArray12) {
                                _context28.next = 16;
                                break;
                            }

                            if (!(_i12 >= _iterator12.length)) {
                                _context28.next = 13;
                                break;
                            }

                            return _context28.abrupt('break', 30);

                        case 13:
                            _ref43 = _iterator12[_i12++];
                            _context28.next = 20;
                            break;

                        case 16:
                            _i12 = _iterator12.next();

                            if (!_i12.done) {
                                _context28.next = 19;
                                break;
                            }

                            return _context28.abrupt('break', 30);

                        case 19:
                            _ref43 = _i12.value;

                        case 20:
                            _ref44 = _ref43;
                            k = _ref44[0];
                            v = _ref44[1];

                            where[key] = v[fkey];
                            if (relation.where) where = ORM.extend({}, where, relation.where);
                            _context28.next = 27;
                            return model.where(where).find();

                        case 27:
                            data[k][relation.name] = _context28.sent;

                        case 28:
                            _context28.next = 10;
                            break;

                        case 30:
                            _context28.next = 37;
                            break;

                        case 32:
                            where[key] = data[fkey];
                            if (relation.where) where = ORM.extend({}, where, relation.where);
                            _context28.next = 36;
                            return model.where(where).find();

                        case 36:
                            data[relation.name] = _context28.sent;

                        case 37:
                            return _context28.abrupt('return', data);

                        case 38:
                        case 'end':
                            return _context28.stop();
                    }
                }
            }, _callee28, this);
        }));

        function __getBelongsToRealtion(_x60, _x61, _x62) {
            return _ref42.apply(this, arguments);
        }

        return __getBelongsToRealtion;
    }();

    /**
     * 添加关联关系数据
     * @param result 主表操作返回结果
     * @param data 主表数据
     * @private
     */


    _class.prototype.__postRelationData = function () {
        var _ref45 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee29(result, data, postType, options) {
            var _this3 = this;

            var pk, caseList, promises;
            return _regenerator2.default.wrap(function _callee29$(_context29) {
                while (1) {
                    switch (_context29.prev = _context29.next) {
                        case 0:
                            _context29.next = 2;
                            return this.getPk();

                        case 2:
                            pk = _context29.sent;

                            //data[pk] = result;
                            caseList = {
                                1: this.__postHasOneRelation,
                                2: this.__postHasManyRelation,
                                3: this.__postManyToManyRelation,
                                4: this.__postBelongsToRealtion,
                                HASONE: this.__postHasOneRelation,
                                HASMANY: this.__postHasManyRelation,
                                MANYTOMANY: this.__postManyToManyRelation,
                                BELONGSTO: this.__postBelongsToRealtion
                            };
                            promises = (0, _keys2.default)(this.relation).map(function (key) {
                                var item = _this3.relation[key];
                                //主表数据没有存储关联字段数据,直接返回
                                if (ORM.isEmpty(data[key])) return;
                                var type = item.type && !~['1', '2', '3', '4'].indexOf(item.type + '') ? (item.type + '').toUpperCase() : item.type;
                                if (type && type in caseList) {
                                    caseList[type](_this3, data, data[key], postType, item);
                                }
                            });
                            _context29.next = 7;
                            return _promise2.default.all(promises);

                        case 7:
                            return _context29.abrupt('return', data);

                        case 8:
                        case 'end':
                            return _context29.stop();
                    }
                }
            }, _callee29, this);
        }));

        function __postRelationData(_x63, _x64, _x65, _x66) {
            return _ref45.apply(this, arguments);
        }

        return __postRelationData;
    }();

    /**
     * hasone子表数据新增更新
     * @param self
     * @param data
     * @param postType
     * @param item
     * @private
     */


    _class.prototype.__postHasOneRelation = function () {
        var _ref46 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee30(self, data, childdata, postType, relation) {
            var _model$where;

            var Model, model, key, fkey;
            return _regenerator2.default.wrap(function _callee30$(_context30) {
                while (1) {
                    switch (_context30.prev = _context30.next) {
                        case 0:
                            //let model = ORM.model(relation.model, {});
                            Model = require('../index');
                            model = new Model(relation.model, self.config);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            //子表外键数据

                            childdata[fkey] = data[key];
                            _context30.t0 = postType;
                            _context30.next = _context30.t0 === 'ADD' ? 8 : _context30.t0 === 'UPDATE' ? 12 : 19;
                            break;

                        case 8:
                            _context30.next = 10;
                            return model.add(childdata);

                        case 10:
                            return _context30.abrupt('return', _context30.sent);

                        case 12:
                            if (!ORM.isEmpty(childdata[fkey])) {
                                _context30.next = 14;
                                break;
                            }

                            return _context30.abrupt('return');

                        case 14:
                            delete childdata[fkey];
                            _context30.next = 17;
                            return model.where((_model$where = {}, _model$where[fkey] = data[key], _model$where)).update(childdata);

                        case 17:
                            return _context30.abrupt('return', _context30.sent);

                        case 19:
                        case 'end':
                            return _context30.stop();
                    }
                }
            }, _callee30, this);
        }));

        function __postHasOneRelation(_x67, _x68, _x69, _x70, _x71) {
            return _ref46.apply(this, arguments);
        }

        return __postHasOneRelation;
    }();

    /**
     * hasmany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */


    _class.prototype.__postHasManyRelation = function () {
        var _ref47 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee31(self, data, childdata, postType, relation) {
            var Model, model, key, fkey, pk, _iterator13, _isArray13, _i13, _ref48, _ref49, k, v;

            return _regenerator2.default.wrap(function _callee31$(_context31) {
                while (1) {
                    switch (_context31.prev = _context31.next) {
                        case 0:
                            //let model = ORM.model(relation.model, {});
                            Model = require('../index');
                            model = new Model(relation.model, self.config);
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            pk = model.getPk();
                            //子表外键数据

                            if (!ORM.isArray(childdata)) {
                                childdata = [childdata];
                            }
                            _iterator13 = childdata.entries(), _isArray13 = Array.isArray(_iterator13), _i13 = 0, _iterator13 = _isArray13 ? _iterator13 : (0, _getIterator3.default)(_iterator13);

                        case 7:
                            if (!_isArray13) {
                                _context31.next = 13;
                                break;
                            }

                            if (!(_i13 >= _iterator13.length)) {
                                _context31.next = 10;
                                break;
                            }

                            return _context31.abrupt('break', 39);

                        case 10:
                            _ref48 = _iterator13[_i13++];
                            _context31.next = 17;
                            break;

                        case 13:
                            _i13 = _iterator13.next();

                            if (!_i13.done) {
                                _context31.next = 16;
                                break;
                            }

                            return _context31.abrupt('break', 39);

                        case 16:
                            _ref48 = _i13.value;

                        case 17:
                            _ref49 = _ref48;
                            k = _ref49[0];
                            v = _ref49[1];

                            v[fkey] = data[key];
                            _context31.t0 = postType;
                            _context31.next = _context31.t0 === 'ADD' ? 24 : _context31.t0 === 'UPDATE' ? 27 : 37;
                            break;

                        case 24:
                            _context31.next = 26;
                            return model.add(v);

                        case 26:
                            return _context31.abrupt('break', 37);

                        case 27:
                            if (!v[pk]) {
                                _context31.next = 32;
                                break;
                            }

                            _context31.next = 30;
                            return model.update(v);

                        case 30:
                            _context31.next = 36;
                            break;

                        case 32:
                            if (!data[key]) {
                                _context31.next = 36;
                                break;
                            }

                            //若更新主表数据中有其关联子表的字段,则新增关联数据
                            v[fkey] = data[key];
                            _context31.next = 36;
                            return model.add(v);

                        case 36:
                            return _context31.abrupt('break', 37);

                        case 37:
                            _context31.next = 7;
                            break;

                        case 39:
                            return _context31.abrupt('return');

                        case 40:
                        case 'end':
                            return _context31.stop();
                    }
                }
            }, _callee31, this);
        }));

        function __postHasManyRelation(_x72, _x73, _x74, _x75, _x76) {
            return _ref47.apply(this, arguments);
        }

        return __postHasManyRelation;
    }();

    /**
     * manytomany子表数据新增更新
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */


    _class.prototype.__postManyToManyRelation = function () {
        var _ref50 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee32(self, data, childdata, postType, relation) {
            var _self$db$add, _self$db$add2;

            var Model, model, option, key, fkey, rpk, cid, rkey, rfkey, _iterator14, _isArray14, _i14, _ref51, cdata;

            return _regenerator2.default.wrap(function _callee32$(_context32) {
                while (1) {
                    switch (_context32.prev = _context32.next) {
                        case 0:
                            //let model = ORM.model(relation.model, {});
                            Model = require('../index');
                            model = new Model(relation.model, self.config);
                            option = {};

                            if (relation.relationtable) {
                                option.table = relation.relationtable;
                            } else {
                                option.table = '' + ORM.config('db_prefix') + self.getModelName().toLowerCase() + '_' + model.getModelName().toLowerCase() + '_map';
                            }
                            key = relation.key || self.getPk();
                            fkey = relation.fkey || self.getModelName().toLowerCase() + '_id';
                            //需要取到对应model的关联key,fkey

                            rpk = model.getPk(), cid = void 0;
                            rkey = model.relation.key || rpk;
                            rfkey = model.relation.fkey || model.getModelName().toLowerCase() + '_id';

                            if (!ORM.isArray(childdata)) {
                                _context32.next = 37;
                                break;
                            }

                            _iterator14 = childdata, _isArray14 = Array.isArray(_iterator14), _i14 = 0, _iterator14 = _isArray14 ? _iterator14 : (0, _getIterator3.default)(_iterator14);

                        case 11:
                            if (!_isArray14) {
                                _context32.next = 17;
                                break;
                            }

                            if (!(_i14 >= _iterator14.length)) {
                                _context32.next = 14;
                                break;
                            }

                            return _context32.abrupt('break', 35);

                        case 14:
                            _ref51 = _iterator14[_i14++];
                            _context32.next = 21;
                            break;

                        case 17:
                            _i14 = _iterator14.next();

                            if (!_i14.done) {
                                _context32.next = 20;
                                break;
                            }

                            return _context32.abrupt('break', 35);

                        case 20:
                            _ref51 = _i14.value;

                        case 21:
                            cdata = _ref51;
                            _context32.t0 = postType;
                            _context32.next = _context32.t0 === 'ADD' ? 25 : _context32.t0 === 'UPDATE' ? 32 : 33;
                            break;

                        case 25:
                            _context32.next = 27;
                            return model.add(cdata);

                        case 27:
                            cid = _context32.sent;

                            cdata[rpk] = cid;
                            //写入两个表关系表
                            _context32.next = 31;
                            return self.db().add((_self$db$add = {}, _self$db$add[fkey] = data[key], _self$db$add[rfkey] = cdata[rkey], _self$db$add), option);

                        case 31:
                            return _context32.abrupt('break', 33);

                        case 32:
                            return _context32.abrupt('break', 33);

                        case 33:
                            _context32.next = 11;
                            break;

                        case 35:
                            _context32.next = 49;
                            break;

                        case 37:
                            if (!ORM.isObject(childdata)) {
                                _context32.next = 49;
                                break;
                            }

                            _context32.t1 = postType;
                            _context32.next = _context32.t1 === 'ADD' ? 41 : _context32.t1 === 'UPDATE' ? 48 : 49;
                            break;

                        case 41:
                            _context32.next = 43;
                            return model.add(childdata);

                        case 43:
                            cid = _context32.sent;

                            childdata[rpk] = cid;
                            _context32.next = 47;
                            return self.db().add((_self$db$add2 = {}, _self$db$add2[fkey] = data[key], _self$db$add2[rfkey] = childdata[rkey], _self$db$add2), option);

                        case 47:
                            return _context32.abrupt('break', 49);

                        case 48:
                            return _context32.abrupt('break', 49);

                        case 49:
                            return _context32.abrupt('return');

                        case 50:
                        case 'end':
                            return _context32.stop();
                    }
                }
            }, _callee32, this);
        }));

        function __postManyToManyRelation(_x77, _x78, _x79, _x80, _x81) {
            return _ref50.apply(this, arguments);
        }

        return __postManyToManyRelation;
    }();

    /**
     * belongsto 无需写入父表数据
     * @param self
     * @param data
     * @param childdata
     * @param postType
     * @param relation
     * @private
     */


    _class.prototype.__postBelongsToRealtion = function __postBelongsToRealtion(self, data, childdata, postType, relation) {
        return;
    };

    return _class;
}(_Base2.default);

exports.default = _class;