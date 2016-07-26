module.exports = function analyze(inputs) {
    var _ = require('lodash');
    var tokens = inputs.tokens;


    //   █████╗ ███╗   ██╗ █████╗ ██╗  ██╗   ██╗███████╗███████╗██████╗
    //  ██╔══██╗████╗  ██║██╔══██╗██║  ╚██╗ ██╔╝╚══███╔╝██╔════╝██╔══██╗
    //  ███████║██╔██╗ ██║███████║██║   ╚████╔╝   ███╔╝ █████╗  ██████╔╝
    //  ██╔══██║██║╚██╗██║██╔══██║██║    ╚██╔╝   ███╔╝  ██╔══╝  ██╔══██╗
    //  ██║  ██║██║ ╚████║██║  ██║███████╗██║   ███████╗███████╗██║  ██║
    //  ╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝╚═╝   ╚══════╝╚══════╝╚═╝  ╚═╝
    //
    // Runs through the tokens and based on the surrounding tokens groups them
    // together into logical pieces that can be passed to functions inside the
    // Sequelizer.

    // Key/Value pair tokens
    var KEY_VALUE_TOKENS = ['KEY', 'VALUE', 'OPERATOR', 'COMBINATOR'];

    // Wrapped tokens
    var WRAPPED_TOKENS = [
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

    // Hold the results of the token processing as a stringfied version.
    // After we are done building up all the grouped tokens, it can be
    // JSON parsed
    var results = '';

    //  ╦ ╦╦═╗╦╔╦╗╔═╗  ╔═╗╦ ╦╦ ╦╔╗╔╦╔═
    //  ║║║╠╦╝║ ║ ║╣   ║  ╠═╣║ ║║║║╠╩╗
    //  ╚╩╝╩╚═╩ ╩ ╚═╝  ╚═╝╩ ╩╚═╝╝╚╝╩ ╩
    //
    // Given a chunk of data, write it to the result container
    var writeChunk = function writeChunk(chunk, wrappedChunk, write) {
      try {
        // If this is a wrapped chunk, close it off
        if (wrappedChunk) {
          wrappedChunk = false;

          // Make sure to no leave any hanging, open brackets
          if (chunk.charAt(chunk.length - 1) === '[' && chunk.charAt(chunk.length - 2) === ',') {
            chunk = chunk.slice(0, -2);
          }

          chunk += ']';
        }

        // Write the chunk
        if (write) {
          results += chunk;
        }
      } catch (e) {
        throw new Error('Error parsing chunk');
      }

      return chunk;
    };


    var analyzer = function analyzer(tokens) {
      // Hold the current chunk
      var chunk;

      // Hold the flag for wrapping a chunk
      var wrappedChunk = false;

      // Hold the token array for unions
      var union = false;

      // Hold the flag array for wrapping a subquery
      var subquery = [];

      // Process the token list in order
      _.each(tokens, function analyzeToken(token) {
        //  ╦ ╦╔╗╔╦╔═╗╔╗╔
        //  ║ ║║║║║║ ║║║║
        //  ╚═╝╝╚╝╩╚═╝╝╚╝
        //
        // If the token is a union, toggle the flag and wrap with an array
        if (token.type === 'UNION') {
          union = true;
          chunk = '[' + JSON.stringify(token) + ',[';
          return;
        }

        if (token.type === 'ENDUNION') {
          union = false;

          if (chunk.charAt(chunk.length - 1) === ',') {
            chunk = chunk.slice(0, -1);
          }

          chunk += ']]';
          writeChunk(chunk, false, true);

          return;
        }

        //  ╔═╗╦ ╦╔╗ ╔═╗ ╦ ╦╔═╗╦═╗╦ ╦
        //  ╚═╗║ ║╠╩╗║═╬╗║ ║║╣ ╠╦╝╚╦╝
        //  ╚═╝╚═╝╚═╝╚═╝╚╚═╝╚═╝╩╚═ ╩
        //
        // If the token is a subquery, flag it as such and open up a new group
        // on the chunk.
        if (token.type === 'SUBQUERY') {
          subquery.push(true);

          // Don't wrap subqueries inside UNION queries
          if (!union) {
            chunk += JSON.stringify(token) + ',[';
          }

          return;
        }

        if (token.type === 'ENDSUBQUERY') {
          subquery.pop();

          if (!union) {
            if (chunk.charAt(chunk.length - 1) === ',') {
              chunk = chunk.slice(0, -1);
            }
            chunk += '],';
          }

          return;
        }

        //  ╦╔╦╗╔═╗╔╗╔╔╦╗╦╔═╗╦╔═╗╦═╗╔═╗
        //  ║ ║║║╣ ║║║ ║ ║╠╣ ║║╣ ╠╦╝╚═╗
        //  ╩═╩╝╚═╝╝╚╝ ╩ ╩╚  ╩╚═╝╩╚═╚═╝
        //
        // If the token is an identifier, write the current chunk and start a
        // new one.
        if (token.type === 'IDENTIFIER') {
          // Start a new chunk unless there is a subquery being built, in
          // which case continue appending logic.
          if (subquery.length) {
            chunk += '[' + JSON.stringify(token) + ',';

            // Otherwise just open a new chunk
          } else {
            chunk = '[' + JSON.stringify(token) + ',';
          }

          // If this is a wrapped chunk, add an extra '['
          if (_.indexOf(WRAPPED_TOKENS, token.value) > -1) {
            wrappedChunk = true;
            chunk += '[';
          }

          return;
        }

        if (token.type === 'ENDIDENTIFIER') {
          // The write flag determines if the clause is ready to be parsed and
          // written to the results. If we are inside a subquery it shouldn't
          // be written to the results until the end. It should be closed though.
          var write = subquery.length ? false : true;

          // Remove the trailing comma from the chunk
          if (chunk.charAt(chunk.length - 1) === ',') {
            chunk = chunk.slice(0, -1);
          }

          if (wrappedChunk) {
            chunk += ']';
            wrappedChunk = false;
          }

          chunk += '],';
          chunk = writeChunk(chunk, wrappedChunk, write);

          return;
        }

        //  ╦╔═╔═╗╦ ╦  ╦  ╦╔═╗╦  ╦ ╦╔═╗  ╔═╗╔═╗╦╦═╗╔═╗
        //  ╠╩╗║╣ ╚╦╝  ╚╗╔╝╠═╣║  ║ ║║╣   ╠═╝╠═╣║╠╦╝╚═╗
        //  ╩ ╩╚═╝ ╩    ╚╝ ╩ ╩╩═╝╚═╝╚═╝  ╩  ╩ ╩╩╩╚═╚═╝
        //
        // Handles simple key/value pairs for KEY/VALUE/OPERATOR tokens
        if (_.indexOf(KEY_VALUE_TOKENS, token.type) > -1) {
          chunk += JSON.stringify(token) + ',';
          return;
        }

        //  ╔═╗╦═╗╔═╗╦ ╦╔═╗╦╔╗╔╔═╗
        //  ║ ╦╠╦╝║ ║║ ║╠═╝║║║║║ ╦
        //  ╚═╝╩╚═╚═╝╚═╝╩  ╩╝╚╝╚═╝

        // If this is a GROUP token, open a new grouping pair.
        if (token.type === 'GROUP') {
          chunk += '[';
          return;
        }

        // Save the current group to the condition
        if (token.type === 'ENDGROUP') {
          // Remove the trailing comma from the group
          if (chunk.charAt(chunk.length - 1) === ',') {
            chunk = chunk.slice(0, -1);
          }

          // Close the group
          chunk += '],';
          return;
        }

        //  ╔═╗╔═╗╔╗╔╔╦╗╦╔╦╗╦╔═╗╔╗╔╔═╗
        //  ║  ║ ║║║║ ║║║ ║ ║║ ║║║║╚═╗
        //  ╚═╝╚═╝╝╚╝═╩╝╩ ╩ ╩╚═╝╝╚╝╚═╝
        //
        // Only some conditions are actually written out

        if (token.type === 'CONDITION' && token.value === 'NOT') {
          chunk += JSON.stringify(token) + ',';
          return;
        }

        if (token.type === 'CONDITION' && token.value === 'IN') {
          chunk += JSON.stringify(token) + ',';
          return;
        }

        if (token.type === 'CONDITION' && token.value === 'AND') {
          chunk += JSON.stringify(token) + ',';
          return;
        }
      });

      // Ensure the results don't end with a trailing comma
      if (results.charAt(results.length - 1) === ',') {
        results = results.slice(0, -1);
      }
    };

    // Kick off the analyzer.
    analyzer(tokens);

    try {
      var parsedTokens = JSON.parse('[' + results + ']');
      return parsedTokens;
    } catch (err) {
      return new Error('Could not analyze the token set. This is most likely a problem with the analyzer and not the query.');
    }

};
