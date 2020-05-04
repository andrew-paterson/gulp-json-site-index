'use strict';

const staticHtmlSearchIndex = require('../json-site-index');
const path = require('path');
const PluginError = require('plugin-error');
const through = require('through2');
const fs = require('fs');

module.exports = function gulpStaticHtmlSearchIndex(options, callback) {
  options = Object.assign(options || {});
  if (arguments.length === 1 && Object.prototype.toString.call(arguments[0]) === '[object Function]')
    callback = arguments[0];

  let transform = function (file, enc, cb) {
    if (!file || !fs.statSync(file.path).isDirectory()) {
      this.emit('error', new PluginError('gulp-static-html-search-index', 'src must be a directory'));
      return cb(null, file);
    }

    if (file.isStream()) {
      this.emit('error', new PluginError('gulp-static-html-search-index', 'Streaming not supported!'));
      return cb(null, file);
    }

    if (!options.rebaseTo && options.rebase !== false) {
      options.rebaseTo = path.dirname(file.path);
    }

    options.sitePath = file.path;
    staticHtmlSearchIndex.runIndex(options, function (errors, response) {
      if (errors)
        return cb(errors.join(' '));
      if (typeof callback === 'function') {
        let details = {
          'stats': response.stats,
        };
        callback(details);
      }
      file.contents = new Buffer(response.searchIndex);
      cb(null, file);
    });
  };
  return through.obj(transform);
};
