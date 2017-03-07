/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
"use strict";

var fs = require('fs');
var util = require('util');
var path = require('path');

//Object上toString方法
global.toString = Object.prototype.toString;

/**
 * 日期格式化
 * @param format
 * @returns {*}
 * @constructor
 */
Date.prototype.Format = function (format) {
    let Week = ['日', '一', '二', '三', '四', '五', '六'];
    format = format.replace(/yyyy|YYYY/, this.getFullYear());
    format = format.replace(/yy|YY/, this.getYear() % 100 > 9 ? (this.getYear() % 100).toString() : '0' + this.getYear() % 100);
    format = format.replace(/mi|MI/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
    format = format.replace(/mm|MM/, this.getMonth() + 1 > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
    format = format.replace(/m|M/g, this.getMonth() + 1);
    format = format.replace(/w|W/g, Week[this.getDay()]);
    format = format.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
    format = format.replace(/d|D/g, this.getDate());
    format = format.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
    format = format.replace(/h|H/g, this.getHours());
    format = format.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
    return format;
};

/**
 * 生成时间戳及时间字符串转时间戳
 * @param str
 * @param format
 * @return {*}
 * @constructor
 */
Date.prototype.Timestamp = function (str, format) {
    format = format || 'yyyy-mm-dd hh:mi:ss';
    if (toString.call(str) === '[object Number]') {
        let newDate = new Date();
        newDate.setTime(str * 1000);
        return newDate.Format(format);
    } else {
        let ts;
        if (str) {
            ts = Date.parse(new Date(str));
        } else {
            ts = Date.parse(new Date());
        }
        ts = ts / 1000;
        return ts;
    }
};

/**
 * console.log 封装
 * @param str
 */
global.echo = function (str) {
    let date = new Date().Format('yyyy-mm-dd hh:mi:ss');
    console.log(`----------${date}----------`);
    console.log(str);
    console.log(`----------${date}----------`);
};

function _interopSafeRequire(obj) {
    return (obj && obj.__esModule && obj.default) ? obj.default : obj;
}

var lib = {};
/**
 * path seperator
 * @type {String}
 */
lib.sep = path.sep;

/**
 * 是否是个数组
 * @type {Boolean}
 */
lib.isArray = Array.isArray;

/**
 * 是否是buffer
 * @type {Boolean}
 */
lib.isBuffer = Buffer.isBuffer;

/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
lib.isBoolean = function (obj) {
    return toString.call(obj) === '[object Boolean]';
};

/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isNumber = function (obj) {
    return toString.call(obj) === '[object Number]';
};

/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isNumberString = function (obj) {
    let numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
};

/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isString = function (obj) {
    return toString.call(obj) === '[object String]';
};

/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isObject = function (obj) {
    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return toString.call(obj) === '[object Object]';
};

/**
 * 是否是标准JSON对象(必须是对象或数组)
 * @param obj
 * @returns {boolean}
 */
lib.isJSONObj = function (obj) {
    return typeof obj === 'object' && (Object.prototype.toString.call(obj).toLowerCase() === '[object object]' || Object.prototype.toString.call(obj).toLowerCase() === '[object array]');
};

/**
 * 是否是标准的JSON字符串(必须是字符串，且可以被反解为对象或数组)
 * @param str
 * @returns {boolean}
 */
lib.isJSONStr = function (str) {
    if (!lib.isString(str)) {
        return false;
    }
    try {
        return lib.isJSONObj(JSON.parse(str));
    } catch (e) {
        return false;
    }
};

/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isFunction = function (obj) {
    return typeof obj === 'function';
};

/**
 * 是否是日期
 * @return {Boolean} [description]
 */
lib.isDate = function (obj) {
    return util.isDate(obj);
};

/**
 * 是否是正则
 * @param obj
 * @return {*}
 */
lib.isRegexp = function (obj) {
    return util.isRegExp(obj);
};

/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isScalar = function (obj) {
    let _obj = toString.call(obj);
    return _obj === '[object Boolean]' || _obj === '[object Number]' || _obj === '[object String]';
};

/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
lib.isFile = function (p) {
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isFile();
};

/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isError = function (obj) {
    return util.isError(obj);
};

/**
 * 判断对象是否为空(不考虑特殊情况)
 * @param  {[type]}  obj
 * @return {Boolean}
 */
lib.isTrueEmpty = function (obj) {
    if (obj === undefined || obj === null || obj === '') {
        return true;
    }
    if (lib.isNumber(obj) && lib.isNaN(obj)) {
        return true;
    }
    return false;
};

/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
lib.isEmpty = function (obj) {
    if (obj === null || obj === undefined || obj === '') {
        return true;
    } else if (lib.isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (lib.isArray(obj)) {
        return obj.length === 0;
    } else if (lib.isObject(obj)) {
        for (let key in obj) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};

/**
 * 强制转换为字符串,跟.toString不同的是可以转换undefined和null
 * @param obj
 * @returns {*}
 */
lib.toString = function (obj) {
    if (obj === undefined) {
        return '';
    }
    if (obj === null) {
        return '';
    }
    return String(obj);
};

/**
 * 强制转换为整数
 * @param obj
 * @returns {*}
 */
lib.toInt = function (obj) {
    return parseInt(obj) === NaN ? 0 : parseInt(obj);
};

/**
 * 强制转换为浮点数
 * @param obj
 * @returns {*}
 */
lib.toFloat = function (obj) {
    return parseFloat(obj) === NaN ? 0 : parseFloat(obj);
};

/**
 * 强制转换为数字
 * @param obj
 * @returns {number}
 */
lib.toNumber = function (obj) {
    return Number(obj) === NaN ? 0 : Number(obj);
};

/**
 * 强制转换为布尔值
 * @param obj
 * @returns {number}
 */
lib.toBoolean = function (obj) {
    return Boolean(obj);
};

/**
 * 判断值是否是数组的元素
 * @param needle
 * @param haystack 数组
 * @returns {boolean}
 */
lib.inArray = function (needle, haystack) {
    let length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
};

/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
lib.isPromise = function (obj) {
    return !!(obj && typeof obj.then === 'function');
};

/**
 * 生成一个defer对象
 * @return {[type]} [description]
 */
lib.getDefer = function () {
    let deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};

/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
lib.promisify = function (fn, receiver) {
    return function (...args) {
        return new Promise(function (resolve, reject) {
            fn.apply(receiver, [...args, function (err, res) {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
};

/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
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
 * 字符串或文件hash,比md5效率高,但是有很低的概率重复
 * @param input
 * @returns {string}
 */
lib.hash = function (input) {
    let _hash = 5381;
    let I64BIT_TABLE =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
    let i = input.length - 1;

    if (typeof input === 'string') {
        for (; i > -1; i--)
            _hash += (_hash << 5) + input.charCodeAt(i);
    }
    else {
        for (; i > -1; i--)
            _hash += (_hash << 5) + input[i];
    }
    let value = _hash & 0x7FFFFFFF;

    let retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    }
    while (value >>= 6);

    return retValue;
};

/**
 * 控制台打印
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
lib.log = function (msg, type, showTime) {
    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');
    let dateTime = `[${date} ${time}] `;

    let message = msg;
    if (lib.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        // console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        if (!lib.isString(msg)) {
            message = JSON.stringify(msg);
        }
        // console.error(message);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        if (!lib.isString(msg)) {
            message = JSON.stringify(msg);
        }
        // console.warn(message);
    } else {
        if (!lib.isString(msg)) {
            message = JSON.stringify(msg);
        }
        if (lib.isNumber(showTime)) {
            let _time = Date.now() - showTime;
            message += '  ' + `${_time}ms`;
        }
        type = type || 'INFO';
    }
    console.log(`${dateTime}[${type}] ${message}`);
    return;
};

/**
 * 执行等待，避免一个耗时的操作多次被执行。 callback 需要返回一个 Promise 。
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
var _ormAwaitInstance = new (_interopSafeRequire(require('./await.js')))();
lib.await = function (key, callback) {
    return _ormAwaitInstance.run(key, callback);
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
    return Promise.resolve(obj);
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
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
lib.extend = function () {
    let args = [].slice.call(arguments);
    let deep = true;
    let target;
    if (lib.isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = lib.isArray(args[0]) ? [] : {};
    } else {
        target = args.shift();
    }
    target = target || {};
    let i = 0,
        length = args.length,
        options = undefined,
        name = undefined,
        src = undefined,
        copy = undefined;
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