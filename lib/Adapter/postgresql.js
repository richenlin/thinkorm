'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
        var _this2 = this;

        if (this.handel) {
            return this.handel;
        }
        //读写分离配置
        if (this.config.db_ext_config.read_write_splitting && _lib2.default.isArray(this.config.db_host)) {
            var configMaster = {
                db_name: _lib2.default.isArray(this.config.db_name) ? this.config.db_name[0] : this.config.db_name,
                db_host: _lib2.default.isArray(this.config.db_host) ? this.config.db_host[0] : this.config.db_host,
                db_user: _lib2.default.isArray(this.config.db_user) ? this.config.db_user[0] : this.config.db_user,
                db_pwd: _lib2.default.isArray(this.config.db_pwd) ? this.config.db_pwd[0] : this.config.db_pwd,
                db_port: _lib2.default.isArray(this.config.db_port) ? this.config.db_port[0] : this.config.db_port,
                db_charset: this.config.db_charset,
                db_timeout: this.config.db_timeout,
                db_ext_config: this.config.db_ext_config
            };
            var configSlave = {
                db_name: _lib2.default.isArray(this.config.db_name) ? this.config.db_name[1] : this.config.db_name,
                db_host: _lib2.default.isArray(this.config.db_host) ? this.config.db_host[1] : this.config.db_host,
                db_user: _lib2.default.isArray(this.config.db_user) ? this.config.db_user[1] : this.config.db_user,
                db_pwd: _lib2.default.isArray(this.config.db_pwd) ? this.config.db_pwd[1] : this.config.db_pwd,
                db_port: _lib2.default.isArray(this.config.db_port) ? this.config.db_port[1] : this.config.db_port,
                db_charset: this.config.db_charset,
                db_timeout: this.config.db_timeout,
                db_ext_config: this.config.db_ext_config
            };
            return _promise2.default.all([new _postgresql2.default(configMaster).connect(), new _postgresql2.default(configSlave).connect()]).then(function (cons) {
                _this2.handel = { RW: true };
                _this2.handel.master = cons[0];
                _this2.handel.slave = cons[1];
                return _this2.handel;
            });
        } else {
            this.handel = new _postgresql2.default(this.config).connect();
        }
        return this.handel;
    };

    _class.prototype.close = function close() {
        if (this.handel) {
            if (this.handel.RW) {
                this.handel.master && this.handel.master.close && this.handel.master.close();
                this.handel.slave && this.handel.slave.close && this.handel.slave.close();
            } else {
                this.handel.close && this.handel.close();
            }
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
        var _this3 = this;

        if (_lib2.default.isEmpty(schema) || _lib2.default.isEmpty(config)) {
            return;
        }
        var tableName = '' + config.db_prefix + _lib2.default.parseName(schema.name);
        return this.execute(this.knexClient.schema.dropTableIfExists(tableName).toString()).then(function () {
            var options = {
                method: 'MIGRATE',
                schema: schema
            };
            return _this3.parsers().buildSql(_this3.knexClient.schema, config, options).then(function (sql) {
                if (/\n/.test(sql)) {
                    var _ret = function () {
                        var temp = sql.replace(/\n/g, '').split(';'),
                            ps = [];
                        temp.map(function (item) {
                            ps.push(_this3.execute(item));
                        });
                        return {
                            v: _promise2.default.all(ps)
                        };
                    }();

                    if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
                }
                return _this3.execute(sql);
            });
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.query = function query(sql) {
        var _this4 = this;

        var startTime = Date.now();
        var connection = void 0;
        return this.connect().then(function (conn) {
            connection = conn.RW ? conn.slave : conn;
            var fn = _lib2.default.promisify(connection.query, connection);
            return fn(sql);
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            connection.release && connection.release();
            _this4.logSql && _lib2.default.log(sql, 'PostgreSQL', startTime);
            return _this4.bufferToString(rows);
        }).catch(function (err) {
            connection.release && connection.release();
            //when socket is closed, try it
            if (err.code === 'EPIPE') {
                _this4.close();
                return _this4.query(sql);
            }
            _this4.logSql && _lib2.default.log(sql, 'PostgreSQL', startTime);
            return _promise2.default.reject(err);
        });
    };

    /**
     *
     * @param sql
     */


    _class.prototype.execute = function execute(sql) {
        var _this5 = this;

        var startTime = Date.now();
        var connection = void 0;
        return this.connect().then(function (conn) {
            connection = conn.RW ? conn.master : conn;
            var fn = _lib2.default.promisify(connection.query, connection);
            return fn(sql);
        }).then(function () {
            var rows = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

            connection.release && connection.release();
            _this5.logSql && _lib2.default.log(sql, 'PostgreSQL', startTime);
            return _this5.bufferToString(rows);
        }).then(function (data) {
            if (data.rows && data.rows[0] && data.rows[0].id) {
                _this5.lastInsertId = data.rows[0].id;
            }
            return data.rowCount || 0;
        }).catch(function (err) {
            connection.release && connection.release();
            //when socket is closed, try it
            if (err.code === 'EPIPE') {
                _this5.close();
                return _this5.execute(sql);
            }
            _this5.logSql && _lib2.default.log(sql, 'PostgreSQL', startTime);
            return _promise2.default.reject(err);
        });
    };

    /**
     *
     * @param sqlStr
     */


    _class.prototype.native = function native(sqlStr) {
        var _this6 = this;

        var ouputs = this.knexClient.raw(sqlStr).toSQL();
        if (_lib2.default.isEmpty(ouputs)) {
            return _promise2.default.reject('SQL analytic result is empty');
        }
        var startTime = Date.now();
        var connection = void 0;
        return this.connect().then(function (conn) {
            connection = conn.RW ? conn.master : conn;
            var fn = _lib2.default.promisify(connection.query, connection);
            return fn(ouputs.sql, ouputs.bindings);
        }).then(function () {
            var res = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

            _this6.logSql && _lib2.default.log(ouputs.sql, 'PostgreSQL', startTime);
            return _this6.bufferToString(res.rows);
        }).catch(function (err) {
            _this6.logSql && _lib2.default.log(ouputs.sql, 'PostgreSQL', startTime);
            return _promise2.default.reject(err);
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
        var _this7 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'ADD';
        options.alias = undefined;
        var knexCls = this.knexClient.insert(data).from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(function (sql) {
            return _this7.execute(sql);
        }).then(function (data) {
            //
            return _this7.lastInsertId;
        });
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete() {
        var _this8 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'DELETE';
        options.alias = undefined;
        var knexCls = this.knexClient.del().from(options.table);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this8.execute(sql);
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
        var _this9 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'UPDATE';
        options.alias = undefined;
        var knexCls = this.knexClient.update(data).from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(function (sql) {
            return _this9.execute(sql);
        }).then(function (data) {
            //
            return data;
        });
    };

    /**
     *
     * @param data
     * @param field
     * @param options
     */


    _class.prototype.increment = function increment(data, field) {
        var _this10 = this;

        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        options.method = 'UPDATE';
        options.alias = undefined;
        var knexCls = this.knexClient;
        if (data[field]) {
            knexCls = knexCls.increment(field, data[field]);
            delete data[field];
        }
        knexCls = knexCls.from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(function (sql) {
            return _this10.execute(sql);
        }).then(function (res) {
            //更新前置操作内会改变data的值
            if (!_lib2.default.isEmpty(data)) {
                _this10.update(data, options);
            }
            return res;
        });
    };

    /**
     *
     * @param data
     * @param field
     * @param options
     */


    _class.prototype.decrement = function decrement(data, field) {
        var _this11 = this;

        var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

        options.method = 'UPDATE';
        options.alias = undefined;
        var knexCls = this.knexClient;
        if (data[field]) {
            knexCls = knexCls.decrement(field, data[field]);
            delete data[field];
        }
        knexCls = knexCls.from(options.table);
        return this.parsers().buildSql(knexCls, data, options).then(function (sql) {
            return _this11.execute(sql);
        }).then(function (res) {
            //更新前置操作内会改变data的值
            if (!_lib2.default.isEmpty(data)) {
                _this11.update(data, options);
            }
            return res;
        });
    };

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(field) {
        var _this12 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'COUNT';
        options.limit = [0, 1];
        var knexCls = this.knexClient.count(field + ' AS count').from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this12.query(sql);
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
        var _this13 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'SUM';
        options.limit = [0, 1];
        var knexCls = this.knexClient.sum(options.sum + ' AS sum').from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this13.query(sql);
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
        var _this14 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'SELECT';
        options.limit = [0, 1];
        var knexCls = this.knexClient.select().from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this14.query(sql);
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
        var _this15 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'SELECT';
        var knexCls = this.knexClient.select().from(options.table + ' AS ' + options.name);
        return this.parsers().buildSql(knexCls, options).then(function (sql) {
            return _this15.query(sql);
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
        //if (lib.isArray(data)) {
        //    for (let i = 0, length = data.length; i < length; i++) {
        //        for (let key in data[i]) {
        //            if (lib.isBuffer(data[i][key])) {
        //                data[i][key] = data[i][key].toString();
        //            }
        //        }
        //    }
        //}
        if (!_lib2.default.isJSONObj(data)) {
            data = JSON.parse((0, _stringify2.default)(data));
        }
        return data;
    };

    /**
     *
     * @param config
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */


    _class.prototype.__getHasOneRelation = function __getHasOneRelation(config, rel, data) {
        var _where;

        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(data[rel.fkey])) {
            return {};
        }
        var model = new rel.model(config);
        return model.find({ field: rel.field, where: (_where = {}, _where[rel.rkey] = data[rel.fkey], _where) });
    };

    /**
     *
     * @param config
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */


    _class.prototype.__getHasManyRelation = function __getHasManyRelation(config, rel, data) {
        var _where2;

        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        var model = new rel.model(config);
        var options = { field: rel.field, where: (_where2 = {}, _where2[rel.rkey] = data[rel.primaryPk], _where2) };
        return model.select(options);
    };

    /**
     *
     * @param config
     * @param rel
     * @param data
     * @returns {*}
     * @private
     */


    _class.prototype.__getManyToManyRelation = function __getManyToManyRelation(config, rel, data) {
        var _where3;

        if (_lib2.default.isEmpty(data) || _lib2.default.isEmpty(data[rel.primaryPk])) {
            return [];
        }
        var model = new rel.model(config);
        var rpk = model.getPk();
        var mapModel = new rel.mapModel(config);
        //let mapName = `${rel.primaryName}${rel.name}Map`;
        //if(model.config.db_type === 'mongo'){
        return mapModel.field(rel.fkey).select({ where: (_where3 = {}, _where3[rel.fkey] = data[rel.primaryPk], _where3) }).then(function (data) {
            var _where4;

            var keys = [];
            data.map(function (item) {
                item[rel.fkey] && keys.push(item[rel.fkey]);
            });
            return model.select({ where: (_where4 = {}, _where4[rpk] = keys, _where4) });
        });
        //} else {
        //    let options = {
        //        table: `${model.config.db_prefix}${lib.parseName(mapModel)}`,
        //        name: mapName,
        //        join: [
        //            {from: `${rel.model.modelName}`, on: {[rel.rkey]: rpk}, field: rel.field, type: 'inner'}
        //        ],
        //        where: {
        //            [rel.fkey]: data[rel.primaryPk]
        //        }
        //    };
        //    //数据量大的情况下可能有性能问题
        //    let regx = new RegExp(`${rel.name}_`, "g");
        //    return model.select(options).then(result => {
        //        result = JSON.stringify(result).replace(regx, '');
        //        return JSON.parse(result);
        //    });
        //}
    };

    /**
     *
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */


    _class.prototype.__postHasOneRelation = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(config, result, options, rel, relationData, postType) {
            var _this16 = this;

            var model, primaryModel;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(_lib2.default.isEmpty(result) || _lib2.default.isEmpty(relationData))) {
                                _context2.next = 2;
                                break;
                            }

                            return _context2.abrupt('return');

                        case 2:
                            model = new rel.model(config);
                            primaryModel = new ORM.collections[rel.primaryName](config);
                            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
                                var _primaryModel$update, _where5, _condition$in;

                                var fkey, condition, keys, info;
                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                _context.t0 = postType;
                                                _context.next = _context.t0 === 'ADD' ? 3 : _context.t0 === 'UPDATE' ? 11 : 21;
                                                break;

                                            case 3:
                                                _context.next = 5;
                                                return model.add(relationData);

                                            case 5:
                                                fkey = _context.sent;
                                                _context.t1 = fkey;

                                                if (!_context.t1) {
                                                    _context.next = 10;
                                                    break;
                                                }

                                                _context.next = 10;
                                                return primaryModel.update((_primaryModel$update = {}, _primaryModel$update[rel.fkey] = fkey, _primaryModel$update), { where: (_where5 = {}, _where5[rel.primaryPk] = result, _where5) });

                                            case 10:
                                                return _context.abrupt('break', 21);

                                            case 11:
                                                condition = {}, keys = [];
                                                //子表主键数据存在

                                                if (relationData[rel.fkey]) {
                                                    condition[rel.rkey] = relationData[rel.fkey];
                                                }
                                                //限制只能更新关联数据
                                                _context.next = 15;
                                                return primaryModel.field([rel.primaryPk]).select(options).catch(function (e) {
                                                    return [];
                                                });

                                            case 15:
                                                info = _context.sent;

                                                info.map(function (item) {
                                                    keys.push(item[rel.primaryPk]);
                                                });
                                                condition['in'] = (_condition$in = {}, _condition$in[rel.rkey] = keys, _condition$in);

                                                _context.next = 20;
                                                return model.update(relationData, { where: condition });

                                            case 20:
                                                return _context.abrupt('break', 21);

                                            case 21:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this16);
                            })(), 't0', 5);

                        case 5:
                            return _context2.abrupt('return');

                        case 6:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function __postHasOneRelation(_x14, _x15, _x16, _x17, _x18, _x19) {
            return _ref.apply(this, arguments);
        }

        return __postHasOneRelation;
    }();

    /**
     *
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */


    _class.prototype.__postHasManyRelation = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(config, result, options, rel, relationData, postType) {
            var _this17 = this;

            var model, rpk;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            if (!(_lib2.default.isEmpty(result) || !_lib2.default.isArray(relationData))) {
                                _context4.next = 2;
                                break;
                            }

                            return _context4.abrupt('return');

                        case 2:
                            model = new rel.model(config), rpk = model.getPk();
                            return _context4.delegateYield(_regenerator2.default.mark(function _callee3() {
                                var _condition$in2;

                                var _iterator, _isArray, _i, _ref3, _ref4, k, v, condition, keys, primaryModel, info, _iterator2, _isArray2, _i2, _ref5, _ref6;

                                return _regenerator2.default.wrap(function _callee3$(_context3) {
                                    while (1) {
                                        switch (_context3.prev = _context3.next) {
                                            case 0:
                                                _context3.t0 = postType;
                                                _context3.next = _context3.t0 === 'ADD' ? 3 : _context3.t0 === 'UPDATE' ? 23 : 50;
                                                break;

                                            case 3:
                                                _iterator = relationData.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                                            case 4:
                                                if (!_isArray) {
                                                    _context3.next = 10;
                                                    break;
                                                }

                                                if (!(_i >= _iterator.length)) {
                                                    _context3.next = 7;
                                                    break;
                                                }

                                                return _context3.abrupt('break', 22);

                                            case 7:
                                                _ref3 = _iterator[_i++];
                                                _context3.next = 14;
                                                break;

                                            case 10:
                                                _i = _iterator.next();

                                                if (!_i.done) {
                                                    _context3.next = 13;
                                                    break;
                                                }

                                                return _context3.abrupt('break', 22);

                                            case 13:
                                                _ref3 = _i.value;

                                            case 14:
                                                _ref4 = _ref3;
                                                k = _ref4[0];
                                                v = _ref4[1];

                                                //子表插入数据
                                                v[rel.rkey] = result;
                                                _context3.next = 20;
                                                return model.add(v);

                                            case 20:
                                                _context3.next = 4;
                                                break;

                                            case 22:
                                                return _context3.abrupt('break', 50);

                                            case 23:
                                                condition = {}, keys = [];
                                                primaryModel = new ORM.collections[rel.primaryName](config);
                                                //限制只能更新关联数据

                                                _context3.next = 27;
                                                return primaryModel.field([rel.primaryPk]).select(options).catch(function (e) {
                                                    return [];
                                                });

                                            case 27:
                                                info = _context3.sent;

                                                info.map(function (item) {
                                                    keys.push(item[rel.primaryPk]);
                                                });
                                                condition['in'] = (_condition$in2 = {}, _condition$in2[rel.rkey] = keys, _condition$in2);

                                                _iterator2 = relationData.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);

                                            case 31:
                                                if (!_isArray2) {
                                                    _context3.next = 37;
                                                    break;
                                                }

                                                if (!(_i2 >= _iterator2.length)) {
                                                    _context3.next = 34;
                                                    break;
                                                }

                                                return _context3.abrupt('break', 49);

                                            case 34:
                                                _ref5 = _iterator2[_i2++];
                                                _context3.next = 41;
                                                break;

                                            case 37:
                                                _i2 = _iterator2.next();

                                                if (!_i2.done) {
                                                    _context3.next = 40;
                                                    break;
                                                }

                                                return _context3.abrupt('break', 49);

                                            case 40:
                                                _ref5 = _i2.value;

                                            case 41:
                                                _ref6 = _ref5;
                                                k = _ref6[0];
                                                v = _ref6[1];

                                                //子表主键数据存在
                                                if (v[rpk]) {
                                                    condition[rpk] = v[rpk];
                                                }
                                                _context3.next = 47;
                                                return model.update(v, { where: condition });

                                            case 47:
                                                _context3.next = 31;
                                                break;

                                            case 49:
                                                return _context3.abrupt('break', 50);

                                            case 50:
                                            case 'end':
                                                return _context3.stop();
                                        }
                                    }
                                }, _callee3, _this17);
                            })(), 't0', 4);

                        case 4:
                            return _context4.abrupt('return');

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function __postHasManyRelation(_x20, _x21, _x22, _x23, _x24, _x25) {
            return _ref2.apply(this, arguments);
        }

        return __postHasManyRelation;
    }();

    /**
     *
     * @param config
     * @param result
     * @param options
     * @param rel
     * @param relationData
     * @param postType
     * @private
     */


    _class.prototype.__postManyToManyRelation = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(config, result, options, rel, relationData, postType) {
            var _this18 = this;

            var model, rpk, mapModel;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            if (!(_lib2.default.isEmpty(result) || !_lib2.default.isArray(relationData))) {
                                _context6.next = 2;
                                break;
                            }

                            return _context6.abrupt('return');

                        case 2:
                            //子表主键
                            model = new rel.model(config), rpk = model.getPk();
                            mapModel = new rel['mapModel'](config);
                            return _context6.delegateYield(_regenerator2.default.mark(function _callee5() {
                                var _on, _condition$in3;

                                var _iterator3, _isArray3, _i3, _mapModel$thenAdd, _where6, _ref8, _ref9, k, v, fkey, condition, keys, primaryModel, info, _iterator4, _isArray4, _i4, _ref10, _ref11, _mapModel$thenAdd2, _where7;

                                return _regenerator2.default.wrap(function _callee5$(_context5) {
                                    while (1) {
                                        switch (_context5.prev = _context5.next) {
                                            case 0:
                                                _context5.t0 = postType;
                                                _context5.next = _context5.t0 === 'ADD' ? 3 : _context5.t0 === 'UPDATE' ? 27 : 59;
                                                break;

                                            case 3:
                                                _iterator3 = relationData.entries(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);

                                            case 4:
                                                if (!_isArray3) {
                                                    _context5.next = 10;
                                                    break;
                                                }

                                                if (!(_i3 >= _iterator3.length)) {
                                                    _context5.next = 7;
                                                    break;
                                                }

                                                return _context5.abrupt('break', 26);

                                            case 7:
                                                _ref8 = _iterator3[_i3++];
                                                _context5.next = 14;
                                                break;

                                            case 10:
                                                _i3 = _iterator3.next();

                                                if (!_i3.done) {
                                                    _context5.next = 13;
                                                    break;
                                                }

                                                return _context5.abrupt('break', 26);

                                            case 13:
                                                _ref8 = _i3.value;

                                            case 14:
                                                _ref9 = _ref8;
                                                k = _ref9[0];
                                                v = _ref9[1];
                                                _context5.next = 19;
                                                return model.add(v);

                                            case 19:
                                                fkey = _context5.sent;
                                                _context5.t1 = fkey;

                                                if (!_context5.t1) {
                                                    _context5.next = 24;
                                                    break;
                                                }

                                                _context5.next = 24;
                                                return mapModel.thenAdd((_mapModel$thenAdd = {}, _mapModel$thenAdd[rel.fkey] = result, _mapModel$thenAdd[rel.rkey] = fkey, _mapModel$thenAdd), {
                                                    where: (_where6 = {}, _where6[rel.fkey] = result, _where6[rel.rkey] = fkey, _where6)
                                                });

                                            case 24:
                                                _context5.next = 4;
                                                break;

                                            case 26:
                                                return _context5.abrupt('break', 59);

                                            case 27:
                                                condition = {}, keys = [];
                                                primaryModel = new ORM.collections[rel.primaryName](config);
                                                //限制只能更新关联数据

                                                _context5.next = 31;
                                                return primaryModel.join([{
                                                    from: mapModel.modelName,
                                                    on: (_on = {}, _on[rel.primaryPk] = rel.fkey, _on),
                                                    field: [rel.fkey, rel.rkey],
                                                    type: 'inner'
                                                }]).select(options);

                                            case 31:
                                                info = _context5.sent;

                                                info.map(function (item) {
                                                    keys.push(item[mapModel.modelName + '_' + rel.rkey]);
                                                });
                                                condition['in'] = (_condition$in3 = {}, _condition$in3[rpk] = keys, _condition$in3);

                                                _iterator4 = relationData.entries(), _isArray4 = Array.isArray(_iterator4), _i4 = 0, _iterator4 = _isArray4 ? _iterator4 : (0, _getIterator3.default)(_iterator4);

                                            case 35:
                                                if (!_isArray4) {
                                                    _context5.next = 41;
                                                    break;
                                                }

                                                if (!(_i4 >= _iterator4.length)) {
                                                    _context5.next = 38;
                                                    break;
                                                }

                                                return _context5.abrupt('break', 58);

                                            case 38:
                                                _ref10 = _iterator4[_i4++];
                                                _context5.next = 45;
                                                break;

                                            case 41:
                                                _i4 = _iterator4.next();

                                                if (!_i4.done) {
                                                    _context5.next = 44;
                                                    break;
                                                }

                                                return _context5.abrupt('break', 58);

                                            case 44:
                                                _ref10 = _i4.value;

                                            case 45:
                                                _ref11 = _ref10;
                                                k = _ref11[0];
                                                v = _ref11[1];

                                                if (!(v[rel.fkey] && v[rel.rkey])) {
                                                    _context5.next = 53;
                                                    break;
                                                }

                                                _context5.next = 51;
                                                return mapModel.thenAdd((_mapModel$thenAdd2 = {}, _mapModel$thenAdd2[rel.fkey] = v[rel.fkey], _mapModel$thenAdd2[rel.rkey] = v[rel.rkey], _mapModel$thenAdd2), { where: (_where7 = {}, _where7[rel.fkey] = v[rel.fkey], _where7[rel.rkey] = v[rel.rkey], _where7) });

                                            case 51:
                                                _context5.next = 56;
                                                break;

                                            case 53:
                                                //仅存在子表主键
                                                if (v[rpk]) {
                                                    condition[rpk] = v[rpk];
                                                }
                                                //更新
                                                _context5.next = 56;
                                                return model.update(v, { where: condition });

                                            case 56:
                                                _context5.next = 35;
                                                break;

                                            case 58:
                                                return _context5.abrupt('break', 59);

                                            case 59:
                                            case 'end':
                                                return _context5.stop();
                                        }
                                    }
                                }, _callee5, _this18);
                            })(), 't0', 5);

                        case 5:
                            return _context6.abrupt('return');

                        case 6:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function __postManyToManyRelation(_x26, _x27, _x28, _x29, _x30, _x31) {
            return _ref7.apply(this, arguments);
        }

        return __postManyToManyRelation;
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