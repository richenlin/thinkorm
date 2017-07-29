/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
'use strict';
//rewite promise, bluebird is much faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;
//define orm object
global.__thinkorm = Object.create({});
//export
module.exports = require('./lib/model.js');