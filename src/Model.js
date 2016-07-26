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
        //如果是字符串id desc
        if (typeof order === 'string') {
            if (order.indexOf(' desc') > -1 || order.indexOf(' DESC') > -1) {
                order = [[order.substring(0, order.length - 5)], 'desc']
            } else if (order.indexOf(' aes') > -1 || order.indexOf(' AES') > -1) {
                order = [[order.substring(0, order.length - 5)], 'aes']
            } else {
                order = [order, 'aes']
            }
        }
        this._options.order = order;
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