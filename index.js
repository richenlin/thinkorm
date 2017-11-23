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
//define orm object
!global.__thinkorm && (global.__thinkorm = Object.create(null));
//export
module.exports = require('./lib/model.js');