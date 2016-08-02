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

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseLimit = function parseLimit(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }

        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseOrder = function parseOrder(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseField = function parseField(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }
        return parseOptions;
    };

    /**
     * count('xxx')
     * count(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseCount = function parseCount(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }
        return parseOptions;
    };

    /**
     * sum('xxx')
     * sum(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseSum = function parseSum(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseWhere = function parseWhere(data, options) {
        var parseOptions = {};
        //
        return parseOptions;
    };

    /**
     * group('xxx')
     * group(['xxx', 'xxx'])
     * @param data
     * @param options
     */


    _class.prototype.parseGroup = function parseGroup(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }
        return parseOptions;
    };

    /**
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'inner')
     * join([{from: 'test', on: {or: [{aaa: bbb}, {ccc: ddd}]}}], 'left')
     * join([{from: 'test', on: [{aaa: bbb}, {ccc: ddd}]}], 'right')
     * @param data
     * @param options
     */


    _class.prototype.parseJoin = function parseJoin(data, options) {
        var parseOptions = {};
        if (options.method === 'SELECT') {
            //
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.parseTable = function parseTable(data, options) {
        var parseOptions = {};
        //
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseData = function parseData(data, options) {
        var parseOptions = {};
        //
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     */


    _class.prototype.parseMethod = function parseMethod(data, options) {
        var parseOptions = {};
        //
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {string}
     */


    _class.prototype.parseSql = function parseSql(data, options) {
        var parseOptions = {};
        for (var n in options) {
            var mt = ORM.ucFirst(n);
            if (this['parse' + mt] && ORM.isFunction(this['parse' + mt])) {
                parseOptions = ORM.extend(false, parseOptions, this['parse' + mt](data, options));
            }
        }
        return parseOptions;
    };

    /**
     *
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.buildSql = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parseOptions, sql;
            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (options === undefined) {
                                options = data;
                            } else {
                                options.data = data;
                            }
                            _context.next = 3;
                            return this.parseSql(data, options);

                        case 3:
                            parseOptions = _context.sent;
                            sql = '';
                            //

                            return _context.abrupt('return', sql);

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function buildSql(_x2, _x3) {
            return _ref.apply(this, arguments);
        }

        return buildSql;
    }();

    return _class;
}(_base3.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    16/7/25
                    */


exports.default = _class;