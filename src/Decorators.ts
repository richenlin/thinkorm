/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-02-17 10:22:13
 */
// tslint:disable-next-line: no-import-side-effect
import "reflect-metadata";
import { Validator } from './Validator';
import { setExpose } from 'think_validtion';
const liteq = require('liteq');
const helper = liteq.helper;
export {
    ClassValidator, FunctionValidator, IsDefined, IsCnName, IsIdNumber, IsZipCode, IsMobile, IsPlateNumber, IsEmail, IsIP, IsPhoneNumber, IsUrl, IsHash, IsNotEmpty, Equals, NotEquals, Contains, IsIn, IsNotIn, IsDate,
    Min, Max, Length
} from "think_validtion";

/**
 * Dynamically add methods for target class types
 *
 * @param {Function} clazz
 * @param {string} protoName
 */
function defineNewProperty(clazz: Function, protoName: string) {
    const oldMethod = Reflect.get(clazz.prototype, protoName);
    Reflect.defineProperty(clazz.prototype, protoName, {
        writable: true,
        value: async function fn(data: any, options?: Object) {
            if (oldMethod) {
                // tslint:disable-next-line: no-invalid-this
                data = await Promise.resolve(Reflect.apply(oldMethod, this, [data, options]));
            }
            // tslint:disable-next-line: no-invalid-this
            clazz.prototype.config = this.config || {};
            if (helper.isEmpty(data)) {
                return {};
            } else if (helper.isArray(data)) {
                const result = [];
                // tslint:disable-next-line: prefer-for-of
                for (const i of data) {
                    // tslint:disable-next-line: no-invalid-this
                    result.push(Validator(clazz, this.fields, i, protoName));
                }
                data = await Promise.all(result);
            } else {
                // tslint:disable-next-line: no-invalid-this
                data = await Validator(clazz, this.fields, data, protoName);
            }
            return data;
        }
    });
}

/**
 * Check the colum name 
 *
 * @param {string} name
 * @returns
 */
function checkColumn(name: string) {
    const deArr = ['pk', 'config', 'options', 'instance', 'modelName', 'tableName', 'relations', 'relationShip'];
    if (deArr.includes(name)) {
        throw Error(`The column name '${name}' cannot be a reserved keyword.`);
    }
    return;
}

/**
 * Cover designType to knex type
 *
 * @param {string} designType
 * @param {number} size
 * @returns
 */
function switchType(designType: string, size: number) {
    let ctype = "";
    switch (designType) {
        case "Number":
            ctype = "integer";
            break;
        case "Array":
            ctype = "array";
            break;
        case "Object":
            ctype = "json";
            break;
        case "Boolean":
            ctype = "boolean";
            break;
        case "String":
            if (size > 255) {
                ctype = "text";
            } else {
                ctype = "string";
            }
            break;
        default:
            ctype = "string";
            break;
    }
    return ctype;
}

/**
 * This decorator is used to mark classes that will be an entity (table or document depend on database type).
 * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
 *
 * @export
 * @param {string} [identifier]
 * @returns {ClassDecorator}
 */
