/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2018 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    18/2/27
 */
const liteq = require('liteq');
const helper = liteq.helper;
const model = require('./model.js');
const relation = require('./relation.js');

module.exports = class relModel extends model {
    /**
     * constructor
     * @param  {Mixed} args []
     * @return {}      []
     */
    constructor(...args) {
        super(...args);
        // 关联关系
        this.relations = this.relations || {};
        this.relationShip = null;
    }
    /**
     * 
     * 
     * @param {any} config 
     */
    init(config) {
        this.config = config;
    }

    /**
     * relation ship 
     * rel(true)
     * rel(true, {user:{field:[], where: {}}})
     * rel(['user'], {user:{field:[], where: {}}})
     * @param {boolean} [rels=true] 
     * @param {any} options 
     */
    rel(rels = true, options = {}) {
        try {
            if (rels) {
                this.options.rels = {};
                //init relationShip class
                if (!this.relationShip){
                    this.relationShip = new relation(this.config);
                }
                let relationShip = this.relationShip.getRelations(this);
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
    async find(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let instance = await this.getInstance();
            let result = await instance.find(parsedOptions);
            //relationShip
            if (parsedOptions.rels) {
                if (!this.relationShip){
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
    async select(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let instance = await this.getInstance();
            let result = await instance.select(parsedOptions);
            //relationShip
            if (parsedOptions.rels) {
                if (!this.relationShip){
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
    async countSelect(options) {
        try {
            let parsedOptions = helper.parseOptions(this, options);
            let instance = await this.getInstance();
            let countNum = await instance.count(null, parsedOptions);
            let pageOptions = helper.parsePage(parsedOptions.page || 1, parsedOptions.num || 10);
            let totalPage = Math.ceil(countNum / pageOptions.num);
            if (pageOptions.page > totalPage) {
                pageOptions.page = totalPage;
            }
            //传入分页参数
            let offset = (pageOptions.page - 1) < 0 ? 0 : (pageOptions.page - 1) * pageOptions.num;
            parsedOptions.limit = [offset, pageOptions.num];
            let result = helper.extend({ count: countNum, total: totalPage }, pageOptions);
            result.data = await this.select(parsedOptions);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
};