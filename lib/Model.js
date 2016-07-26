'use strict';

exports.__esModule = true;

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
        //如果是字符串id desc
        if (typeof _order === 'string') {
            if (_order.indexOf(' desc') > -1 || _order.indexOf(' DESC') > -1) {
                _order = [[_order.substring(0, _order.length - 5)], 'desc'];
            } else if (_order.indexOf(' aes') > -1 || _order.indexOf(' AES') > -1) {
                _order = [[_order.substring(0, _order.length - 5)], 'aes'];
            } else {
                _order = [_order, 'aes'];
            }
        }
        this._options.order = _order;
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
     * 查询一条数据
     * @param option
     */


    _class.prototype.find = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(options) {
            var result;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!options) options = {};
                            //TODO options继承this._options
                            options = this._options;
                            _context.next = 4;
                            return this.parseOption(options);

                        case 4:
                            options = _context.sent;
                            _context.next = 7;
                            return this.adapter().find(options);

                        case 7:
                            result = _context.sent;

                        case 8:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function find(_x) {
            return _ref.apply(this, arguments);
        }

        return find;
    }();

    /**
     * 解析参数
     * @param options
     */


    _class.prototype.parseOption = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(options) {
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            options.table = 'user';
                            options.tablePrefix = 'think_';
                            return _context2.abrupt('return', options);

                        case 3:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function parseOption(_x2) {
            return _ref2.apply(this, arguments);
        }

        return parseOption;
    }();

    return _class;
}(_Base2.default); /**
                    * Created by lihao on 16/7/26.
                    */


exports.default = _class;