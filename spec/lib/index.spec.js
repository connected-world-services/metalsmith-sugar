"use strict";

var Metalsmith, MetalsmithMock, sugarFactory;

Metalsmith = require("metalsmith");
MetalsmithMock = require("../mock/metalsmith-mock");
sugarFactory = require("../..");

describe("metalsmith-sugar", () => {
    it("exports a factory", () => {
        expect(sugarFactory).toEqual(jasmine.any(Function));
    });
    it("works without arguments", () => {
        var sugar;

        sugar = sugarFactory();
        expect(sugar).toEqual({
            build: jasmine.any(Function),
            metadata: jasmine.any(Function),
            metalsmith: jasmine.any(Function),
            use: jasmine.any(Function)
        });
        expect(sugar.metalsmith()).toEqual(jasmine.any(Metalsmith));
    });
    it("works with the mock", () => {
        var sugar;

        sugar = sugarFactory({
            metalsmith: MetalsmithMock
        });
        expect(sugar.metalsmith()).toEqual(jasmine.any(MetalsmithMock));
    });
    describe("configuration", () => {
        /**
         * Run the sugarFactory with a config and return the configured
         * Metalsmith object.
         *
         * @param {Object} [config={}]
         * @return {MetalsmithMock}
         */
        function sugaryMetalsmith(config) {
            var sugar;

            config = config || {};
            config.metalsmith = MetalsmithMock;
            sugar = sugarFactory(config);

            return sugar.metalsmith();
        }

        describe("clean", () => {
            it("does not pass a value unless specified", () => {
                expect(sugaryMetalsmith().clean).not.toHaveBeenCalled();
            });
            it("works with true", () => {
                expect(sugaryMetalsmith({
                    clean: true
                }).clean).toHaveBeenCalledWith(true);
            });
            it("works with false", () => {
                expect(sugaryMetalsmith({
                    clean: false
                }).clean).toHaveBeenCalledWith(false);
            });
        });
        describe("concurrency", () => {
            it("does not pass a value unless specified", () => {
                expect(sugaryMetalsmith().concurrency).not.toHaveBeenCalled();
            });
            it("works with a number", () => {
                expect(sugaryMetalsmith({
                    concurrency: 12
                }).concurrency).toHaveBeenCalledWith(12);
            });
        });
        describe("destination", () => {
            it("does not pass a value unless specified", () => {
                expect(sugaryMetalsmith().destination).not.toHaveBeenCalled();
            });
            it("works with a path", () => {
                expect(sugaryMetalsmith({
                    destination: "some-folder"
                }).destination).toHaveBeenCalledWith("some-folder");
            });
        });
        describe("directory", () => {
            // The Metalsmith constructor calls .directory. The mock has
            // been set up to simulate the same behavior.
            it("passes a default value", () => {
                expect(sugaryMetalsmith().directory).toHaveBeenCalled();
            });
            it("works with a path", () => {
                expect(sugaryMetalsmith({
                    directory: "/tmp"
                }).directory).toHaveBeenCalledWith("/tmp");
            });
        });
        describe("frontmatter", () => {
            it("does not pass a value unless specified", () => {
                expect(sugaryMetalsmith().frontmatter).not.toHaveBeenCalled();
            });
            it("works with true", () => {
                expect(sugaryMetalsmith({
                    frontmatter: true
                }).frontmatter).toHaveBeenCalledWith(true);
            });
            it("works with false", () => {
                expect(sugaryMetalsmith({
                    frontmatter: false
                }).frontmatter).toHaveBeenCalledWith(false);
            });
        });
        // "metalsmith" is tested continually
        describe("source", () => {
            it("does not pass a value unless specified", () => {
                expect(sugaryMetalsmith().source).not.toHaveBeenCalled();
            });
            it("works with a path", () => {
                expect(sugaryMetalsmith({
                    source: "some-folder"
                }).source).toHaveBeenCalledWith("some-folder");
            });
        });
    });
    describe("sugar methods", () => {
        var sugar;

        beforeEach(() => {
            sugar = sugarFactory({
                metadata: {
                    thisIsATest: true
                },
                metalsmith: MetalsmithMock
            });
        });
        describe("build", () => {
            it("triggers a build", () => {
                sugar.build();
                expect(sugar.metalsmith().build).toHaveBeenCalledWith(jasmine.any(Function));
            });
            it("triggers a build with a specific callback", () => {
                var callback;

                callback = jasmine.createSpy("callback");
                sugar.build(callback);
                expect(sugar.metalsmith().build).toHaveBeenCalledWith(callback);
                expect(callback).toHaveBeenCalledWith();
            });
            it("throws without a callback", () => {
                sugar.metalsmith().buildResult = false;
                expect(() => {
                    sugar.build();
                }).toThrow();
            });
            it("does not throw without a callback", () => {
                var callback;

                callback = jasmine.createSpy("callback");
                sugar.metalsmith().buildResult = false;
                expect(() => {
                    sugar.build(callback);
                }).not.toThrow();
                expect(callback).toHaveBeenCalledWith(jasmine.any(Error));
            });
        });
        describe("metadata", () => {
            it("returns the metadata object", () => {
                // Use the real Metalsmith to get the real metadata method
                sugar = sugarFactory({
                    metadata: {
                        thisIsATest: true
                    }
                });
                expect(sugar.metadata()).toEqual({
                    thisIsATest: true
                });
                sugar.metadata().anotherTest = "yes";
                expect(sugar.metadata()).toEqual({
                    anotherTest: "yes",
                    thisIsATest: true
                });
            });
        });
        describe("metalsmith", () => {
            it("returns the metalsmith object", () => {
                expect(sugar.metalsmith()).toEqual(jasmine.any(MetalsmithMock));
            });
        });
        describe("use", () => {
            it("accepts a function, like normal Metalsmith usage", () => {
                var fn;

                fn = jasmine.createSpy("fn");
                sugar.use(fn);
                expect(fn).not.toHaveBeenCalled();
                expect(sugar.metalsmith().use).toHaveBeenCalledWith(jasmine.any(Function));
            });
            it("discards extra parameters with middleware function", () => {
                var fn;

                fn = jasmine.createSpy("fn");
                sugar.use(fn, 1, 2, 3);
                expect(fn).not.toHaveBeenCalled();
                expect(sugar.metalsmith().use).toHaveBeenCalledWith(jasmine.any(Function));
            });
            it("works with anonymous functions", () => {
                var fn;

                fn = () => {};

                if (fn.name) {
                    delete fn.name;
                }

                sugar.use(fn);
                expect(sugar.metalsmith().use).toHaveBeenCalledWith(jasmine.any(Function));
            });
            it("accepts a module name", () => {
                // Relative to the library!
                sugar.use("../spec/mock/fake-module");
                expect(sugar.metalsmith().use).toHaveBeenCalledWith(jasmine.any(Function));
            });
            it("accepts a module name and arguments", () => {
                // Relative to the library!
                sugar.use("../spec/mock/fake-module", 1, "two");
                expect(sugar.metalsmith().use).toHaveBeenCalledWith(jasmine.any(Function));
            });
        });
    });
});
