module.exports = function insertBower(grunt) {
  var path = require('path'),
      _ = require('lodash'),
      bowerDeps = require('bowerdeps');

  grunt.registerMultiTask('insertbower', function importBowerTask() {
    var options,
        defaultTypeOptions,
        libs,
        importNames = {},
        importFiles = {};

    defaultTypeOptions = {
      css: {
          ext: 'css',
          tag: '<link rel="stylesheet" href="%s" />',
          includeBase: null, // When generating relative paths from the src file to the libs, use this cwd
        },
      js: {
          ext: 'js',
          tag: '<script type="text/javascript" src="%s"></script>',
          includeBase: null, // When generating relative paths from the src file to the libs, use this cwd
        }
    };

    // Set default options
    options = this.options({
      includeBase: null,
      types: {
          js: true,
          css: true
        },
      commentMarker: 'insertbower',
      bowerdepsOptions: {}
    });
    // Normalize types
    _.each(options.types, function normalizeType(typeOptions, type) {
      if (!_.isObject(typeOptions)) {
        typeOptions = {};
      }

      options.types[type] = _.defaults(typeOptions, defaultTypeOptions[type]);
    });

    // Get libs
    libs = bowerDeps(_.extend({}, options.bowerdepsOptions, {
      types: _.keys(options.types)
    }));

    // Process files, inserting tags for relevant libs
    _.each(this.files, function importerFileLoop(file) {
      grunt.file.copy(file.src, file.dest, {
        process: function processImporter(contents) {
          var fileDir = options.cwd || path.dirname(file.dest),
              logString,
              typeLogStrings = [];

          _.each(options.types, function tagWriterLoop(typeOptions, type) {
            var placeholder = '<!-- ' + options.commentMarker + ':' + type + ' -->',
                generatedTags = [],
                regex;

            if (libs[type].length) {
              generatedTags = _.chain(libs[type]).map(function processLibFiles(lib) {
                return _.map(lib.files, function generateTag(libFile) {
                  var fileName = path.basename(libFile),
                      filePath = fileName;

                  if (typeOptions.includeBase) {
                    filePath = path.join(typeOptions.includeBase, filePath);
                  }

                  if (options.includeBase) {
                    filePath = path.join(options.includeBase, filePath);
                  }

                  return typeOptions.tag.replace('%s', filePath);
                });
              }).flatten().value();

              regex = new RegExp('([ \\t]*)' + placeholder.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));

              contents = contents.replace(regex, function regexReplacement(match, whitespace) {
                return whitespace + generatedTags.join('\n' + whitespace);
              });

              typeLogStrings.push(generatedTags.length + ' ' + type.toUpperCase() + ' package' + (generatedTags.length === 1 ? '' : 's'));
            }
          });

          if (typeLogStrings.length) {
            logString = 'Inserted ';

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
            logString = 'Nothing was inserted into ' + file.dest;
          }

          grunt.log.writeln(logString);

          return contents;
        }
      });
    });
  });
};
