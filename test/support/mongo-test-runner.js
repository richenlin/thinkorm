/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/26
 */
var assert = require('assert');
var async = require('async');
var path = require('path');
var thinkorm = require('../../index.js');
var User = thinkorm.require(path.dirname(path.dirname(__dirname)) + '/exmple/model/lib/mongo/User.js');
function requireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}
var _aToG = require('babel-runtime/helpers/asyncToGenerator');
var _asyncToGenerator = requireDefault(_aToG);

module.exports = function (test, cb) {
    var testDialect = function testDialect(outcome, next) {

        var model = new User(outcome.config);

        var parser = new (outcome.parser)(outcome.config);
        for (var n in outcome.query) {
            model = model[n](outcome.query[n]);
        }
        var options = model._parseOptions(outcome.options);
        return (0, _asyncToGenerator.default)(function* () {
            var queryBody = yield parser.buildSql(outcome.client, options);

            try {
                assert.deepEqual(queryBody, outcome.queryBody);
                next();
            } catch (e) {
                return cb(e);
            }

        })();
    };

    async.each(test.outcomes, testDialect, cb);
};