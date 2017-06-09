'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
const path = require('path');
const schema = require('../schema');

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
module.exports = class {
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
    return path.basename(fname, '.js');
  }

  /**
   * get instance
   * @param  {Object} config []
   * @return {Object}        []
   */
  static getInstance(config) {
    let key = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
    if (!schema.instances[key]) {
      schema.instances[key] = new this(config);
      return schema.instances[key];
    }
    return schema.instances[key];
  }
};