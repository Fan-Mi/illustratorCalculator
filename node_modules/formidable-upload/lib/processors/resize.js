'use strict';

var fs = require('fs');
var util = require('util');
var magickwand;

try {
    magickwand = require('magickwand');
} catch (e) {
    // ignore include error for now
}

module.exports = function (resizeOpts, file, cb) {
    if (!magickwand) {
        return cb(new Error(
            'resize depends on magickwand, is magickwand module installed?'
        ));
    }

    if (!resizeOpts || !resizeOpts.settings) {
        return cb(new Error('no resize options set'));
    }

    var method = resizeOpts.use || 'resize';

    if (!magickwand[method]) {
        return cb(new Error('unsupported magickwand method: ' + resizeOpts.use));
    }

    magickwand[method](file.path, resizeOpts.settings, resized);

    function resized(err, data, info) {
        if (err) return cb(err);

        file.resize = info;

        fs.writeFile(file.path, data, 'binary', fileWritten);
    }

    function fileWritten(err) {
        cb(err, file);
    }
};
