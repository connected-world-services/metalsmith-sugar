Metalsmith Sugar
================

Syntactic sugar to make it sweeter to use [Metalsmith].

**This is not a plugin!** Instead, you use this to load other plugins.

[![npm version][npm-badge]][npm-link]
[![Build Status][travis-badge]][travis-link]
[![Dependencies][dependencies-badge]][dependencies-link]
[![Dev Dependencies][devdependencies-badge]][devdependencies-link]
[![codecov.io][codecov-badge]][codecov-link]


Overview
--------

This is easier to describe in code.

    // Before:
    var Metalsmith = require("Metalsmith");
    var myPlugin = require("metalsmith-my-plugin");
    var metalsmith = new Metalsmith(__dirname);
    metalsmith.use(myPlugin({
        configuration: true
    }));

    // After:
    var sugar = require("metalsmith-sugar")();
    sugar.use("metalsmith-my-plugin", {
        configuration: true
    });

This handles the loading of Metalsmith for you and also makes it easier to use many plugins in your build without having to call `require()` on each of them. You still maintain full control over all of the aspects of the build and you can skip tedium. One does not need to require modules to capture the factory functions and then call the factory.

All of the typical Metalsmith configuration is supported. The exported factory can accept several options. These names are essentially all taken directly from how you would initialize Metalsmith on your own. If you define any of the properties, they will be sent along to Metalsmith as expected. Many of these should work as-is without being defined in your project.

    var sugar = require("metalsmith-sugar")({
        clean: true,
        concurrency: Infinity,
        destination: "build",
        directory: __dirname, // Defaults to the module's `${__dirname}/../..`
        frontmatter: true,
        metalsmith: require("metalsmith"), // Lets you override the constructor
        source: "src"
    });

In addition, the [`metalsmith-timer`] module is added for each plugin so you are able to get detailed timing information. Three other events are logged under the `metalsmith-timer` debug flag; the completion of loading the JavaScript, the time it takes to read all source files and when the build finishes. You enable debug by setting an environment variable during the build. Assuming you have a "build" script in your `package.json`, the command could look like this.

    DEBUG=metalsmith-timer npm run build


Installation
------------

Use `npm` to install this package easily.

    $ npm install --save metalsmith-sugar

Alternately you may edit your `package.json` and add this to your `dependencies` object:

    {
        ...
        "dependencies": {
            ...
            "metalsmith-sugar": "*"
            ...
        }
        ...
    }

This already depends on the `metalsmith` module so you don't need to list it separately in your `package.json` file.


API
---

The factory accepts configuration. All of these properties are optional. What you see below are the default options. Many of these are the defaults from Metalsmith itself.

    var sugar = require("metalsmith-sugar")({
        // If true, cleans the build directory before running a build.
        // When false, does not clean and just overwrites as needed.
        // Boolean. Passed to metalsmith.clean().
        clean: true,

        // If set, limits the maximum number of concurrent file reads that
        // happen. Number. Passed to metalsmith.concurrency().
        concurrency: Infinity,

        // This is where the generated files are placed after the build.
        // It is relative to the .directory property. String. Passed to
        // metalsmith.destination().
        destination: "build",

        // The root of the project. This holds the source and destination
        // directories. String. Passed to the Metalsmith constructor.
        // The default value here should automatically find the project's
        // root folder. If not, please set this to `__dirname` or any other
        // working value for your structure.
        directory: path.resolve(__dirname, "..", ".."),

        // Enable or disable frontmatter loading. Boolean. Passed to
        // metalsmith.frontmatter().
        frontmatter: true,

        // The Metalsmith object constructor. If you want to make an instance
        // of another object, override this constructor. Function.
        metalsmith: require("metalsmith"),

        // The folder containing the source files. String. Passed to
        // metalsmith.source().
        source: "src"
    });

This factory creates a Metalsmith instance and configures it. A `metalsmith-timer` message is added indicating when all of the source files have been loaded.

The factory returns a `sugar` object with the following methods.


### `sugar = sugar.build([callback])`

Run a build, nearly identical to `metalsmith.build()`. If no callback function is passed, this will create a callback that will simply `throw` if there are any errors.

The build will also add an event to `metalsmith-timer` showing when all of the JavaScript modules have been loaded and another event when the build completes successfully.


### `metadata = sugar.metadata()`

Calls `metalsmith.metadata()` and returns the metadata object. Simply a convenience function to have the sugar operate more like Metalsmith.


### `metalsmith = sugar.metalsmith()`

Returns the Metalsmith instance being used. It should be considered a bug if you need to call this method because the sugar module isn't doing enough work for you.


### `sugar = sugar.use(middlewareFunction)`
### `sugar = sugar.use(middlewareString, arguments...)`

The first syntax is just like how you would call `metalsmith.use()`. The second is the sugar version that will call `require()` on your behalf and pass along extra arguments to the module's factory. There's an example at the top explaining how to use this.

In addition to loading the module, a call to `metalsmith-timer` will indicate when the plugin has finished. This will say the middleware's name when you pass a module name (string). When you pass a middleware function, the timer message will say the function's name when available, or indicate that it is an anonymous function.


License
-------

This software is licensed under a [MIT license][LICENSE] that contains additional non-advertising and patent-related clauses.  [Read full license terms][LICENSE]


[codecov-badge]: https://img.shields.io/codecov/c/github/connected-world-services/metalsmith-sugar/master.svg
[codecov-link]: https://codecov.io/github/connected-world-services/metalsmith-sugar?branch=master
[dependencies-badge]: https://img.shields.io/david/connected-world-services/metalsmith-sugar.svg
[dependencies-link]: https://david-dm.org/connected-world-services/metalsmith-sugar
[devdependencies-badge]: https://img.shields.io/david/dev/connected-world-services/metalsmith-sugar.svg
[devdependencies-link]: https://david-dm.org/connected-world-services/metalsmith-sugar#info=devDependencies
[LICENSE]: LICENSE.md
[metalsmith]: http://www.metalsmith.io/
[`metalsmith-timer`]: https://github.com/deltamualpha/metalsmith-timer
[npm-badge]: https://img.shields.io/npm/v/metalsmith-sugar.svg
[npm-link]: https://npmjs.org/package/metalsmith-sugar
[travis-badge]: https://img.shields.io/travis/connected-world-services/metalsmith-sugar/master.svg
[travis-link]: http://travis-ci.org/connected-world-services/metalsmith-sugar
