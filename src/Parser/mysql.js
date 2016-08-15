/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/14
 */
import base from './base';
import Knex from 'knex';

export default class extends base {
    init(config = {}) {
        super.init(config);
        this.knexClient = Knex({
            client: 'mysql'
        });
    }
}
