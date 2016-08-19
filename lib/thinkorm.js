'use strict';

exports.__esModule = true;

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

var _valid = require('./Util/valid');

var _valid2 = _interopRequireDefault(_valid);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
}; /**
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
            this.modelName = name;
            this.tableName = this.getTableName();
        } else {
            //空模型创建临时表
            this.modelName = '_temp';
            this.tableName = '_temp';
        }
        // 安全模式
        this.safe = this.config.db_ext_config.safe === true;
        // 配置hash
        this.connKey = this.config.db_type + '_' + this.config.db_host + '_' + this.config.db_port + '_' + this.config.db_name;
        // collection instance
        this.instances = null;
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

                            this.instances = ORM.Models[this.modelName];

                            if (this.instances) {
                                _context.next = 8;
                                break;
                            }

                            _context.next = 5;
                            return _schema2.default.loadCollection(this.modelName, this.config, this);

                        case 5:
                            _context.next = 7;
                            return _schema2.default.initialize();

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
     * 数据迁移
     */


    _class.prototype.migrate = function migrate() {
        // mongodb is schema less
        if (this.config.db_type === 'mongo') {
            return;
        }
    };

    /**
     * 错误封装
     * @param err
     */


    _class.prototype.error = function error(err) {
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
                this.instances && this.instances['conn'] && this.instances['conn'].close && this.instances['conn'].close();
            }
            ORM.log(msg);
        }
        return ORM.getDefer().promise;
    };

    /**
     * 获取表名
     * @return {[type]} [description]
     */


    _class.prototype.getTableName = function getTableName() {
        if (!this.tableName) {
            var tableName = this.config.db_prefix || '';
            tableName += ORM.parseName(this.getModelName());
            this.tableName = tableName.toLowerCase();
        }
        return this.tableName;
    };

    /**
     * 获取模型名
     * @access public
     * @return string
     */


    _class.prototype.getModelName = function getModelName(name) {
        if (!this.modelName) {
            var filename = this.__filename || __filename;
            var last = filename.lastIndexOf('/');
            this.modelName = filename.substr(last + 1, filename.length - last - 4);
        }
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
        } else {
            if (this.config.db_type === 'mongo') {
                this.pk = '_id';
            }
        }
        return this.pk;
    };

    return _class;
}(_base3.default);

exports.default = _class;