export function Entity(identifier?: string): ClassDecorator {
    return (target: any) => {
        identifier = identifier || target.name;
        if (!target.prototype.modelName) {
            Reflect.defineProperty(target.prototype, "modelName", {
                value: identifier,
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        //
        defineNewProperty(target, "_beforeAdd");
        defineNewProperty(target, "_beforeUpdate");
    };
}

/**
 * Column decorator is used to mark a specific class property as a table column.
 * Only properties decorated with this decorator will be persisted to the database when entity be saved.
 * Primary columns also creates a PRIMARY KEY for this column in a db.
 *
 * @export
 * @param {number} [size=11]
 * @param {boolean} [auto=true]
 * @returns {PropertyDecorator}
 */
export function PrimaryColumn(size = 11, auto = true): PropertyDecorator {
    return (target: any, propertyKey: string) => {
        //Check the colum name
        checkColumn(propertyKey);

        if (!target.fields) {
            Reflect.defineProperty(target, "fields", {
                value: {},
                writable: true,
                configurable: true,
                enumerable: true
            });
        }

        const designType = Reflect.getMetadata("design:type", target, propertyKey);
        const ctype = switchType(designType.name, size);

        Reflect.defineProperty(target.fields, propertyKey, {
            value: {
                type: ctype,
                size,
                pk: true,
                auto
            },
            writable: true,
            configurable: true,
            enumerable: true
        });
        Reflect.defineProperty(target, 'pk', {
            value: propertyKey,
            writable: true,
            configurable: true,
            enumerable: true
        });
        // Set property as included in the process of transformation.
        setExpose(target, propertyKey);
    };

}

/**
 * Column decorator is used to mark a specific class property as a table column.
 *
 * @export
 * @param {number} [size]
 * @param {*} [defaultValue]
 * @param {boolean} [index=false]
 * @param {boolean} [unique=false]
 * @returns {PropertyDecorator}
 */
export function Column(size?: number, defaultValue?: any, index = false, unique = false): PropertyDecorator {
    return (target: any, propertyKey: string) => {
        //Check the colum name
        checkColumn(propertyKey);

        if (!target.fields) {
            Reflect.defineProperty(target, "fields", {
                value: {},
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        const designType = Reflect.getMetadata("design:type", target, propertyKey);
        const ctype = switchType(designType.name, size);

        const values: any = {
            type: ctype
        };
        if (size > 0) {
            values.size = size;
        }
        if (defaultValue === null) {
            values.isnull = true;
        }
        if (defaultValue !== null && defaultValue !== undefined) {
            values.defaults = defaultValue;
        }
        if (index) {
            values.index = index;
        }
        if (unique) {
            values.unique = unique;
        }
        Reflect.defineProperty(target.fields, propertyKey, {
            value: values,
            writable: true,
            configurable: true,
            enumerable: true
        });
        // Set property as included in the process of transformation.
        setExpose(target, propertyKey);
    };

}

/** 
 * 
 */
export type timeWhen = "_beforeAdd" | "_beforeUpdate" | "All";

/**
 * This column will store a creation Unix timestamp of the inserted/updated object.
 *
 * @export
 * @param {timeWhen} [timeWhen="All"] When to execute timestamp
 * @returns {PropertyDecorator}
 */
export function TimestampColumn(timeWhen: timeWhen = "All"): PropertyDecorator {
    return (target: any, propertyKey: string) => {
        //Check the colum name
        checkColumn(propertyKey);

        if (!target.fields) {
            Reflect.defineProperty(target, "fields", {
                value: {},
                writable: true,
                configurable: true,
                enumerable: true
            });
        }
        const designType = Reflect.getMetadata("design:type", target, propertyKey);
        if (designType && designType.name !== "Number") {
            throw Error("TimestampColumn's type must be `Number`");
        }
        Reflect.defineProperty(target.fields, propertyKey, {
            value: {
                type: "integer",
                size: 11,
                defaults: helper.datetime,
                isnull: true, //TimestampColumn allowed null
                when: timeWhen
            },
            writable: true,
            configurable: true,
            enumerable: true
        });
        // Set property as included in the process of transformation.
        setExpose(target, propertyKey);
    };

}

interface ModelClsInterface {
    config: Object;
    instance: Object;
    pk: string;
    tableName: string;
    modelName: string;
    transaction: ((t: any) => Promise<any>);
}

/**
 * Mark this method to start transaction execution. In Thinkkoa and Koatty, do not use it in the controller.
 * * modelCls.add(data);
 * * otherModel.setInstance(this.tsx).add(data);
 * 
 * @export
 * @returns {MethodDecorator}
 */
export function Transactional(modelCls: ModelClsInterface): MethodDecorator {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        const { value, configurable, enumerable } = descriptor;
        descriptor = {
            configurable,
            enumerable,
            writable: true,
            value: async function trans(...props: any[]) {
                if (helper.isEmpty(modelCls) || helper.isEmpty(modelCls.config) || helper.isEmpty(modelCls.instance)) {
                    return Promise.reject("Wrong model class instance. This decorator is only for ThinkORM.");
                }
                return modelCls.transaction((tsx: any) => {
                    // tslint:disable-next-line: no-invalid-this
                    this.tsx = tsx;
                    // tslint:disable-next-line: no-invalid-this
                    return value.apply(this, props);
                });
            }
        };
        return descriptor;
    };
}

