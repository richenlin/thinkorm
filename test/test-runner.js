/**
 * Given a db flavor and a query object, generate the SQL statement and test
 * it against the expected outcome.
 */
/*eslint-disable */
const assert = require('assert');
const async = require('async');
const path = require('path');
const genPromise = require('./genPromise.js');
const { helper } = require('liteq');
const { BaseModel } = require('../dist/index');


class User extends BaseModel {
    init(config) {
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                pk: true
            }
        };
        this.modelName = 'User';
    }
}
process.env.NODE_ENV = 'development';

module.exports = function (test, cb) {
    const testDialect = function (outcome, next) {
        let model = new User(outcome.config);

        for (let n in outcome.query) {
            model = model[n](outcome.query[n]);
        }
        return genPromise(function* () {
            let options = helper.parseOptions(model, outcome.options);
            let instance = yield model.getInstance();
            let parser = instance.parser;
            let result = yield parser.buildSql(outcome.config, outcome.client, options);

            try {
                // echo([outcome.dialect, result])
                assert.equal(result, outcome.sql);
                next();
            } catch (e) {
                return cb(e);
            };
        })();
    };

    async.each(test.outcomes, testDialect, cb);
};
