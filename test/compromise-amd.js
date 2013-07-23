define(function (require) {
    'use strict';
    var expect = require('chai').expect;
    var _ = require('underscore');

    require('./compromise');
    module.exports('AMD in browser', expect, _, require('compromise'));
    module.exports('AMD in browser min', expect, _, require('compromise-dist'));
});
