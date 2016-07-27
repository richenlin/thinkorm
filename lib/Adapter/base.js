'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
var _class = function () {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */
  function _class() {
    (0, _classCallCheck3.default)(this, _class);

    this.init.apply(this, arguments);
  }

  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */


  _class.prototype.init = function init() {
    var config = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    this.config = config;
    this.parsercls = null;
    this.handel = null;
  };

  /**
   * get current class filename
   * @return {} []
   */


  _class.prototype.filename = function filename() {
    var fname = this.__filename || __filename;
    return _path2.default.basename(fname, '.js');
  };

  /**
   *
   * @returns {Promise.<T>}
   */


  _class.prototype.connect = function connect() {
    return _promise2.default.resolve();
  };

  /**
   *
   * @returns {Promise.<T>}
   */


  _class.prototype.parsers = function parsers() {
    return _promise2.default.resolve();
  };

  /**
   *
   * @returns {Promise.<T>}
   */


  _class.prototype.schema = function schema() {
    //自动创建表\更新表\迁移数据
    return _promise2.default.resolve();
  };

  /**
   *
   * @returns {Promise.<T>}
   */


  _class.prototype.close = function close() {
    return _promise2.default.resolve();
  };

  /**
   *
   * @param sql
   */


  _class.prototype.query = function query(sql) {
    return _promise2.default.resolve();
  };

  /**
   *
   * @param sql
   */


  _class.prototype.execute = function execute(sql) {
    return _promise2.default.resolve();
  };

  return _class;
}(); /**
      *
      * @author     richen
      * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
      * @license    MIT
      * @version    16/7/25
      */


exports.default = _class;