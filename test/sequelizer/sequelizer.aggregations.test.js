var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('Aggregations', function() {
    it('should generate a group by query', function(done) {
      var tree = analyze({
        select: '*',
        from: 'users',
        groupBy: ['count']
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      });

      assert.equal(result.sql, 'select * from "users" group by "count"');
      return done();
    });

    it('should generate a MIN query', function(done) {
      var tree = analyze({
        min: [
          'active'
        ],
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'select min("active") from "users"');
        return done();
    });

    it('should generate a MAX query', function(done) {
      var tree = analyze({
        max: [
          'active'
        ],
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'select max("active") from "users"');
        return done();
    });

    it('should generate a SUM query', function(done) {
      var tree = analyze({
        sum: [
          'active'
        ],
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'select sum("active") from "users"');
        return done();
    });

    it('should generate a AVG query', function(done) {
      var tree = analyze({
        avg: [
          'active'
        ],
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'select avg("active") from "users"');
        return done();
    });
  });
});
