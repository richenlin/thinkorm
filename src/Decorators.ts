/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-03-24 17:42:42
 */
// tslint:disable-next-line: no-import-side-effect
import "reflect-metadata";
import { setExpose } from 'think_validtion';
import { classMap } from './Relation';
const liteq = require('liteq');
const helper = liteq.helper;
export {
    ClassValidator, FunctionValidator, IsDefined, IsCnName, IsIdNumber, IsZipCode, IsMobile, IsPlateNumber, IsEmail, IsIP, IsPhoneNumber, IsUrl, IsHash, IsNotEmpty, Equals, NotEquals, Contains, IsIn, IsNotIn, IsDate,
    Min, Max, Length
} from "think_validtion";

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
            if (size > 11) {
                ctype = 'bigInteger';
            }
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
        classMap.set(identifier, target);
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
 * @param {string} [comment]
 * @returns {PropertyDecorator}
 */
export function PrimaryColumn(size = 11, auto = true, comment?: string): PropertyDecorator {
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
                auto,
                comment
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
 * @param {string} [comment]
 * @returns {PropertyDecorator}
 */
export function Column(size?: number, defaultValue?: any, index = false, unique = false, comment?: string): PropertyDecorator {
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
            type: ctype,
            comment
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
 * @param {string} [comment]
 * @returns {PropertyDecorator}
 */
export function TimestampColumn(timeWhen: timeWhen = "All", comment?: string): PropertyDecorator {
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
            throw Error("TimestampColumn's type must be `number`");
        }
        Reflect.defineProperty(target.fields, propertyKey, {
            value: {
                type: "integer",
                size: 11,
                defaults: helper.datetime,
                isnull: true, //TimestampColumn allowed null
                comment,
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


// 4.5.0
// 1、用赋值替代现在的默认值机制。数据验证更高效
// 2、弄清楚关联查询同join查询的区别，然后重新实现关联查询功能
// export type relationType = "HASONE" | "HASMANY" | "MANYTOMANY" | "BLONGTO";
// export function HasOne(modelName: string, relationKey: string, field: any[] = []): PropertyDecorator {
//     return (target: any, propertyKey: string) => {
//         if (!target.relationShip) {
//             Reflect.defineProperty(target, "relationShip", {
//                 value: {},
//                 writable: true,
//                 configurable: true,
//                 enumerable: true
//             });
//         }
//         const clazz = classMap.get(modelName);
//         if (!clazz) {
//             throw Error(`The Entity ${modelName} is not found.`);
//         }
//         const values: any = {
//             "from": modelName,
//             "on": { [propertyKey]: relationKey },
//             "field": field,
//             "type": "left"
//         };
//         if (!target.relationShip.HASONE) {
//             Reflect.defineProperty(target.relationShip, "HASONE", {
//                 value: [values],
//                 writable: true,
//                 configurable: true,
//                 enumerable: true
//             });
//         } else {
//             target.relationShip.HASONE.push(values);
//         }
//     };
// }
// export function HasMany(modelName: string, relationKey: string): PropertyDecorator {
//     return (target: any, propertyKey: string) => {
//         if (!target.relationShip) {
//             Reflect.defineProperty(target, "relationShip", {
//                 value: {},
//                 writable: true,
//                 configurable: true,
//                 enumerable: true
//             });
//         }
//         const clazz = classMap.get(modelName);
//         if (!clazz) {
//             throw Error(`The Entity ${modelName} is not found.`);
//         }
//         const values: any = {
//             "from": modelName,
//             "on": { [propertyKey]: relationKey },
//             "type": "left"
//         };
//         if (!target.relationShip.HASMANY) {
//             Reflect.defineProperty(target.relationShip, "HASMANY", {
//                 value: [values],
//                 writable: true,
//                 configurable: true,
//                 enumerable: true
//             });
//         } else {
//             target.relationShip.HASMANY.push(values);
//         }
//     };
// }
// export function ManyToMany(modelName: string, relationKey: string, mapModelName: string): PropertyDecorator {
//     return (target: any, propertyKey: string) => { };
// }
// export function BlongTo(modelName: string, relationKey: string): PropertyDecorator {
//     return (target: any, propertyKey: string) => { };
// }

/**
 * Relations mapping
 *
 * @export
 * @param {Function} clazz
 * @param {relationType} type
 * @param {string} foreignKey
 * @param {string} relationKey
 * @returns {PropertyDecorator}
 */
// export function Relations(clazz: Function, type: relationType, foreignKey: string, relationKey: string, map?: Function, field?: string[]): PropertyDecorator {
//     return (target: any, propertyKey: string) => {

//         if (!target.relations) {
//             Reflect.defineProperty(target, "relations", {
//                 value: {},
//                 writable: true,
//                 configurable: true,
//                 enumerable: true
//             });
//         }
//         const values: any = {
//             type,
//             model: clazz,
//             fkey: foreignKey,
//             rkey: relationKey
//         };
//         if (type === "MANYTOMANY") {
//             if (helper.isEmpty(map)) {
//                 throw Error(`Missing map table parameter`);
//             }
//             values.map = map;
//         }

//         if (field) {
//             values.field = field;
//         }
//         Reflect.defineProperty(target.relations, propertyKey, {
//             value: values,
//             writable: true,
//             configurable: true,
//             enumerable: true
//         });
//     };
// }

interface ModelClsInterface {
    config: Object;
    instance: Object;
    pk: string;
    tableName: string;
    modelName: string;
    transaction: ((t: any) => Promise<any>);
}

/**
 * Mark this method to start transaction execution. In Thinkkoa and Koatty.
 *
 * @export
 * @param {string} modelInstanceName Instantiated ORM model attribute members of the current class.
 * * exp:
 * * @Transactional("userModel")
 * * await this.userModel.add({name: "test"});
 * * await this.userModel.where({id: 1}).update({status: 1});
 * * const tsx = await this.userModel.getInstance();
 * * await this.roleModel.setInstance(tsx).where({id: 1}).update(name: "test");
 * @returns {MethodDecorator}
 */
export function Transactional(modelInstanceName: string): MethodDecorator {
    return (target: any, methodName: string, descriptor: PropertyDescriptor) => {
        const { value, configurable, enumerable } = descriptor;
        descriptor = {
            configurable,
            enumerable,
            writable: true,
            value: async function trans(...props: any[]) {
                // tslint:disable-next-line: no-invalid-this
                const modelCls: ModelClsInterface = this[modelInstanceName];
                if (helper.isEmpty(modelCls) || helper.isEmpty(modelCls.config)) {
                    return Promise.reject("Model instance is invalid.");
                }
                return modelCls.transaction((tsx: any) => {
                    props.push(tsx);
                    // tslint:disable-next-line: no-invalid-this
                    return value.apply(this, props);
                });
            }
        };
        return descriptor;
    };
}

