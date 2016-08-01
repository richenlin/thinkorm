'use strict';

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var fs = require('fs');
var util = require('util');
function _interopSafeRequire(obj) {
    return obj && obj.__esModule && obj.default ? obj.default : obj;
}

if (!Date.prototype.Format) {
    Date.prototype.Format = function (format) {
        var Week = ['日', '一', '二', '三', '四', '五', '六'];
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
}
//Object上toString方法
global.toString = Object.prototype.toString;
/**
 * 是否是buffer
 * @type {Boolean}
 */
ORM.isBuffer = Buffer.isBuffer;
/**
 * 是否是个数组
 * @type {Boolean}
 */
ORM.isArray = Array.isArray;
/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
ORM.isBoolean = function (obj) {
    'use strict';

    return toString.call(obj) === '[object Boolean]';
};
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isNumber = function (obj) {
    'use strict';

    return toString.call(obj) === '[object Number]';
};
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isObject = function (obj) {
    'use strict';

    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return toString.call(obj) === '[object Object]';
};
ORM.getDefer = function () {
    'use strict';

    var deferred = {};
    deferred.promise = new _promise2.default(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isString = function (obj) {
    'use strict';

    return toString.call(obj) === '[object String]';
};
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isNumberString = function (obj) {
    'use strict';

    var numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
};
/**
 * 是否是标准JSON对象
 * @param obj
 * @returns {boolean}
 */
ORM.isJSONObj = function (obj) {
    'use strict';

    return (typeof obj === 'undefined' ? 'undefined' : (0, _typeof3.default)(obj)) === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object object]' && !obj.length;
};
/**
 * 是否是标准的JSON字符串
 * @param str
 * @returns {boolean}
 */
ORM.isJSONStr = function (str) {
    'use strict';

    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isFunction = function (obj) {
    'use strict';

    return typeof obj === 'function';
};
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
ORM.isDate = function (obj) {
    'use strict';

    return util.isDate(obj);
};
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
ORM.isRegexp = function (obj) {
    'use strict';

    return util.isRegExp(obj);
};
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isScalar = function (obj) {
    'use strict';

    return ORM.isBoolean(obj) || ORM.isNumber(obj) || ORM.isString(obj);
};
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
ORM.isFile = function (p) {
    'use strict';

    if (!fs.existsSync(p)) {
        return false;
    }
    var stats = fs.statSync(p);
    return stats.isFile();
};
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isError = function (obj) {
    'use strict';

    return util.isError(obj);
};
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
ORM.isEmpty = function (obj) {
    'use strict';

    if (obj === null || obj === undefined || obj === '') {
        return true;
    } else if (ORM.isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (ORM.isArray(obj)) {
        return obj.length === 0;
    } else if (ORM.isObject(obj)) {
        for (var key in obj) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
ORM.isPromise = function (obj) {
    'use strict';

    return !!(obj && typeof obj.then === 'function');
};
/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
ORM.promisify = function (fn, receiver) {
    'use strict';

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
 * 执行等待，避免一个耗时的操作多次被执行。 callback 需要返回一个 Promise 。
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
var _ormAwaitInstance = new (_interopSafeRequire(require('./await.js')))();
ORM.await = function (key, callback) {
    return _ormAwaitInstance.run(key, callback);
};
/**
 * 安全方式加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
ORM.safeRequire = function (file) {
    'use strict';

    try {
        var obj = require(file);
        return _interopSafeRequire(obj);
    } catch (err) {
        console.log(err);
        return null;
    }
};
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
ORM.ucFirst = function (name) {
    'use strict';

    name = (name || '') + '';
    return name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();
};
/**
 * 字符串或文件hash,比md5效率高,但是有很低的概率重复
 * @param input
 * @returns {string}
 */
ORM.hash = function (input) {
    'use strict';

    var _hash = 5381;
    var I64BIT_TABLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
    var i = input.length - 1;

    if (typeof input === 'string') {
        for (; i > -1; i--) {
            _hash += (_hash << 5) + input.charCodeAt(i);
        }
    } else {
        for (; i > -1; i--) {
            _hash += (_hash << 5) + input[i];
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
 * 控制台打印
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
ORM.log = function (msg, type, showTime) {
    'use strict';

    var d = new Date();
    var date = d.Format('yyyy-mm-dd');
    var time = d.Format('hh:mi:ss');
    var dateTime = '[' + date + ' ' + time + '] ';

    var message = msg;
    if (util.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        //console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        //console.error(msg);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        //console.warn(msg);
    } else {
        if (!Object.prototype.toString.call(msg) === '[object String]') {
            message = (0, _stringify2.default)(msg);
        }
        if (Object.prototype.toString.call(showTime) === '[object Number]') {
            var _time = Date.now() - showTime;
            message += '  ' + (_time + 'ms');
        }
        type = type || 'INFO';
    }
    console.log(dateTime + '[' + type + '] ' + message);
    return;
};
/**
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
ORM.extend = function () {
    'use strict';

    var args = [].slice.call(arguments);
    var deep = true;
    var target = void 0;
    if (ORM.isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = ORM.isArray(args[0]) ? [] : {};
    } else {
        target = args.shift();
    }
    target = target || {};
    var i = 0,
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
                if (ORM.isObject(copy)) {
                    target[name] = ORM.extend(src && ORM.isObject(src) ? src : {}, copy);
                } else if (ORM.isArray(copy)) {
                    target[name] = ORM.extend([], copy);
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