"use strict";

/**
 * This simulates Metalsmith for tests.
 */
class MetalsmithMock {
    /**
     * Create an instance of the MetalsmithMock class
     *
     * This spies on all methods on the new instance.
     *
     * @param {string} directory
     */
    constructor(directory) {
        [
            "build",
            "clean",
            "concurrency",
            "destination",
            "directory",
            "frontmatter",
            "metadata",
            "source",
            "use"
        ].forEach((methodName) => {
            this[methodName] = jasmine.createSpy(methodName);
        });
        this.directory(directory);

        // Allow failure simluation with build()
        this.buildResult = true;
        this.build.and.callFake((callback) => {
            if (this.buildResult) {
                callback();
            } else {
                callback(new Error("broken build"));
            }
        });

        // Simulate use a bit better
        this.use.and.returnValue(this);
    }
}

module.exports = MetalsmithMock;
