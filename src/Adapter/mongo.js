/**
 * Created by lihao on 16/8/2.
 */
import base from '../base';
import parser from '../Parser/mongo';
import socket from '../Socket/mongo';

export default class extends base {

    init(config = {}) {
        this.config = config;
    }

    connect() {
        if (this.handel) {
            return this.handel;
        }
        this.handel = new socket(this.config);
        return this.handel;
    }

    close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    }

    /**
     * 语法解析器
     */
    parsers() {
        if (!this.parsercls) {
            this.parsercls = new parser(this.config);
        }
        return this.parsercls;
    }

    /**
     * 查询
     * @param options
     */
    select(options) {
        console.log(options)
        this.parsers().parseTableAndType(options.table, 'select');
        this.parsers().parseWhere(options.where);
        this.parsers().buildSql();
    }


}

