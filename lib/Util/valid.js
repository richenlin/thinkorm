'use strict';

exports.__esModule = true;

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _lib = require('./lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2015 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    15/11/19
 */
/**
 * Valid
 * @return {[type]} [description]
 */
var rules = {
    /**
     * 长度区域
     * @param  {[type]} min [description]
     * @param  {[type]} max [description]
     * @return {[type]}     [description]
     */
    length: function length(value, min, max) {
        'use strict';

        min = min | 0;
        var length = ((value || '') + '').length;
        if (length < min) {
            return false;
        }
        if (max && length > max) {
            return false;
        }
        return true;
    },
    /**
     * 必填
     * @return {[type]} [description]
     */
    required: function required(value) {
        'use strict';

        return ((value || '') + '').length > 0;
    },
    /**
     * 自定义正则校验
     * @param  {[type]} reg [description]
     * @return {[type]}     [description]
     */
    regexp: function regexp(value, reg) {
        'use strict';

        return reg.test(value);
    },
    /**
     * 邮箱
     * @return {[type]} [description]
     */
    email: function email(value) {
        'use strict';

        var reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
        return this.regexp(value, reg);
    },
    /**
     * 时间戳
     * @return {[type]} [description]
     */
    time: function time(value) {
        'use strict';

        var reg = /^[1-5]\d{12}$/;
        return this.regexp(value, reg);
    },
    /**
     * 中文名
     * @return {[type]} [description]
     */
    cnname: function cnname(value) {
        'use strict';

        var reg = /^[\u4e00-\u9fa5\u3002\u2022]{2,32}$/;
        return this.regexp(value, reg);
    },
    /**
     * 身份证号码
     * @return {[type]} [description]
     */
    idnumber: function idnumber(value) {
        'use strict';

        if (/^\d{15}$/.test(value)) {
            return true;
        }
        if (/^\d{17}[0-9xX]$/.test(value)) {
            var vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','),
                ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','),
                ss = value.toLowerCase().split(''),
                r = 0;
            for (var i = 0; i < 17; i++) {
                r += ps[i] * ss[i];
            }
            var isOk = vs[r % 11] === ss[17];
            return isOk;
        }
        return false;
    },
    /**
     * 手机号
     * @return {[type]} [description]
     */
    mobile: function mobile(value) {
        'use strict';

        var reg = /^(13|15|18|14|17)\d{9}$/;
        return this.regexp(value, reg);
    },
    /**
     * 邮编
     * @return {[type]} [description]
     */
    zipcode: function zipcode(value) {
        'use strict';

        var reg = /^\d{6}$/;
        return this.regexp(value, reg);
    },
    /**
     * 2次值是否一致
     * @param  {[type]} field [description]
     * @return {[type]}       [description]
     */
    confirm: function confirm(value, cvalue) {
        'use strict';

        return value === cvalue;
    },
    /**
     * url
     * @return {[type]} [description]
     */
    url: function url(value) {
        'use strict';

        var reg = /^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/;
        return this.regexp(value, reg);
    },
    /**
     * 整数
     * @param  {[type]} o [description]
     * @return {[type]}   [description]
     */
    int: function int(value) {
        'use strict';

        var val = parseInt(value, 10);
        if (isNaN(val)) {
            return false;
        }
        return (val + '').length === value.length;
    },
    /**
     * 浮点数
     * @return {[type]} [description]
     */
    float: function float(value) {
        'use strict';

        var numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
        return numberReg.test(value);
    },
    /**
     * 整数范围
     * @param  {[type]} min [description]
     * @param  {[type]} max [description]
     * @return {[type]}     [description]
     */
    range: function range(value, min, max) {
        'use strict';

        value = parseInt(value, 10);
        min = min | 0;
        if (isNaN(value) || value < min) {
            return false;
        }
        if (max && value > max) {
            return false;
        }
        return true;
    },
    /**
     * ip4校验
     * @return {[type]} [description]
     */
    ip4: function ip4(value) {
        'use strict';

        return _net2.default.isIPv4(value);
    },
    /**
     * ip6校验
     * @return {[type]} [description]
     */
    ip6: function ip6(value) {
        'use strict';

        return _net2.default.isIPv6(value);
    },
    /**
     * ip校验
     * @return {[type]} [description]
     */
    ip: function ip(value) {
        'use strict';

        return _net2.default.isIP(value);
    },
    /**
     * 日期校验
     * @return {[type]} [description]
     */
    date: function date(value) {
        'use strict';

        var reg = /^\d{4}-\d{1,2}-\d{1,2}$/;
        return this.regexp(value, reg);
    },
    /**
     * 在一个范围内
     * @param  {[type]} value [description]
     * @param  {[type]} arr   [description]
     * @return {[type]}       [description]
     */
    in: function _in(value, arr) {
        'use strict';

        return arr.indexOf(value) > -1;
    }
};

/**
 * 数据类型检查
 * @param name
 * @param value
 * @param type
 * @returns {*}
 */
var dataCheck = function dataCheck(name, value, type) {
    'use strict';
    //数据类型存在则检查

    if (type) {
        //字段类型严格验证
        switch (type) {
            case 'integer':
            case 'float':
                if (!_lib2.default.isNumber(value)) {
                    return { status: 0, msg: name + '值类型错误!' };
                }
                break;
            case 'json':
                if (!_lib2.default.isJSONObj(value)) {
                    return { status: 0, msg: name + '值类型错误!' };
                }
                break;
            case 'array':
                if (!_lib2.default.isArray(value)) {
                    return { status: 0, msg: name + '值类型错误!' };
                }
                break;
            case 'string':
            case 'text':
                if (!_lib2.default.isString(value)) {
                    return { status: 0, msg: name + '值类型错误!' };
                }
                break;
            default:
                if (!_lib2.default.isString(value)) {
                    return { status: 0, msg: name + '值类型错误!' };
                }
                break;
        }
    }

    return { status: 1, msg: '' };
};

/**
 * 自定义规则检查
 * extra格式
 * {
 *     method: 'ADD', // ADD, UPDATE, ALL
 *     valid: ['required', 'range'],
 *     range_args: [],
 *     msg:{
 *         required: '必填',
 *         range: '必须在xx--xx整数范围'
 *     }
 * }
 * @param name
 * @param value
 * @param extra
 * @param method
 * @returns {{status: number, msg: string}}
 */
var ruleCheck = function ruleCheck(name, value, extra, method) {
    'use strict';

    var result = { status: 1, msg: '' };
    if (!name) {
        return result;
    }
    //自定义规则存在则检查
    if (extra && extra.valid) {
        var met = void 0;
        if (extra.method) {
            met = extra.method.toUpperCase();
            if (met === 'ALL' || met === method) {
                met = true;
            } else {
                met = false;
            }
        }
        if (met) {
            var valid = extra.valid;
            if (!Array.isArray(valid)) {
                valid = [valid];
            }
            valid.some(function (validItem) {
                //自定义检测方法
                if (typeof validItem === 'function') {
                    result = validItem(value);
                } else if (typeof rules[validItem] === 'function') {
                    var args = extra[validItem + '_args'] || [];
                    if (!Array.isArray(args)) {
                        args = [args];
                    }
                    args = [value].concat(args);
                    if (rules[validItem].apply(rules, args) === false) {
                        result = { status: 0, msg: extra.msg[validItem] || name + '值未通过检测!' };
                    }
                }
            });
        }
    }
    return result;
};

exports.default = {
    dataCheck: dataCheck,
    ruleCheck: ruleCheck
};