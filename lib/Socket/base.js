'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var instances = {};
/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
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


  _class.prototype.init = function init() {};

  /**
   * get current class filename
   * @return {} []
   */


  _class.prototype.filename = function filename() {
    var fname = this.__filename || __filename;
    return _path2.default.basename(fname, '.js');
  };

  /**
   * get instance
   * @param  {Object} config []
   * @return {Object}        []
   */


  _class.getInstance = function getInstance(config) {
    var key = config.db_type + '_' + config.db_host + '_' + config.db_port + '_' + config.db_name;
    if (!instances[key]) {
      instances[key] = new this(config);
      return instances[key];
    }
    return instances[key];
  };

  return _class;
}();

exports.default = _class;