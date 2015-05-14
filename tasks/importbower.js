module.exports = function importBower(grunt) {
  var path = require('path'),
      _ = require('lodash'),
      wiredep = require('wiredep');

  grunt.registerMultiTask('importbower', function() {
    var options,
        deps = wiredep(),
        jsNames = {},
        cssNames = {},
        jsFiles,
        cssFiles;


    // Set default options
    options = this.options({
      path_cwd: null, // When generating relative paths from the src file to the libs, use this cwd
      css_dest: 'bower_imports/css',
      css_marker: '<!-- importbower:css -->',
      css_tag: '<link rel="stylesheet" href="%s" />',
      js_dest: 'bower_imports/js',
      js_marker: '<!-- importbower:js -->',
      js_tag: '<script type="text/javascript" src="%s"></script>'
    });

    _.each(deps.packages, function(package, name) {
      _.each(package.main, function(file) {
        if (/\.js$/.test(file)) {
          jsNames[file] = name;
        } else if (/\.css$/.test(file)) {
          cssNames[file] = name;
        }
      });
    });

    jsFiles = _.map(deps.js, function(src) {
      var name = jsNames[src],
          dest = path.normalize(options.js_dest + '/' + name + '.js');

      grunt.file.copy(src, dest);
      return dest;
    });

    cssFiles = _.map(deps.css, function(src) {
      var name = cssNames[src],
          dest = path.normalize(options.css_dest + '/' + name + '.css');

      grunt.file.copy(src, dest);
      return dest;
    });

    _.each(this.files, function importerFileLoop(file) {
      grunt.file.copy(file.src, file.dest, {
        process: function processImporter(contents) {
          var fileDir = options.cwd || path.dirname(file.dest),
              jsTags,
              cssTags,
              jsRegex,
              cssRegex;

          jsTags = _.map(jsFiles, function generateJSTag(libFileDest) {
            var relPath = path.relative(fileDir, libFileDest);
            return options.js_tag.replace('%s', relPath);
          });

          cssTags = _.map(cssFiles, function generateCSSTag(libFileDest) {
            var relPath = path.relative(fileDir, libFileDest);
            return options.css_tag.replace('%s', relPath);
          });

          jsRegex = new RegExp('([ \\t]*)' + options.js_marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
          contents = contents.replace(jsRegex, function(match, whitespace) {
            return whitespace + jsTags.join('\n' + whitespace);
          });

          cssRegex = new RegExp('([ \\t]*)' + options.css_marker.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
          contents = contents.replace(cssRegex, function(match, whitespace) {
            return whitespace + cssTags.join('\n' + whitespace);
          });

          grunt.log.writeln('Imported ' + jsFiles.length + ' JS packages and ' + cssFiles.length + ' CSS packages into '+ file.dest);

          return contents;
        }
      });
    });
  });
};
