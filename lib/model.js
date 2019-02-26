/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const liteq = require('liteq');
const helper = liteq.helper;
const valid = require('./validation.js');

module.exports = class Model extends liteq {
    /**
     * constructor
     * @param  {Mixed} args []
     * @return {}      []
     */
    constructor(...args) {
        super(...args);
        // 数据检查规则
        this.validations = this.validations || {};
    }

    /**
     * 新增数据前置方法
     * 
     * @param {any} data 
     * @param {any} options 
     */
    _beforeAdd(data, options) {
        return Promise.resolve(data);
    }
    /**
     * 新增数据
     * 
     * @param {any} data 
     * @param {any} options 
     */
    async add(data, options) {
        try {
            if (helper.isEmpty(data)) {
                throw Error('Data can not be empty');
            }
            let _data = await this._beforeAdd(data, options) || data;
            _data = await valid(this.fields, _data, this.validations, 'ADD');
            if (helper.isEmpty(_data)) {
                throw Error('Data can not be empty');
            }
            let result = await super.add(_data, options);
            await this._afterAdd(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 新增数据后置方法
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _afterAdd(data, options) {
        return Promise.resolve(data);
    }
    /**
     * 查询结果为空即新增数据
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    async thenAdd(data, options) {
        try {
            let record = await this.find(options);
            if (helper.isEmpty(record)) {
                return this.add(data, options);
            }
            return null;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 删除数据前置方法
     * 
     * @param {any} options 
     * @returns 
     */
    _beforeDelete(options) {
        return Promise.resolve(options);
    }
    /**
     * 删除数据
     * 
     * @param {any} options 
     */
    async delete(options) {
        try {
            await this._beforeDelete(options);
            let result = await super.delete(options);
            await this._afterDelete(options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 删除数据后置方法
     * 
     * @param {any} options 
     * @returns 
     */
    _afterDelete(options) {
        return Promise.resolve(options);
    }
    /**
     * 更新数据前置方法
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _beforeUpdate(data, options) {
        return Promise.resolve(data);
    }
    /**
     * 更新数据
     * 
     * @param {any} data 
     * @param {any} options 
     */
    async update(data, options) {
        try {
            let _data = await this._beforeUpdate(data, options) || data;
            _data = await valid(this.fields, _data, this.validations, 'UPDATE');
            if (helper.isEmpty(_data)) {
                throw Error('Data can not be empty');
            }
            let result = await super.update(_data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 字段值自增
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} [data={}] 
     * @param {any} options 
     * @returns 
     */
    async increment(field, step = 1, data = {}, options) {
        try {
            let _data = await this._beforeUpdate(data, options) || data;
            _data = await valid(this.fields, _data, this.validations, 'UPDATE');
            let result = await super.increment(field, step, _data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 字段值自减
     * 
     * @param {any} field 
     * @param {number} [step=1] 
     * @param {any} [data={}] 
     * @param {any} options 
     * @returns 
     */
    async decrement(field, step = 1, data = {}, options) {
        try {
            let _data = await this._beforeUpdate(data, options) || data;
            _data = await valid(this.fields, _data, this.validations, 'UPDATE');
            let result = await super.decrement(field, step, _data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 更新数据后置方法
     * 
     * @param {any} data 
     * @param {any} options 
     * @returns 
     */
    _afterUpdate(data, options) {
        return Promise.resolve(data);
    }
    /**
     * 查询单条数据
     * 
     * @param {any} options 
     * @returns 
     */
    async find(options) {
        try {
            let result = await super.find(options);
            result = await this._afterFind(result, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询单条数据后置方法
     * 
     * @param {any} result 
     * @param {any} options 
     * @returns 
     */
    _afterFind(result, options) {
        return Promise.resolve(result);
    }
    /**
     * 查询多条数据
     * 
     * @param {any} options 
     * @returns 
     */
    async select(options) {
        try {
            let result = await super.select(options);
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
            let result = await super.countSelect(options);
            result.data = await this._afterSelect(result.data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }
    /**
     * 查询多条数据后置方法
     * 
     * @param {any} result 
     * @param {any} options 
     * @returns 
     */
    _afterSelect(result, options) {
        return Promise.resolve(result);
    }
    
};