'use strict';

exports.__esModule = true;

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let instances = {};
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
exports.default = class {
  /**
   * constructor
   * @param  {Object} http []
   * @return {}      []
   */
  constructor(...args) {
    this.init(...args);
  }

  /**
   * init
   * @param  {Object} http []
   * @return {}      []
   */
  init() {}

  /**
   * get current class filename
   * @return {} []
   */
  filename() {
    let fname = this.__filename || __filename;
    return _path2.default.basename(fname, '.js');
  }

  /**
   * get instance
   * @param  {Object} config []
   * @return {Object}        []
   */
  static getInstance(config) {
    let key = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
    if (!instances[key]) {
      instances[key] = new this(config);
      return instances[key];
    }
    return instances[key];
  }
};