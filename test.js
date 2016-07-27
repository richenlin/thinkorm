/**
 * Created by lihao on 16/7/26.
 */
var Model = require('./lib/Model').default;
var model = new Model();
model
    .field(['id', 'name'])
    .where({'user.id': 1})
    .order([{id: 'asc', name: 'desc'}])
    .group('id')
    .limit(1, 10)
    .join([
        {
            from: 'contacts',
            on: {
                or: [
                    {
                        accounts: 'id',
                        users: 'account_id'
                    },
                    {
                        accounts: 'owner_id',
                        users: 'id'
                    }
                ]
            }
        }
    ]).decrement('id', 10);