/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var util = require('util');
var path = require('path');

var _interopSafeRequire = function _interopSafeRequire(obj) {
    return obj && obj.__esModule && obj.default ? obj.default : obj;
};

var lib = {};
/**
 * console.log 封装
 * @param str
 */
global.echo = function (str) {
    var date = lib.datetime('', '');
    console.log('----------' + date + '----------');
    console.log(lib.isScalar(str) ? str : (0, _stringify2.default)(str));
    console.log('----------' + date + '----------');
};

lib.sep = path.sep;
lib.isArray = Array.isArray;
lib.isBuffer = Buffer.isBuffer;
lib.isDate = util.isDate;
lib.isDate = util.isDate;
lib.isRegexp = util.isRegExp;
lib.isSymbol = util.isSymbol;
lib.isError = util.isError;

/**
 * 是否是字符串
 * 
 * @param {any} obj 
 * @returns 
 */
lib.isString = function (obj) {
    return Object.prototype.toString.call(obj) === '[object String]';
};

/**
 * 是否是数值
 * 
 * @param {any} obj 
 * @returns 
 */
lib.isNumber = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
};

/**
 * 
 * 
 * @param {any} obj 
 * @returns 
 */
lib.isBoolean = function (obj) {
    return Object.prototype.toString.call(obj) === '[object Boolean]';
};

/**
 * 是否是对象
 * 
 * @param  {[type]} 
 * @return {Boolean} 
 */
lib.isObject = function (obj) {
    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return Object.prototype.toString.call(obj) === '[object Object]';
};

/**
 * 是否是函数
 * 
 * @param {any} obj 
 * @returns 
 */
lib.isFunction = function (obj) {
    return typeof obj === 'function';
};

/**
 * 是否是个标量
 * 
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isScalar = function (obj) {
    var _obj = Object.prototype.toString.call(obj);
    return _obj === '[object Boolean]' || _obj === '[object Number]' || _obj === '[object String]';
};

/**
 * 是否是个Promise
 * 
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isPromise = function (obj) {
    return !!(obj && obj.catch && typeof obj.then === 'function');
};

/**
 * 是否是仅包含数字的字符串
 * 
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isNumberString = function (obj) {
    var numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
};

/**
 * 是否是标准JSON对象
 * 必须是对象或数组
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isJSONObj = function (obj) {
    return lib.isObject(obj) || lib.isArray(obj);
};

/**
 * 是否是标准的JSON字符串
 * 必须是字符串，且可以被反解为对象或数组
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isJSONStr = function (obj) {
    if (!lib.isString(obj)) {
        return false;
    }
    try {
        return lib.isJSONObj(JSON.parse(obj));
    } catch (e) {
        return false;
    }
};

/**
 * 是否是个文件
 * 
 * @param {string} p 
 * @returns {boolean} 
 */
lib.isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    try {
        var stats = fs.statSync(p);
        return stats.isFile();
    } catch (e) {
        return false;
    }
};

/**
 * 检查对象是否为空
 * 不考虑空对象、数组
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isTrueEmpty = function (obj) {
    if (obj === undefined || obj === null || obj === '') {
        return true;
    }
    if (lib.isNumber(obj)) {
        return isNaN(obj);
    }
    return false;
};

/**
 * 检查对象是否为空
 * 
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.isEmpty = function (obj) {
    if (obj === undefined || obj === null || obj === '') {
        return true;
    } else if (lib.isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (lib.isNumber(obj)) {
        return isNaN(obj);
    } else if (lib.isArray(obj)) {
        return obj.length === 0;
    } else if (lib.isObject(obj)) {
        for (var key in obj) {
            return !key && !0;
        }
        return true;
    }
    return false;
};

/**
 * 强制转换为字符串
 * 跟.toString不同的是可以转换undefined和null
 * @param {*} obj 
 * @returns {string} 
 */
lib.toString = function (obj) {
    if (obj === undefined || obj === null) {
        return '';
    }
    return String(obj);
};

/**
 * 强制转换为整型
 * 
 * @param {*} obj 
 * @returns {number} 
 */
lib.toInt = function (obj) {
    return isNaN(obj) ? 0 : parseInt(obj);
};

/**
 * 强制转换为浮点型
 * 
 * @param {*} obj 
 * @returns {number} 
 */
lib.toFloat = function (obj) {
    return isNaN(obj) ? 0 : parseFloat(obj);
};

/**
 * 强制转换为数值
 * 
 * @param {*} obj 
 * @returns {number} 
 */
lib.toNumber = function (obj) {
    return isNaN(obj) ? 0 : Number(obj);
};

/**
 * 强制转换为布尔值
 * 
 * @param {*} obj 
 * @returns {boolean} 
 */
lib.toBoolen = function (obj) {
    return Boolean(obj);
};

/**
 * 判断值是否为数组的元素
 * 非严格匹配
 * @param {*} value 
 * @param {any[]} arr 
 * @returns {boolean} 
 */
lib.inArray = function (value, arr) {
    var len = arr.length;
    for (var i = 0; i < len; i++) {
        if (arr[i] == value) {
            return true;
        }
    }
    return false;
};

/**
 * 生成一个defer对象
 * 
 * @returns {*} 
 */
lib.getDefer = function () {
    var defer = {};
    defer.promise = new _promise2.default(function (resolve, reject) {
        defer.resolve = resolve;
        defer.reject = reject;
    });
    return defer;
};

/**
 * 将callback风格的函数转换为Promise
 * 
 * @param {Function} fn 
 * @param {object} receiver 
 * @returns {*} 
 */
