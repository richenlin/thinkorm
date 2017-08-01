/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const net = require('net');
const lib = require('think_lib');
const rules = {
    /**
     * 长度区域
     * @param  {[type]} min [description]
     * @param  {[type]} max [description]
     * @return {[type]}     [description]
     */
    length: function (value, min, max) {
        'use strict';
        min = min | 0;
        let length = ((value || '') + '').length;
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
    required: function (value) {
        'use strict';
        return ((value || '') + '').length > 0;
    },
    /**
     * 自定义正则校验
     * @param  {[type]} reg [description]
     * @return {[type]}     [description]
     */
    regexp: function (value, reg) {
        'use strict';
        return reg.test(value);
    },
    /**
     * 邮箱
     * @return {[type]} [description]
     */
    email: function (value) {
        'use strict';
        let reg = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
        return this.regexp(value, reg);
    },
    /**
     * 时间戳
     * @return {[type]} [description]
     */
    time: function (value) {
        'use strict';
        let reg = /^[1-5]\d{12}$/;
        return this.regexp(value, reg);
    },
    /**
     * 中文名
     * @return {[type]} [description]
     */
    cnname: function (value) {
        'use strict';
        let reg = /^[\u4e00-\u9fa5\u3002\u2022]{2,32}$/;
        return this.regexp(value, reg);
    },
    /**
     * 身份证号码
     * @return {[type]} [description]
     */
    idnumber: function (value) {
        'use strict';
        if (/^\d{15}$/.test(value)) {
            return true;
        }
        if ((/^\d{17}[0-9xX]$/).test(value)) {
            let vs = '1,0,x,9,8,7,6,5,4,3,2'.split(','),
                ps = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(','),
                ss = value.toLowerCase().split(''),
                r = 0;
            for (let i = 0; i < 17; i++) {
                r += ps[i] * ss[i];
            }
            let isOk = (vs[r % 11] === ss[17]);
            return isOk;
        }
        return false;
    },
    /**
     * 手机号
     * @return {[type]} [description]
     */
    mobile: function (value) {
        'use strict';
        let reg = /^(13|15|18|14|17)\d{9}$/;
        return this.regexp(value, reg);
    },
    /**
     * 邮编
     * @return {[type]} [description]
     */
    zipcode: function (value) {
        'use strict';
        let reg = /^\d{6}$/;
        return this.regexp(value, reg);
    },
    /**
     * 2次值是否一致
     * @param  {[type]} field [description]
     * @return {[type]}       [description]
     */
    confirm: function (value, cvalue) {
        'use strict';
        return value === cvalue;
    },
    /**
     * url
     * @return {[type]} [description]
     */
    url: function (value) {
        'use strict';
        let reg = /^http(s?):\/\/(?:[A-za-z0-9-]+\.)+[A-za-z]{2,4}(?:[\/\?#][\/=\?%\-&~`@[\]\':+!\.#\w]*)?$/;
        return this.regexp(value, reg);
    },
    /**
     * 整数
     * @param  {[type]} o [description]
     * @return {[type]}   [description]
     */
    int: function (value) {
        'use strict';
        let val = parseInt(value, 10);
        if (isNaN(val)) {
            return false;
        }
        return (val + '').length === value.length;
    },
    /**
     * 浮点数
     * @return {[type]} [description]
     */
    float: function (value) {
        'use strict';
        let numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
        return numberReg.test(value);
    },
    /**
     * 整数范围
     * @param  {[type]} min [description]
     * @param  {[type]} max [description]
     * @return {[type]}     [description]
     */
    range: function (value, min, max) {
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
    ip4: function (value) {
        'use strict';
        return net.isIPv4(value);
    },
    /**
     * ip6校验
     * @return {[type]} [description]
     */
    ip6: function (value) {
        'use strict';
        return net.isIPv6(value);
    },
    /**
     * ip校验
     * @return {[type]} [description]
     */
    ip: function (value) {
        'use strict';
        return net.isIP(value);
    },
    /**
     * 日期校验
     * @return {[type]} [description]
     */
    date: function (value) {
        'use strict';
        let reg = /^\d{4}-\d{1,2}-\d{1,2}$/;
        return this.regexp(value, reg);
    },
    /**
     * 在一个范围内
     * @param  {[type]} value [description]
     * @param  {[type]} arr   [description]
     * @return {[type]}       [description]
     */
    in: function (value, arr) {
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
const dataCheck = function (name, value, type) {
    'use strict';
    //数据类型存在则检查
    if (type) {
        //字段类型严格验证
        switch (type) {
            case 'integer':
            case 'float':
                if (!lib.isNumber(value)) {
                    return { status: 0, msg: `${name}值类型错误!` };
                }
                break;
            case 'json':
                if (!lib.isJSONObj(value)) {
                    return { status: 0, msg: `${name}值类型错误!` };
                }
                break;
            case 'array':
                if (!lib.isArray(value)) {
                    return { status: 0, msg: `${name}值类型错误!` };
                }
                break;
            case 'string':
            case 'text':
                if (!lib.isString(value)) {
                    return { status: 0, msg: `${name}值类型错误!` };
                }
                break;
            default:
                if (!lib.isString(value)) {
                    return { status: 0, msg: `${name}值类型错误!` };
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
const ruleCheck = function (name, value, extra, method) {
    'use strict';
    let result = { status: 1, msg: '' };
    if (!name) {
        return result;
    }
    //自定义规则存在则检查
    if (extra && extra.valid) {
        let met;
        if (extra.method) {
            met = (extra.method).toUpperCase();
            if (met === 'ALL' || met === method) {
                met = true;
            } else {
                met = false;
            }
        }
        if (met) {
            let valid = extra.valid;
            if (!Array.isArray(valid)) {
                valid = [valid];
            }
            valid.some(function (validItem) {
                //自定义检测方法
                if (typeof validItem === 'function') {
                    result = validItem(value);
                } else if (typeof (rules[validItem]) === 'function') {
                    let args = extra[validItem + '_args'] || [];
                    if (!Array.isArray(args)) {
                        args = [args];
                    }
                    args = [value].concat(args);
                    if (rules[validItem].apply(rules, args) === false) {
                        result = { status: 0, msg: extra.msg[validItem] || `${name}值未通过检测!` };
                    }
                }
            });
        }
    }
    return result;
};

/**
 * 数据验证及处理
 * 
 * @param {any} adapter 
 * @param {any} fields 
 * @param {any} data 
 * @param {any} vaildRules 
 * @param {any} options 
 * @param {string} [method=''] 
 * @returns 
 */
const validData = function (adapter, fields, data, vaildRules, options, method = '') {
    let dataCheckFlag = false, ruleCheckFlag = false, result = { status: 1, msg: '' }, rdata = {};
    for (let field in fields) {
        if (method === 'ADD') { //新增数据add
            if (lib.isEmpty(data[field]) && (fields[field].defaultsTo !== undefined && fields[field].defaultsTo !== null)) {
                data[field] = fields[field].defaultsTo;
            }
            //非主键字段就检查
            dataCheckFlag = !fields[field].primaryKey ? true : false;
            //定义了规则就检查
            ruleCheckFlag = vaildRules[field] ? true : false;
        } else if (method === 'UPDATE') { //编辑数据update
            if (data[field] !== undefined && lib.isEmpty(data[field]) && (fields[field].defaultsTo !== undefined && fields[field].defaultsTo !== null)) {
                data[field] = fields[field].defaultsTo;
            }
            //更新包含字段就检查,主键除外(因为主键不会被更新)
            dataCheckFlag = (data[field] !== undefined && !fields[field].primaryKey) ? true : false;
            //更新包含字段且定义了规则就检查
            ruleCheckFlag = (data[field] !== undefined && vaildRules[field]) ? true : false;
        }
        //自定义规则验证
        if (ruleCheckFlag) {
            result = ruleCheck(field, data[field], vaildRules[field], method);
            if (!result.status) {
                throw Error(result.msg);
                return null;
            }
        }
        //严格数据类型检查
        if (dataCheckFlag) {
            result = dataCheck(field, data[field], (fields[field].type || 'string'));
            if (!result.status) {
                throw Error(result.msg);
                return null;
            }
        }
        //处理数据源特殊字段
        if (adapter.validData && data[field]) {
            data[field] = adapter.validData(data[field], (fields[field].type || 'string'));
        }
        //新赋值剔除多余字段
        data[field] !== undefined && (rdata[field] = data[field]);
    }
    return rdata;
};

/**
 * 查询结果处理
 * 
 * @param {any} adapter 
 * @param {any} data 
 * @param {any} fields 
 * @param {any} options 
 * @returns 
 */
const parseData = function (adapter, data, fields, options) {
    if (adapter.parseData) {
        return adapter.parseData(data, fields);
    }
    return data;
};

module.exports = {
    validData: validData,
    parseData: parseData
};