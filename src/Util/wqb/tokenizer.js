module.exports = function tokenizer(inputs) {
    var _ = require('lodash');
    var expression = inputs.expression;
    var results = [];

    // These are the identifiers used in RQL for various keys
    var identifiers = {
      'select': 'SELECT',
      'from': 'FROM',
      'or': 'OR',
      'and': 'AND',
      'not': 'NOT',
      'in': 'IN',
      'distinct': 'DISTINCT',
      'count': 'COUNT',
      'min': 'MIN',
      'max': 'MAX',
      'sum': 'SUM',
      'avg': 'AVG',
      'limit': 'LIMIT',
      'skip': 'SKIP',
      'groupBy': 'GROUPBY',
      'orderBy': 'ORDERBY',
      'where': 'WHERE',
      'insert': 'INSERT',
      'into': 'INTO',
      'update': 'UPDATE',
      'using': 'USING',
      'del': 'DELETE',
      'join': 'JOIN',
      'innerJoin': 'JOIN',
      'outerJoin': 'JOIN',
      'crossJoin': 'JOIN',
      'leftJoin': 'JOIN',
      'leftOuterJoin': 'JOIN',
      'rightJoin': 'JOIN',
      'rightOuterJoin': 'JOIN',
      'fullOuterJoin': 'JOIN',
      'union': 'UNION',
      'unionAll': 'UNIONALL',
      'as': 'AS',
      '>': 'OPERATOR',
      '<': 'OPERATOR',
      '<>': 'OPERATOR',
      '<=': 'OPERATOR',
      '>=': 'OPERATOR',
      'like': 'OPERATOR',
      'opts': 'OPTS'
    };

    // These are the Data Manipulation Identifiers that denote a subquery
    var DML_IDENTIFIERS = [
      'select',
      'insert',
      'update',
      'del'
    ];


    //  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗██╗███████╗███████╗██████╗
    //  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║██║╚══███╔╝██╔════╝██╔══██╗
    //     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║██║  ███╔╝ █████╗  ██████╔╝
    //     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║██║ ███╔╝  ██╔══╝  ██╔══██╗
    //     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║██║███████╗███████╗██║  ██║
    //     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // @obj {Object} - the token obj being processed
    // @processor {Object} - a value to insert between each key in the array
    var tokenizeObject = function tokenizeObject(obj, processor, parent, isSubQuery) {
      // If this obj represent a sub-query, add a sub query token
      if (isSubQuery) {
        results.push({
          type: 'SUBQUERY',
          value: null
        });
      }

      _.each(_.keys(obj), function tokenizeKey(key, idx) {
        // Check if the key is a known identifier
        var isIdentitifier = identifiers[key];

        // If so, look ahead at it's value to determine what to do next.
        if (isIdentitifier) {
          //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔╦╗╔═╗╦═╗  ╔═╗╦═╗╔═╗╔╦╗╦╔═╗╔═╗╔╦╗╔═╗╔═╗
          //  ║ ║╠═╝║╣ ╠╦╝╠═╣ ║ ║ ║╠╦╝  ╠═╝╠╦╝║╣  ║║║║  ╠═╣ ║ ║╣ ╚═╗
          //  ╚═╝╩  ╚═╝╩╚═╩ ╩ ╩ ╚═╝╩╚═  ╩  ╩╚═╚═╝═╩╝╩╚═╝╩ ╩ ╩ ╚═╝╚═╝

          // If the identifier is an OPERATOR, add it's tokens
          if (identifiers[key] === 'OPERATOR') {
            // If there is a parent and the previous key in the results isn't
            // a KEY add it's key first. This is used when a key has multiple
            // criteria. EX: { values: { '>': 100, '<': 200 }}
            if (parent && _.last(results).type !== 'KEY') {
              results.push({
                type: 'KEY',
                value: parent
              });
            }

            processOperator(key, obj[key]);
            return;
          }

          // If the identifier is an IN
          if (identifiers[key] === 'IN') {
            processIn(obj[key]);
            return;
          }

          // If the identifier is an OR, start a group and add each token.
          if (identifiers[key] === 'OR') {
            processOr(obj[key]);
            return;
          }

          // If the identifier is an AND, start a group and add each token.
          if (identifiers[key] === 'AND') {
            processAnd(obj[key]);
            return;
          }

          // If the identifier is a NOT
          if (identifiers[key] === 'NOT') {
            processNot(obj[key]);
            return;
          }

          //  ╔═╗ ╦ ╦╔═╗╦═╗╦╔═╗╔═╗
          //  ║═╬╗║ ║║╣ ╠╦╝║║╣ ╚═╗
          //  ╚═╝╚╚═╝╚═╝╩╚═╩╚═╝╚═╝

          // If the identifier is a FROM, add it's token
          if (identifiers[key] === 'FROM') {
            processFrom(obj[key]);
            return;
          }

          // If the identifier is a WHERE, add it's token and process it's values
          if (identifiers[key] === 'WHERE') {
            processWhere(obj[key]);
            return;
          }

          // If the identifier is a GROUP BY aggregation
          if (identifiers[key] === 'GROUPBY') {
            processGroupBy(obj[key]);
            return;
          }

          // If the identifier is an ORDER BY, add the sort options
          if (identifiers[key] === 'ORDERBY') {
            processOrderBy(obj[key]);
            return;
          }

          //  ╔╦╗╔╦╗╦    ╔═╗╔═╗╔╦╗╔╦╗╔═╗╔╗╔╔╦╗╔═╗
          //   ║║║║║║    ║  ║ ║║║║║║║╠═╣║║║ ║║╚═╗
          //  ═╩╝╩ ╩╩═╝  ╚═╝╚═╝╩ ╩╩ ╩╩ ╩╝╚╝═╩╝╚═╝

          // If the identifier is a SELECT, add it's token
          if (identifiers[key] === 'SELECT') {
            processSelect(obj[key]);
            return;
          }

          // If the identifier is an INSERT, add it's token
          if (identifiers[key] === 'INSERT') {
            processInsert(obj[key]);
            return;
          }

          // If the identifier is an UPDATE, add it's token
          if (identifiers[key] === 'UPDATE') {
            processUpdate(obj[key]);
            return;
          }

          // If the identifier is a DELETE, add it's token
          if (identifiers[key] === 'DELETE') {
            processDelete(obj[key]);
            return;
          }

          // If the identifier is an INTO, add it's token
          if (identifiers[key] === 'INTO') {
            processInto(obj[key]);
            return;
          }

          // If the identifier is an USING, add it's token
          if (identifiers[key] === 'USING') {
            processUsing(obj[key]);
            return;
          }

          //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔═╗╔═╗╔╦╗╔═╗╔═╗
          //  ╠═╣║ ╦║ ╦╠╦╝║╣ ║ ╦╠═╣ ║ ║╣ ╚═╗
          //  ╩ ╩╚═╝╚═╝╩╚═╚═╝╚═╝╩ ╩ ╩ ╚═╝╚═╝

          // If the identifier is a AVG
          if (identifiers[key] === 'AVG') {
            processAggregations(obj[key], 'AVG');
            return;
          }

          // If the identifier is a SUM
          if (identifiers[key] === 'SUM') {
            processAggregations(obj[key], 'SUM');
            return;
          }

          // If the identifier is a MIN
          if (identifiers[key] === 'MIN') {
            processAggregations(obj[key], 'MIN');
            return;
          }

          // If the identifier is a MAX
          if (identifiers[key] === 'MAX') {
            processAggregations(obj[key], 'MAX');
            return;
          }

          // If the identifier is a COUNT
          if (identifiers[key] === 'COUNT') {
            processAggregations(obj[key], 'COUNT');
            return;
          }

          //  ╔═╗╔╦╗╦ ╦╔═╗╦═╗
          //  ║ ║ ║ ╠═╣║╣ ╠╦╝
          //  ╚═╝ ╩ ╩ ╩╚═╝╩╚═

          // If the identifier is a LIMIT
          if (identifiers[key] === 'LIMIT') {
            processPagination(obj[key], 'LIMIT');
            return;
          }

          // If the indetifier is an SKIP
          if (identifiers[key] === 'SKIP') {
            processPagination(obj[key], 'SKIP');
            return;
          }

          // AS is only available on sub queries
          if (identifiers[key] === 'AS') {
            if (!isSubQuery) {
              return;
            }
            processAs(obj[key]);
            return;
          }

          //   ╦╔═╗╦╔╗╔╔═╗
          //   ║║ ║║║║║╚═╗
          //  ╚╝╚═╝╩╝╚╝╚═╝

          // If the identifier is a JOIN, add it's token and process the joins
          if (identifiers[key] === 'JOIN') {
            processJoin(obj[key], key);
            return;
          }

          //  ╦ ╦╔╗╔╦╔═╗╔╗╔╔═╗
          //  ║ ║║║║║║ ║║║║╚═╗
          //  ╚═╝╝╚╝╩╚═╝╝╚╝╚═╝

          // If the identifier is a UNION
          if (identifiers[key] === 'UNION') {
            processUnion(obj[key], 'UNION');
            return;
          }

          // If the identifier is a UNIONALL
          if (identifiers[key] === 'UNIONALL') {
            processUnion(obj[key], 'UNIONALL');
            return;
          }

          //  ╔═╗╔═╗╔╦╗╔═╗
          //  ║ ║╠═╝ ║ ╚═╗
          //  ╚═╝╩   ╩ ╚═╝

          // Handle any known values in the opts. Opts must be a dictionary.
          if (identifiers[key] === 'OPTS') {
            if (!_.isPlainObject(obj[key])) {
              return;
            }

            _.each(obj[key], function processOpt(val, key) {
              // Handle PG schema values
              if (key === 'schema') {
                return processSchema(val);
              }
            });

            return;
          }

          // Add the identifier
          results.push({
            type: identifiers[key],
            value: key
          });

          // If the identifier is an array, loop through each item and tokenize
          if (_.isArray(obj[key])) {
            _.each(obj[key], function tokenizeJoinPiece(expr) {
              tokenizeObject(expr);
            });

            return;
          }

          // If the identifier is an object, continue tokenizing it
          if (_.isPlainObject(obj[key])) {
            tokenizeObject(obj[key], undefined, key);
            return;
          }

          // Otherwise WTF?
          return;
        }

        // Otherwise add the token for the key
        results.push({
          type: 'KEY',
          value: key
        });

        // If the value is an object, recursively parse it unless it matches as
        // a sub query
        if (_.isPlainObject(obj[key])) {
          // Check if the value is a subquery first
          var subQuery = checkForSubquery(obj[key]);
          if (subQuery) {
            return;
          }

          // Otherwise parse the object
          tokenizeObject(obj[key], undefined, key);
          return;
        }

        // If the value is a primitive add it's token
        results.push({
          type: 'VALUE',
          value: obj[key]
        });

        // If there is a processor and we are not on the last key, add it as well.
        // This is used for things like:
        // {
        //   not: {
        //     firstName: 'foo',
        //     lastName: 'bar'
        //   }
        // }
        // Where we need to insert a NOT statement between each key
        if (processor && (_.keys(obj).length > idx + 1)) {
          results.push(processor);
        }
      });

      // If this obj represent a sub-query, close the sub query token
      if (isSubQuery) {
        results.push({
          type: 'ENDSUBQUERY',
          value: null
        });
      }
    };


    //  ╔═╗╦ ╦╔═╗╔═╗╦╔═  ╔═╗╔═╗╦═╗  ╔═╗╦ ╦╔╗ ╔═╗ ╦ ╦╔═╗╦═╗╦ ╦
    //  ║  ╠═╣║╣ ║  ╠╩╗  ╠╣ ║ ║╠╦╝  ╚═╗║ ║╠╩╗║═╬╗║ ║║╣ ╠╦╝╚╦╝
    //  ╚═╝╩ ╩╚═╝╚═╝╩ ╩  ╚  ╚═╝╩╚═  ╚═╝╚═╝╚═╝╚═╝╚╚═╝╚═╝╩╚═ ╩
    var checkForSubquery = function checkForSubquery(value) {
      var isSubquery = false;

      // Check if the object has any top level DML identifiers
      _.each(value, function checkForIdentifier(val, key) {
        if (_.indexOf(DML_IDENTIFIERS, key) < 0) {
          return;
        }
        isSubquery = true;
      });

      // If this is a sub query, tokenize it as such
      if (isSubquery) {
        tokenizeObject(value, undefined, undefined, isSubquery);
        return isSubquery;
      }

      return isSubquery;
    };


    //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔╦╗╔═╗╦═╗╔═╗
    //  ║ ║╠═╝║╣ ╠╦╝╠═╣ ║ ║ ║╠╦╝╚═╗
    //  ╚═╝╩  ╚═╝╩╚═╩ ╩ ╩ ╚═╝╩╚═╚═╝
    var processOperator = function processOperator(operator, value) {
      // Add the operator to the results
      results.push({
        type: 'OPERATOR',
        value: operator
      });

      // Add the value to the results
      results.push({
        type: 'VALUE',
        value: value
      });

      // Add the operator to the results
      results.push({
        type: 'ENDOPERATOR',
        value: operator
      });
    };


    //  ╔═╗╔═╗╦  ╔═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╚═╗║╣ ║  ║╣ ║   ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩═╝╚═╝╚═╝ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processSelect = function processSelect(value) {
      // Check if a distinct or other key is being used
      if (_.isPlainObject(value) && !_.isArray(value)) {
        if (value.distinct) {
          // Add the distinct to the results
          results.push({
            type: 'IDENTIFIER',
            value: 'DISTINCT'
          });

          // Add the value to the results
          results.push({
            type: 'VALUE',
            value: value.distinct
          });

          // Add the enddistinct to the results
          results.push({
            type: 'ENDIDENTIFIER',
            value: 'DISTINCT'
          });

          return;
        }
      }

      // If the value is not an array or object, add the value
      if (!_.isPlainObject(value) && !_.isArray(value)) {
        // Add the SELECT to the results
        results.push({
          type: 'IDENTIFIER',
          value: 'SELECT'
        });

        // Add the value to the results
        results.push({
          type: 'VALUE',
          value: value
        });

        // Add the ENDSELECT to the results
        results.push({
          type: 'ENDIDENTIFIER',
          value: 'SELECT'
        });

        return;
      }

      // If the value is not an array, make it one so that we can process each
      // element.
      if (!_.isArray(value)) {
        value = [value];
      }

      // Process each item in there SELECT statement and process subqueries as
      // needed.
      _.each(value, function processSelectKey(val) {
        // Add the SELECT to the results
        results.push({
          type: 'IDENTIFIER',
          value: 'SELECT'
        });

        // If the value isn't an object, no need to process it further
        if (!_.isPlainObject(val)) {
          results.push({
            type: 'VALUE',
            value: val
          });
        }

        // Check if the object is a sub-query
        if (_.isPlainObject(val)) {
          var isSubquery = checkForSubquery(val);

          // If it's not, add it's value
          if (!isSubquery) {
            results.push({
              type: 'VALUE',
              value: val
            });
          }
        }

        // Add the ENDSELECT to the results
        results.push({
          type: 'ENDIDENTIFIER',
          value: 'SELECT'
        });
      });
    };


    //  ╔═╗╦═╗╔═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ╠╣ ╠╦╝║ ║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚  ╩╚═╚═╝╩ ╩  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processFrom = function processFrom(value) {
      // Check if a schema is being used
      if (_.isPlainObject(value)) {
        // Add the FROM identifier
        results.push({
          type: 'IDENTIFIER',
          value: 'FROM'
        });

        // Check if a subquery is being used
        var isSubQuery = checkForSubquery(value);

        if (!isSubQuery && value.table) {
          results.push({
            type: 'VALUE',
            value: value.table
          });
        }

        results.push({
          type: 'ENDIDENTIFIER',
          value: 'FROM'
        });

        return;
      }

      // Otherwise just add the FROM identifier and value
      results.push({
        type: 'IDENTIFIER',
        value: 'FROM'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'FROM'
      });
    };


    //  ╔═╗╔═╗╦ ╦╔═╗╔╦╗╔═╗  ╔═╗╔═╗╔╦╗
    //  ╚═╗║  ╠═╣║╣ ║║║╠═╣  ║ ║╠═╝ ║
    //  ╚═╝╚═╝╩ ╩╚═╝╩ ╩╩ ╩  ╚═╝╩   ╩
    var processSchema = function processSchema(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'SCHEMA'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'SCHEMA'
      });
    };


    //  ╦╔╗╔╔═╗╔═╗╦═╗╔╦╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║╚═╗║╣ ╠╦╝ ║   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝╚═╝╚═╝╩╚═ ╩   ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processInsert = function processInsert(value) {
      // Add the insert statment
      results.push({
        type: 'IDENTIFIER',
        value: 'INSERT'
      });

      // Check if a value is being used
      if (_.isObject(value)) {
        _.each(_.keys(value), function appendInsertValue(key) {
          results.push({
            type: 'KEY',
            value: key
          });

          results.push({
            type: 'VALUE',
            value: value[key]
          });
        });
      }

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'INSERT'
      });
    };


    //  ╦╔╗╔╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║║ ║ ║ ║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╩╝╚╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processInto = function processInto(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'INTO'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'INTO'
      });
    };


    //  ╦ ╦╔═╗╔╦╗╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╠═╝ ║║╠═╣ ║ ║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╩  ═╩╝╩ ╩ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processUpdate = function processUpdate(value) {
      // Add the update statment
      results.push({
        type: 'IDENTIFIER',
        value: 'UPDATE'
      });

      // Check if a value is being used
      if (_.isObject(value)) {
        _.each(_.keys(value), function appendUpdateValue(key) {
          results.push({
            type: 'KEY',
            value: key
          });

          results.push({
            type: 'VALUE',
            value: value[key]
          });
        });
      }

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'UPDATE'
      });
    };


    //  ╦ ╦╔═╗╦╔╗╔╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ║╚═╗║║║║║ ╦  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚═╝╚═╝╩╝╚╝╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processUsing = function processUsing(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'USING'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'USING'
      });
    };


    //  ╔╦╗╔═╗╦  ╔═╗╔╦╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //   ║║║╣ ║  ║╣  ║ ║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ═╩╝╚═╝╩═╝╚═╝ ╩ ╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processDelete = function processDelete() {
      results.push({
        type: 'IDENTIFIER',
        value: 'DELETE'
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'DELETE'
      });
    };


    //  ╔╗╔╔═╗╔╦╗  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔
    //  ║║║║ ║ ║   ║  ║ ║║║║ ║║║ ║ ║║ ║║║║
    //  ╝╚╝╚═╝ ╩   ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝
    var processNot = function processNot(value) {
      // Add a condition
      var condition = {
        type: 'CONDITION',
        value: 'NOT'
      };

      results.push(condition);

      // Tokenize the values within the condition
      if (_.isPlainObject(value)) {
        tokenizeObject(value, condition);
        return;
      }

      // Otherwise just add the value
      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDCONDITION',
        value: 'NOT'
      });
    };


    //  ╦╔╗╔  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔
    //  ║║║║  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║
    //  ╩╝╚╝  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝
    var processIn = function processIn(value) {
      // Add a condition
      results.push({
        type: 'CONDITION',
        value: 'IN'
      });

      // If the value isn't an object, no need to process it further
      if (!_.isPlainObject(value)) {
        results.push({
          type: 'VALUE',
          value: value
        });
      }

      // Check if the object is a sub-query
      if (_.isPlainObject(value)) {
        var isSubquery = checkForSubquery(value);

        // If it's not, add it's value
        if (!isSubquery) {
          results.push({
            type: 'VALUE',
            value: value
          });
        }
      }

      results.push({
        type: 'ENDCONDITION',
        value: 'IN'
      });
    };


    //  ╦ ╦╦ ╦╔═╗╦═╗╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║║║╠═╣║╣ ╠╦╝║╣   ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║
    //  ╚╩╝╩ ╩╚═╝╩╚═╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩
    var processWhere = function processWhere(value) {
      // Tokenize the where and then call the tokenizer on the where values
      results.push({
        type: 'IDENTIFIER',
        value: 'WHERE'
      });

      tokenizeObject(value);

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'WHERE'
      });
    };


    //  ╔═╗╦═╗  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
    //  ║ ║╠╦╝  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
    //  ╚═╝╩╚═  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝
    var processOr = function processOr(value) {
      // Add the Or token
      results.push({
        type: 'CONDITION',
        value: 'OR'
      });

      // For each condition in the OR, add a group token and process the criteria.
      _.forEach(value, function appendOrCrieria(criteria, idx) {
        // Start a group
        results.push({
          type: 'GROUP',
          value: idx
        });

        tokenizeObject(criteria);

        // End a group
        results.push({
          type: 'ENDGROUP',
          value: idx
        });
      });

      // Close the condition
      results.push({
        type: 'ENDCONDITION',
        value: 'OR'
      });
    };


    //  ╔═╗╔╗╔╔╦╗  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
    //  ╠═╣║║║ ║║  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
    //  ╩ ╩╝╚╝═╩╝  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝
    var processAnd = function processAnd(value) {
      // Only process grouped AND's if the value is an array
      if (!_.isArray(value)) {
        return;
      }

      // Add the AND token
      results.push({
        type: 'CONDITION',
        value: 'AND'
      });

      // For each condition in the OR, add a group token and process the criteria.
      _.forEach(value, function appendAndCrieria(criteria, idx) {
        // Start a group
        results.push({
          type: 'GROUP',
          value: idx
        });

        tokenizeObject(criteria);

        // End a group
        results.push({
          type: 'ENDGROUP',
          value: idx
        });
      });

      // Close the condition
      results.push({
        type: 'ENDCONDITION',
        value: 'AND'
      });
    };


    //   ╦╔═╗╦╔╗╔  ╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╦╗╔═╗╔╗╔╔╦╗╔═╗
    //   ║║ ║║║║║  ╚═╗ ║ ╠═╣ ║ ║╣ ║║║║╣ ║║║ ║ ╚═╗
    //  ╚╝╚═╝╩╝╚╝  ╚═╝ ╩ ╩ ╩ ╩ ╚═╝╩ ╩╚═╝╝╚╝ ╩ ╚═╝
    var processJoin = function processJoin(value, joinType) {
      // Ensure we have an array value
      if (!_.isArray(value)) {
        value = [value];
      }

      _.each(value, function processJoinInstructions(joinInstructions) {
        // Add a JOIN token
        results.push({
          type: 'IDENTIFIER',
          value: joinType.toUpperCase()
        });

        // Ensure the instructions include a FROM and an ON and that the ON
        // is made up of two table keys.
        if (!_.has(joinInstructions, 'from') || !_.has(joinInstructions, 'on')) {
          throw new Error('Invalid join instructions');
        }

        // Check if this is an AND or an OR join statement. An AND statement will
        // just be an array of conditions and an OR statement will have a single
        // OR key as the value.

        // Process AND
        if (_.isArray(joinInstructions.on)) {
          (function andInstructions() {
            var JOIN_TABLE = joinInstructions.from;
            var joinResults = [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: JOIN_TABLE }
            ];

            _.each(joinInstructions.on, function onSet(set) {
              var PARENT_TABLE = _.first(_.keys(set));
              var CHILD_TABLE = _.keys(set)[1];
              var PARENT_COLUMN = set[_.first(_.keys(set))];
              var CHILD_COLUMN = set[_.keys(set)[1]];

              var setKeys = [
                { type: 'COMBINATOR', value: 'AND' },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: PARENT_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: PARENT_COLUMN },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: CHILD_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: CHILD_COLUMN }
              ];

              joinResults = joinResults.concat(setKeys);
            });

            // Add the join results to the token set
            results = results.concat(joinResults);
          })();

          // Process OR
        } else if (_.isArray(joinInstructions.on.or)) {
          (function orInstructions() {
            var JOIN_TABLE = joinInstructions.from;
            var joinResults = [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: JOIN_TABLE }
            ];

            _.each(joinInstructions.on.or, function orSet(set) {
              var PARENT_TABLE = _.first(_.keys(set));
              var CHILD_TABLE = _.keys(set)[1];
              var PARENT_COLUMN = set[_.first(_.keys(set))];
              var CHILD_COLUMN = set[_.keys(set)[1]];

              var setKeys = [
                { type: 'COMBINATOR', value: 'OR' },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: PARENT_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: PARENT_COLUMN },
                { type: 'KEY', value: 'TABLE_KEY' },
                { type: 'VALUE', value: CHILD_TABLE },
                { type: 'KEY', value: 'COLUMN_KEY' },
                { type: 'VALUE', value: CHILD_COLUMN }
              ];

              joinResults = joinResults.concat(setKeys);
            });

            // Add the join results to the token set
            results = results.concat(joinResults);
          })();

          // Otherwise ensure that the ON key has two keys
        } else if (!_.isPlainObject(joinInstructions.on) || _.keys(joinInstructions.on).length !== 2) {
          throw new Error('Invalid join instructions');

          // Handle normal, single level joins
        } else {
          (function buildJoinResults() {
            var JOIN_TABLE = joinInstructions.from;
            var PARENT_TABLE = _.first(_.keys(joinInstructions.on));
            var CHILD_TABLE = _.keys(joinInstructions.on)[1];
            var PARENT_COLUMN = joinInstructions.on[_.first(_.keys(joinInstructions.on))];
            var CHILD_COLUMN = joinInstructions.on[_.keys(joinInstructions.on)[1]];

            var joinResults = [
              { type: 'KEY', value: 'TABLE' },
              { type: 'VALUE', value: JOIN_TABLE },
              { type: 'KEY', value: 'TABLE_KEY' },
              { type: 'VALUE', value: PARENT_TABLE },
              { type: 'KEY', value: 'COLUMN_KEY' },
              { type: 'VALUE', value: PARENT_COLUMN },
              { type: 'KEY', value: 'TABLE_KEY' },
              { type: 'VALUE', value: CHILD_TABLE },
              { type: 'KEY', value: 'COLUMN_KEY' },
              { type: 'VALUE', value: CHILD_COLUMN }
            ];

            results = results.concat(joinResults);
          })();
        }

        results.push({
          type: 'ENDIDENTIFIER',
          value: joinType.toUpperCase()
        });
      });
    };


    //  ╔═╗╦═╗╔═╗╦ ╦╔═╗  ╔╗ ╦ ╦
    //  ║ ╦╠╦╝║ ║║ ║╠═╝  ╠╩╗╚╦╝
    //  ╚═╝╩╚═╚═╝╚═╝╩    ╚═╝ ╩
    var processGroupBy = function processGroupBy(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'GROUPBY'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'GROUPBY'
      });
    };


    //  ╔═╗╦═╗╔╦╗╔═╗╦═╗  ╔╗ ╦ ╦
    //  ║ ║╠╦╝ ║║║╣ ╠╦╝  ╠╩╗╚╦╝
    //  ╚═╝╩╚══╩╝╚═╝╩╚═  ╚═╝ ╩
    var processOrderBy = function processOrderBy(values) {
      // Tokenize the order by and then call the tokenizer on the values
      results.push({
        type: 'IDENTIFIER',
        value: 'ORDERBY'
      });

      if (!_.isArray(values)) {
        values = [values];
      }

      _.each(values, function tokenizeSet(tokenSet) {
        tokenizeObject(tokenSet);
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'ORDERBY'
      });
    };


    //  ╔═╗╔═╗╔═╗╦═╗╔═╗╔═╗╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
    //  ╠═╣║ ╦║ ╦╠╦╝║╣ ║ ╦╠═╣ ║ ║║ ║║║║╚═╗
    //  ╩ ╩╚═╝╚═╝╩╚═╚═╝╚═╝╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
    var processAggregations = function processAggregations(value, aggregation) {
      results.push({
        type: 'IDENTIFIER',
        value: aggregation
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: aggregation
      });
    };


    //  ╔═╗╔═╗╔═╗╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔
    //  ╠═╝╠═╣║ ╦║║║║╠═╣ ║ ║║ ║║║║
    //  ╩  ╩ ╩╚═╝╩╝╚╝╩ ╩ ╩ ╩╚═╝╝╚╝
    var processPagination = function processPagination(value, operator) {
      results.push({
        type: 'IDENTIFIER',
        value: operator
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: operator
      });
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╦ ╦╔╗╔╦╔═╗╔╗╔
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║ ║║║║║║ ║║║║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╝╚╝╩╚═╝╝╚╝
    var processUnion = function processUnion(values, type) {
      results.push({
        type: 'UNION',
        value: type
      });

      _.each(values, function processUnionValue(value, idx) {
        // Start each union subquery with an ENDGROUP
        results.push({
          type: 'GROUP',
          value: idx
        });

        // Build the subquery
        checkForSubquery(value);

        // Close each subquery with an ENDGROUP token
        results.push({
          type: 'ENDGROUP',
          value: idx
        });
      });

      results.push({
        type: 'ENDUNION',
        value: type
      });
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╔═╗
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ╠═╣╚═╗
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╩ ╩╚═╝
    var processAs = function processAs(value) {
      results.push({
        type: 'IDENTIFIER',
        value: 'AS'
      });

      results.push({
        type: 'VALUE',
        value: value
      });

      results.push({
        type: 'ENDIDENTIFIER',
        value: 'AS'
      });
    };

    // Kick off recursive parsing of the RQL object
    tokenizeObject(expression);

    return results;


};
