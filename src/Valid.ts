/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-01-06 21:05:11
 */

import * as helper from "think_lib";
import { validateOrReject, ValidationOptions, registerDecorator, ValidationArguments } from "class-validator";

/**
 * 数据类型检查
 * @param name
 * @param value
 * @param type
 * @returns {*}
 */
const dataCheck = function (name: string, value: any, type: string) {
    //数据类型存在则检查
    if (type) {
        //字段类型严格验证
        switch (type) {
            case 'integer':
            case 'float':
                if (!helper.isNumber(value)) {
                    return { status: 0, msg: `The parameter '${name}' is invalid!` };
                }
                break;
            case 'json':
                if (!helper.isJSONObj(value)) {
                    return { status: 0, msg: `The parameter '${name}' is invalid!` };
                }
                break;
            case 'array':
                if (!helper.isArray(value)) {
                    return { status: 0, msg: `The parameter '${name}' is invalid!` };
                }
                break;
            case 'string':
            case 'text':
                if (!helper.isString(value)) {
                    return { status: 0, msg: `The parameter '${name}' is invalid!` };
                }
                break;
            default:
                if (!helper.isString(value)) {
                    return { status: 0, msg: `The parameter '${name}' is invalid!` };
                }
                break;
        }
    }

    return { status: 1, msg: '' };
};


/**
 * 数据验证及处理
 *
 * @param {Function} clazz
 * @param {*} fields
 * @param {*} data
 * @param {string} method
 * @returns
 */
// tslint:disable-next-line: cyclomatic-complexity
export const Valid = async function (clazz: Function, fields: any, data: any, method = "All") {
    // tslint:disable-next-line: no-invalid-this
    // tslint:disable-next-line: forin
    for (const propertyKey in fields) {
        if (fields[propertyKey].pk) {
            continue;
        }
        // 如果可为空值并且值不存在，直接设置为Null
        if (fields[propertyKey].isnull === true && helper.isEmpty(data[propertyKey])) {
            // tslint:disable-next-line: no-null-keyword
            data[propertyKey] = null;
            continue;
        }
        //默认值
        if (helper.isEmpty(data[propertyKey])) {
            if ((fields[propertyKey].defaults !== undefined && fields[propertyKey].defaults !== null)) {
                if (fields[propertyKey].defaults && helper.isFunction(fields[propertyKey].defaults)) {
                    fields[propertyKey].when = fields[propertyKey].when || "All";
                    if (fields[propertyKey].when === "All") {
                        data[propertyKey] = fields[propertyKey].defaults();
                    } else if (method === fields[propertyKey].when) {
                        data[propertyKey] = fields[propertyKey].defaults();
                    }
                } else {
                    data[propertyKey] = fields[propertyKey].defaults;
                }
            }
        }
        //数据类型检查
        if (fields[propertyKey].type) {
            const result: any = dataCheck(propertyKey, data[propertyKey], fields[propertyKey].type);
            if (!result.status) {
                return Promise.reject(result.msg);
            }
        }
    }

    //规则验证
    await validateOrReject(clazz.prototype, data, { skipMissingProperties: true }).catch((errors: any) => {
        return Promise.reject(Object.values(errors[0].constraints)[0]);
    });
    return Promise.resolve(data);
};


/**
 * Checks if value is a chinese name.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function iscnname(value: string): boolean {
    const reg = /^([a-zA-Z0-9\u4e00-\u9fa5\·]{1,10})$/;
    return reg.test(value);
}

/**
 * Checks if value is a idcard number.
 *
 * @param {string} value
 * @returns
 */
