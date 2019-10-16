/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2019-10-16 10:13:40
 */
const liteq = require('liteq');
const helper = liteq.helper;
import { Valid } from "./Valid";

export class BaseModel extends liteq {
    validations: object;

    /**
     *Creates an instance of BaseModel.
     * @param {...any[]} args
     * @memberof BaseModel
     */
    constructor(...args: any[]) {
        super(...args);
        // 数据检查规则
        this.validations = this.validations || {};
    }

    /**
     * 新增数据前置方法
     *
     * @param {*} data
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    _beforeAdd(data: any, options?: any) {
        return data;
    }

    /**
     * 新增数据
     *
     * @param {*} data
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async add(data: any, options?: any) {
        try {
            if (helper.isEmpty(data)) {
                throw Error('Data can not be empty');
            }
            options = helper.parseOptions(this, options);
            let _data = await this._beforeAdd(data, options) || data;
            _data = await Valid(this.fields, _data, this.validations, 'ADD');
            if (helper.isEmpty(_data)) {
                throw Error('Data can not be empty');
            }
            const result = await super.add(_data, options);
            //add return pk to data
            if (result) {
                Reflect.set(_data, this.pk, result);
            }
            await this._afterAdd(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 新增数据后置方法
     *
     * @param {*} data
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    _afterAdd(data: any, options?: any) {
        return data;
    }

    /**
     * 查询结果为空即新增数据
     *
     * @param {*} data
     * @param {*} options
     * @returns
     * @memberof BaseModel
     */
    async thenAdd(data: any, options: any) {
        try {
            const record = await this.find(options);
            if (helper.isEmpty(record)) {
                return this.add(data, options);
            }
            // tslint:disable-next-line: no-null-keyword
            return null;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 删除数据前置方法
     *
     * @param {*} options
     * @returns
     * @memberof BaseModel
     */
    _beforeDelete(options: any) {
        return options;
    }

    /**
     * 删除数据
     *
     * @param {*} options
     * @returns
     * @memberof BaseModel
     */
    async delete(options: any) {
        try {
            options = helper.parseOptions(this, options);
            await this._beforeDelete(options);
            const result = await super.delete(options);
            await this._afterDelete(options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 删除数据后置方法
     *
     * @param {*} options
     * @returns
     * @memberof BaseModel
     */
    _afterDelete(options: any) {
        return options;
    }

    /**
     * 更新数据前置方法
     *
     * @param {*} data
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    _beforeUpdate(data: any, options?: any) {
        return data;
    }

    /**
     * 更新数据
     *
     * @param {*} data
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async update(data: any, options?: any) {
        try {
            options = helper.parseOptions(this, options);
            let _data = await this._beforeUpdate(data, options) || data;
            _data = await Valid(this.fields, _data, this.validations, 'UPDATE');
            if (helper.isEmpty(_data)) {
                throw Error('Data can not be empty');
            }
            const result = await super.update(_data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 字段值自增
     *
     * @param {*} field
     * @param {number} [step=1]
     * @param {*} [data={}]
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async increment(field: any, step = 1, data = {}, options?: any) {
        try {
            options = helper.parseOptions(this, options);
            let _data = await this._beforeUpdate(data, options) || data;
            _data = await Valid(this.fields, _data, this.validations, 'UPDATE');
            const result = await super.increment(field, step, _data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 字段值自减
     *
     * @param {*} field
     * @param {number} [step=1]
     * @param {*} [data={}]
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async decrement(field: any, step = 1, data = {}, options?: any) {
        try {
            options = helper.parseOptions(this, options);
            let _data = await this._beforeUpdate(data, options) || data;
            _data = await Valid(this.fields, _data, this.validations, 'UPDATE');
            const result = await super.decrement(field, step, _data, options);
            await this._afterUpdate(_data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 更新数据后置方法
     *
     * @param {*} data
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    _afterUpdate(data: any, options?: any) {
        return data;
    }

    /**
     * 查询单条数据
     *
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async find(options?: any) {
        try {
            options = helper.parseOptions(this, options);
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
     * @param {*} result
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    _afterFind(result: any, options?: any) {
        return result;
    }

    /**
     * 查询多条数据
     *
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async select(options?: any) {
        try {
            options = helper.parseOptions(this, options);
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
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    async countSelect(options?: any) {
        try {
            options = helper.parseOptions(this, options);
            const result = await super.countSelect(options);
            result.data = await this._afterSelect(result.data, options);
            return result;
        } catch (e) {
            return this.error(e);
        }
    }

    /**
     * 查询多条数据后置方法
     *
     * @param {*} result
     * @param {*} [options]
     * @returns
     * @memberof BaseModel
     */
    _afterSelect(result: any, options?: any) {
        return Promise.resolve(result);
    }
}