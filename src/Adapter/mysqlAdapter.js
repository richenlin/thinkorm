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
        this.sql = '';

    }

    //实例化数据库Socket
    socket() {
        if (this._socket) {
            return this._socket;
        }
        let MysqlSocket = require('../Socket/mysqlSocket').default;
        this._socket = new MysqlSocket(this.config);
        return this._socket;
    }

    /**
     * 执行查询类操作
     * @param sql
     */
    async query(sql) {
        console.log(sql);
        this.sql = sql;
        return this.socket().query(sql).then(data=> {
            return this.bufferToString(data);
        })
    }

    /**
     * 更新,修改,删除类操作
     * @param sql
     */
    async execute(sql) {

    }


    async count(options) {
        this.knex = this.knexClient.count(options.count);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    async min(options) {
        this.knex = this.knexClient.min(options.min);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    async max(options) {
        this.knex = this.knexClient.max(options.max);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    async avg(options) {
        this.knex = this.knexClient.avg(options.avg);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    async avgDistinct(options) {
        this.knex = this.knexClient.avgDistinct(options.avgDistinct);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 字段自增
     * @param options
     */
    async increment(options) {
        this.knex = this.knexClient.increment(options.increment[0], options.increment[1]);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 字段自增
     * @param options
     */
    async decrement(options) {
        this.knex = this.knexClient.decrement(options.decrement[0], options.decrement[1]);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 查询操作
     * @param options
     */
    async select(options) {
        this.knex = this.knexClient.select();
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 新增操作
     * @param data
     * @param options
     */
    async insert(data, options) {
        this.knex = this.knexClient.insert(data);
        return this.query(this.knex.toString());
    }

    /**
     * 查询对象转变为查询语句
     * 基于knex.js http://knexjs.org
     */
    queryBuilder(options) {
        this.builderTable(options.table);
        this.builderWhere(options.where);
        this.builderField(options.fields);
        this.builderLimit(options.limit);
        this.builderOrder(options.order);
        this.builderGroup(options.group);
        this.builderJoin(options.join);
    }

    /**
     * 解析表名
     * @param optionTable
     */
    builderTable(optionTable) {
        this.knex.from(optionTable);
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
        for (let order of optionOrder) {
            this.knex.orderBy(order[0], order[1])
        }
    }

    builderGroup(optionGroup) {
        if (!optionGroup) return;
        this.knex.groupBy(optionGroup);
    }


    /**
     * 解析join条件
     * join:{
     *  innerJoin,leftJoin,leftOuterJoin,rightJoin,rightOuterJoin,outerJoin,fullOuterJoin,crossJoin,
     * }
     * @param optionJoin
     */
    builderJoin(optionJoin) {
        if (!optionJoin) return;
        for (let join of optionJoin) {
            if (join.or) {
                this.knex[`${join.type}Join`](join.or[0], function () {
                    //or:[{a:'id',b:'a_id'},{a:'name',b:'a_name'}]
                    this.on(join.or[1][0], '=', join.or[1][1]);
                    //删除带个元素
                    join.or.shift();
                    join.or.shift();
                    for (let or of join.or) {

                        this.orOn(or[0], '=', or[1]);
                    }
                })
            } else {
                this.knex[`${join.type}Join`](join.on[0], join.on[1], join.on[2]);
            }
        }
        //if (optionJoin.innerJoin) this.knex.innerJoin(optionJoin.innerJoin);

    }

    /**
     * 解析where条件
     * where:{
     *  where,whereNot,whereNotIn,whereNull,whereNotNull,whereExists,whereNotExists,whereBetween,whereNotBetween,
     * }
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

    bufferToString(data) {
        if (!this.config.buffer_tostring || !ORM.isArray(data)) {
            return data;
        }
        for (let i = 0, length = data.length; i < length; i++) {
            for (let key in data[i]) {
                if (ORM.isBuffer(data[i][key])) {
                    data[i][key] = data[i][key].toString();
                }
            }
        }
        return data;
    }

}