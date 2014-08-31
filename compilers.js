require('ex-tensions');
var debug = require('debug')('compilers');
var sweet = require('sweet.js');
var path = require('path');
var resolve = require('resolve');

/**
 * Only add regenerator if ES6 Generators are not already supported
 *
 * The regenerator code here is adapted from tootallnate/gnode
 */
var regenerator, genFunExp;
try {
  eval('(function*(){})');
} catch (e) {
  /**
   * Module dependencies.
   */

  regenerator = require('regenerator');
  genFunExp = /\bfunction\s*\*/;

  /**
   * First include the regenerator runtime. It gets installed gloablly as
   * `wrapGenerator`, so we just need to make sure that global function is
   * available.
   */
  debug('generators not supported, loading regenerator');
  require('vm').runInThisContext(regenerator('', { includeRuntime: true }));
  require.extensions.preprocess('.js', __dirname, compileGenerators);
}

function isValidJavaScript (content) {
  try {
    Function('', content);
    return true;
  } catch (ex) {
    return false;
  }
}
function compileGenerators (module, content) {

  if (!genFunExp.test(content) || isValidJavaScript(content)) {
    // contains no generators and is valid JS.
    return content
  }

  // compile JS via facebook/regenerator
  debug('compiling generators %s', module.filename);
  try {
    return regenerator(content, {
      includeRuntime: 'function' != typeof wrapGenerator
    });
  } catch (err) {
    console.error('regenerator failed to compile ' + module.filename);
    throw err;
  }
}


// Compile SweetJS macros
require.extensions.preprocess('.js', __dirname, compileMacros);
require.extensions.preprocess('.js', __dirname, preloadRequiredMacros);
// clobber the existing sweetjs require hook
delete require.extensions['.sjs'];
require.extensions.preprocess('.sjs', __dirname, compileMacros);
require.extensions.preprocess('.sjs', __dirname, preloadRequiredMacros);

function loadMacro (filename, macroFile) {
  if (typeof macroFile !== 'string') {
    throw new TypeError('requireMacros only supports literal strings');
  }
  macroFile = resolve.sync(macroFile, {basedir: path.dirname(filename)});
  var alreadyLoaded = sweet.loadedMacros.some(function (m) {
    return m.filename === macroFile;
  });
  if (!alreadyLoaded) {
    debug('loading macro %s', macroFile);
    sweet.loadMacro(macroFile);
  }
}

var requireMacroRgx = /requireMacros\(['"]([^'"]+)['"]\)[;\n,\s]*/g;

function preloadRequiredMacros (module, content) {
  debug('preloading required macros %s', module.filename);
  return content.replace(requireMacroRgx, function (_, macroFile) {
    loadMacro(module.filename, macroFile);
    return '';
  });
}

// compile SweetJS macros
function compileMacros (module, content) {
  debug('compiling macros %s', module.filename);
  if (/\/node_modules\//.test(module.filename)) {
    return content;
  }
  try {
    var result = sweet.compile(content, {
      filename: module.filename,
      sourceMap: true
    });
    module.filename = module.filename.replace(/\.sjs/, '.js');
    return result.code;
  } catch (err) {
    console.error('SweetJS failed to compile ' + module.filename);
    throw err;
  }
}
