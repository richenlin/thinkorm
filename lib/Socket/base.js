'use strict';

exports.__esModule = true;

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
    this.pool = null;
    this.connection = null;
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
   * close db connection
   */


  _class.prototype.close = function close() {
    clearTimeout(this.closeTimer);
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
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