/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
const path = require('path');

/**
 * Base Class
 * @param  {Object} http
 * @return {Class}
 */
module.exports = class {
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
        //require加载文件时, 指定 fn.__filename = requirePath
        return path.basename(this.__filename || '', '.js');
    }
};
