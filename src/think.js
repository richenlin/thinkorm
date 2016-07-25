/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
export default class {
    constructor(options = {}) {
        //构建连接池
        this.handel = null;
    }

    db(){
        return this.handel;
    }

    schema(){
        return this.handel.schema();
    }


}
