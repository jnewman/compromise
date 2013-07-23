/*jshint maxstatements:10000*/
/*globals module:true*/

module = (typeof module === 'object' ? module : {});
module.exports = typeof exports === 'object' ? exports : {};
module.exports = function (contextDescription, expect, _, compromise) {
    'use strict';
    describe(contextDescription, function () {
        var targets = [];
        var called = [];

        beforeEach(function () {
            var i = 0;
            function Foo () {
                this.id = i++;
            }

            var mkCbOnlyFn = function () {
                return function (value, callback) {
                    value += 1;
                    called.push(this.id);
                    var cb = _.bind(callback, this);
                    setTimeout(function () {
                        cb(null, value);
                    }, 1);
                };
            };

            _.extend(Foo.prototype, {
                a: mkCbOnlyFn(),
                b: mkCbOnlyFn(),
                c: mkCbOnlyFn()
            });

            var example = {
                get: function get(url, methods, callback) {
                    callback(null, url, {name: 'foo', age: 42});
                },

                options: function options(url, callback) {
                    callback(null, url, {methods: ['get', 'post']});
                },

                post: function post(url, data, callback) {
                    callback(null, {success: true});
                }
            };

            targets = [
                new Foo(),
                new Foo(),
                new Foo(),
                example
            ];
        });

        afterEach(function () {
            targets = [];
            called = [];
        });

        it('works for the example', function (done) {
            var target = targets[3];
            compromise(target, 'options', 'get', 'post')('/foo').then(function (resp) {
                expect(resp).to.eql({success: true});
                done();
            });
        });

        it('is defined', function () {
            expect(compromise()).to.be.a('function');
        });

        it('returns a promise', function () {
            expect(compromise(_.first(targets))().then).to.be.a('function');
        });

        it('calls the functions in requested order', function (done) {
            var target = _.first(targets);
            compromise(target, 'a', 'b', 'c')(0).then(function (value) {
                // One for each function
                expect(value).to.equal(3);

                _.forEach(called, function (id) {
                    expect(id).to.equal(0);
                });
                done();
            });
        });

        it('calls all methods on the given context', function (done) {
            var target = targets[2];
            compromise(target, 'a', 'b', 'c')(0).then(function () {
                _.forEach(called, function (id) {
                    // The last id is 2, make sure the context was that.
                    expect(id).to.equal(2);
                });
                done();
            });
        });

        it('passes the initial value through', function (done) {
            var target = targets[1];
            compromise(target, 'a', 'b', 'c')(42).then(function (value) {
                expect(value).to.equal(45);
                done();
            });
        });

        it('handles function pointers the same as keys', function (done) {
            var target = _.first(targets);
            compromise(target, target.a, target.b, target.c)(0).then(function (value) {
                // One for each function
                expect(value).to.equal(3);

                _.forEach(called, function (id) {
                    expect(id).to.equal(0);
                });
                done();
            });
        });
    });
};
