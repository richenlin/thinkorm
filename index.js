/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
'use strict';
var util = require('util');
//rewite promise, bluebird is more faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;
//define THINK object
global.ORM = {};
function _interopSafeRequire (obj) {return (obj && obj.__esModule && obj.default) ? obj.default : obj;}
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
ORM.getDefer = function () {
    'use strict';
    let deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};
ORM.promisify = function (fn, receiver) {
    'use strict';
    return function (...args) {
        return new Promise(function (resolve, reject) {
            fn.apply(receiver, [...args, function (err, res) {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
};
var _awaitInstance = new (_interopSafeRequire(require('./lib/await.js')))();
ORM.await = function (key, callback) {
    return _awaitInstance.run(key, callback);
};
ORM.hash = function (input) {
    'use strict';
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
ORM.log = function (msg, type, showTime) {
    'use strict';
    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');
    let dateTime = `[${date} ${time}] `;

    let message = msg;
    if (util.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        console.error(msg);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        console.warn(msg);
    } else {
        if (!Object.prototype.toString.call(msg) === '[object String]') {
            message = JSON.stringify(msg);
        }
        if (Object.prototype.toString.call(showTime) === '[object Number]') {
            let _time = Date.now() - showTime;
            message += '  ' + `${_time}ms`;
        }
        type = type || 'INFO';
    }
    console.log(`${dateTime}[${type}] ${message}`);
    return;
};
