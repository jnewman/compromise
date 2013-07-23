(function () {
    'use strict';
    require('./compromise')(
        'Require in Node',
        require('chai').expect,
        require('underscore'),
        require('../')
    );
})();
