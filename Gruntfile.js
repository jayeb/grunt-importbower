module.exports = function(grunt) {
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    name: '<%= pkg.name %>',

    jshint: {
        src: 'tasks/*.js',
        options: {
            jshintrc: '.jshintrc',
            reporter: require('reporter-plus/jshint')
          }
      },
    jscs: {
        src: 'tasks/*.js',
        options: {
            config: '.jscsrc',
            reporter: require('reporter-plus/jscs').path
          }
      },

    importbower: {
        test: {
            options: {
                import_types: {
                    css: {
                        dest: '.tmp/css/libs'
                      },
                    js: {
                        dest: '.tmp/js/libs',
                        tag: '<script src="%s" async></script>'
                      },
                    less: {
                        dest: '.tmp/less/libs',
                        tag: '<!-- %s -->'
                      }
                  },
                wiredep_options: {
                    devDependencies: true
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
