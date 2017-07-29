'use strict';

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const lib = require('think_lib');

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
    init(config) {
        this.config = config;
    }

    static getInstance(config) {
        if (lib.isEmpty(config.db_type)) {
            throw Error('db_type is undefined.');
        }
        const adapter = require(`thinkorm_adapter_${config.db_type.toLowerCase()}`);
        let key = lib.md5(`${config.db_type}_${config.db_host}_${config.db_port}_${config.db_name}`);
        !__thinkorm.instances && (__thinkorm.instances = {});
        if (!__thinkorm.instances[key]) {
            __thinkorm.instances[key] = new adapter(config);
            return __thinkorm.instances[key];
        }
        return __thinkorm.instances[key];
    }
};