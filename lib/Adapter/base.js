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

  _class.prototype.connect = function connect() {
    return this.handel;
  };

  _class.prototype.schema = function schema() {};

  _class.prototype.log = function log() {};

  _class.prototype.error = function error() {};

  /**
   * 数据插入之前操作，可以返回一个promise
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  _class.prototype._beforeAdd = function _beforeAdd(data, options) {
    return _promise2.default.resolve(data);
  };

  _class.prototype.add = function add() {};

  /**
   * 数据插入之后操作，可以返回一个promise
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  _class.prototype._afterAdd = function _afterAdd(data, options) {
    return _promise2.default.resolve(data);
  };

  _class.prototype.addMany = function addMany() {};

  /**
   * 数据删除之前操作，可以返回一个promise
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  _class.prototype._beforeDelete = function _beforeDelete(options) {
    return _promise2.default.resolve(options);
  };

  _class.prototype.delete = function _delete() {};

  /**
   * 删除后续操作
   * @return {[type]} [description]
   */


  _class.prototype._afterDelete = function _afterDelete(options) {
    return _promise2.default.resolve(options);
  };

  /**
   * 更新前置操作
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  _class.prototype._beforeUpdate = function _beforeUpdate(data, options) {
    return _promise2.default.resolve(data);
  };

  _class.prototype.update = function update() {};

  /**
   * 更新后置操作
   * @param  {[type]} data    [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  _class.prototype._afterUpdate = function _afterUpdate(data, options) {
    return _promise2.default.resolve(data);
  };

  _class.prototype.count = function count() {};

  _class.prototype.sum = function sum() {};

  _class.prototype.max = function max() {};

  _class.prototype.min = function min() {};

  _class.prototype.avg = function avg() {};

  _class.prototype.find = function find() {};

  /**
   * find查询后置操作
   * @return {[type]} [description]
   */


  _class.prototype._afterFind = function _afterFind(result, options) {
    return _promise2.default.resolve(result);
  };

  _class.prototype.select = function select() {};

  /**
   * 查询后置操作
   * @param  {[type]} result  [description]
   * @param  {[type]} options [description]
   * @return {[type]}         [description]
   */


  _class.prototype._afterSelect = function _afterSelect(result, options) {
    return _promise2.default.resolve(result);
  };

  _class.prototype.countSelect = function countSelect() {};

  return _class;
}(); /**
      *
      * @author     richen
      * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
      * @license    MIT
      * @version    16/7/25
      */


exports.default = _class;