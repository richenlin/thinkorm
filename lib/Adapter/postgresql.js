'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _postgresql = require('../Parser/postgresql');

var _postgresql2 = _interopRequireDefault(_postgresql);

var _postgresql3 = require('../Socket/postgresql');

var _postgresql4 = _interopRequireDefault(_postgresql3);

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
        this.transTimes = 0; //transaction times
        this.lastInsertId = 0;
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _postgresql4.default(this.config);
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    _class.prototype.parsers = function parsers() {
        if (!this.parsercls) {
            this.parsercls = new _postgresql2.default(this.config);
        }
        return this.parsercls;
    };

    _class.prototype.schema = function schema() {}
    //自动创建表\更新表\迁移数据


    /**
     *
     * @param sql
     */
    ;

    _class.prototype.query = function query(sql) {
        var _this2 = this;

        return this.connect().query(sql).then(function (data) {
            return _this2.parsers().bufferToString(data.rows);
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.execute = function execute(sql) {
        var _this3 = this;

        return this.connect().execute(sql).then(function (data) {
            if (data.rows && data.rows[0] && data.rows[0].id) {
                _this3.lastInsertId = data.rows[0].id;
            }
            return data.rowCount || 0;
        });
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.startTrans = function startTrans() {
        if (this.transTimes === 0) {
            this.transTimes++;
            return this.execute('BEGIN');
        }
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.commit = function commit() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('COMMIT');
        }
        return _promise2.default.resolve();
    };

    /**
     *
     * @returns {*}
     */


    _class.prototype.rollback = function rollback() {
        if (this.transTimes > 0) {
            this.transTimes = 0;
            return this.execute('ROLLBACK');
        }
        return _promise2.default.resolve();
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function add(data, options) {
        var _this4 = this;

        options.method = 'INSERT';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this4.execute(sql);
        }).then(function (data) {
            //
            return _this4.lastInsertId;
        });
    };

    /**
     * 插入多条数据(使用事务)
     * @param  {[type]} data    [description]
     * @param  {[type]} options [description]
     * @return {[type]}         [description]
     */


    _class.prototype.addAll = function addAll(data, options) {
        var _this5 = this;

        //start trans
        return this.startTrans().then(function () {
            var promised = data.map(function (item) {
                return _this5.add(item, options);
            });
            return _promise2.default.all(promised);
        }).then(function (data) {
            //commit
            _this5.commit();
            return data;
        }).catch(function (e) {
            //rollback
            _this5.rollback();
            return [];
        });
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete(options) {
        var _this6 = this;

        options.method = 'DELETE';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this6.execute(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function update(data, options) {
        var _this7 = this;

        options.method = 'UPDATE';
        return this.parsers().buildSql(data, options).then(function (sql) {
            return _this7.execute(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(field, options) {
        var _this8 = this;

        options.method = 'SELECT';
        options.count = field;
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(function (sql) {
            return _this8.query(sql);
        }).then(function (data) {
            if (ORM.isArray(data)) {
                return data[0].count;
            } else {
                return data.count;
            }
        });
    };

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function sum(field, options) {
        var _this9 = this;

        options.method = 'SELECT';
        options.sum = field;
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(function (sql) {
            return _this9.query(sql);
        }).then(function (data) {
            if (ORM.isArray(data)) {
                return data[0].sum;
            } else {
                return data.sum;
            }
        });
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function find(options) {
        var _this10 = this;

        options.method = 'SELECT';
        options.limit = [0, 1];
        return this.parsers().buildSql(options).then(function (sql) {
            return _this10.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function select(options) {
        var _this11 = this;

        options.method = 'SELECT';
        return this.parsers().buildSql(options).then(function (sql) {
            return _this11.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    return _class;
}(_base3.default); /**
                    *
                    * @author     richen
                    * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
                    * @license    MIT
                    * @version    16/7/25
                    */


exports.default = _class;