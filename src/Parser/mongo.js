/**
 * Created by lihao on 16/8/2.
 */
import base from '../base';
import builder from 'mongo-sql';
export default class extends base {
    init(config = {}) {
        this.config = config;
        this.jsonObj = {};
        this.lastsql = '';
    }


    /**
     * 解析表名,操作类型
     * @param table
     */
    parseTableAndType(table, type) {
        this.jsonObj.type = type;
        this.jsonObj.table = table;
    }

    /**
     * 解析条件
     * @param where
     */
    parseWhere(where) {
        let where = {};
        let identifiers = {
            '>': '$gt',
            '>=': '$gte',
            '<': '$lt',
            '<=': '$lte',
            'or': '$or',
            'in': '$in',
            'notin': '$nin',
        }
        let parse = function (key, value) {
            if (identifiers[key]) {
                if (ORM.isArray(value)) {
                    where[identifiers[key]] = [];
                    value.map(item=> {
                        where[identifiers[key]].push(parse())
                    })
                }
            }
        }
    }

    /**
     * 生成查询语句
     */
    buildSql() {
        let mongosql = builder.sql(this.jsonObj);
        this.lastsql = mongosql.toString();
        console.log(this.lastsql);
        return this.lastsql;
    }
}