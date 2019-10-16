/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2019-10-16 11:24:24
 */

import * as helper from "think_lib";
/**
 * 
 * 
 * @param {any} type 
 * @returns 
 */
const parseType = function (type: number | string) {
    type = type || 'HASONE';
    if (type === 1) {
        type = 'HASONE';
    } else if (type === 2) {
        type = 'HASMANY';
    } else if (type === 3) {
        type = 'MANYTOMANY';
    } else {
        type = (type + '').toUpperCase();
    }
    return type;
};
const collections: any = {};

export class Relation {
    config: any;

    /**
     *Creates an instance of Relation.
     * @param {*} config
     * @memberof Relation
     */
    constructor(config: any) {
        this.config = config || {};
    }

    /**
     *
     *
     * @param {*} cls
     * @returns
     * @memberof Relation
     */
    getRelations(cls: any) {
        if (collections[cls.modelName]) {
            return collections[cls.modelName];
        }
        collections[cls.modelName] = {};
        if (!helper.isEmpty(cls.relations)) {
            // tslint:disable-next-line: forin
            for (const n in cls.relations) {
                const type = parseType(cls.relations[n].type);
                collections[cls.modelName][n] = {
                    type, //关联方式
                    name: n, //关联模型名称
                    // tslint:disable-next-line: no-null-keyword
                    model: cls.relations[n].model || null, //关联模型
                    field: cls.relations[n].field || [],
                    fkey: cls.relations[n].fkey, //hasone主表外键,hasmany查询结果字段名,manytomany map表主外键
                    rkey: cls.relations[n].rkey, //hasone子表主键,hasmany子表外键,manytomany map表子外键
                    // tslint:disable-next-line: no-null-keyword
                    map: cls.relations[n].map || null,
                    primaryPk: cls.getPk()
                };
            }
        }
        return collections[cls.modelName] || {};
    }

    async getRelationData(options: any, data: any) {
        const caseList: any = {
            'HASONE': this.getHasOneRelation,
            'HASMANY': this.getHasManyRelation,
            'MANYTOMANY': this.getManyToManyRelation
        };
        if (!helper.isEmpty(data)) {
            // tslint:disable-next-line: one-variable-per-declaration
            const rels = options.rels;
            let rtype;
            const ps = [];
            // tslint:disable-next-line: forin
            for (const n in rels) {
                rtype = rels[n].type;
                if (rtype && rtype in caseList) {
                    if (helper.isArray(data)) {
                        for (const [k, v] of data.entries()) {
                            ps.push(caseList[rtype](this.config, options, rels[n], data[k]).then((res: any) => {
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
     * @param {*} config
     * @param {*} options
     * @param {*} rel
     * @param {*} data
     * @returns
     * @memberof Relation
     */
    getHasOneRelation(config: any, options: any, rel: any, data: any) {
        if (helper.isEmpty(data) || helper.isEmpty(data[rel.fkey])) {
            return Promise.resolve({});
        }
        const rModel = new (rel.model)(config);
        let opt: any = { where: { [rel.rkey]: data[rel.fkey] } };
        if (!helper.isEmpty(rel.options)) {
            opt = helper.extend(rel.options, opt, true);
        }
        return rModel.find(opt);
    }

    /**
     * HasManyRelation
     *
     * @param {*} config
     * @param {*} options
     * @param {*} rel
     * @param {*} data
     * @returns
     * @memberof Relation
     */
    getHasManyRelation(config: any, options: any, rel: any, data: any) {
        if (helper.isEmpty(data) || helper.isEmpty(data[rel.primaryPk])) {
            return Promise.resolve([]);
        }
        const rModel = new (rel.model)(config);
        let opt: any = { where: { [rel.rkey]: data[rel.primaryPk] } };
        if (!helper.isEmpty(rel.options)) {
            opt = helper.extend(rel.options, opt, true);
        }
        return rModel.select(opt);
    }

    /**
     * ManyToManyRelation
     *
     * @param {*} config
     * @param {*} options
     * @param {*} rel
     * @param {*} data
     * @returns
     * @memberof Relation
     */
    getManyToManyRelation(config: any, options: any, rel: any, data: any) {
        if (helper.isEmpty(data) || helper.isEmpty(data[rel.primaryPk])) {
            return Promise.resolve([]);
        }
        const rModel = new (rel.model)(config);
        const rpk = rModel.getPk();
        const mapModel = new (rel.map)(config);
        return mapModel.select({ where: { [rel.fkey]: data[rel.primaryPk] } }).then((result: any) => {
            const keys: any[] = [];
            result.map((item: any) => {
                // tslint:disable-next-line: no-unused-expression
                item[rel.rkey] && keys.push(item[rel.rkey]);
            });
            return rModel.select(!helper.isEmpty(rel.options) ? helper.extend(rel.options, { where: { [rpk]: keys } }, true) : { where: { [rpk]: keys } });
        });
    }
}