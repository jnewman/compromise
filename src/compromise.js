(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['underscore', 'q'], factory);
    }
    else if (typeof exports === 'object') {
        // CommonJS
        module.exports = factory(require('underscore'), require('q'));
    }
    else {
        /*globals _:false,Q:false*/
        // Browser globals
        window.compromise = factory(_, Q);
    }
}(this, function (_, Q) {
    'use strict';
    /**
     * Takes a context and keys (for some methods) or functions, then executes the functions in
     * order, transfiguring each from a callback taker to a promise giver. {@see: ../README.md}
     *
     * @param {Object} context The context to call each method with. (Hint bind other methods.)
     * @param {(function()|string)...} [methods] Methods to transfigure and compose. Noop if excluded.
     * @param {boolean} [multiple=false] Set to true to extract all args (except any error) from the
     *     final callback in the chain.
     * @returns {Promise} Resolves to the final value.
     */
    return function compromised(context, methods, multiple) {
        var todo = _.tail(arguments);
        multiple = _.isBoolean(_.last(todo)) ? todo.pop() : false;
        return function (args) {
            var ms = _.map(todo, function transfigure(method) {
                return function (args) {
                    var finished = Q.defer();
                    var complete = function complete(err, data) {
                        if (err) {
                            finished.reject(err);
                        }
                        else {
                            finished.resolve(_.tail(arguments));
                        }
                    };

                    var fn = _.isFunction(method) ? method : context[method];
                    // Put the callback at the end.
                    fn.apply(context, args.concat(complete));

                    return finished.promise;
                };
            });

            for (var i = 0, len = ms.length, promises = [], prev = null, current = null; i < len; ++i) {
                current = ms[i];
                prev = promises[i] = prev ? prev.then(current) : current(_.toArray(arguments));
            }

            return Q.all(promises).then(function (results) {
                var last = _.last(results);
                return multiple ? last : last[0];
            });
        };
    };
}));
