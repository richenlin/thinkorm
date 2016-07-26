/**
 * 数据库适配器,将查询有对象转变为查询语句的query bulider
 * Created by lihao on 16/7/26.
 */
import base from '../Base';
import Knex from 'knex';
export default class extends base {
    //配置数据库实例
    init(config) {
        super.init(config);
        this.config = config;
        this.knex;
        this.knexClient = Knex({
            client: this.config.db_type
        })

    }

    //实例化数据库Socket
    socket() {

    }

    async find(options) {
        try {
            //this.knex = this.knexClient.from('lihao1');
            //this.knex = this.knex.where({id:1})
            //console.log(this.knex.select().toString())
            this.queryBuilder(options);
            console.log(this.knex.toString())
        } catch (e) {
            console.log(e)
        }
    }


    /**
     * 查询对象转变为查询语句
     * 基于knex.js http://knexjs.org
     */
    queryBuilder(options) {
        this.builderTable(`${options.tablePrefix}${options.table}`);
        this.builderWhere(options.where);
        this.builderField(options.fields);
        this.builderLimit(options.limit);
        this.builderOrder(options.order);
        this.builderGroup(options.group);
    }

    /**
     * 解析表名
     * @param optionTable
     */
    builderTable(optionTable) {
        this.knex = this.knexClient.from(optionTable);
    }

    /**
     * 解析字段
     * @param optionField
     */
    builderField(optionField) {
        if (!optionField) return;
        this.knex.column(optionField);
    }

    /**
     * 解析limit
     * @param optionLimit
     */
    builderLimit(optionLimit) {
        if (!optionLimit || optionLimit.length < 1)return;
        this.knex.limit(optionLimit[1]).offset(optionLimit[0]);
    }

    /**
     * 解析Order
     * @param optionOrder
     */
    builderOrder(optionOrder) {
        if (!optionOrder || optionOrder.length < 1) return;
        this.knex.orderBy(optionOrder[0], optionOrder[1]);
    }

    builderGroup(optionGroup) {
        if (!optionGroup) return;
        this.knex.groupBy(optionGroup);
    }

    /**
     * 解析where条件
     * where:[
     *  where,whereNot,whereNotIn,whereNull,whereNotNull,whereExists,whereNotExists,whereBetween,whereNotBetween,
     * ]
     * @param optionWhere
     */
    builderWhere(optionWhere) {
        if (!optionWhere) return;
        if (optionWhere.where) this.knex.where(optionWhere.where);
        if (optionWhere.whereNot) this.knex.whereNot(optionWhere.whereNot);
        if (optionWhere.whereNotIn) this.knex.whereNotIn(optionWhere.whereNotIn);
        if (optionWhere.whereNull) this.knex.whereNull(optionWhere.whereNull);
        if (optionWhere.whereNotNull)  this.knex.whereNotNull(optionWhere.whereNotNull);
        if (optionWhere.whereExists) this.knex.whereExists(optionWhere.whereExists);
        if (optionWhere.whereNotExists) this.knex.whereNotExists(optionWhere.whereNotExists);
        if (optionWhere.whereBetween) this.knex.whereBetween(optionWhere.whereBetween);
        if (optionWhere.whereNotBetween)  this.knex.whereNotBetween(optionWhere.whereNotBetween);
    }

}