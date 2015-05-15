module.exports = function importBower(grunt) {
  var path = require('path'),
      _ = require('lodash'),
      wiredep = require('wiredep');

  grunt.registerMultiTask('importbower', function importBowerTask() {
    var options,
        defaultImportTypeOptions,
        dependencyData,
        importNames = {},
        importFiles = {};

    defaultImportTypeOptions = {
      css: {
          dest: 'bower_imports/css',
          tag: '<link rel="stylesheet" href="%s" />',
        },
      js: {
          dest: 'bower_imports/js',
          tag: '<script type="text/javascript" src="%s"></script>',
        }
    };

    // Set default options
    options = this.options({
      path_cwd: null, // When generating relative paths from the src file to the libs, use this cwd
      import_types: _.clone(defaultImportTypeOptions), // List the import types you wish to include, in the format above
      comment_marker: 'importbower',
      wiredep_options: {}
    });

    dependencyData = wiredep(options.wiredep_options);

    _.each(dependencyData.packages, function packageLoop(package, name) {
      _.each(package.main, function mainfileLoop(src) {
        _.each(options.import_types, function typeCheckLoop(typeOptions, type) {
          if (!importNames[type]) {
            importNames[type] = {};
          }

          // If this file ends in the type's extension, track its name
          if (new RegExp('\\.' + (typeOptions.ext || type) + '$').test(src)) {
            importNames[type][src] = name;
          }
        });
      });
    });

    _.each(options.import_types, function importTypeLoop(typeOptions, type) {
      var filesOfType = dependencyData[type];

      importFiles[type] = _.map(filesOfType, function dependencyLoop(src) {
        var name = importNames[type][src],
            dest = path.normalize((typeOptions.dest || defaultImportTypeOptions[type].dest) + '/' + name + '.' + (typeOptions.ext || type));

        grunt.file.copy(src, dest);

        return dest;
      });
    });

    _.each(this.files, function importerFileLoop(file) {
      grunt.file.copy(file.src, file.dest, {
        process: function processImporter(contents) {
          var fileDir = options.cwd || path.dirname(file.dest),
              logString,
              typeLogStrings = [];

          _.each(options.import_types, function tagWriterLoop(typeOptions, type) {
            var tag = typeOptions.tag || defaultImportTypeOptions[type].tag,
                placeholder = '<!-- ' + options.comment_marker + ':' + type + ' -->',
                generatedTags,
                regex;

            if (importFiles[type].length) {
              generatedTags = _.map(importFiles[type], function generateTag(libFileDest) {
                var relPath = path.relative(fileDir, libFileDest);
                return tag.replace('%s', relPath);
              });

              regex = new RegExp('([ \\t]*)' + placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
              contents = contents.replace(regex, function regexReplacement(match, whitespace) {
                return whitespace + generatedTags.join('\n' + whitespace);
              });

              typeLogStrings.push(generatedTags.length + ' ' + type.toUpperCase() + ' package' + (generatedTags.length === 1 ? '' : 's'));
            }
          });

          if (typeLogStrings.length) {
            logString = 'Imported ';

            if (typeLogStrings.length === 1) {
              logString += typeLogStrings[0];
            } else if (typeLogStrings.length === 2) {
              logString += typeLogStrings.join(' and ');
            } else {
              logString += _.initial(typeLogStrings).join(', ');
              logString += ', and ' + _.last(typeLogStrings);
            }
            logString += ' into ' + file.dest;

          } else {
            logString = 'Nothing was imported into ' + file.dest;
          }

          grunt.log.writeln(logString);

          return contents;
        }
      });
    });
  });
};