lib.promisify = function (fn, receiver) {
    return function () {
        for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
        }

        return new _promise2.default(function (resolve, reject) {
            fn.apply(receiver, [].concat(args, [function (err, res) {
                return err ? reject(err) : resolve(res);
            }]));
        });
    };
};

/**
 * 大写首字符
 * 
 * @param {string} name 
 * @returns {string} 
 */
lib.ucFirst = function (name) {
    name = (name || '') + '';
    return name.slice(0, 1).toUpperCase() + name.slice(1).toLowerCase();
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
 * hash
 * 
 * @param {string} str 
 * @returns {string} 
 */
lib.hash = function (str) {
    var _hash = 5381;
    var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
    var i = str.length - 1;
    if (typeof str === 'string') {
        for (; i > -1; i--) {
            _hash += (_hash << 5) + str.charCodeAt(i);
        }
    } else {
        for (; i > -1; i--) {
            _hash += (_hash << 5) + str[i];
        }
    }
    var value = _hash & 0x7FFFFFFF;
    var retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    } while (value >>= 6);
    return retValue;
};

/**
 * 日期时间戳及格式化
 * 
 * @param {any} date 
 * @param {any} format 
 * @returns 
 */
lib.datetime = function (date, format) {
    if (format === undefined) {
        //datetime() => now timestamp
        if (date === undefined) {
            return Math.floor(Date.now() / 1000);
        } else if (lib.isString(date)) {
            //datetime('2017-01-01') => timestamp
            date = date || new Date();
            return Math.floor(new Date(date).getTime() / 1000);
        }
        return NaN;
    } else {
        if (date && lib.isString(date)) {
            date = new Date(Date.parse(date));
        }
        date = date || new Date();
        format = format || 'yyyy-mm-dd hh:mi:ss';
        var fn = function fn(d, f) {
            var Week = ['日', '一', '二', '三', '四', '五', '六'];
            f = f.replace(/yyyy|YYYY/, d.getFullYear());
            f = f.replace(/yy|YY/, d.getYear() % 100 > 9 ? (d.getYear() % 100).toString() : '0' + d.getYear() % 100);
            f = f.replace(/mi|MI/, d.getMinutes() > 9 ? d.getMinutes().toString() : '0' + d.getMinutes());
            f = f.replace(/mm|MM/, d.getMonth() + 1 > 9 ? (d.getMonth() + 1).toString() : '0' + (d.getMonth() + 1));
            f = f.replace(/m|M/g, d.getMonth() + 1);
            f = f.replace(/w|W/g, Week[d.getDay()]);
            f = f.replace(/dd|DD/, d.getDate() > 9 ? d.getDate().toString() : '0' + d.getDate());
            f = f.replace(/d|D/g, d.getDate());
            f = f.replace(/hh|HH/, d.getHours() > 9 ? d.getHours().toString() : '0' + d.getHours());
            f = f.replace(/h|H/g, d.getHours());
            f = f.replace(/ss|SS/, d.getSeconds() > 9 ? d.getSeconds().toString() : '0' + d.getSeconds());
            return f;
        };
        return fn(date, format);
    }
};

/**
 * 日志记录及打印
 * 
 * @param {*} msg 
 * @param {string} [type] 
 * @param {number} [showTime] 
 * @returns {void} 
 */
lib.log = function (msg, type, showTime) {
    var dateTime = '[' + lib.datetime('', '') + '] ';
    var message = msg;
    if (lib.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        if (!lib.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        console.error(message);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        if (!lib.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        console.warn(message);
    } else {
        if (!lib.isString(msg)) {
            message = (0, _stringify2.default)(msg);
        }
        if (lib.isNumber(showTime)) {
            var _time = Date.now() - showTime;
            message += '  ' + (_time + 'ms');
        }
        type = type || 'INFO';
        //判断console.info是否被重写
        'prototype' in console.info && console.info(message);
    }
    console.log(dateTime + '[' + type + '] ' + message);
};

/**
 * 执行等待，避免一个耗时的操作多次被执行。 callback 需要返回一个 Promise 。
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
lib.await = function (key, callback) {
    if (!ORM.instances.await) {
        ORM.instances.await = new (_interopSafeRequire(require('./await.js')))();
    }
    return ORM.instances.await.run(key, callback);
};

/**
 * alias co module
 * @type {Object}
 */
var co = require('co');
lib.thinkCo = function (obj) {
    //optimize invoke co package
    if (obj && typeof obj.next === 'function') {
        return co(obj);
    }
    return _promise2.default.resolve(obj);
};

/**
 * 加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
lib.thinkRequire = function (file) {
    try {
        var obj = require(file);
        obj = _interopSafeRequire(obj);
        if (lib.isFunction(obj)) {
            obj.prototype.__filename = file;
        }
        return obj;
    } catch (err) {
        return null;
    }
};

/**
 * 继承
 * from jquery.具有深度克隆
 * @returns {*} 
 */
lib.extend = function () {
    var args = [].slice.call(arguments),
        deep = true,
        target = void 0;
    if (lib.isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = lib.isArray(args[0]) ? [] : {};
    } else {
        target = args.shift();
    }
    target = target || {};
    var i = 0,
        length = args.length,
        options = void 0,
        name = void 0,
        src = void 0,
        copy = void 0;
    for (; i < length; i++) {
        options = args[i];
        if (!options) {
            continue;
        }
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (deep) {
                if (lib.isObject(copy)) {
                    target[name] = lib.extend(src && lib.isObject(src) ? src : {}, copy);
                } else if (lib.isArray(copy)) {
                    target[name] = lib.extend([], copy);
                } else {
                    target[name] = copy;
                }
            } else {
                target[name] = copy;
            }
        }
    }
    return target;
};

module.exports = lib;