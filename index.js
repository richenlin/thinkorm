/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
//rewite promise, bluebird is much faster
const liteq = require('liteq');
global.Promise = require('bluebird');
const thinkorm = require('./lib/model.js');
const relModel = require('./lib/relModel.js');

thinkorm.model = thinkorm;
thinkorm.relModel = relModel;
thinkorm.helper = liteq.helper;
module.exports = thinkorm;