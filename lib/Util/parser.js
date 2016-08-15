'use strict';

exports.__esModule = true;

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

exports.default = parseWhere;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/14
 */

var identifiers = {
    OR: 'OR',
    AND: 'AND',
    NOT: 'NOT',
    NOTIN: 'NOTIN',
    IN: 'IN',
    NULL: 'NULL',
    NOTNULL: 'NOTNULL',
    BETWEEN: 'BETWEEN',
    NOTBETWEEN: 'NOTBETWEEN',
    '>': 'OPERATOR',
    '<': 'OPERATOR',
    '<>': 'OPERATOR',
    '<=': 'OPERATOR',
    '>=': 'OPERATOR'
};
/*******************此方法将要将where条件解析为knex可用格式**********************/
//where = {
//    //此项表示id=1,name=a
//    and: [[id, 1], [name, a]],
//    //此项表示id !=1
//    not: [[id, 1], [name, a]],
//    //此项表示id in(1,2)
//    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
//    //此项表示id not in(1,2)
//    notin: [[id, [1, 2, 3]]],
//    //此项不表示id >= 1
//    operator: [[id, '>', 1]],
//}
//orwhere = {
//    //此项表示id=1,name=a
//    and: [[id, 1], [name, a]],
//    //此项表示id !=1
//    not: [[id, 1], [name, a]],
//    //此项表示id in(1,2)
//    in: [[id, [1, 2, 3]], [name, [1, 2, 3]]],
//    //此项表示id not in(1,2)
//    notin: [[id, [1, 2, 3]]],
//    //此项不表示id >= 1
//    operator: [[id, '>', 1]],
//}
/**************************************************************************/
function parseWhere(options, key, value, k) {
    var isor = arguments.length <= 4 || arguments[4] === undefined ? false : arguments[4];

    var idt = key.toUpperCase();
    switch (identifiers[idt]) {
        case 'OR':
            for (var _iterator = value, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                var _ref;

                if (_isArray) {
                    if (_i >= _iterator.length) break;
                    _ref = _iterator[_i++];
                } else {
                    _i = _iterator.next();
                    if (_i.done) break;
                    _ref = _i.value;
                }

                var m = _ref;

                for (var o in m) {
                    parseWhere(options, o, m[o], o, true);
                }
            }
            break;
        //id:{in:[1,2,3,4]}
        case 'IN':
            for (var n in value) {
                isor ? options.orwhere.in.push([n, value[n]]) : options.where.in.push([n, value[n]]);
                //if (isor) {
                //    options.orwhere.in.push([n, value[n]]);
                //} else {
                //    options.where.in.push([n, value[n]]);
                //}
            }
            break;
        case 'NOTIN':
            for (var _n in value) {
                isor ? options.orwhere.notin.push([_n, value[_n]]) : options.where.notin.push([_n, value[_n]]);
                //if (isor) {
                //    options.orwhere.notin.push([n, value[n]]);
                //} else {
                //    options.where.notin.push([n, value[n]]);
                //}
            }
            break;
        case 'NULL':
            if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
            isor ? options.orwhere.null.push(value) : options.where.null.push(value);
            //if (isor) {
            //    options.orwhere.null.push(value);
            //} else {
            //    options.where.null.push(value);
            //}
            break;
        case 'NOTNULL':
            if (ORM.isString(value) && value.indexOf(',') > -1) value = value.split(',');
            isor ? options.orwhere.notnull.push(value) : options.where.notnull.push(value);
            //if (isor) {
            //    options.orwhere.null.push(value);
            //} else {
            //    options.where.null.push(value);
            //}
            break;
        case 'BETWEEN':
            isor ? options.orwhere.between.push([k, value]) : options.where.between.push([k, value]);
            return;
            break;
        case 'NOTBETWEEN':
            isor ? options.orwhere.notbetween.push([k, value]) : options.where.notbetween.push([k, value]);
            break;
        case 'NOT':
            for (var _n2 in value) {
                isor ? options.orwhere.not.push([_n2, value[_n2]]) : options.where.not.push([_n2, value[_n2]]);
                //if (isor) {
                //    options.orwhere.not.push([n, value[n]]);
                //} else {
                //    options.where.not.push([n, value[n]]);
                //}
            }

            break;
        case 'OPERATOR':
            isor ? options.orwhere.operation.push([k, key, value]) : options.where.operation.push([k, key, value]);
            //if (isor) {
            //    options.orwhere.operation.push([k, key, value])
            //} else {
            //    options.where.operation.push([k, key, value])
            //}
            break;
        case 'AND':
        default:
            if (ORM.isJSONObj(value)) {
                for (var _n3 in value) {
                    parseWhere(options, _n3, value[_n3], key, isor);
                }
                //} else if (isor) {
                //    options.orwhere.and.push([key, '=', value]);
            } else {
                isor ? options.orwhere.and.push([key, '=', value]) : options.where.and.push([key, '=', value]);
                //options.where.and.push([key, '=', value]);
            }
            break;
    }
}