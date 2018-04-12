/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const helper = require('think_lib');
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
     * Creates an instance of Relation.
     */
    constructor(config) {
        this.config = config || {};
    }
    /**
     * 获取关联定义
     * 
     * @param {any} cls 
     * @returns 
     */
    getRelations(cls) {
        if (collections[cls.modelName]) {
            return collections[cls.modelName];
        }
        collections[cls.modelName] = {};
        if (!helper.isEmpty(cls.relations)) {
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
     * 关联查询
     * 
     * @param {any} options 
     * @param {any} data 
     * @returns 
     */
    async getRelationData(options, data) {
        let caseList = {
            'HASONE': this.getHasOneRelation,
            'HASMANY': this.getHasManyRelation,
            'MANYTOMANY': this.getManyToManyRelation
        };
        if (!helper.isEmpty(data)) {
            let rels = options.rels, rtype, ps = [];
            for (let n in rels) {
                rtype = rels[n].type;
                if (rtype && rtype in caseList) {
                    if (helper.isArray(data)) {
                        for (let [k, v] of data.entries()) {
                            ps.push(caseList[rtype](this.config, options, rels[n], data[k]).then(res => {
                                data[k][rels[n].name] = res;
                            }));
                            //data[k][rels[n]['name']] = await caseList[rtype](this.config, rels[n], data[k]);
                        }
                        await Promise.all(ps);
                    } else {
                        data[rels[n].name] = await caseList[rtype](this.config, options, rels[n], data);
                    }
                }
            }
        }
        return data;
    }

    /**
     * HasOneRelation
     * 
     * @param {any} config 
     * @param {any} options 
     * @param {any} rel 
     * @param {any} data 
     * @returns 
     */
    getHasOneRelation(config, options, rel, data) {
        if (helper.isEmpty(data) || helper.isEmpty(data[rel.fkey])) {
            return Promise.resolve({});
        }
        let rModel = new (rel.model)(config);
        let opt = { where: { [rel.rkey]: data[rel.fkey] } };
        if (!helper.isEmpty(rel.options)) {
            opt = helper.extend(rel.options, opt, true);
        }
        return rModel.find(opt);
    }
    /**
     * HasManyRelation
     * 
     * @param {any} config 
     * @param {any} options 
     * @param {any} rel 
     * @param {any} data 
     * @returns 
     */
    getHasManyRelation(config, options, rel, data) {
        if (helper.isEmpty(data) || helper.isEmpty(data[rel.primaryPk])) {
            return Promise.resolve([]);
        }
        let rModel = new (rel.model)(config);
        let opt = { where: { [rel.rkey]: data[rel.primaryPk] } };
        if (!helper.isEmpty(rel.options)) {
            opt = helper.extend(rel.options, opt, true);
        }
        return rModel.select(opt);
    }
    /**
     * ManyToManyRelation
     * 
     * @param {any} config 
     * @param {any} options 
     * @param {any} rel 
     * @param {any} data 
     * @returns 
     */
    getManyToManyRelation(config, options, rel, data) {
        if (helper.isEmpty(data) || helper.isEmpty(data[rel.primaryPk])) {
            return Promise.resolve([]);
        }
        let rModel = new (rel.model)(config);
        let rpk = rModel.getPk();
        let mapModel = new (rel.map)(config);
        return mapModel.select({ where: { [rel.fkey]: data[rel.primaryPk] } }).then(result => {
            let keys = [];
            result.map(item => {
                item[rel.rkey] && keys.push(item[rel.rkey]);
            });
            return rModel.select(!helper.isEmpty(rel.options) ? helper.extend(rel.options, { where: { [rpk]: keys } }, true) : { where: { [rpk]: keys } });
        });
    }
};