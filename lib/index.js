#!/usr/bin/env node

/**
 * This is what the factory function returns. It's a helper for using
 * Metalsmith with fewer defined variables and less fuss.
 *
 * @typedef {Object} metalsmithSugar
 * @property {Function} build
 * @property {Function} metadata
 * @property {Function} metalsmith
 * @property {Function} use
 */

/**
 * The factory function takes this as a parameter.
 *
 * @typedef {Object} metalsmithSugar~config
 * @property {boolean} [clean If defined, passed to metalsmith.clean()
 * @property {string} [concurrency] If set, used by metalsmith.concurrency()
 * @property {string} [destination] If set, used by metalsmith.destination()
 * @property {string} [directory] Defaults to __dirname/../../..
 * @property {boolean} [frontmatter] If set, sent to metalsmith.frontmatter()
 * @property {Metalsmith} [metalsmith] Defaults to require("metalsmith")
 * @property {string} [source] If specified, passed to metalsmith.source()
 */

"use strict";

var debug, debugSugar, debugTimer, Metalsmith, path, timer;

debug = require("debug");
debugSugar = debug("metalsmith-sugar");
debugTimer = debug("metalsmith-timer");
Metalsmith = require("metalsmith");
path = require("path");
timer = require("metalsmith-timer");

/**
 * Assigns a name for a function
 *
 * @param {Function} fn
 * @param {string} name
 */
function setFunctionName(fn, name) {
    Object.defineProperty(fn, "name", {
        configurable: true,
        enumerable: false,
        writable: false,
        value: name
    });
}


/**
 * Builds the sugar object that is returned from calling the exported
 * factory from this module.
 *
 * @param {Metalsmith} smith
 * @return {metalsmithSugar}
 */
function buildSugar(smith) {
    var sugar;

    sugar = {};

    /**
     * Run the build.
     *
     * Does not require a callback. If no callback is specified, then
     * a very generic callback is created that simply throws when there
     * is an error.
     *
     * This also adds a line to the metalsmith-timer debug output indicating
     * how long it took to finish loading the JavaScript modules.
     *
     * @param {function} [callback]
     * @return {this}
     */
    sugar.build = (callback) => {
        debugSugar("Starting a build");
        debugTimer("javascript modules loaded");
        callback = callback || ((err) => {
            if (err) {
                debugSugar("Build error");

                throw err;
            }

            debugSugar("Build completed");
            debugTimer("build complete");
        });
        smith.build(callback);

        return sugar;
    };

    /**
     * Gets the metadata from Metalsmith.
     *
     * @return {Object}
     */
    sugar.metadata = () => {
        return smith.metadata();
    };

    /**
     * Returns the instance of Metalsmith being used by this sugar object.
     *
     * @return {Metalsmith}
     */
    sugar.metalsmith = () => {
        return smith;
    };

    /**
     * Adds a middleware to Metalsmith.
     *
     *   var myMetalsmithPlugin = require("myMetalsmithPlugin");
     *   sugar.use(myMetalsmithPlugin({
     *       config: "same as normal usage"
     *   }));
     *
     * When passed a string, it is assumed to be a module name and is
     * required. Additional arguments are passed to the module's exported
     * function.
     *
     *   sugar.use("myMetalsmithPlugin", {
     *       config: "very similar to what's above"
     *   });
     *
     * @param {(function|string)} middleware
     * @param {*} [args...]
     * @return {this}
     */
    sugar.use = function (middleware) {
        var args, name, wrapped;

        args = [].slice.call(arguments, 1);

        if (typeof middleware === "string") {
            debugSugar("Requiring middleware: %s", middleware);
            name = middleware;
            middleware = require(name).apply(null, args);

            // Set a reasonable, consisten function name for DebugUI.
            setFunctionName(middleware, name.replace(/^metalsmith-/, ""));
        } else if (middleware.name) {
            name = middleware.name;
            debugSugar("Using middleware function: %s", name);
            name = middleware.name;
        } else {
            debugSugar("Using anonymous middleware");
            name = "anonymous function";
        }

        // Wrap the middleware so we can have the time it starts and completes.
        if (middleware.length <= 2) {
            wrapped = (files, metalsmith) => {
                debugTimer("Starting plugin: %s", name);
                middleware(files, metalsmith);
                debugTimer("Plugin completed: %s", name);
            };
        } else {
            wrapped = (files, metalsmith, done) => {
                debugTimer("Starting plugin: %s", name);
                middleware(files, metalsmith, (err) => {
                    if (err) {
                        debugTimer("Plugin failed: %s", name);
                    } else {
                        debugTimer("Plugin completed: %s", name);
                    }

                    done(err);
                });
            };
        }

        // Copy the function name for Debug-UI to work better.
        if (middleware.name) {
            setFunctionName(wrapped, middleware.name);
        }

        smith.use(wrapped);

        return sugar;
    };

    debugSugar("Sugar object build complete");

    return sugar;
}


/**
 * The exported factory function. Generates a metalsmithSugar object.
 *
 * @param {metalsmithSugar~config} config
 * @return {metalsmithSugar}
 */
module.exports = (config) => {
    var smith;

    // Default the configuration.
    config = config || {};
    config.directory = config.directory || path.resolve(__dirname, "..", "..", "..");
    config.metalsmith = config.metalsmith || Metalsmith;
    debugSugar("Directory: %s", config.directory);

    // Create a new Metalsmith instance.
    /* eslint new-cap: off */
    smith = new config.metalsmith(config.directory);

    if (config.source) {
        debugSugar("Source: %s", config.source);
        smith.source(config.source);
    }

    if (config.destination) {
        debugSugar("Destination: %s", config.destination);
        smith.destination(config.destination);
    }

    if (config.concurrency) {
        debugSugar("Concurrency: %s", config.concurrency.toString());
        smith.concurrency(config.concurrency);
    }

    if (config.hasOwnProperty("clean")) {
        debugSugar("Clean: %b", config.clean);
        smith.clean(config.clean);
    }

    if (config.hasOwnProperty("frontmatter")) {
        debugSugar("Frontmatter: %b", config.frontmatter);
        smith.frontmatter(config.frontmatter);
    }

    if (config.metadata) {
        debugSugar("Metadata: %O", config.metadata);
        smith.metadata(config.metadata);
    }

    // Add the timer here manually to show how long the source files
    // take to load.
    smith.use(timer("source files loaded"));
    debugSugar("Building sugar object");

    return buildSugar(smith, config);
};
