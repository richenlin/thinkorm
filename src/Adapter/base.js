/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import path from 'path';

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
export default class {
    /**
     * constructor
     * @param  {Object} http []
     * @return {}      []
     */
    constructor(...args) {
        this.init(...args);
    }

    /**
     * init
     * @param  {Object} http []
     * @return {}      []
     */
    init(config = {}) {
        this.config = config;
        this.handel = null;
    }

    /**
     * get current class filename
     * @return {} []
     */
    filename() {
        let fname = this.__filename || __filename;
        return path.basename(fname, '.js');
    }


    connect() {
        return Promise.resolve();
    }

    schema() {
        //自动创建表\更新表\迁移数据
        return Promise.resolve();
    }

    close() {
        return Promise.resolve();
    }

    /**
     *
     * @param sql
     */
    query(sql) {
        return Promise.resolve();
    }

    /**
     *
     * @param sql
     */
    execute(sql) {
        return Promise.resolve();
    }
}
