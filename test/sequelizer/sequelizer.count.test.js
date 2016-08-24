var Sequelizer = require('../../lib/Util/sequelizer.js');
var analyze = require('../../lib/Util/analyze.js');
var assert = require('assert');

describe('Sequelizer ::', function() {
  describe('COUNT statements', function() {
    it('should generate a count query', function(done) {
      var tree = analyze({
        count: [
          'active'
        ],
        from: 'users'
      });

      var result = Sequelizer({
        dialect: 'postgresql',
        tree: tree
      })
        assert.equal(result.sql, 'select count("active") from "users"');
        return done();
    });
  });
});
