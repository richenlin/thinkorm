/**
 * @Author: richen 
 * @Date: 2018-03-09 08:53:36 
 * @Copyright (c) - <richenlin(at)gmail.com>
 * @Last Modified by: richen
 * @Last Modified time: 2018-03-09 09:00:53
 */
/*eslint-disable */

module.exports = function (fn) {
    return function () {
        let gen = fn.apply(this, arguments);
        return new Promise(function (resolve, reject) {
            function step(key, arg) {
                let info, value;
                try {
                    info = gen[key](arg);
                    value = info.value;
                } catch (error) {
                    reject(error);
                    return;
                }

                if (info.done) {
                    resolve(value);
                } else {
                    return Promise.resolve(value).then(function (value) {
                        step("next", value);
                    }, function (err) {
                        step("throw", err);
                    });
                }
            }

            return step("next");
        });
    };
};