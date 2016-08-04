'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _mongo = require('../Parser/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

var _mongo3 = require('../Socket/mongo');

var _mongo4 = _interopRequireDefault(_mongo3);

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

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mongo4.default(this.config);
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    /**
     * 执行查询
     * @param sql
     */


    _class.prototype.query = function query(sql) {
        var _this2 = this;

        console.log(sql);
        return this.connect().query(sql).then(function (data) {
            return _this2.parsers().bufferToString(data);
        });
    };

    _class.prototype.execute = function execute(sql, data) {
        var _this3 = this;

        return this.connect().query(sql, data).then(function (data) {
            //console.log(data)
            switch (sql.type) {
                case 'add':
                case 'ADD':
                    _this3.lastInsertId = data.insertedId;
                    return _this3.lastInsertId;
                    break;
                case 'addall':
                case 'ADDALL':
                    return data.insertedCount;
                    break;
                case 'update':
                case 'UPDATE':
                    return data.modifiedCount;
                    break;
                case 'delete':
                case 'DELETE':
                    return data.deletedCount;
                    break;
            }
        });
    };

    /**
     * 语法解析器
     */


    _class.prototype.parsers = function parsers() {
        if (!this.parsercls) {
            this.parsercls = new _mongo2.default(this.config);
        }
        return this.parsercls;
    };

    /**
     * 查询
     * @param options
     */


    _class.prototype.select = function select(options) {
        var _this4 = this;

        options.method = 'select';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this4.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 查找单条记录
     * @param options
     * @returns {*}
     */


    _class.prototype.find = function find(options) {
        var _this5 = this;

        options.method = 'select';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this5.query(sql);
        }).then(function (data) {
            return ORM.isEmpty(data) ? {} : data[0];
        });
    };

    /**
     * 插入记录
     * @param data
     * @param options
     */


    _class.prototype.add = function add(data, options) {
        var _this6 = this;

        options.method = 'add';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this6.execute(sql, data);
        }).then(function (data) {
            return _this6.lastInsertId;
        });
    };

    /**
     * 插入多条
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.addAll = function addAll(data, options) {
        var _this7 = this;

        options.method = 'addall';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this7.execute(sql, data);
        }).then(function (data) {
            return data;
        });
    };

    /**
     * 更新
     * @param data
     * @param options
     */


    _class.prototype.update = function update(data, options) {
        var _this8 = this;

        var parsedata = void 0;
        options.method = 'update';
        parsedata = { $set: data };
        return this.parsers().buildSql(parsedata, options).then(function (sql) {
            return _this8.execute(sql, parsedata);
        }).then(function (data) {
            return data;
        });
    };

    /**
     * 删除操作
     * @param options
     */


    _class.prototype.delete = function _delete(options) {
        var _this9 = this;

        options.method = 'delete';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this9.execute(sql);
        }).then(function (data) {
            return data;
        });
    };

    /**
     * 查询字段数
     * @param field
     * @param options
     */


    _class.prototype.count = function count(field, options) {};

    return _class;
}(_base3.default); /**
                    * Created by lihao on 16/8/2.
                    */


exports.default = _class;