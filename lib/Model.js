'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _Base = require('./Base');

var _Base2 = _interopRequireDefault(_Base);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    //此处初始化数据库
    _class.prototype.init = function init() {
        this.config = {
            db_type: 'mysql'
        };
        this._options = {
            where: {}
        };
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
        this._options.where.where = _where;
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

        if (typeof offset === 'array') {
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
        if (typeof _order === 'string') {
            //'id desc,name aes'
            if (_order.indexOf(',') > -1) {
                var orderarr = _order.split(',');
                for (var _iterator = orderarr, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var o = _ref;

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
        } else if (Array.isArray(_order)) {
            //[{id: 'asc', name: 'desc'}],
            for (var _iterator2 = _order, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
                var _ref2;

                if (_isArray2) {
                    if (_i2 >= _iterator2.length) break;
                    _ref2 = _iterator2[_i2++];
                } else {
                    _i2 = _iterator2.next();
                    if (_i2.done) break;
                    _ref2 = _i2.value;
                }

                var _o = _ref2;

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
        for (var _iterator3 = _join, _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);;) {
            var _ref3;

            if (_isArray3) {
                if (_i3 >= _iterator3.length) break;
                _ref3 = _iterator3[_i3++];
            } else {
                _i3 = _iterator3.next();
                if (_i3.done) break;
                _ref3 = _i3.value;
            }

            var j = _ref3;

            type = j.type || 'left';
            from = j.from;
            onCondition = j.on;
            if (Object.prototype.toString(onCondition) == '[object Object]') {
                //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                if (onCondition.or != undefined) {
                    orArr = [from];
                    for (var _iterator4 = onCondition.or, _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);;) {
                        var _ref4;

                        if (_isArray4) {
                            if (_i4 >= _iterator4.length) break;
                            _ref4 = _iterator4[_i4++];
                        } else {
                            _i4 = _iterator4.next();
                            if (_i4.done) break;
                            _ref4 = _i4.value;
                        }

                        var o = _ref4;

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
                    on = [from];
                    for (var _k in onCondition) {
                        on.push(_k + '.' + onCondition[_k]);
                    }
                    joinArr.push({ type: type, from: from, on: on });
                }
            }
        }
        this._options.join = joinArr;
        //console.log(this._options.join)
        return this;
    };

    _class.prototype.count = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(field) {
            var options, result;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.count = field;
                            _context.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context.sent;
                            _context.next = 7;
                            return this.adapter().count(options);

                        case 7:
                            result = _context.sent;

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function count(_x) {
            return _ref5.apply(this, arguments);
        }

        return count;
    }();

    _class.prototype.min = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(field) {
            var options, result;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.min = field;
                            _context2.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context2.sent;
                            _context2.next = 7;
                            return this.adapter().min(options);

                        case 7:
                            result = _context2.sent;

                        case 8:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function min(_x2) {
            return _ref6.apply(this, arguments);
        }

        return min;
    }();

    _class.prototype.max = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(field) {
            var options, result;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.max = field;
                            _context3.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context3.sent;
                            _context3.next = 7;
                            return this.adapter().max(options);

                        case 7:
                            result = _context3.sent;

                        case 8:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function max(_x3) {
            return _ref7.apply(this, arguments);
        }

        return max;
    }();

    _class.prototype.avg = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(field) {
            var options, result;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.avg = field;
                            _context4.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context4.sent;
                            _context4.next = 7;
                            return this.adapter().avg(options);

                        case 7:
                            result = _context4.sent;

                        case 8:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function avg(_x4) {
            return _ref8.apply(this, arguments);
        }

        return avg;
    }();

    _class.prototype.avgDistinct = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(field) {
            var options, result;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.avgDistinct = field;
                            _context5.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context5.sent;
                            _context5.next = 7;
                            return this.adapter().avgDistinct(options);

                        case 7:
                            result = _context5.sent;

                        case 8:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function avgDistinct(_x5) {
            return _ref9.apply(this, arguments);
        }

        return avgDistinct;
    }();

    /**
     * 字段自增
     * @param field
     */


    _class.prototype.increment = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(field, inc) {
            var options, result;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.increment = [field, inc || 1];
                            _context6.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context6.sent;
                            _context6.next = 7;
                            return this.adapter().increment(options);

                        case 7:
                            result = _context6.sent;

                        case 8:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function increment(_x6, _x7) {
            return _ref10.apply(this, arguments);
        }

        return increment;
    }();

    /**
     * 字段自减
     * @param field
     */


    _class.prototype.decrement = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(field, dec) {
            var options, result;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            if (field) this._options.decrement = [field, dec || 1];
                            _context7.next = 4;
                            return this.parseOption(this._options);

                        case 4:
                            options = _context7.sent;
                            _context7.next = 7;
                            return this.adapter().decrement(options);

                        case 7:
                            result = _context7.sent;

                        case 8:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function decrement(_x8, _x9) {
            return _ref11.apply(this, arguments);
        }

        return decrement;
    }();

    /**
     * 查询一条数据
     * @param option
     */


    _class.prototype.find = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            var result;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            options = this._options;
                            _context8.next = 4;
                            return this.parseOption(options);

                        case 4:
                            options = _context8.sent;
                            _context8.next = 7;
                            return this.adapter().find(options);

                        case 7:
                            result = _context8.sent;

                        case 8:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function find(_x10) {
            return _ref12.apply(this, arguments);
        }

        return find;
    }();

    /**
     * 解析参数
     * @param options
     */


    _class.prototype.parseOption = function () {
        var _ref13 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(options) {
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            options.table = 'user';
                            options.tablePrefix = 'think_';
                            return _context9.abrupt('return', options);

                        case 3:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function parseOption(_x11) {
            return _ref13.apply(this, arguments);
        }

        return parseOption;
    }();

    return _class;
}(_Base2.default); /**
                    * Created by lihao on 16/7/26.
                    */


exports.default = _class;