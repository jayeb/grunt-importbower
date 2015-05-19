# grunt-importbower

`grunt-importbower` is a Grunt task for importinng main files from your installed Bower packages and inserting them into an HTML document.

## Prerequisites

* Grunt
* Bower

## How to use it

```js
grunt.config({
  importbower: {
    all: {
      options: {
        import_types: {
          css: {
            dest: '.tmp/css/libs'
          },
          js: {
            dest: '.tmp/js/libs',
            tag: '<script src="%s" async></script>'
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
```

The `import_types` option specifies which types of main files you'd like to import from your Bower packages. Each object you pass can include a `dest` value, which determines where the matching main files will end up, and a `tag` attribute, which will be used when inserting the matching main files into the list of HTML documents.

By default, CSS and JS main files will be imported, pointing to the `bower_imports/css` and `bower_imports/js` directories, respectively.

The `files` configuration option will determine which HTML files will be processed and have tags inserted for the Bower dependencies.