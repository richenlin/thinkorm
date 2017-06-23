'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

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
const awaitjs = require('./await.js');
let lib = thinklib;

/**
 * 
 * 
 * @param {any} msg 
 * @param {any} type 
 * @param {any} showTime 
 * @param {any} debug 
 */
lib.log = function (msg, type, showTime, debug = true) {
    if (type === true) {
        debug = true;
        type = '';
    }
    debug = debug || false;
    let dateTime = `[${lib.datetime('', '')}] `;
    let message = msg;
    if (lib.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        'prototype' in console.error && console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        if (!lib.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        'prototype' in console.error && console.error(message);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        if (!lib.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        'prototype' in console.warn && console.warn(message);
    } else {
        if (!lib.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        if (lib.isNumber(showTime)) {
            let _time = Date.now() - showTime;
            message += '  ' + `${_time}ms`;
        }
        type = type || 'INFO';
        //判断console.info是否被重写
        'prototype' in console.info && console.info(message);
    }
    (debug || type === 'THINK') && console.log(`${dateTime}[${type}] ${message}`);
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