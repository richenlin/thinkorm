/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-23 01:37:22
 */
import * as helper from "think_lib";
import { ClassValidator } from 'think_validtion';
import { classMap } from './Relation';

/**
 * 数据类型检查
 * @param name
 * @param value
 * @param type
 * @returns {*}
 */
const typeCheck = function (name: string, value: any, type: string) {
    //数据类型存在则检查
    if (type) {
        //字段类型严格验证
        switch (type) {
            case 'integer':
            case 'float':
            case 'bigInteger':
                if (!helper.isNumber(value)) {
                    return { status: 0, msg: `TypeError: invalid arguments '${name}'` };
                }
                break;
            case 'json':
                if (!helper.isJSONObj(value)) {
                    return { status: 0, msg: `TypeError: invalid arguments '${name}'` };
                }
                break;
            case 'array':
                if (!helper.isArray(value)) {
                    return { status: 0, msg: `TypeError: invalid arguments '${name}'` };
                }
                break;
            case 'string':
            case 'text':
                if (!helper.isString(value)) {
                    return { status: 0, msg: `TypeError: invalid arguments '${name}'` };
                }
                break;
            default:
                if (!helper.isString(value)) {
                    return { status: 0, msg: `TypeError: invalid arguments '${name}'` };
                }
                break;
        }
    }

    return { status: 1, msg: '' };
};

/**
 * 字段默认值设置
 *
 * @param {*} data
 * @param {string} propertyKey
 * @param {*} defaultValue
 * @param {string} when
 * @param {string} method
 * @returns
 */
const setDefault = function (value: any, propertyKey: string, defaultValue: any, when: string, method: string) {
    if (helper.isTrueEmpty(value) && defaultValue !== undefined && defaultValue !== null) {
        // 特殊类型自动赋值字段,绑定的是函数
        if (helper.isFunction(defaultValue)) {
            if (when === "All") {
                value = defaultValue();
            } else if (method === when) {
                value = defaultValue();
            }
        } else {
            value = defaultValue;
        }
    }
    return value;
};

/**
 * 数据验证及处理
 *
 * @param {*} ins
 * @param {*} fields
 * @param {*} data
 * @param {string} method
 * @returns
 */
export const Validator = async function (ins: any, data: any, method = "_beforeAdd") {
    if (helper.isArray(data)) {
        const result = [];
        // tslint:disable-next-line: prefer-for-of
        for (const i of data) {
            // tslint:disable-next-line: no-invalid-this
            result.push(validData(ins, i, method));
        }
        return Promise.all(result);
    } else {
        // tslint:disable-next-line: no-invalid-this
        return validData(ins, data, method);
    }
};

/**
 *
 *
 * @param {*} ins
 * @param {*} data
 * @param {string} [method="_beforeAdd"]
 * @returns
 */
const validData = async function (ins: any, data: any, method = "_beforeAdd") {
    const rdata: any = {};
    const fields = ins.fields || {};
    // tslint:disable-next-line: forin
    for (const propertyKey in fields) {
        if (fields[propertyKey].pk) {
            if (data[propertyKey] !== undefined && data[propertyKey] !== null) {
                rdata[propertyKey] = data[propertyKey];
            }
            continue;
        }
        // 如果可为空值并且值不存在
        if (fields[propertyKey].isnull === true && helper.isEmpty(data[propertyKey]) && !fields[propertyKey].when) {
            // tslint:disable-next-line: no-null-keyword
            // rdata[propertyKey] = null;
            continue;
        }
        //默认值
        if ((method === "_beforeAdd" || method === "_beforeUpdate") && fields[propertyKey].when) {
            const values = setDefault(data[propertyKey], propertyKey, fields[propertyKey].defaults, fields[propertyKey].when, method);
            if (values !== undefined) {
                rdata[propertyKey] = values;
            }
        } else if (data.hasOwnProperty(propertyKey)) {
            rdata[propertyKey] = data[propertyKey];
        }

        //数据类型检查
        if (data.hasOwnProperty(propertyKey) && fields[propertyKey].type) {
            const result: any = typeCheck(propertyKey, data[propertyKey], fields[propertyKey].type);
            if (!result.status) {
                return Promise.reject(result.msg);
            }
        }
    }

    //规则验证
    const clazz = classMap.get(ins.modelName);
    if (clazz) {
        let sdata = Object.assign(Object.create(ins), rdata);
        await ClassValidator.valid(clazz, sdata);
        sdata = null;
    }
    return rdata;
};
