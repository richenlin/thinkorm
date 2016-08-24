/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/8/18
 */
import thinkorm from '../../../index';

export default class extends thinkorm{
    init(config){
        super.init(config);
        // 是否自动迁移(默认安全模式)
        this.safe = true;
        // 数据表字段信息
        this.fields = {
            id: {
                type: 'integer',
                primaryKey: true
            },
            test: {
                type: 'string'
            }
        };
        // 数据验证
        this.validations = {};
        // 关联关系
        this.relation = {};
    }
}
