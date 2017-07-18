// https://en.wikipedia.org/wiki/ANSI_escape_code

const fs = require('fs');
const util = require('util');
const lib = require('think_lib');

let debug = process.env.NODE_ENV === 'development' ? true : false;
const styles = {
    'bold': ['\x1B[1m', '\x1B[22m'],
    'italic': ['\x1B[3m', '\x1B[23m'],
    'underline': ['\x1B[4m', '\x1B[24m'],
    'inverse': ['\x1B[7m', '\x1B[27m'],
    'strikethrough': ['\x1B[9m', '\x1B[29m'],

    'white': ['\x1B[37m', '\x1B[39m'],
    'grey': ['\x1B[90m', '\x1B[39m'],
    'black': ['\x1B[30m', '\x1B[39m'],
    'blue': ['\x1B[34m', '\x1B[39m'],
    'cyan': ['\x1B[36m', '\x1B[39m'],
    'green': ['\x1B[32m', '\x1B[39m'],
    'magenta': ['\x1B[35m', '\x1B[39m'],
    'red': ['\x1B[31m', '\x1B[39m'],
    'yellow': ['\x1B[33m', '\x1B[39m'],

    'whiteBG': ['\x1B[47m', '\x1B[49m'],
    'greyBG': ['\x1B[49;5;8m', '\x1B[49m'],
    'blackBG': ['\x1B[40m', '\x1B[49m'],
    'blueBG': ['\x1B[44m', '\x1B[49m'],
    'cyanBG': ['\x1B[46m', '\x1B[49m'],
    'greenBG': ['\x1B[42m', '\x1B[49m'],
    'magentaBG': ['\x1B[45m', '\x1B[49m'],
    'redBG': ['\x1B[41m', '\x1B[49m'],
    'yellowBG': ['\x1B[43m', '\x1B[49m']
};
// console.log('\x1B[47m\x1B[30m%s\x1B[39m\x1B[49m', 'hello') //白底黑色字

/**
 * 
 * 
 * @returns 
 */
const stack = function (err) {
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, st) {
        return st;
    };
    Error.captureStackTrace(err, arguments.callee);
    Error.prepareStackTrace = orig;
    return err.stack;
};

/**
 * 
 * 
 * @param {any} type 
 * @param {any} args 
 * @param {any} css 
 * @returns 
 */
const show = function (type, args, css) {
    let params = [], i = 0, len = args.length;
    css = css || 'grey';
    let style = styles[css] || [];
    params.push(style[0]);
    params.push(`[${lib.datetime('', '')}]`);
    params.push(`[${type.toUpperCase()}]`);
    for (; i < len; i++) {
        if (lib.isError(args[i])) {
            params.push(stack(args[i]));
            // params.push(args[i].stack);
        } else if (typeof args[i] === 'object') {
            params.push(JSON.stringify(args[i]));
        } else {
            params.push(args[i]);
        }
    }
    params.push(style[1]);
    return console.log.apply(null, params);
};

/**
 * 
 * 
 * @returns 
 */
const logger = function (type, ...args) {
    if (debug && lib.isString(type)) {
        return show(type || 'INFO', args, 'grey');
    }
    return null;
};

/**
 * 
 * 
 * @param {any} path 
 * @param {any} name 
 * @param {any} msgs 
 */
logger.write = function (path, name, msgs) {
    try {
        path = path || __dirname;
        if (!lib.isEmpty(msgs)) {
            lib.isDir(path) || lib.mkDir(path);
            let file = `${path}${lib.sep}${name ? name + '_' : ''}${lib.datetime('', 'yyyy-mm-dd')}.log`;
            if (lib.isError(msgs)) {
                msgs = [msgs.stack];
            } else if (lib.isObject(msgs)) {
                msgs = [JSON.stringify(msgs)];
            }
            msgs = ['[' + lib.datetime('', '') + ']'].concat([].slice.call(msgs));
            let message = util.format.apply(null, msgs) + '\n';
            fs.appendFile(file, message);
        }
    } catch (e) {}
};

/**
 * 
 * 
 * @returns 
 */
logger.info = function () {
    if (debug) {
        return show('INFO', arguments, 'blue');
    }
    return null;
};

/**
 * 
 * 
 * @returns 
 */
logger.success = function () {
    return show('SUCCESS', arguments, 'green');
};

/**
 * 
 * 
 * @returns 
 */
logger.warn = function () {
    return show('WARN', arguments, 'yellow');
};

/**
 * 
 * 
 * @returns 
 */
logger.error = function () {
    return show('ERROR', arguments, 'red');
};

module.exports = logger;