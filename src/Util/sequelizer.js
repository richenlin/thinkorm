 module.exports = function (inputs) {
    var _ = require('lodash');
    var knex = require('knex')({
      dialect: inputs.dialect,
      useNullAsDefault: true
    });


    //  ███████╗███████╗ ██████╗ ██╗   ██╗███████╗██╗     ██╗███████╗███████╗██████╗
    //  ██╔════╝██╔════╝██╔═══██╗██║   ██║██╔════╝██║     ██║╚══███╔╝██╔════╝██╔══██╗
    //  ███████╗█████╗  ██║   ██║██║   ██║█████╗  ██║     ██║  ███╔╝ █████╗  ██████╔╝
    //  ╚════██║██╔══╝  ██║▄▄ ██║██║   ██║██╔══╝  ██║     ██║ ███╔╝  ██╔══╝  ██╔══██╗
    //  ███████║███████╗╚██████╔╝╚██████╔╝███████╗███████╗██║███████╗███████╗██║  ██║
    //  ╚══════╝╚══════╝ ╚══▀▀═╝  ╚═════╝ ╚══════╝╚══════╝╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // Takes a set of grouped tokens from the Analyzer and turns them into a
    // parameterized SQL query using the Knex query builder.


    //  ╔╗ ╦ ╦╦╦  ╔╦╗  ╔═╗ ╦ ╦╔═╗╦═╗╦ ╦  ╔═╗╦╔═╗╔═╗╔═╗
    //  ╠╩╗║ ║║║   ║║  ║═╬╗║ ║║╣ ╠╦╝╚╦╝  ╠═╝║║╣ ║  ║╣
    //  ╚═╝╚═╝╩╩═╝═╩╝  ╚═╝╚╚═╝╚═╝╩╚═ ╩   ╩  ╩╚═╝╚═╝╚═╝
    //
    // Applys a function to the Knex query builder.
    var buildQueryPiece = function buildQueryPiece(fn, expression, query) {
      // Ensure the value is always an array
      if (!_.isArray(expression)) {
        expression = [expression];
      }

      query[fn].apply(query, expression);
    };


    //  ╔═╗╦ ╦╔═╗╔═╗╦╔═  ╔═╗╔═╗╦═╗  ╔╦╗╔═╗╔╦╗╦╔═╗╦╔═╗╦═╗╔═╗
    //  ║  ╠═╣║╣ ║  ╠╩╗  ╠╣ ║ ║╠╦╝  ║║║║ ║ ║║║╠╣ ║║╣ ╠╦╝╚═╗
    //  ╚═╝╩ ╩╚═╝╚═╝╩ ╩  ╚  ╚═╝╩╚═  ╩ ╩╚═╝═╩╝╩╚  ╩╚═╝╩╚═╚═╝
    //
    // Check for any embedded combinators (OR) or modifiers (NOT) in a single
    // expression set.
    var checkForModifiers = function checkForModifiers(expr, options) {
      var combinator;
      var modifiers = [];

      // Default to removing the values from the array
      // var strip = options && options.strip ? options.strip : true;
      options = _.defaults(options, { strip: true });

      // Normalize strip attibutes
      if (options.strip === true) {
        options.strip = '*';
      }

      // Check for any encoded combinators and remove them
      var cIdx = _.indexOf(expr, 'AND');
      if (cIdx > -1) {
        combinator = 'AND';
        if (options.strip && (options.strip === '*' || _.indexOf(options.strip, 'AND') > -1)) {
          _.pullAt(expr, cIdx);
        }
      }

      // Check for any modifiers added to the beginning of the expression.
      // These represent things like NOT. Pull the value from the expression
      (function checkForNot() {
        var mIdx = _.indexOf(expr, 'NOT');
        if (mIdx > -1) {
          modifiers.push('NOT');
          if (options.strip && (options.strip === '*' || _.indexOf(options.strip, 'NOT') > -1)) {
            _.pullAt(expr, mIdx);
          }
        }
      })();

      (function checkForIn() {
        var mIdx = _.indexOf(expr, 'IN');
        if (mIdx > -1) {
          modifiers.push('IN');
          if (options.strip && (options.strip === '*' || _.indexOf(options.strip, 'IN') > -1)) {
            _.pullAt(expr, mIdx);
          }
        }
      })();

      return {
        combinator: combinator,
        modifier: modifiers
      };
    };


    //  ╔╗ ╦ ╦╦╦  ╔╦╗  ╦╔═╔╗╔╔═╗═╗ ╦
    //  ╠╩╗║ ║║║   ║║  ╠╩╗║║║║╣ ╔╩╦╝
    //  ╚═╝╚═╝╩╩═╝═╩╝  ╩ ╩╝╚╝╚═╝╩ ╚═
    //  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗  ╔═╗╦ ╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔
    //  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦  ╠╣ ║ ║║║║║   ║ ║║ ║║║║
    //  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝  ╚  ╚═╝╝╚╝╚═╝ ╩ ╩╚═╝╝╚╝
    //
    // Given a set of expressions, create a Knex grouping statement.
    // ex:
    // query.whereNot(function() {
    //   this.where('id', 1).orWhereNot('id', '>', 10)
    // })
    //
    // This is probably the piece that needs the most work. I would really like
    // to have the parent function figured out before it get's here so I don't
    // need to mess around with all this modifiers stuff so much. It feels
    // very brittle.
    var buildKnexGroupingFn = function buildKnexGroupingFn(expressionGroup, modifier, query) {
      // Figure out what the function should be by examining the first item
      // in the expression group. If it has any modifiers or combinators, grab
      // them. We do this so we know if the grouping should be negated or not.
      // ex: orWhereNot vs orWhere
      var modifiers = checkForModifiers(_.first(expressionGroup), {
        strip: ['NOT', 'AND']
      });

      // Default the fn value to `orWhere` unless an AND modifier was
      // specifically set
      var fn = 'orWhere';

      if (modifier && _.isArray(modifier) && _.first(modifier) === 'AND') {
        fn = 'andWhere';
      }

      // Check the modifier to see if a different function other than
      // WHERE should be used. The most common is NOT.
      if (modifiers && modifiers.modifier.length) {
        if (modifiers.modifier.length === 1) {
          if (_.first(modifiers.modifier) === 'NOT') {
            fn = 'whereNot';
          }
          if (_.first(modifiers.modifier) === 'IN') {
            fn = 'whereIn';
          }
        }

        // If there are more than 1 modifier then we need to checkout
        // the combo. Usually it's a [NOT,IN] situation.
        // For now let's assume it will only ever be 2 items.
        if (modifiers.modifier.length > 1) {
          var first = _.first(_.pullAt(modifiers.modifier, 0));
          var second = _.first(_.pullAt(modifiers.modifier, 0));

          if (first === 'NOT' && second === 'IN') {
            // Push the NOT back on to the first expression
            _.first(expressionGroup).unshift('NOT');
          }
        }
      }

      // Build a function that when called, creates a nested grouping of statements.
      query[fn].call(query, function buildGroupFn() {
        var self = this;

        // Process each expression in the group, building up a query as it goes.
        _.each(expressionGroup, function processGroupExpr(expr, idx) {
          // default the _fn to `orWhere`
          var _fn = 'orWhere';

          // Check for any modifiers and combinators in this expression piece
          var modifiers = checkForModifiers(expr);

          // Check the modifier to see what fn to use
          if (modifiers.modifier.length) {
            if (modifiers.modifier.length === 1) {
              if (_.first(modifiers.modifier) === 'NOT') {
                // Handle WHERE NOT
                if (modifiers.combinator === 'AND') {
                  _fn = 'whereNot';
                }

                // Defaults to OR when grouping
                if (modifiers.combinator === 'OR' || !modifiers.combinator) {
                  _fn = 'orWhereNot';
                  modifiers.combinator = 'OR';
                }
              }
            }

            // If we end up with something like [AND, NOT, IN].
            // Throw out the AND.
            if (modifiers.modifier.length > 1) {
              if (_.first(modifiers.modifier) === 'AND') {
                _.pullAt(modifiers.modifier, 0);
              }

              var first = _.first(_.pullAt(modifiers.modifier, 0));
              var second = _.first(_.pullAt(modifiers.modifier, 0));

              if (first === 'NOT' && second === 'IN') {
                _fn = 'orWhereNotIn';
              }
            }

            // Handle empty modifiers. Use this when not negating. Defaulting to
            // use the `orWhere` statement already set.
          } else {
            if (modifiers.combinator === 'AND') {
              _fn = 'where';
            }
          }

          // If the first item in the array, always force the fn to be
          // where or whereIn or whereNotIn. This is part of the way Knex works.
          if (idx === 0) {
            if (_fn === 'orWhereNotIn') {
              _fn = 'whereNotIn';
            } else if (_fn === 'orWhereIn') {
              _fn = 'whereIn';
            } else if (_fn === 'orWhereNot') {
              _fn = 'whereNot';
            } else {
              _fn = 'where';
            }
          }

          self[_fn].apply(self, expr);
        });
      });
    };


    //  ╦ ╦╦ ╦╔═╗╦═╗╔═╗  ╔═╗═╗ ╦╔═╗╦═╗╔═╗╔═╗╔═╗╦╔═╗╔╗╔  ╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
    //  ║║║╠═╣║╣ ╠╦╝║╣   ║╣ ╔╩╦╝╠═╝╠╦╝║╣ ╚═╗╚═╗║║ ║║║║  ╠╩╗║ ║║║   ║║║╣ ╠╦╝
    //  ╚╩╝╩ ╩╚═╝╩╚═╚═╝  ╚═╝╩ ╚═╩  ╩╚═╚═╝╚═╝╚═╝╩╚═╝╝╚╝  ╚═╝╚═╝╩╩═╝═╩╝╚═╝╩╚═
    //
    // Builds up an array of values that can be passed into the .where or .orWhere
    // functions of Knex.
    var whereBuilder = function whereBuilder(expr, expression) {
      // Handle KEY/VALUE pairs
      if (expr.type === 'KEY') {
        // Reset the expression for each new key, unless there was already a
        // modifier present.
        expression = expression.length > 1 ? [] : expression;
        expression.push(expr.value);
        return expression;
      }

      // Handle OPERATORS such as '>' and '<'
      if (expr.type === 'OPERATOR') {
        expression.push(expr.value);
        return expression;
      }

      // Set the value
      if (expr.type === 'VALUE') {
        expression.push(expr.value);
        return expression;
      }
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔╔═╗╦
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║╠═╣║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝╩ ╩╩═╝
    //  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗  ╔═╗╔╦╗╔═╗╔╦╗╔╦╗╔═╗╔╗╔╔╦╗
    //  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦  ╚═╗ ║ ╠═╣ ║ ║║║║╣ ║║║ ║
    //  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝  ╚═╝ ╩ ╩ ╩ ╩ ╩ ╩╚═╝╝╚╝ ╩
    //
    // Conditional statements are grouped into sets. This function processes
    // the tokens in a single one of those sets.
    var processConditionalSet = function processConditionalSet(tokens, nested, expression, modifier, query) {
      // Hold values that make up a nested expression group.
      var expressionGroup = [];

      // Loop through each expression in the group
      _.each(tokens, function processSet(groupedExpr) {
        // If there is a NOT condition, reset the expression and add the NOT
        // condition as the first item in the expression. The analyzer will
        // always put the NOT condition before an expression set.
        if (groupedExpr.type === 'CONDITION' && groupedExpr.value === 'NOT') {
          expression = [];
          expression.unshift(groupedExpr.value);
          return;
        }

        // If there is a IN condition, add the condition as the first item in
        // the expression.
        if (groupedExpr.type === 'CONDITION' && groupedExpr.value === 'IN') {
          expression.unshift(groupedExpr.value);
          return;
        }

        // If there is a AND condition, add the condition as the first item in
        // the expression.
        if (groupedExpr.type === 'CONDITION' && groupedExpr.value === 'AND') {
          expression.unshift(groupedExpr.value);
          return;
        }

        // If the grouped expression is a nested array, this represents a nested
        // OR statement. So instead of building the query outright, we want to
        // collect all the pieces that make it up and call the Knex grouping
        // function at the end.
        if (_.isArray(groupedExpr)) {
          expressionGroup.push(processGroup(groupedExpr, true, expression, modifier, query));
          return;
        }

        // If there is a KEY/OPERATOR/VALUE token, process it using the where builder
        if (groupedExpr.type === 'KEY' || groupedExpr.type === 'OPERATOR' || groupedExpr.type === 'VALUE') {
          expression = whereBuilder(groupedExpr, expression);
        }

        // If the expression's type is value after we are done processing it we
        // can add it to the query. Unless we are in a nested statement in
        // which case just add it to the expression group.
        if (groupedExpr.type === 'VALUE') {
          // Look ahead in the tokens and see if there are any more VALUE
          // expressions. If so, this will need to be an expression group so
          // that we get parenthesis around it. This is commonly used where you
          // have a criteria like the following:
          // {
          //   or: [
          //     { name: 'foo' },
          //     { age: 21, username: 'bar' }
          //   ]
          // }
          // Here we need to wrap the `age` and `username` part of the
          // expression in parenthesis.
          var hasMoreValues = _.filter(tokens, { type: 'VALUE' });

          // If there are more values, add the current expression to the group.
          // Prepend an AND statement to the beginning to show that the will
          // end up as (age = 21 and username = bar). If this was an OR statement
          // it would be processed differently because the tokens would be
          // nested arrays.
          if (hasMoreValues.length > 1) {
            expression.unshift('AND');
            expressionGroup.push(expression);
            return;
          }

          // If this is a nested expression, just update the expression group
          if (nested) {
            expressionGroup = expressionGroup.concat(expression);
            return;
          }

          expressionGroup.push(expression);
        }
      });

      // Return the expression group
      return expressionGroup;
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔╔═╗╦
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║╠═╣║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝╩ ╩╩═╝
    //
    // Process a group of values that make up a conditional.
    // Such as an OR statement.
    var processGroup = function processGroup(tokens, nested, expression, modifier, query) {
      // Loop through each expression in the group
      var expressionGroup = processConditionalSet(tokens, nested, expression, modifier, query);

      // If we are inside of a nested expression, return the group after we are
      // done processing all the tokens.
      if (nested) {
        return expressionGroup;
      }

      // Now the Knex functions need to be called. We can examine the group and
      // if there is only a single item, go ahead and just build a normal Knex
      // grouping query.
      // ex. query().orWhere([name, 'foo'])
      //
      // If there are multiple items in the set, we need to create a knex grouping
      // function.
      if (expressionGroup.length === 1) {
        // Check for any modifiers added to the beginning of the expression.
        // These represent things like NOT. Pull the value from the expression.
        var queryExpression = _.first(expressionGroup);
        var modifiers = checkForModifiers(queryExpression);

        // Default the fn value to `orWhere` unless an AND modifier was passed in
        var fn = 'orWhere';

        if (modifier && _.isArray(modifier) && _.first(modifier) === 'AND') {
          fn = 'andWhere';
        }

        // Check the modifier to see if a different function other than
        // OR WHERE should be used. The most common is OR WHERE NOT IN.
        if (modifiers.modifier.length) {
          if (modifiers.modifier.length === 1) {
            if (_.first(modifiers.modifier) === 'NOT') {
              fn = 'orWhereNot';
            }

            if (_.first(modifiers.modifier) === 'IN') {
              fn = 'orWhereIn';
            }
          }

          // If there are more than 1 modifier then we need to checkout
          // the combo. Usually it's a [NOT,IN] situation.
          // For now let's assume it will only ever be 2 items.
          if (modifiers.modifier.length > 1) {
            var first = _.first(_.pullAt(modifiers.modifier, 0));
            var second = _.first(_.pullAt(modifiers.modifier, 0));

            if (first === 'NOT' && second === 'IN') {
              fn = 'orWhereNotIn';
            }
          }
        }

        buildQueryPiece(fn, queryExpression, query);
        return;
      }

      // Otherwise build the grouping function
      buildKnexGroupingFn(expressionGroup, modifier, query);
    };


    //  ╔╦╗╔═╗╔╦╗╔═╗╦═╗╔╦╗╦╔╗╔╔═╗   ╦╔═╗╦╔╗╔
    //   ║║║╣  ║ ║╣ ╠╦╝║║║║║║║║╣    ║║ ║║║║║
    //  ═╩╝╚═╝ ╩ ╚═╝╩╚═╩ ╩╩╝╚╝╚═╝  ╚╝╚═╝╩╝╚╝
    //  ╔═╗╦ ╦╔╗╔╔═╗╔╦╗╦╔═╗╔╗╔  ╔═╗╦═╗╔═╗╔╦╗  ╦╔═╔═╗╦ ╦
    //  ╠╣ ║ ║║║║║   ║ ║║ ║║║║  ╠╣ ╠╦╝║ ║║║║  ╠╩╗║╣ ╚╦╝
    //  ╚  ╚═╝╝╚╝╚═╝ ╩ ╩╚═╝╝╚╝  ╚  ╩╚═╚═╝╩ ╩  ╩ ╩╚═╝ ╩
    //
    // Given a KEY value, find what join expression to use.
    var findJoinFunction = function findJoinFunction(key) {
      var fn;
      switch (key) {
        case 'JOIN':
          fn = 'join';
          break;
        case 'INNERJOIN':
          fn = 'innerJoin';
          break;
        case 'OUTERJOIN':
          fn = 'outerJoin';
          break;
        case 'CROSSJOIN':
          fn = 'crossJoin';
          break;
        case 'LEFTJOIN':
          fn = 'leftJoin';
          break;
        case 'LEFTOUTERJOIN':
          fn = 'leftOuterJoin';
          break;
        case 'RIGHTJOIN':
          fn = 'rightJoin';
          break;
        case 'RIGHTOUTERJOIN':
          fn = 'rightOuterJoin';
          break;
        case 'FULLOUTERJOIN':
          fn = 'fullOuterJoin';
          break;
      }

      return fn;
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╦  ╔═╗╔╦╗   ╦╔═╗╦╔╗╔
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ╠╣ ║  ╠═╣ ║    ║║ ║║║║║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚  ╩═╝╩ ╩ ╩   ╚╝╚═╝╩╝╚╝
    //
    // Process a flat join. This is a join that doesn't need to be wrapped in
    // parenthesis.
    var processFlatJoin = function processFlatJoin(tokens, joinType, query) {
      // A JOIN token array assumes the following structure
      // { type: 'KEY', value: 'TABLE' },
      // { type: 'VALUE', value: 'contacts' },
      // { type: 'KEY', value: 'TABLE_KEY' },
      // { type: 'VALUE', value: 'users' },
      // { type: 'KEY', value: 'COLUMN_KEY' },
      // { type: 'VALUE', value: 'id' },
      // { type: 'KEY', value: 'TABLE_KEY' },
      // { type: 'VALUE', value: 'contacts' },
      // { type: 'KEY', value: 'COLUMN_KEY' },
      // { type: 'VALUE', value: 'user_id' }

      // Hold the values that make up the join expression
      var JOIN_TABLE = tokens[1] && tokens[1].value;
      var PARENT_TABLE = tokens[3] && tokens[3].value;
      var CHILD_TABLE = tokens[7] && tokens[7].value;
      var PARENT_COLUMN = tokens[5] && tokens[5].value;
      var CHILD_COLUMN = tokens[9] && tokens[9].value;

      // Hold the actual expression we will pass to Knex
      var joinExpr = [JOIN_TABLE, PARENT_TABLE + '.' + PARENT_COLUMN, '=', CHILD_TABLE + '.' + CHILD_COLUMN];

      // Find out which function to use
      var fn = findJoinFunction(joinType);

      buildQueryPiece(fn, joinExpr, query);
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╔═╗╦═╗╔═╗╦ ╦╔═╗╔═╗╔╦╗   ╦╔═╗╦╔╗╔
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║ ╦╠╦╝║ ║║ ║╠═╝║╣  ║║   ║║ ║║║║║
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╩╚═╚═╝╚═╝╩  ╚═╝═╩╝  ╚╝╚═╝╩╝╚╝
    //
    // Process a grouped join. This is a join that should be wrapped in parenthesis.
    var processGroupedJoin = function processGroupedJoin(tokens, joinType, query) {
      var pieces = [];
      var JOIN_TABLE = tokens[1] && tokens[1].value;

      // Remove the table name from the token set
      tokens = _.slice(tokens, 2);

      // Recurse through the tokens building up the pieces of the grouped fn
      var buildJoinPieces = function buildJoinPieces(_tokens) {
        var piece = {};

        // Find the start and end of the expression. To find the end, check if
        // there is another combinator value in the set.
        var start = _.findIndex(_tokens, { type: 'COMBINATOR' });
        var end = _.findIndex(_.slice(_tokens, start + 1), { type: 'COMBINATOR' });

        // Figure out what combinator was used
        var combinator = _tokens[start].value;
        piece.combinator = combinator;

        // Build up the join expression
        var PARENT_TABLE = _tokens[2] && _tokens[2].value;
        var CHILD_TABLE = _tokens[6] && _tokens[6].value;
        var PARENT_COLUMN = _tokens[4] && _tokens[4].value;
        var CHILD_COLUMN = _tokens[8] && _tokens[8].value;

        // Hold the actual expression we will pass to Knex
        piece.expr = [PARENT_TABLE + '.' + PARENT_COLUMN, '=', CHILD_TABLE + '.' + CHILD_COLUMN];

        // Add the piece to group of expressions
        pieces.push(piece);

        // If there are no more groups, return
        if (end < 0) {
          return;
        }

        // Set the _tokens to remove the process join piece and call again
        _tokens = _.slice(_tokens, end + 1);
        buildJoinPieces(_tokens);
      };

      // Kickoff the recursive parsing
      buildJoinPieces(tokens);

      // Now that all the pieces are built, build the function for passing into
      // Knex that will perform the actual grouping
      var groupFn = function groupFn() {
        var self = this;
        _.each(pieces, function applyFn(piece, idx) {
          var _fn = 'andOn';

          // The first item always uses the .on functions
          if (idx === 0) {
            _fn = 'on';
          } else if (piece.combinator === 'OR') {
            _fn = 'orOn';
          }

          self[_fn].apply(self, piece.expr);
        });
      };

      // Find out which function to use
      var joinFn = findJoinFunction(joinType);

      // Build the grouped join query
      buildQueryPiece(joinFn, [JOIN_TABLE, groupFn], query);
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗   ╦╔═╗╦╔╗╔╔═╗
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗   ║║ ║║║║║╚═╗
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚╝╚═╝╩╝╚╝╚═╝
    //
    // Takes an array of join tokens and builds various SQL joins.
    var processJoinGroup = function processJoinGroup(tokens, joinType, query) {
      // Check if there is a COMBINATOR token
      var hasCombinator = _.findIndex(tokens, { type: 'COMBINATOR' });

      // If not, process the flat join
      if (hasCombinator < 0) {
        processFlatJoin(tokens, joinType, query);
        return;
      }

      // Otherwise process the grouped join
      processGroupedJoin(tokens, joinType, query);
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╦ ╦╔╗╔╦╔═╗╔╗╔╔═╗
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ║ ║║║║║║ ║║║║╚═╗
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝  ╚═╝╝╚╝╩╚═╝╝╚╝╚═╝
    //
    // Takes an array of subqueries and build a UNION or UNION ALL statement
    var processUnion = function processUnion(tokens, query, unionType) {
      _.each(tokens, function buildUnionSubquery(token) {
        // Build a standalone knex query builder
        var subQueryBuilder = knex.queryBuilder();

        // Pass the token to the parser
        tokenParser(subQueryBuilder, token);

        // Set the fn to run - either UNION or UNIONALL
        var fn = unionType === 'UNIONALL' ? 'unionAll' : 'union';

        // Add the subquery to the main query
        buildQueryPiece(fn, [subQueryBuilder, true], query);
      });
    };


    //  ╔═╗╦═╗╔╦╗╔═╗╦═╗  ╔╗ ╦ ╦  ╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
    //  ║ ║╠╦╝ ║║║╣ ╠╦╝  ╠╩╗╚╦╝  ╠╩╗║ ║║║   ║║║╣ ╠╦╝
    //  ╚═╝╩╚══╩╝╚═╝╩╚═  ╚═╝ ╩   ╚═╝╚═╝╩╩═╝═╩╝╚═╝╩╚═
    //
    // Process ORDER BY expressions
    var orderByBuilder = function orderByBuilder(expr, expression) {
      var arr = [];

      // Handle KEY/VALUE pairs
      if (expr.type === 'KEY') {
        arr.push(expr.value);
        expression.push(arr);

        return expression;
      }

      // Set the VALUE pair
      if (expr.type === 'VALUE') {
        arr = _.last(expression);
        arr.push(expr.value);

        return expression;
      }
    };


    //  ╦╔╗╔╔═╗╔═╗╦═╗╔╦╗  ╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
    //  ║║║║╚═╗║╣ ╠╦╝ ║   ╠╩╗║ ║║║   ║║║╣ ╠╦╝
    //  ╩╝╚╝╚═╝╚═╝╩╚═ ╩   ╚═╝╚═╝╩╩═╝═╩╝╚═╝╩╚═
    //
    // Builds an array of KEY/VALUE pairs to use as the insert clause.
    var insertBuilder = function insertBuilder(expr, expression) {
      var arr = [];

      // Handle KEY/VALUE pairs
      if (expr.type === 'KEY') {
        arr.push(expr.value);
        expression.push(arr);

        return expression;
      }

      // Set the VALUE pair
      if (expr.type === 'VALUE') {
        arr = _.last(expression);
        arr.push(expr.value);

        return expression;
      }
    };


    //  ╦ ╦╔═╗╔╦╗╔═╗╔╦╗╔═╗  ╔╗ ╦ ╦╦╦  ╔╦╗╔═╗╦═╗
    //  ║ ║╠═╝ ║║╠═╣ ║ ║╣   ╠╩╗║ ║║║   ║║║╣ ╠╦╝
    //  ╚═╝╩  ═╩╝╩ ╩ ╩ ╚═╝  ╚═╝╚═╝╩╩═╝═╩╝╚═╝╩╚═
    //
    // Builds an array of KEY/VALUE pairs to use as the update clause
    var updateBuilder = function updateBuilder(expr, expression) {
      var arr = [];

      // Handle KEY/VALUE pairs
      if (expr.type === 'KEY') {
        arr.push(expr.value);
        expression.push(arr);

        return expression;
      }

      // Set the VALUE pair
      if (expr.type === 'VALUE') {
        arr = _.last(expression);
        arr.push(expr.value);

        return expression;
      }
    };


    //  ╔═╗╦═╗╔═╗╔═╗╔═╗╔═╗╔═╗  ╦  ╦╔═╗╦  ╦ ╦╔═╗
    //  ╠═╝╠╦╝║ ║║  ║╣ ╚═╗╚═╗  ╚╗╔╝╠═╣║  ║ ║║╣
    //  ╩  ╩╚═╚═╝╚═╝╚═╝╚═╝╚═╝   ╚╝ ╩ ╩╩═╝╚═╝╚═╝
    //
    // Negotiates building a query piece based on the identifier
    var processValue = function processValue(expr, idx, options) {
      // Examine the identifier value
      switch (options.identifier) {
        case 'SELECT':
          buildQueryPiece('select', expr.value, options.query);
          break;

        case 'FROM':
          buildQueryPiece('from', expr.value, options.query);
          break;

        case 'SCHEMA':
          buildQueryPiece('withSchema', expr.value, options.query);
          break;

        case 'DISTINCT':
          buildQueryPiece('distinct', expr.value, options.query);
          break;

        case 'COUNT':
        case 'MIN':
        case 'MAX':
        case 'SUM':
        case 'AVG':
          if (!_.isArray(expr.value)) {
            expr.value = [expr.value];
          }

          _.each(expr.value, function processAvg(val) {
            buildQueryPiece(options.identifier.toLowerCase(), val, options.query);
          });
          break;

        case 'GROUPBY':
          buildQueryPiece('groupBy', expr.value, options.query);
          break;

        case 'INTO':
          buildQueryPiece('into', expr.value, options.query);
          break;

        case 'USING':
          buildQueryPiece('table', expr.value, options.query);
          break;

        case 'LIMIT':
          buildQueryPiece('limit', expr.value, options.query);
          break;

        case 'SKIP':
          buildQueryPiece('offset', expr.value, options.query);
          break;

        case 'ORDERBY':

          // Look ahead and see if the next expression is an Identifier.
          // If so or if there is no next identifier, add the insert statments.
          options.nextExpr = undefined;
          options.nextExpr = options.tokenGroup[idx + 1];
          if (!options.nextExpr || options.nextExpr.type === 'IDENTIFIER') {
            _.each(options.expression, function processOrderBy(ordering) {
              buildQueryPiece('orderBy', ordering, options.query);
            });
          }
          break;

        case 'INSERT':

          // Look ahead and see if the next expression is an Identifier.
          // If so or if there is no next identifier, add the insert statments.
          options.nextExpr = undefined;
          options.nextExpr = options.tokenGroup[idx + 1];
          if (!options.nextExpr || options.nextExpr.type === 'IDENTIFIER') {
            // Flatten the expression
            options.expression = _.fromPairs(options.expression);
            buildQueryPiece('insert', options.expression, options.query);

            // Also add a 'returning' value
            buildQueryPiece('returning', 'id', options.query);
          }
          break;

        case 'UPDATE':

          // Look ahead and see if the next expression is an Identifier.
          // If so or if there is no next identifier, add the update statments.
          options.nextExpr = undefined;
          options.nextExpr = options.tokenGroup[idx + 1];
          if (!options.nextExpr || options.nextExpr.type === 'IDENTIFIER') {
            // Flatten the expression
            options.expression = _.fromPairs(options.expression);
            buildQueryPiece('update', options.expression, options.query);

            // Also add a 'returning' value
            buildQueryPiece('returning', 'id', options.query);
          }
          break;

        case 'WHERE':

          // Check the modifier to see if a different function other than
          // WHERE should be used. The most common is NOT.
          if (options.modifier && options.modifier.length) {
            if (options.modifier.length === 1 && _.first(options.modifier) === 'NOT') {
              options.fn = 'whereNot';
            }

            if (options.modifier.length === 1 && _.first(options.modifier) === 'IN') {
              options.fn = 'whereIn';
            }

            // If there are more than 1 modifier then we need to checkout
            // the combo. Usually it's a [NOT,IN] situation.
            // For now let's assume it will only ever be 2 items.
            if (options.modifier.length > 1) {
              var first = _.first(_.pullAt(options.modifier, 0));
              var second = _.first(_.pullAt(options.modifier, 0));

              if (first === 'NOT' && second === 'IN') {
                options.fn = 'whereNotIn';
              }
            }

            // Otherwise use the where fn
          } else {
            options.fn = 'where';
          }

          // Set the second or third item in the array to the value
          buildQueryPiece(options.fn, options.expression, options.query);

          // Clear the modifier
          options.modifier = [];
          break;

      }
    };


    //  ╔═╗═╗ ╦╔═╗╦═╗╔═╗╔═╗╔═╗╦╔═╗╔╗╔  ╔═╗╔═╗╦═╗╔═╗╔═╗╦═╗
    //  ║╣ ╔╩╦╝╠═╝╠╦╝║╣ ╚═╗╚═╗║║ ║║║║  ╠═╝╠═╣╠╦╝╚═╗║╣ ╠╦╝
    //  ╚═╝╩ ╚═╩  ╩╚═╚═╝╚═╝╚═╝╩╚═╝╝╚╝  ╩  ╩ ╩╩╚═╚═╝╚═╝╩╚═
    //
    // Parses each individual token piece.
    var expressionParser = function expressionParser(expr, idx, options) {
      // Handle identifiers by storing them on the fn
      if (expr.type === 'IDENTIFIER') {
        options.identifier = expr.value;

        // If the identifier is the DELETE key, we can go ahead and process it
        if (options.identifier === 'DELETE') {
          options.query.del();
          options.query.returning('id');
        }

        return;
      }

      // NOT Modifier
      if (expr.type === 'CONDITION' && expr.value === 'NOT') {
        options.modifier = options.modifier || [];
        options.modifier.push(expr.value);
        return;
      }

      // IN Modifier
      if (expr.type === 'CONDITION' && expr.value === 'IN') {
        options.modifier = options.modifier || [];
        options.modifier.push(expr.value);
        return;
      }

      // AND Modifier
      if (expr.type === 'CONDITION' && expr.value === 'AND') {
        options.modifier = options.modifier || [];
        options.modifier.push(expr.value);
        return;
      }

      // Handle sets of values being inserted
      if (options.identifier === 'INSERT' && (expr.type === 'KEY' || expr.type === 'VALUE')) {
        options.expression = insertBuilder(expr, options.expression, options.query);
      }

      // Handle sets of values being update
      if (options.identifier === 'UPDATE' && (expr.type === 'KEY' || expr.type === 'VALUE')) {
        options.expression = updateBuilder(expr, options.expression, options.query);
      }

      // Handle clauses in the WHERE value
      if (options.identifier === 'WHERE' && (expr.type === 'KEY' || expr.type === 'OPERATOR' || expr.type === 'VALUE')) {
        options.expression = whereBuilder(expr, options.expression, options.modifier, options.query);
      }

      // Handle ORDER BY statements
      if (options.identifier === 'ORDERBY' && (expr.type === 'KEY' || expr.type === 'VALUE')) {
        options.expression = orderByBuilder(expr, options.expression, options.query);
      }

      // Handle AS statements
      if (options.identifier === 'AS' && expr.type === 'VALUE') {
        options.query.as(expr.value);
        return;
      }

      // Handle UNION statements
      if (expr.type === 'UNION') {
        options.union = true;
        options.unionType = expr.value;
        return;
      }

      // Process value and use the appropriate Knex function
      if (expr.type === 'VALUE') {
        processValue(expr, idx, options);
        return;
      }

      // Handle SUBQUERY keys
      if (expr.type === 'SUBQUERY') {
        options.subQuery = true;
        return;
      }

      //  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
      //  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
      //  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝
      //
      // If the expression is an array then the values should be grouped. Unless
      // they are describing join logic.
      if (_.isArray(expr)) {
        var joinTypes = [
          'JOIN',
          'INNERJOIN',
          'OUTERJOIN',
          'CROSSJOIN',
          'LEFTJOIN',
          'LEFTOUTERJOIN',
          'RIGHTJOIN',
          'RIGHTOUTERJOIN',
          'FULLOUTERJOIN'
        ];

        // If the expression is an array of UNION subqueries, process each
        // one and toggle the UNION flag.
        if (options.union) {
          processUnion(expr, options.query, options.unionType);
          options.union = false;
          options.unionType = undefined;
          return;
        }

        // If the expression is a subQuery then process it standalone query
        // and pass it in as the expression value
        if (options.subQuery) {
          // Build a standalone knex query builder and pass it the expression
          var subQueryBuilder = knex.queryBuilder();
          tokenParser(subQueryBuilder, expr);

          // Toggle off the subquery flag
          options.subQuery = false;

          // Build the query using the subquery object as the value
          if (options.identifier === 'WHERE') {
            options.expression.push(subQueryBuilder);

            // If not a WHERE clause, just stick the subquery on the value
          } else {
            expr.value = subQueryBuilder;
          }

          // Process the value
          processValue(expr, idx, options);

          return;
        }

        var isJoin = _.indexOf(joinTypes, options.identifier);
        if (isJoin === -1) {
          processGroup(expr, false, options.expression, options.modifier, options.query);
          return;
        }

        // Otherwise process the array of join logic
        processJoinGroup(expr, options.identifier, options.query);
      }
    };

    //  ╔╦╗╦═╗╔═╗╔═╗  ╔═╗╔═╗╦═╗╔═╗╔═╗╦═╗
    //   ║ ╠╦╝║╣ ║╣   ╠═╝╠═╣╠╦╝╚═╗║╣ ╠╦╝
    //   ╩ ╩╚═╚═╝╚═╝  ╩  ╩ ╩╩╚═╚═╝╚═╝╩╚═
    //
    // Parses a group of tokens in the tree
    var treeParser = function treeParser(tokenGroup, query) {
      // Build up the default options
      var options = {
        identifier: undefined,
        modifier: [],
        fn: undefined,
        nextExpr: undefined,
        expression: [],
        query: query,
        tokenGroup: tokenGroup,
        subQuery: false,
        union: false
      };

      // Loop through each item in the group and build up the expression
      _.each(tokenGroup, function parseTokenGroup(expr, idx) {
        expressionParser(expr, idx, options);
      });
    };


    //  ████████╗ ██████╗ ██╗  ██╗███████╗███╗   ██╗    ██████╗  █████╗ ██████╗ ███████╗███████╗██████╗
    //  ╚══██╔══╝██╔═══██╗██║ ██╔╝██╔════╝████╗  ██║    ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗
    //     ██║   ██║   ██║█████╔╝ █████╗  ██╔██╗ ██║    ██████╔╝███████║██████╔╝███████╗█████╗  ██████╔╝
    //     ██║   ██║   ██║██╔═██╗ ██╔══╝  ██║╚██╗██║    ██╔═══╝ ██╔══██║██╔══██╗╚════██║██╔══╝  ██╔══██╗
    //     ██║   ╚██████╔╝██║  ██╗███████╗██║ ╚████║    ██║     ██║  ██║██║  ██║███████║███████╗██║  ██║
    //     ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // Loop through each token group in the tree and add to the query
    var tokenParser = function tokenParser(query, tree) {
      _.forEach(tree, function parseTree(tokenGroup) {
        treeParser(tokenGroup, query);
      });
    };

    // Run the token parser
    var knexQuery = (function parseTree(tree) {
      var query = knex.queryBuilder();
      tokenParser(query, tree);
      return query;
    })(inputs.tree);

    // Build up the actual SQL string
    var _SQL = knexQuery.toSQL();
    var text = _SQL.sql;

    // Check if the bindings need to be positioned (aka changed to $1, $2 from ?, ?)
    if (knexQuery.client && knexQuery.client.positionBindings) {
      text = knexQuery.client.positionBindings(_SQL.sql);
    }

    return { sql: text, bindings: _SQL.bindings };

};
