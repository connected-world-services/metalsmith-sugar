"use strict";

module.exports = jasmine.createSpy("fakeModule").and.callFake(function () {
    var args;

    args = [].slice.call(arguments);

    return `fakeModule result ${JSON.stringify(args)}`;
});
