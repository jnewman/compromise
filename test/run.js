(function (global) {
    var TESTS = [
        'test/compromise-amd'
    ];

    require({
        paths: {
            chai: '../node_modules/chai/chai',
            compromise: '../src/compromise',
            'compromise-dist': '../dist/compromise.min',
            mocha: '../node_modules/mocha/mocha',
            q: '../node_modules/q/q',
            test: '.',
            underscore: '../node_modules/lodash/lodash'
        },

        shim: {
            mocha: {
                exports: 'mocha'
            }
        }
    });

    require([
        'require',
        'underscore',
        'mocha'
    ], function (
        require,
        _,
        mocha
    ) {
        'use strict';
        _.noConflict();

        mocha.ui('bdd');
        mocha.reporter('html');

        require(TESTS, function() {
            if (typeof global !== 'undefined' && global.initMochaPhantomJS) {
                global.initMochaPhantomJS();
            } else {
                mocha.run();
            }
        });
    });
})(this || window);
