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
        this.lastInsertId;
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

    getLastSql() {
        return this.sql;
    }

    getLastInsertId() {
        return this.lastInsertId;
    }

    /**
     * 执行查询类操作
     * @param sql
     */
    query(sql) {
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
    execute(sql) {
        console.log(sql);
        this.sql = sql;
        return this.socket().query(sql).then(data=> {
            if (data.insertId) {
                this.lastInsertId = data.insertId;
            }
            return data.affectedRows || 0;
        })
    }


    count(options) {
        this.knex = this.knexClient.count(options.count);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    min(options) {
        this.knex = this.knexClient.min(options.min);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    max(options) {
        this.knex = this.knexClient.max(options.max);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    avg(options) {
        this.knex = this.knexClient.avg(options.avg);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    avgDistinct(options) {
        this.knex = this.knexClient.avgDistinct(options.avgDistinct);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 字段自增
     * @param options
     */
    increment(options) {
        this.knex = this.knexClient.increment(options.increment[0], options.increment[1]);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 字段自增
     * @param options
     */
    decrement(options) {
        this.knex = this.knexClient.decrement(options.decrement[0], options.decrement[1]);
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 查询操作
     * @param options
     */
    select(options) {
        this.knex = this.knexClient.select();
        this.queryBuilder(options);
        return this.query(this.knex.toString());
    }

    /**
     * 新增操作
     * @param data
     * @param options
     */
    insert(data, options) {
        this.knex = this.knexClient.insert(data).from(options.table);
        return this.execute(this.knex.toString());
    }

    /**
     * 批量写入
     * 生成多条insert语句,一次执行
     * @param data
     * @param options
     */
    insertAll(data, options) {
        return this.insert(data, options);
    }

    /**
     * 更新操作
     * @param data
     * @param options
     */
    update(data, options) {
        this.knex = this.knexClient.update(data);
        this.builderTable(options.table);
        this.builderWhere(options.where);
        return this.query(this.knex.toString());
    }

    /**
     * 删除操作
     * @param options
     */
    delete(options) {
        this.knex = this.knexClient.del();
        this.builderTable(options.table);
        this.builderWhere(options.where);
        return this.execute(this.knex.toString());
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
        if (optionWhere.where) {
            if (optionWhere.where.and) {
                optionWhere.where.and.map(data=> {
                    this.knex.where(data[0], data[1], data[2]);
                })
            }

            if (optionWhere.where.in) {
                optionWhere.where.in.map(data=> {
                    this.knex.whereIn(data[0], data[1]);
                })
            }

            if (optionWhere.where.not) {
                optionWhere.where.not.map(data=> {
                    this.knex.whereNot(data[0], data[1]);
                })
            }

            if (optionWhere.where.notin) {
                optionWhere.where.notin.map(data=> {
                    this.knex.whereNotIn(data[0], data[1]);
                })
            }

            if (optionWhere.where.null) {
                optionWhere.where.null.map(data=> {
                    //this.knex.whereNull(...data);
                    data.map(d=> {
                        this.knex.whereNull(d);
                    })
                })
            }

            if (optionWhere.where.notnull) {
                optionWhere.where.notnull.map(data=> {
                    data.map(d=> {
                        this.knex.whereNotNull(d);
                    })
                })
            }

            if (optionWhere.where.between) {
                optionWhere.where.between.map(data=> {
                    this.knex.whereBetween(data[0], data[1]);
                })
            }

            if (optionWhere.where.notbetween) {
                optionWhere.where.notbetween.map(data=> {
                    this.knex.whereNotBetween(data[0], data[1]);
                })
            }

            if (optionWhere.where.operation) {
                optionWhere.where.operation.map(data=> {
                    this.knex.where(data[0], data[1], data[2]);
                })
            }

        }
        if (optionWhere.orwhere) {
            if (optionWhere.orwhere.and) {
                optionWhere.orwhere.and.map(data=> {
                    this.knex.orWhere(data[0], data[1], data[2]);
                })
            }

            if (optionWhere.orwhere.operation) {
                optionWhere.orwhere.operation.map(data=> {
                    this.knex.orWhere(data[0], data[1], data[2]);
                })
            }

            if (optionWhere.orwhere.in) {
                optionWhere.orwhere.in.map(data=> {
                    this.knex.orWhereIn(data[0], data[1]);
                })
            }

            if (optionWhere.orwhere.not) {
                optionWhere.orwhere.not.map(data=> {
                    this.knex.orWhereNot(data[0], data[1]);
                })
            }

            if (optionWhere.orwhere.notin) {
                optionWhere.orwhere.notin.map(data=> {
                    this.knex.orWhereNotIn(data[0], data[1]);
                })
            }

            if (optionWhere.orwhere.null) {
                optionWhere.orwhere.null.map(data=> {
                    data.map(d=> {
                        this.knex.orWhereNull(d);
                    })
                })
            }

            if (optionWhere.orwhere.notnull) {
                optionWhere.orwhere.notnull.map(data=> {
                    data.map(d=> {
                        this.knex.orWhereNotNull(d);
                    })
                })
            }

            if (optionWhere.orwhere.between) {
                optionWhere.orwhere.between.map(data=> {
                    this.knex.orWhereBetween(data[0], data[1]);
                })
            }

            if (optionWhere.orwhere.notbetween) {
                optionWhere.orwhere.notbetween.map(data=> {
                    this.knex.orWhereNotBetween(data[0], data[1]);
                })
            }
        }
        //if (optionWhere.where) this.knex.where(optionWhere.where);
        //if (optionWhere.whereNot) this.knex.whereNot(optionWhere.whereNot);
        //if (optionWhere.whereNotIn) this.knex.whereNotIn(optionWhere.whereNotIn);
        //if (optionWhere.whereNull) this.knex.whereNull(optionWhere.whereNull);
        //if (optionWhere.whereNotNull)  this.knex.whereNotNull(optionWhere.whereNotNull);
        //if (optionWhere.whereExists) this.knex.whereExists(optionWhere.whereExists);
        //if (optionWhere.whereNotExists) this.knex.whereNotExists(optionWhere.whereNotExists);
        //if (optionWhere.whereBetween) this.knex.whereBetween(optionWhere.whereBetween);
        //if (optionWhere.whereNotBetween)  this.knex.whereNotBetween(optionWhere.whereNotBetween);
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