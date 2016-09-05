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

var _mongodb = require('mongodb');

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

        this.sql = '';
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
        if (!cls) {
            this.logSql && _lib2.default.log(this.sql, 'MongoDB', startTime);
            return _promise2.default.reject('Analytic result is empty');
        }
        return cls.then(function (data) {
            _this2.logSql && _lib2.default.log(_this2.sql, 'MongoDB', startTime);
            return _this2.bufferToString(data);
        }).catch(function (err) {
            _this2.logSql && _lib2.default.log(_this2.sql, 'MongoDB', startTime);
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        //mongodb.js的addOne,会改变原有添加对象，将主键加进去。
        var d = _lib2.default.extend({}, data);
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this3.parsers().buildSql(d, options);
        }).then(function (res) {
            _this3.sql = 'db.' + res.options.table + '.insertOne(' + (0, _stringify2.default)(res.data) + ')';
            handler = collection.insertOne(res.data);
            return _this3.execute(handler, startTime);
        }).then(function (data) {
            return data.insertedId.toHexString() || 0;
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this4.parsers().buildSql(options);
        }).then(function (res) {
            _this4.sql = 'db.' + res.options.table + (res.options.where ? '.remove(' + (0, _stringify2.default)(res.options.where) + ')' : '.remove()');
            handler = collection.deleteMany(res.options.where || {});
            return _this4.execute(handler, startTime);
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this5.parsers().buildSql(data, options);
        }).then(function (res) {
            _this5.sql = 'db.' + res.options.table + (res.options.where ? '.update(' + (0, _stringify2.default)(res.options.where) + ', {$set:' + (0, _stringify2.default)(res.data) + '}, false, true))' : '.update({}, {$set:' + (0, _stringify2.default)(res.data) + '}, false, true)');
            handler = collection.updateMany(res.options.where || {}, { $set: res.data }, false, true);
            return _this5.execute(handler, startTime);
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this6.parsers().buildSql(options);
        }).then(function (res) {
            if (_lib2.default.isEmpty(res.options.group)) {
                var fn = _lib2.default.promisify(collection.aggregate, collection),
                    pipe = [];
                !_lib2.default.isEmpty(res.options.where) && pipe.push({ $match: res.options.where });
                pipe.push({
                    $group: {
                        _id: null,
                        count: { $sum: 1 }
                    }
                });
                _this6.sql = 'db.' + res.options.table + '.aggregate(' + (0, _stringify2.default)(pipe) + ')';
                handler = fn(pipe);
            } else {
                res.options.group.initial = {
                    "countid": 0
                };
                res.options.group.reduce = new Function('obj', 'prev', 'if (obj.' + res.options.count + ' != null) if (obj.' + res.options.count + ' instanceof Array){prev.countid += obj.' + res.options.count + '.length; }else{ prev.countid++;}');
                res.options.group.cond = res.options.where;
                _this6.sql = 'db.' + res.options.table + '.group(' + (0, _stringify2.default)(res.options.group) + ')';
                handler = collection.group(res.options.group);
            }
            return _this6.query(handler, startTime);
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this7.parsers().buildSql(options);
        }).then(function (res) {
            if (_lib2.default.isEmpty(res.options.group)) {
                var fn = _lib2.default.promisify(collection.aggregate, collection),
                    pipe = [];
                !_lib2.default.isEmpty(res.options.where) && pipe.push({ $match: res.options.where });
                pipe.push({
                    $group: {
                        _id: 1,
                        sum: { $sum: '$' + res.options.sum }
                    }
                });
                _this7.sql = 'db.' + res.options.table + '.aggregate(' + (0, _stringify2.default)(pipe) + ')';
                handler = fn(pipe);
            } else {
                res.options.group.initial = {
                    "sumid": 0
                };
                res.options.group.reduce = new Function('obj', 'prev', 'prev.sumid = prev.sumid + obj.' + res.options.sum + ' - 0;');
                res.options.group.cond = res.options.where;
                _this7.sql = 'db.' + res.options.table + '.group(' + (0, _stringify2.default)(res.options.group) + ')';
                handler = collection.group(res.options.group);
            }
            return _this7.query(handler, startTime);
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this8.parsers().buildSql(options);
        }).then(function (res) {
            if (_lib2.default.isEmpty(res.options.group)) {
                _this8.sql = 'db.' + res.options.table + (res.options.where ? '.findOne(' + (0, _stringify2.default)(res.options.where) + ')' : '.findOne()');
                handler = collection.findOne(res.options.where || {});
            } else {
                res.options.group.cond = res.options.where;
                _this8.sql = 'db.' + res.options.table + '.group(' + res.options.group.key + ',' + res.options.group.cond + ',' + res.options.group.initial + ',' + res.options.group.reduce + ')';
                //handler = collection.group(res.options.group);
                handler = collection.group(res.options.group.key, res.options.group.cond, res.options.group.initial, res.options.group.reduce);
            }
            return _this8.query(handler, startTime);
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
        var startTime = Date.now(),
            collection = void 0,
            handler = void 0;
        return this.connect().then(function (conn) {
            collection = conn.collection(options.table);
            return _this9.parsers().buildSql(options);
        }).then(function (res) {
            if (_lib2.default.isEmpty(res.options.group)) {
                _this9.sql = '' + _this9.sql + (res.options.where ? '.find(' + (0, _stringify2.default)(res.options.where) + ')' : '.find()');
                handler = collection.find(res.options.where || {});
            } else {
                res.options.group.cond = res.options.where;
                _this9.sql = _this9.sql + '.group(' + res.options.group.key + ',' + res.options.group.cond + ',' + res.options.group.initial + ',' + res.options.group.reduce + ')';
                //handler = collection.group(res.options.group);
                handler = collection.group(res.options.group.key, res.options.group.cond, res.options.group.initial, res.options.group.reduce);
            }
            return _this9.query(handler.toArray(), startTime);
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
        return model.find({ field: rel.field, where: (_where = {}, _where[rel.rkey] = data[rel.fkey]['oid'], _where) });
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
        //modify by lihao 此处主表查询出的结果中_id为ObjectId类型,会被parse/parseWhere解析出错,因此转为string
        var primaryPk = _lib2.default.isObject(data[rel.primaryPk]) ? data[rel.primaryPk].toString() : data[rel.primaryPk];
        var options = { field: rel.field, where: (_where2 = {}, _where2[rel.rkey] = primaryPk, _where2) };
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
            var _options$where, _primaryModel$update;

            var model, primaryModel, fkey, refKey, info, _where5;

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
                            _context.next = _context.t0 === 'ADD' ? 7 : _context.t0 === 'UPDATE' ? 17 : 27;
                            break;

                        case 7:
                            _context.next = 9;
                            return model.add(relationData);

                        case 9:
                            fkey = _context.sent;

                            options.where = (_options$where = {}, _options$where[rel.primaryPk] = result, _options$where);
                            //modify by lihao,此处修改为mongo的ref引用关联字段
                            refKey = new _mongodb.DBRef(model.getTableName(), fkey);
                            //更新主表关联字段
                            //fkey && (await primaryModel.update({[rel.fkey]: fkey}, options));

                            _context.t1 = fkey;

                            if (!_context.t1) {
                                _context.next = 16;
                                break;
                            }

                            _context.next = 16;
                            return primaryModel.update((_primaryModel$update = {}, _primaryModel$update[rel.fkey] = refKey, _primaryModel$update), options);

                        case 16:
                            return _context.abrupt('break', 27);

                        case 17:
                            if (relationData[rel.fkey]) {
                                _context.next = 23;
                                break;
                            }

                            if (!primaryModel) {
                                _context.next = 23;
                                break;
                            }

                            _context.next = 21;
                            return primaryModel.field(rel.fkey).find(options);

                        case 21:
                            info = _context.sent;

                            relationData[rel.fkey] = info[rel.fkey];

                        case 23:
                            if (!relationData[rel.fkey]) {
                                _context.next = 26;
                                break;
                            }

                            _context.next = 26;
                            return model.update(relationData, { where: (_where5 = {}, _where5[rel.rkey] = relationData[rel.fkey], _where5) });

                        case 26:
                            return _context.abrupt('break', 27);

                        case 27:
                            return _context.abrupt('return');

                        case 28:
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
            var model, rpk, relIdArr, fkey, _iterator, _isArray, _i, _ref3, _ref4, k, v, _options$where2, _primaryModel$update2, primaryModel, _iterator2, _isArray2, _i2, _ref5, _ref6, _where6;

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
                            //for (let [k, v] of relationData.entries()) {
                            //    switch (postType) {
                            //        case 'ADD':
                            //            //子表插入数据
                            //            v[rel.rkey] = result;
                            //            await model.add(v);
                            //            //modify by lihao,将子表数据通过ref关联更新到主表
                            //            break;
                            //        case 'UPDATE':
                            //            //子表主键数据存在才更新
                            //            if (v[rpk]) {
                            //                await model.update(v, {where: {[rpk]: v[rpk]}});
                            //            }
                            //            break;
                            //    }
                            //}
                            //modify by lihao,将子表数据通过ref关联更新到主表

                            _context2.t0 = postType;
                            _context2.next = _context2.t0 === 'ADD' ? 6 : _context2.t0 === 'UPDATE' ? 34 : 54;
                            break;

                        case 6:
                            relIdArr = [], fkey = void 0;
                            _iterator = relationData.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);

                        case 8:
                            if (!_isArray) {
                                _context2.next = 14;
                                break;
                            }

                            if (!(_i >= _iterator.length)) {
                                _context2.next = 11;
                                break;
                            }

                            return _context2.abrupt('break', 28);

                        case 11:
                            _ref3 = _iterator[_i++];
                            _context2.next = 18;
                            break;

                        case 14:
                            _i = _iterator.next();

                            if (!_i.done) {
                                _context2.next = 17;
                                break;
                            }

                            return _context2.abrupt('break', 28);

                        case 17:
                            _ref3 = _i.value;

                        case 18:
                            _ref4 = _ref3;
                            k = _ref4[0];
                            v = _ref4[1];

                            //子表插入数据
                            v[rel.rkey] = result;
                            _context2.next = 24;
                            return model.add(v);

                        case 24:
                            fkey = _context2.sent;

                            relIdArr.push(new _mongodb.DBRef(model.getTableName(), fkey));

                        case 26:
                            _context2.next = 8;
                            break;

                        case 28:
                            if (_lib2.default.isEmpty(relIdArr)) {
                                _context2.next = 33;
                                break;
                            }

                            options.where = (_options$where2 = {}, _options$where2[rel.primaryPk] = result, _options$where2);
                            primaryModel = new ORM.collections[rel.primaryName](config);
                            _context2.next = 33;
                            return primaryModel.update((_primaryModel$update2 = {}, _primaryModel$update2[rel.fkey] = relIdArr, _primaryModel$update2), options);

                        case 33:
                            return _context2.abrupt('break', 54);

                        case 34:
                            _iterator2 = relationData.entries(), _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);

                        case 35:
                            if (!_isArray2) {
                                _context2.next = 41;
                                break;
                            }

                            if (!(_i2 >= _iterator2.length)) {
                                _context2.next = 38;
                                break;
                            }

                            return _context2.abrupt('break', 53);

                        case 38:
                            _ref5 = _iterator2[_i2++];
                            _context2.next = 45;
                            break;

                        case 41:
                            _i2 = _iterator2.next();

                            if (!_i2.done) {
                                _context2.next = 44;
                                break;
                            }

                            return _context2.abrupt('break', 53);

                        case 44:
                            _ref5 = _i2.value;

                        case 45:
                            _ref6 = _ref5;
                            k = _ref6[0];
                            v = _ref6[1];

                            if (!v[rpk]) {
                                _context2.next = 51;
                                break;
                            }

                            _context2.next = 51;
                            return model.update(v, { where: (_where6 = {}, _where6[rpk] = v[rpk], _where6) });

                        case 51:
                            _context2.next = 35;
                            break;

                        case 53:
                            return _context2.abrupt('break', 54);

                        case 54:
                            return _context2.abrupt('return');

                        case 55:
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
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(config, result, options, rel, relationData, postType) {
            var _mapModel$thenAdd, _where7;

            var model, rpk, mapModel, _iterator3, _isArray3, _i3, _ref8, _ref9, k, v, fkey, _mapModel$thenAdd2, _where8, _where9;

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

                            _iterator3 = relationData.entries(), _isArray3 = Array.isArray(_iterator3), _i3 = 0, _iterator3 = _isArray3 ? _iterator3 : (0, _getIterator3.default)(_iterator3);

                        case 5:
                            if (!_isArray3) {
                                _context3.next = 11;
                                break;
                            }

                            if (!(_i3 >= _iterator3.length)) {
                                _context3.next = 8;
                                break;
                            }

                            return _context3.abrupt('break', 40);

                        case 8:
                            _ref8 = _iterator3[_i3++];
                            _context3.next = 15;
                            break;

                        case 11:
                            _i3 = _iterator3.next();

                            if (!_i3.done) {
                                _context3.next = 14;
                                break;
                            }

                            return _context3.abrupt('break', 40);

                        case 14:
                            _ref8 = _i3.value;

                        case 15:
                            _ref9 = _ref8;
                            k = _ref9[0];
                            v = _ref9[1];
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
                                where: (_where7 = {}, _where7[rel.fkey] = result, _where7[rel.rkey] = fkey, _where7)
                            });

                        case 28:
                            return _context3.abrupt('break', 38);

                        case 29:
                            if (!(v[rel.fkey] && v[rel.rkey])) {
                                _context3.next = 34;
                                break;
                            }

                            _context3.next = 32;
                            return mapModel.thenAdd((_mapModel$thenAdd2 = {}, _mapModel$thenAdd2[rel.fkey] = v[rel.fkey], _mapModel$thenAdd2[rel.rkey] = v[rel.rkey], _mapModel$thenAdd2), { where: (_where8 = {}, _where8[rel.fkey] = v[rel.fkey], _where8[rel.rkey] = v[rel.rkey], _where8) });

                        case 32:
                            _context3.next = 37;
                            break;

                        case 34:
                            if (!v[rpk]) {
                                _context3.next = 37;
                                break;
                            }

                            _context3.next = 37;
                            return model.update(v, { where: (_where9 = {}, _where9[rpk] = v[rpk], _where9) });

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