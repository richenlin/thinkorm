/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
'use strict';
//rewite promise, bluebird is much faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;
//define ORM object
global.ORM = { collections: {} };
//export
function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
module.exports = requireDefault(require('./lib/model.js')).default;
