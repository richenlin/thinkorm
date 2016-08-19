/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
'use strict';
//rewite promise, bluebird is more faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;
require('./lib/Util/lib.js');
//export
function requireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
ORM.model = requireDefault(require('./lib/model.js')).default;
var schema = requireDefault(require('./lib/schema.js')).default;
module.exports = {
    setCollection: schema.setCollection,
    Model: ORM.model
};
