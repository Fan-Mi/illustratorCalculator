'use strict';

var util = require('util');
var imguri;

try {
    imguri = require('imguri');
} catch (e) {
    // ignore include error for now
}

module.exports = function (file, cb) {
    if (!imguri) {
        return cb(new Error(
            'imguri depends on imguri(npm), is imguri module installed?'));
    }

    if (!file || !file.path) {
        return cb(new Error('no file path found!'));
    }

    var options = {
        force: true
    };

    imguri.encode(file.path, options, encoded);

    function encoded(err, result) {
        if (err || !result || !result[file.path] || result[file.path].err) {
            return cb(err || new Error('error encoding file to imguri'));
        }

        file.data = result[file.path].data;
        cb(undefined, file);
    }
};
