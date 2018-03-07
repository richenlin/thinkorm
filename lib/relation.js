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
var collections = {};

module.exports = class Relation {
    /**
     * 
     * 
     * @static
     * @param {any} name 
     * @param {any} config 
     */
    static getRelations(cls) {
        if (collections[cls.modelName]) {
            return collections[cls.modelName];
        }
        collections[cls.modelName] = {};
        if (!lib.isEmpty(cls.relations)) {
            for (let n in cls.relations) {
                let type = parseType(cls.relations[n].type);
                collections[cls.modelName][n] = {
                    type: type, //关联方式
                    name: n, //关联模型名称
                    model: cls.relations[n].model || null, //关联模型
                    field: cls.relations[n].field || [],
                    fkey: cls.relations[n].fkey, //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                    rkey: cls.relations[n].rkey, //hasone子表主键,hasmany子表外键,manytomany map表子外键
                    map: cls.relations[n].map || null,
                    primaryPk: cls.getPk()
                };
            }
        }
        return collections[cls.modelName] || {};
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
        return data;
    }
};