"use strict";

exports.__esModule = true;

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
var _class = function () {
    function _class() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
        (0, _classCallCheck3.default)(this, _class);

        this.options = options;
        //构建连接池
        this.handel = null;
    }

    _class.prototype.db = function db() {
        return this.handel;
    };

    _class.prototype.schema = function schema() {
        return this.handel.schema();
    };

    return _class;
}();

exports.default = _class;