'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
const co = require('co');
const thinklib = require('think_lib');
const logger = require('./logger.js');
let lib = (0, _create2.default)(thinklib);

/**
 * 
 * 
 * @param {any} msg 
 * @param {any} type 
 * @param {any} showTime 
 * @param {any} debug 
 */
lib.logs = function (msg, type, showTime, debug) {
    if (type === true) {
        debug = true;
        type = '';
    }
    debug = debug || false;
    if (debug) {
        let message = msg;
        if (lib.isError(msg)) {
            type = 'ERROR';
            message = msg.stack;
        } else if (type === 'ERROR') {
            type = 'ERROR';
            if (!lib.isString(msg)) {
                message = (0, _stringify2.default)(msg);
            }
        } else if (type === 'WARNING') {
            type = 'WARNING';
            if (!lib.isString(msg)) {
                message = (0, _stringify2.default)(msg);
            }
        } else {
            if (!lib.isString(msg)) {
                message = (0, _stringify2.default)(msg);
            }
            if (lib.isNumber(showTime)) {
                let _time = Date.now() - showTime;
                message += '  ' + `${_time}ms`;
            }
            type = type || 'INFO';
        }
        logger(type, message);
    }

    return null;
};

/**
 * 字符串命名风格转换
 * @param  {[type]} name [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
lib.parseName = function (name) {
    name = name.trim();
    if (!name) {
        return name;
    }
    //首字母如果是大写，不转义为_x
    name = name[0].toLowerCase() + name.substr(1);
    return name.replace(/[A-Z]/g, function (a) {
        return '_' + a.toLowerCase();
    });
};

/**
 * 执行等待，避免一个耗时的操作多次被执行。 callback 需要返回一个 Promise 。
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
var _awaitInstances;
lib.await = function (key, callback) {
    if (!_awaitInstances) {
        const awaitjs = require('./await.js');
        _awaitInstances = new awaitjs();
    }
    return _awaitInstances.run(key, callback);
};

/**
 * alias co module
 * @type {Object}
 */
lib.thinkco = function (obj) {
    //optimize invoke co package
    if (obj && typeof obj.next === 'function') {
        return co(obj);
    }
    return _promise2.default.resolve(obj);
};

module.exports = lib;