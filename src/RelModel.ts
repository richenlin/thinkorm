/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2019-10-16 10:40:07
 */

const liteq = require('liteq');
const helper = liteq.helper;

import { BaseModel } from "./BaseModel";
import { Relation } from "./Relation";

export class RelModel extends BaseModel {
    relations: any;
    relationShip: any;
    constructor(...args: any[]) {
        super(...args);
        // 关联关系
        this.relations = this.relations || {};
        // tslint:disable-next-line: no-null-keyword
        this.relationShip = null;
    }

    /**
     * relation ship 
     * rel(true)
     * rel(true, {user:{field:[], where: {}}})
     * rel(['user'], {user:{field:[], where: {}}})
     * @param {boolean} [rels=true] 
     * @param {any} options 
     */
    rel(rels: boolean | any = true, options: any = {}) {
        try {
            if (rels) {
                this.options.rels = {};
                //init relationShip class
                if (!this.relationShip) {
                    this.relationShip = new Relation(this.config);
                }
                const relationShip = this.relationShip.getRelations(this);
                if (rels === true) {
                    rels = Object.keys(relationShip);
                } else if (helper.isString(rels)) {
                    rels = rels.replace(/ +/g, '').split(',');
                } else if (!helper.isArray(rels)) {
                    rels = [];
                }
                for (let i = 0, len = rels.length; i < len; i++) {
                    this.options.rels[rels[i]] = relationShip[rels[i]] || {};
                    this.options.rels[rels[i]].options = options[rels[i]] || {};
                }
            }
            return this;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询单条数据
     * 
     * @param {any} options 
     * @returns 
     */
    async find(options: any) {
        try {
            const parsedOptions = helper.parseOptions(this, options);
            const instance = await this.getInstance();
            let result = await instance.find(parsedOptions);
            //relationShip
            if (parsedOptions.rels) {
                if (!this.relationShip) {
                    throw Error('Before using the associated query, call the `rel` method!');
                }
                result = await this.relationShip.getRelationData(parsedOptions, result || {});
            }
            result = await this._afterFind(result, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询多条数据
     * 
     * @param {any} options 
     * @returns 
     */
    async select(options: any) {
        try {
            const parsedOptions = helper.parseOptions(this, options);
            const instance = await this.getInstance();
            let result = await instance.select(parsedOptions);
            //relationShip
            if (parsedOptions.rels) {
                if (!this.relationShip) {
                    throw Error('Before using the associated query, call the `rel` method!');
                }
                result = await this.relationShip.getRelationData(parsedOptions, result || []);
            }
            result = await this._afterSelect(result, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 分页查询
     * 
     * @param {any} options 
     * @returns 
     */
    async countSelect(options: any) {
        try {
            const parsedOptions = helper.parseOptions(this, options);
            const instance = await this.getInstance();
            // tslint:disable-next-line: no-null-keyword
            const countNum = await instance.count(null, parsedOptions);
            const pageOptions = helper.parsePage(parsedOptions.page || 1, parsedOptions.num || 10);
            const totalPage = Math.ceil(countNum / pageOptions.num);
            if (pageOptions.page > totalPage) {
                pageOptions.page = totalPage;
            }
            //传入分页参数
            const offset = (pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
            parsedOptions.limit = [offset, pageOptions.num];
            const result = helper.extend({ count: countNum, total: totalPage }, pageOptions);
            result.data = await this.select(parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
}