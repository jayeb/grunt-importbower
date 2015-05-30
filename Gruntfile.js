module.exports = function(grunt) {
  var package = grunt.file.readJSON('package.json');

  require('time-grunt')(grunt);

  grunt.initConfig({
    name: package.name,

    jshint: {
        src: package.files,
        options: {
            jshintrc: '.jshintrc',
            reporter: require('reporter-plus/jshint')
          }
      },
    jscs: {
        src: package.files,
        options: {
            config: '.jscsrc',
            reporter: require('reporter-plus/jscs').path
          }
      },

    insertbower: {
        all: {
            options: {
                includeBase: 'libs',
                types: {
                    css: true,
                    js: {
                        includeBase: 'js',
                        tag: '<script src="%s" async></script>'
                      },
                    less: {
                        tag: '<!-- %s -->'
                      }
                  },
                bowerdepsOptions: {
                    wiredepOptions: {
                        devDependencies: true
                      }
                  }
              },
            files: {
                '.tmp/test.html': 'test/test.html'
              }
          },
        js: {
            options: {
                types: {
                    js: {
                        includeBase: 'scripts'
                      }
                  },
                bowerdepsOptions: {
                    wiredepOptions: {
                        devDependencies: true
                      }
                  }
              },
            files: {
                '.tmp/test.html': 'test/test.html'
              }
          }
      }
  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-jscs');
  grunt.loadTasks('tasks');
};
