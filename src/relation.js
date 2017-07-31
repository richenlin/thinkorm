/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const lib = require('think_lib');
/**
 * 
 * 
 * @param {any} type 
 * @returns 
 */
const parseType = function (type) {
    type = type || 'HASONE';
    if (type == 1) {
        type = 'HASONE';
    } else if (type == 2) {
        type = 'HASMANY';
    } else if (type == 3) {
        type = 'MANYTOMANY';
    } else {
        type = (type + '').toUpperCase();
    }
    return type;
};

module.exports = class relation {
    /**
     * 
     * 
     * @static
     * @param {any} name 
     * @param {any} config 
     * @returns 
     */
    static setRelations(name, config) {
        if (!__thinkorm.collections[name]) {
            throw Error(`Collections ${name} is undefined.`);
        }
        __thinkorm.collections[name].relationShip = {};
        let cls = new (__thinkorm.collections[name])(config);
        let relations = cls.relation;
        if (!lib.isEmpty(relations)) {
            for (let n in relations) {
                if (!__thinkorm.collections[n]) {
                    throw Error(`Collection ${n} is undefined.`);
                }
                let type = parseType(relations[n].type);
                __thinkorm.collections[name].relationShip[n] = {
                    type: type, //关联方式
                    name: n, //关联模型名称
                    model: __thinkorm.collections[n], //关联模型
                    field: relations[n].field || [],
                    fkey: relations[n].fkey, //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                    rkey: relations[n].rkey, //hasone子表主键,hasmany子表外键,manytomany map表子外键

                    primaryPk: cls.pk, //主表主键
                    primaryName: cls.modelName, //主模型名称
                    primaryModel: __thinkorm.collections[name] //主模型
                };
                //MANYTOMANY map
                if (type === 'MANYTOMANY') {
                    let mapName = relations[n].map;
                    if (!mapName || !__thinkorm.collections[mapName]) {
                        throw Error(`Collection ${mapName} is undefined.`);
                        // return null;
                    }
                    __thinkorm.collections[name].relationShip[n].mapName = mapName;
                    __thinkorm.collections[name].relationShip[n].mapModel = __thinkorm.collections[mapName];
                }
            }
        }
        return __thinkorm.collections[name].relationShip;
    }

    /**
     * 
     * 
     * @static
     * @param {any} name 
     * @param {any} config 
     */
    static getRelations(name, config) {
        if (!__thinkorm.collections[name]) {
            throw Error(`Collections ${name} is undefined.`);
        }
        if (!__thinkorm.collections[name].relationShip) {
            __thinkorm.collections[name].relationShip = relation.setRelations(name, config);
        }
        return __thinkorm.collections[name].relationShip;
    }

    /**
     * 
     * 
     * @static
     * @param {any} adapter 
     * @param {any} config 
     * @param {any} options 
     * @param {any} data 
     * @returns 
     */
    static async getRelationData(adapter, config, options, data) {
        let caseList = {
            'HASONE': adapter.getHasOneRelation,
            'HASMANY': adapter.getHasManyRelation,
            'MANYTOMANY': adapter.getManyToManyRelation
        };
        let relationData = data;
        if (!lib.isEmpty(data)) {
            let rels = options.rels, rtype, ps = [];
            for (let n in rels) {
                rtype = rels[n].type;
                if (rtype && rtype in caseList) {
                    if (lib.isArray(data)) {
                        for (let [k, v] of data.entries()) {
                            ps.push(caseList[rtype](config, options, rels[n], data[k]).then(res => {
                                data[k][rels[n].name] = res;
                            }));
                            //data[k][rels[n]['name']] = await caseList[rtype](config, rels[n], data[k]);
                        }
                        await Promise.all(ps);
                    } else {
                        data[rels[n].name] = await caseList[rtype](config, options, rels[n], data);
                    }
                }
            }
        }
        return relationData;
    }

    /**
     * 
     * 
     * @static
     * @param {any} adapter 
     * @param {any} config 
     * @param {any} options 
     * @param {any} result 
     * @param {any} data 
     * @param {any} postType 
     * @returns 
     */
    static async postRelationData(adapter, config, options, result, data, postType) {
        let caseList = {
            'HASONE': adapter.postHasOneRelation,
            'HASMANY': adapter.postHasManyRelation,
            'MANYTOMANY': adapter.postManyToManyRelation
        };
        let ps = [];
        if (!lib.isEmpty(result)) {
            let rels = options.rels, rtype, relationData = null;
            for (let n in rels) {
                rtype = rels[n] && rels[n].type ? rels[n].type : null;
                relationData = rels[n] && data[n] ? data[n] : null;
                if (rtype && relationData && rtype in caseList) {
                    ps.push(caseList[rtype](config, options, rels[n], result, relationData, postType));
                }
            }
        }
        return Promise.all(ps);
    }
};