export function isidnumber(value: string): boolean {
    if (/^\d{15}$/.test(value)) {
        return true;
    }
    if ((/^\d{17}[0-9X]$/).test(value)) {
        const vs = '1,0,x,9,8,7,6,5,4,3,2'.split(',');
        const ps: any[] = '7,9,10,5,8,4,2,1,6,3,7,9,10,5,8,4,2'.split(',');
        const ss: any[] = value.toLowerCase().split('');
        let r = 0;
        for (let i = 0; i < 17; i++) {
            r += ps[i] * ss[i];
        }
        const isOk = (vs[r % 11] === ss[17]);
        return isOk;
    }
    return false;
}

/**
 * Checks if value is a mobile phone number.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function ismobile(value: string): boolean {
    const reg = /^(13|14|15|16|17|18|19)\d{9}$/;
    return reg.test(value);
}

/**
 * Checks if value is a zipcode.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function iszipcode(value: string): boolean {
    const reg = /^\d{6}$/;
    return reg.test(value);
}

/**
 * Checks if value is a platenumber.
 *
 * @param {string} value
 * @returns {boolean}
 */
export function isplatenumber(value: string): boolean {
    // let reg = new RegExp('^(([\u4e00-\u9fa5][a-zA-Z]|[\u4e00-\u9fa5]{2}\d{2}|[\u4e00-\u9fa5]{2}[a-zA-Z])[-]?|([wW][Jj][\u4e00-\u9fa5]{1}[-]?)|([a-zA-Z]{2}))([A-Za-z0-9]{5}|[DdFf][A-HJ-NP-Za-hj-np-z0-9][0-9]{4}|[0-9]{5}[DdFf])$');
    // let xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    const xreg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-Z]{1}(([0-9]{5}[DF]$)|([DF][A-HJ-NP-Z0-9][0-9]{4}$))/;
    // let creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领A-Z]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    const creg = /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领]{1}[A-Z]{1}[A-HJ-NP-Z0-9]{4}[A-HJ-NP-Z0-9挂学警港澳]{1}$/;
    if (value.length === 7) {
        return creg.test(value);
    } else {
        //新能源车牌
        return xreg.test(value);
    }
}


/**
 * Checks if value is a chinese name.
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns
 */
export function IsCnName(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsCnName",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return iscnname(value);
                },
                defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
                    return "The ($value) must be a chinese name!";
                }
            }
        });
    };
}

/**
 * Checks if value is a idcard number(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns
 */
export function IsIdNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsIdNumber",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return isidnumber(value);
                },
                defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
                    return "The ($value) must be a idcard number!";
                }
            }
        });
    };
}

/**
 * Checks if value is a zipcode(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns
 */
export function IsZipCode(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsZipCode",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return iszipcode(value);
                },
                defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
                    return "The ($value) must be a zip code!";
                }
            }
        });
    };
}

/**
 * Checks if value is a mobile phone number(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns
 */
export function IsMobile(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsMobile",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return ismobile(value);
                },
                defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
                    return "The ($value) must be a mobile number!";
                }
            }
        });
    };
}

/**
 * Checks if value is a plate number(chinese).
 *
 * @export
 * @param {string} property
 * @param {ValidationOptions} [validationOptions]
 * @returns
 */
export function IsPlateNumber(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsPlateNumber",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return isplatenumber(value);
                },
                defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
                    return "The ($value) must be a plate number!";
                }
            }
        });
    };

}

/**
 * Checks value is not empty, undefined, null, '', NaN, [], {} and any empty string(including spaces, tabs, formfeeds, etc.), returns false.
 *
 * @export
 * @param {ValidationOptions} [validationOptions]
 * @returns
 */
export function IsNotEmpty(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: "IsNotEmpty",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments) {
                    return !helper.isEmpty(value);
                },
                defaultMessage(args: ValidationArguments) { // here you can provide default error message if validation failed
                    return "The ($property)'s value must be not empty!";
                }
            }
        });
    };
}

export {
    IsDefined, Equals, NotEquals, Contains, IsIn, IsNotIn, IsDate,
    Min, Max, Length, IsEmail, IsIP, IsPhoneNumber, IsUrl, IsHash
} from "class-validator";