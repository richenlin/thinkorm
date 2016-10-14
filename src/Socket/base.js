/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
import path from 'path';

let instances = {};
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
    init() {

    }

    /**
     * get current class filename
     * @return {} []
     */
    filename() {
        let fname = this.__filename || __filename;
        return path.basename(fname, '.js');
    }

    /**
     * get instance
     * @param  {Object} config []
     * @return {Object}        []
     */
    static getInstance(config){
        let key = `${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`;
        if(!instances[key]){
            instances[key] = new this(config);
            return instances[key];
        }
        return instances[key];
    }
}
