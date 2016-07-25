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
    init() {
        this.pool = null;
        this.connection = null;
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
     * close db connection
     */
    close(){
        clearTimeout(this.closeTimer);
        if(this.connection){
            this.connection.close();
            this.connection = null;
        }
    }
}
