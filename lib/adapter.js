/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const lib = require('think_lib');

module.exports = class {
    static getInstance(config){
        if (lib.isEmpty(config.db_type)) {
            throw Error('db_type is undefined.');
        }
        if (config.db_ext_config && !process.env.NODE_ENV && config.db_ext_config.db_log_sql === true){
            process.env.NODE_ENV = 'development';
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