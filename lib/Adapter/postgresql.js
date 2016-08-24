'use strict';

exports.__esModule = true;

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _knex = require('knex');

var _knex2 = _interopRequireDefault(_knex);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _base4 = require('../Parser/base');

var _base5 = _interopRequireDefault(_base4);

var _postgresql = require('../Socket/postgresql');

var _postgresql2 = _interopRequireDefault(_postgresql);

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
        this.logSql = config.db_ext_config.db_log_sql || false;
        this.transTimes = 0; //transaction times
        this.lastInsertId = 0;

        this.knexClient = (0, _knex2.default)({
            client: 'postgresql'
        });

        this.handel = null;
        this.parsercls = null;
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _postgresql2.default(this.config).connect();
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close && this.handel.close();
            this.handel = null;
        }
    };

    _class.prototype.parsers = function parsers() {
        if (this.parsercls) {
            return this.parsercls;
        }
        this.parsercls = new _base5.default(this.config);
        return this.parsercls;
    };

    /**
     *
     * @param schema
     * @param config
     */


    _class.prototype.migrate = function migrate(schema, config) {
        var _this2 = this;

        if (_lib2.default.isEmpty(schema) || _lib2.default.isEmpty(config)) {
            return;
        }
        var tableName = '' + config.db_prefix + _lib2.default.parseName(schema.name);
        return this.query(this.knexClient.schema.hasTable(tableName).toString()).then(function (exists) {
            if (_lib2.default.isEmpty(exists)) {
                return _promise2.default.resolve();
            } else {
                return _this2.execute(_this2.knexClient.schema.dropTableIfExists(tableName).toString());
            }
        }).then(function () {
            var options = {
                method: 'MIGRATE',
                schema: schema
            };
            return _this2.parsers().buildSql(_this2.knexClient.schema, config, options).then(function (sql) {
                if (/\n/.test(sql)) {
                    var _ret = function () {
                        var temp = sql.replace(/\n/g, '').split(';'),
                            ps = [];
                        temp.map(function (item) {
                            ps.push(_this2.execute(item));
                        });
                        return {
                            v: _promise2.default.all(ps)
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
                }
                return _this2.execute(sql.replace(/\n/g, ''));
            });
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.query = function query(sql) {
        var _this3 = this;

        var startTime = Date.now();
        var connection = void 0;
        return this.connect().then(function (conn) {
            connection = conn;
            var fn = _lib2.default.promisify(connection.query, connection);
            return fn(sql);
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            connection.release && connection.release();
            _this3.logSql && _lib2.default.log(sql, 'PostgreSQL', startTime);
            return _this3.bufferToString(rows);
        }).catch(function (err) {
            _this3.release && _this3.release();
            //when socket is closed, try it
            if (err.code === 'EPIPE') {
                _this3.close();
                return _this3.query(sql);
            }
            _this3.logSql && _lib2.default.log(sql, 'PostgreSQL', startTime);
            return _promise2.default.reject(err);
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.execute = function execute(sql) {
        var _this4 = this;

        return this.query(sql).then(function (data) {
            if (data.rows && data.rows[0] && data.rows[0].id) {
                _this4.lastInsertId = data.rows[0].id;
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


    _class.prototype.add = function add(data) {
        var _this5 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'ADD';
        var knexCls = this.knexClient.insert(data).from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(function (sql) {
            return _this5.execute(sql);
        }).then(function (data) {
            //
            return _this5.lastInsertId;
        });
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete() {
        var _this6 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'DELETE';
        var knexCls = this.knexClient.del().from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
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


    _class.prototype.update = function update(data) {
        var _this7 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'UPDATE';
        var knexCls = this.knexClient.update(data).from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, data, options).then(function (sql) {
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


    _class.prototype.count = function count(field) {
        var _this8 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'COUNT';
        options.limit = [0, 1];
        var knexCls = this.knexClient.count(field + ' AS count').from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this8.query(sql);
        }).then(function (data) {
            if (_lib2.default.isArray(data)) {
                if (data[0]) {
                    return data[0]['count'] ? data[0]['count'] || 0 : 0;
                } else {
                    return 0;
                }
            } else {
                return data['count'] || 0;
            }
        });
    };

    /**
     * 统计数据数量和
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.sum = function sum(field) {
        var _this9 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'SUM';
        options.limit = [0, 1];
        var knexCls = this.knexClient.sum(options.sum + ' AS sum').from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this9.query(sql);
        }).then(function (data) {
            if (_lib2.default.isArray(data)) {
                if (data[0]) {
                    return data[0]['sum'] ? data[0]['sum'] || 0 : 0;
                } else {
                    return 0;
                }
            } else {
                return data['sum'] || 0;
            }
        });
    };

    /**
     * 查询一条数据
     * @return 返回一个promise
     */


    _class.prototype.find = function find() {
        var _this10 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'SELECT';
        options.limit = [0, 1];
        var knexCls = this.knexClient.select().from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
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


    _class.prototype.select = function select() {
        var _this11 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'SELECT';
        var knexCls = this.knexClient.select().from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this11.query(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     *
     * @param data
     * @returns {*}
     */


    _class.prototype.bufferToString = function bufferToString(data) {
        if (!this.config.buffer_tostring || !_lib2.default.isArray(data)) {
            return data;
        }
        for (var i = 0, length = data.length; i < length; i++) {
            for (var key in data[i]) {
                if (_lib2.default.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
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