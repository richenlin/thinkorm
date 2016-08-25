'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

var _mongo = require('../Parser/mongo');

var _mongo2 = _interopRequireDefault(_mongo);

var _mongo3 = require('../Socket/mongo');

var _mongo4 = _interopRequireDefault(_mongo3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
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

    _class.prototype.init = function init() {
        var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        this.config = config;
        this.logSql = config.db_ext_config.db_log_sql || false;

        this.handel = null;
        this.parsercls = null;
    };

    _class.prototype.connect = function connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new _mongo4.default(this.config).connect();
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
        this.parsercls = new _mongo2.default(this.config);
        return this.parsercls;
    };

    /**
     * mongodb is schema less.
     */


    _class.prototype.migrate = function migrate() {
        return _promise2.default.resolve();
    };

    /**
     *
     */


    _class.prototype.startTrans = function startTrans() {
        _lib2.default.log('Adapter is not support startTrans.', 'WARNING');
        return _promise2.default.resolve();
    };

    /**
     *
     */


    _class.prototype.commit = function commit() {
        _lib2.default.log('Adapter is not support commit.', 'WARNING');
        return _promise2.default.resolve();
    };

    /**
     *
     */


    _class.prototype.rollback = function rollback() {
        _lib2.default.log('Adapter is not support rollback.', 'WARNING');
        return _promise2.default.resolve();
    };

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */


    _class.prototype.query = function query(cls, startTime) {
        var _this2 = this;

        startTime = startTime || Date.now();
        if (!cls.col) {
            this.logSql && _lib2.default.log(cls.sql, 'MongoDB', startTime);
            return _promise2.default.reject('Analytic result is empty');
        }
        return cls.col.then(function (data) {
            _this2.logSql && _lib2.default.log(cls.sql, 'MongoDB', startTime);
            return _this2.bufferToString(data);
        }).catch(function (err) {
            _this2.logSql && _lib2.default.log(cls.sql, 'MongoDB', startTime);
            return _promise2.default.reject(err);
        });
    };

    /**
     *
     * @param cls
     * @param startTime
     * @returns {*}
     */


    _class.prototype.execute = function execute(cls, startTime) {
        return this.query(cls, startTime);
    };

    /**
     * 添加一条数据
     * @param {[type]} data    [description]
     * @param {[type]} options [description]
     * @param int 返回插入的id
     */


    _class.prototype.add = function add(data) {
        var _this3 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'ADD';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this3.parsers().buildSql(conn, data, options);
        }).then(function (res) {
            return _this3.execute(res, startTime);
        }).then(function (data) {
            return data.insertedId || 0;
        });
    };

    /**
     * 删除数据
     * @return {[type]} [description]
     */


    _class.prototype.delete = function _delete() {
        var _this4 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'DELETE';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this4.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this4.execute(res, startTime);
        }).then(function (data) {
            return data.deletedCount || 0;
        });
    };

    /**
     * 更新数据
     * @return {[type]} [description]
     */


    _class.prototype.update = function update(data) {
        var _this5 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'UPDATE';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this5.parsers().buildSql(conn, data, options);
        }).then(function (res) {
            return _this5.execute(res, startTime);
        }).then(function (data) {
            return data.modifiedCount || 0;
        });
    };

    /**
     * 查询数据条数
     * @param field
     * @param options
     * @returns {*}
     */


    _class.prototype.count = function count(field) {
        var _this6 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'COUNT';
        options.count = field;
        options.limit = [0, 1];
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this6.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this6.query(res, startTime);
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
        var _this7 = this;

        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        options.method = 'SUM';
        options.sum = field;
        options.limit = [0, 1];
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this7.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this7.query(res, startTime);
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
        var _this8 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'FIND';
        options.limit = [0, 1];
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this8.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this8.query(res, startTime);
        });
    };

    /**
     * 查询数据
     * @return 返回一个promise
     */


    _class.prototype.select = function select() {
        var _this9 = this;

        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        options.method = 'SELECT';
        var startTime = Date.now();
        return this.connect().then(function (conn) {
            return _this9.parsers().buildSql(conn, options);
        }).then(function (res) {
            return _this9.query(res, startTime);
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
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(config, result, options, rel, relationData, postType) {
            var _primaryModel$update, _where5;

            var model, primaryModel, fkey, info, _where6;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (!(_lib2.default.isEmpty(result) || _lib2.default.isEmpty(relationData))) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt('return');

                        case 2:
                            model = new rel.model(config);
                            primaryModel = new ORM.collections[rel.primaryName](config);
                            _context.t0 = postType;
                            _context.next = _context.t0 === 'ADD' ? 7 : _context.t0 === 'UPDATE' ? 15 : 25;
                            break;

                        case 7:
                            _context.next = 9;
                            return model.add(relationData);

                        case 9:
                            fkey = _context.sent;
                            _context.t1 = fkey;

                            if (!_context.t1) {
                                _context.next = 14;
                                break;
                            }

                            _context.next = 14;
                            return primaryModel.update((_primaryModel$update = {}, _primaryModel$update[rel.fkey] = fkey, _primaryModel$update), { where: (_where5 = {}, _where5[rel.primaryPk] = result, _where5) });

                        case 14:
                            return _context.abrupt('break', 25);

                        case 15:
                            if (relationData[rel.fkey]) {
                                _context.next = 21;
                                break;
                            }

                            if (!primaryModel) {
                                _context.next = 21;
                                break;
                            }

                            _context.next = 19;
                            return primaryModel.field(rel.fkey).find(options);

                        case 19:
                            info = _context.sent;

                            relationData[rel.fkey] = info[rel.fkey];

                        case 21:
                            if (!relationData[rel.fkey]) {
                                _context.next = 24;
                                break;
                            }

                            _context.next = 24;
                            return model.update(relationData, { where: (_where6 = {}, _where6[rel.rkey] = relationData[rel.fkey], _where6) });

                        case 24:
                            return _context.abrupt('break', 25);

                        case 25:
                            return _context.abrupt('return');

                        case 26:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function __postHasOneRelation(_x9, _x10, _x11, _x12, _x13, _x14) {
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
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(config, result, options, rel, relationData, postType) {
            var model, rpk, _iterator, _isArray, _i, _ref3, _ref4, k, v, _where7;

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
                            model = new rel.model(config), rpk = model.getPk();
                            _iterator = relationData.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                        case 4:
                            if (!_isArray) {
                                _context2.next = 10;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context2.next = 7;
                                break;
                            }

                            return _context2.abrupt('break', 30);

                        case 7:
                            _ref3 = _iterator[_i++];
                            _context2.next = 14;
                            break;

                        case 10:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context2.next = 13;
                                break;
                            }

                            return _context2.abrupt('break', 30);

                        case 13:
                            _ref3 = _i.value;

                        case 14:
                            _ref4 = _ref3;
                            k = _ref4[0];
                            v = _ref4[1];
                            _context2.t0 = postType;
                            _context2.next = _context2.t0 === 'ADD' ? 20 : _context2.t0 === 'UPDATE' ? 24 : 28;
                            break;

                        case 20:
                            //子表插入数据
                            v[rel.rkey] = result;
                            _context2.next = 23;
                            return model.add(v);

                        case 23:
                            return _context2.abrupt('break', 28);

                        case 24:
                            if (!v[rpk]) {
                                _context2.next = 27;
                                break;
                            }

                            _context2.next = 27;
                            return model.update(v, { where: (_where7 = {}, _where7[rpk] = v[rpk], _where7) });

                        case 27:
                            return _context2.abrupt('break', 28);

                        case 28:
                            _context2.next = 4;
                            break;

                        case 30:
                            return _context2.abrupt('return');

                        case 31:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function __postHasManyRelation(_x15, _x16, _x17, _x18, _x19, _x20) {
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
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(config, result, options, rel, relationData, postType) {
            var _mapModel$thenAdd, _where8;

            var model, rpk, mapModel, _iterator2, _isArray2, _i2, _ref6, _ref7, k, v, fkey, _mapModel$thenAdd2, _where9, _where10;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            if (!(_lib2.default.isEmpty(result) || _lib2.default.isEmpty(relationData))) {
                                _context3.next = 2;
                                break;
                            }

                            return _context3.abrupt('return');

                        case 2:
                            //子表主键
                            model = new rel.model(config), rpk = model.getPk();
                            mapModel = new rel['mapModel'](config);
                            //关系表

                            _iterator2 = relationData.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);

                        case 5:
                            if (!_isArray2) {
                                _context3.next = 11;
                                break;
                            }

                            if (!(_i2 >= _iterator2.length)) {
                                _context3.next = 8;
                                break;
                            }

                            return _context3.abrupt('break', 40);

                        case 8:
                            _ref6 = _iterator2[_i2++];
                            _context3.next = 15;
                            break;

                        case 11:
                            _i2 = _iterator2.next();

                            if (!_i2.done) {
                                _context3.next = 14;
                                break;
                            }

                            return _context3.abrupt('break', 40);

                        case 14:
                            _ref6 = _i2.value;

                        case 15:
                            _ref7 = _ref6;
                            k = _ref7[0];
                            v = _ref7[1];
                            _context3.t0 = postType;
                            _context3.next = _context3.t0 === 'ADD' ? 21 : _context3.t0 === 'UPDATE' ? 29 : 38;
                            break;

                        case 21:
                            _context3.next = 23;
                            return model.add(v);

                        case 23:
                            fkey = _context3.sent;
                            _context3.t1 = fkey;

                            if (!_context3.t1) {
                                _context3.next = 28;
                                break;
                            }

                            _context3.next = 28;
                            return mapModel.thenAdd((_mapModel$thenAdd = {}, _mapModel$thenAdd[rel.fkey] = result, _mapModel$thenAdd[rel.rkey] = fkey, _mapModel$thenAdd), {
                                where: (_where8 = {}, _where8[rel.fkey] = result, _where8[rel.rkey] = fkey, _where8)
                            });

                        case 28:
                            return _context3.abrupt('break', 38);

                        case 29:
                            if (!(v[rel.fkey] && v[rel.rkey])) {
                                _context3.next = 34;
                                break;
                            }

                            _context3.next = 32;
                            return mapModel.thenAdd((_mapModel$thenAdd2 = {}, _mapModel$thenAdd2[rel.fkey] = v[rel.fkey], _mapModel$thenAdd2[rel.rkey] = v[rel.rkey], _mapModel$thenAdd2), { where: (_where9 = {}, _where9[rel.fkey] = v[rel.fkey], _where9[rel.rkey] = v[rel.rkey], _where9) });

                        case 32:
                            _context3.next = 37;
                            break;

                        case 34:
                            if (!v[rpk]) {
                                _context3.next = 37;
                                break;
                            }

                            _context3.next = 37;
                            return model.update(v, { where: (_where10 = {}, _where10[rpk] = v[rpk], _where10) });

                        case 37:
                            return _context3.abrupt('break', 38);

                        case 38:
                            _context3.next = 5;
                            break;

                        case 40:
                            return _context3.abrupt('return');

                        case 41:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function __postManyToManyRelation(_x21, _x22, _x23, _x24, _x25, _x26) {
            return _ref5.apply(this, arguments);
        }

        return __postManyToManyRelation;
    }();

    return _class;
}(_base3.default);

exports.default = _class;