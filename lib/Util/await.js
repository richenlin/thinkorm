'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function () {
    function _class() {
        (0, _classCallCheck3.default)(this, _class);

        this.queue = {};
    }

    _class.prototype.run = function run(key, fn) {
        var _this = this;

        if (!(key in this.queue)) {
            this.queue[key] = [];
            return _promise2.default.resolve(fn()).then(function (data) {
                process.nextTick(function () {
                    _this.queue[key].forEach(function (deferred) {
                        return deferred.resolve(data);
                    });
                    delete _this.queue[key];
                });
                return data;
            }).catch(function (err) {
                process.nextTick(function () {
                    _this.queue[key].forEach(function (deferred) {
                        return deferred.reject(err);
                    });
                    delete _this.queue[key];
                });
                return _promise2.default.reject(err);
            });
        } else {
            var deferred = _lib2.default.getDefer();
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    };

    return _class;
}(); /**
      *
      * @author     richen
      * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
      * @license    MIT
      * @version    16/7/14
      */


exports.default = _class;