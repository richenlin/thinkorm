/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/14
 */
import lib from '../Util/lib';

export default class {
    constructor(){
        this.queue = {};
    }

    run(key, fn){
        if(!(key in this.queue)){
            this.queue[key] = [];
            return Promise.resolve(fn()).then(data => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.resolve(data));
                    delete this.queue[key];
                });
                return data;
            }).catch(err => {
                process.nextTick(() => {
                    this.queue[key].forEach(deferred => deferred.reject(err));
                    delete this.queue[key];
                });
                return Promise.reject(err);
            });
        } else {
            let deferred = lib.getDefer();
            this.queue[key].push(deferred);
            return deferred.promise;
        }
    }
}
