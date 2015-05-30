# grunt-insertbower

`grunt-insertbower` is a Grunt task for analyzing the main files from your installed Bower components and inserting them in order into HTML documents.

## Prerequisites

* Grunt
* Bower

## How to use it

```js
grunt.config({
  insertbower: {
    options: {
      types: {
        css: true,
        js: {
          ext: '.es6',
          tag: '<script src="%s" async></script>'
        }
      }
    },
    files: {
      '.tmp/test.html': 'test/test.html'
    }
  }
});
```

The `import_types` option specifies which types of main files you'd like to import from your Bower packages. Each object you pass can include a `dest` value, which determines where the matching main files will end up, and a `tag` attribute, which will be used when inserting the matching main files into the list of HTML documents.
