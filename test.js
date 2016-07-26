/**
 * Created by lihao on 16/7/26.
 */
var Model = require('./lib/Model').default;
var model = new Model();
model.field(['id', 'name']).where({id: 1}).order('id').group('id').limit(1, 10).find();