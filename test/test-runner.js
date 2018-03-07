/**
 * Given a db flavor and a query object, generate the SQL statement and test
 * it against the expected outcome.
 */
/*eslint-disable */
const assert = require('assert');
const promise = require('bluebird');
const path = require('path');
const {model, helper} = require('../index.js');


class User extends model {
    init(config) {
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                primaryKey: true
            }
        };
        this.modelName = 'User';
    }
}
process.env.NODE_ENV = 'development';

module.exports = function (test, cb) {
    const testDialect = async function(outcome, next) {
        let model = new User(outcome.config);
        let instance = await model.getInstance();
        let parser = instance.parser;

        for (let n in outcome.query) {
            model = model[n](outcome.query[n]);
        }

        let options = helper.parseOptions(model, outcome.options);
        let result = await parser.buildSql(outcome.client, options);

        try {
            assert.equal(result, outcome.sql);
            next();
        } catch (e) {
            return cb(e);
        };
    };

    promise.reduce(test.outcomes, function(index){
        return testDialect(index, cb);
    });
};
