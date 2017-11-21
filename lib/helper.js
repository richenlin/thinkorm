/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    17/7/27
 */
const co = require('co');
const lib = require('think_lib');

module.exports = {
    /**
     * 
     * 
     * @param {any} obj 
     * @returns 
     */
    thinkco: function (obj) {
        //optimize invoke co package
        if (obj && typeof obj.next === 'function') {
            return co(obj);
        }
        return Promise.resolve(obj);
    },
    /**
     * 
     * 
     * @param {any} name 
     * @returns 
     */
    parseName: function (name) {
        name = name.trim();
        if (!name) {
            return name;
        }
        //首字母如果是大写，不转义为_x
        name = name[0].toLowerCase() + name.substr(1);
        return name.replace(/[A-Z]/g, function (a) {
            return '_' + a.toLowerCase();
        });
    },

    /**
     * 
     * 
     * @param {any} page 
     * @param {any} listRows 
     * @returns 
     */
    parsePage: function (page, listRows) {
        if (page === undefined) {
            return this;
        }
        if (lib.isArray(page)) {
            listRows = page[1];
            page = page[0];
        }
        return { page: page || 1, num: listRows || 10 };
    },

    /**
     * 条件解析
     * 
     * @param {any} model 
     * @param {any} oriOpts 
     * @param {any} [extraOptions={}] 
     * @returns 
     */
    parseOptions: async function (model, oriOpts, extraOptions = {}) {
        //解析扩展写法参数
        if (lib.isObject(oriOpts)) {
            let parseCase = { alias: 1, field: 1, where: 1, limit: 1, order: 1, group: 1, join: 1, rel: 1 };
            for (let n in oriOpts) {
                if (parseCase[n]) {
                    await model[n](oriOpts[n]);
                }
            }
        }
        let options = lib.extend(model.options, extraOptions || {}, true);
        //清空model.options,避免影响下次查询
        model.options = {};
        //获取表名
        options.table = model.tableName;
        //模型名称
        options.name = model.modelName;
        //模型查询别名
        options.alias = options.alias || model.modelName;
        //模型主键
        options.pk = model.pk;
        return options;
    },

    /**
     * auto migrate all model structure to database
     * 
     * @static
     * @param {any} config 
     * @returns 
     */
    migrate: function (config) {
        let instance, ps = [];
        for (let n in __thinkorm.collections) {
            instance = new (__thinkorm.collections[n])(config);
            if (instance.safe === false) {
                /*eslint-disable no-loop-func*/
                ps.push(instance.initDB().then(db => {
                    return db.migrate(__thinkorm.collections[n].schema, config);
                }));
            }
        }
        return Promise.all(ps);
    }
};