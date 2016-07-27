/**
 * Created by lihao on 16/7/26.
 */
import base from './Base'
export default class extends base {
    //此处初始化数据库
    init() {
        this.config = {
            db_type: 'mysql'
        }
        this._options = {
            where: {}
        };
    }

    /**
     * 获取数据库适配器单例
     */
    adapter() {
        if (this._adapter) return this._adapter;
        let Adapter = require(`./Adapter/${this.config.db_type || 'mysql'}Adapter`).default;
        this._adapter = new Adapter(this.config);
        return this._adapter;
    }

    /**
     * 查询字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */
    field(fields) {
        if (!fields) {
            return this;
        }
        if (typeof fields === 'string') {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this._options.fields = fields;
        return this;
    }

    /**
     * 查询条件where
     * @param where
     */
    where(where) {
        if (!where) return this;
        this._options.where.where = where;
        return this;
    }

    /**
     * 指定查询数量
     * @param offset
     * @param length
     */
    limit(offset, length) {
        if (offset === undefined) {
            return this;
        }

        if (typeof offset === 'array') {
            offset = offset[0], length = offset[1];
        }

        offset = Math.max(parseInt(offset) || 0, 0);
        if (length) {
            length = Math.max(parseInt(length) || 0, 0);
        }
        this._options.limit = [offset, length];
        return this;
    }

    /**
     * 排序
     * @param order
     */
    order(order) {
        if (order === undefined) {
            return this;
        }
        //TODO进一步解析
        this._options.order = [];
        //如果是字符串id desc
        if (typeof order === 'string') {
            //'id desc,name aes'
            if (order.indexOf(',') > -1) {
                let orderarr = order.split(',');
                for (let o of orderarr) {
                    if (o.indexOf(' desc') > -1 || o.indexOf(' DESC') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'desc']);
                    } else if (o.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                        this._options.order.push([[o.substring(0, o.length - 5)], 'aes']);
                    } else {
                        this._options.order.push([o, 'aes']);
                    }
                }
            } else {
                //'id desc'
                if (order.indexOf(' desc') > -1 || order.indexOf(' DESC') > -1) {
                    this._options.order.push([[order.substring(0, order.length - 5)], 'desc']);
                } else if (order.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                    this._options.order.push([[order.substring(0, order.length - 5)], 'aes']);
                } else {
                    this._options.order.push([order, 'aes'])
                }
            }

        } else if (Array.isArray(order)) {
            //[{id: 'asc', name: 'desc'}],
            for (let o of order) {
                for (let k in o) {
                    this._options.order.push([k, o[k]]);
                }
            }
        }
        return this;
    }

    /**
     * 分组
     * @param value
     */
    group(value) {
        this._options.group = value;
        return this;
    }

    /**
     * 关联
     * [{type:'left',from:'user',on:Object||Array}]
     * @param join
     */
    join(join) {
        if (!join) return this;
        let type, onCondition, from, joinArr = [], on, or, orArr;
        for (let j of join) {
            type = j.type || 'left';
            from = j.from;
            onCondition = j.on;
            if (Object.prototype.toString(onCondition) == '[object Object]') {
                //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                if (onCondition.or != undefined) {
                    orArr = [from];
                    for (let o of onCondition.or) {
                        or = [];
                        for (let k in o) {
                            or.push(`${k}.${o[k]}`)
                        }
                        orArr.push(or);
                    }
                    //console.log(orArr)
                    //or:['user',[[user.id,info.user_id],[user.name,info.user_name]]]
                    joinArr.push({type: type, from: from, or: orArr})
                } else {
                    //or:{a:'id',b:'a_id'}
                    on = [from];
                    for (let k in onCondition) {
                        on.push(`${k}.${onCondition[k]}`);
                    }
                    joinArr.push({type: type, from: from, on: on})
                }
            }
        }
        this._options.join = joinArr;
        //console.log(this._options.join)
        return this;
    }

    async count(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.count = field;
        let options = await this.parseOption(this._options);
        let result = await this.adapter().count(options);
    }

    async min(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.min = field;
        let options = await this.parseOption(this._options);
        let result = await this.adapter().min(options);
    }

    async max(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.max = field;
        let options = await this.parseOption(this._options);
        let result = await this.adapter().max(options);
    }

    async avg(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.avg = field;
        let options = await this.parseOption(this._options);
        let result = await this.adapter().avg(options);
    }

    async avgDistinct(field) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.avgDistinct = field;
        let options = await this.parseOption(this._options);
        let result = await this.adapter().avgDistinct(options);
    }

    /**
     * 字段自增
     * @param field
     */
    async increment(field, inc) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.increment = [field, inc || 1];
        let options = await this.parseOption(this._options);
        let result = await this.adapter().increment(options);
    }

    /**
     * 字段自减
     * @param field
     */
    async decrement(field, dec) {
        if (!options) options = {};
        //TODO options继承this._options
        if (field) this._options.decrement = [field, dec || 1];
        let options = await this.parseOption(this._options);
        let result = await this.adapter().decrement(options);
    }


    /**
     * 查询一条数据
     * @param option
     */
    async find(options) {
        if (!options) options = {};
        //TODO options继承this._options
        options = this._options;
        options = await this.parseOption(options);
        let result = await this.adapter().find(options);
    }

    /**
     * 解析参数
     * @param options
     */
    async parseOption(options) {
        options.table = 'user';
        options.tablePrefix = 'think_';
        return options
    }
}