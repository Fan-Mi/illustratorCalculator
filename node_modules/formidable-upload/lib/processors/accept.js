'use strict';

var util = require('util');

module.exports = function (mimeTypes, file, cb) {
    if (!file.type) {
        return cb(new Error('Empty mime type is not accepted for upload'));
    }

    if (!util.isArray(mimeTypes)) {
        mimeTypes = [mimeTypes];
    }

    for (var i = 0; i < mimeTypes.length; i++) {
        var mimeType = mimeTypes[i];

        if (util.isRegExp(mimeType)) {
            if (mimeType.test(file.type)) {
                return cb(undefined, file);
            }
        } else {
            if (mimeType.toLowerCase() === file.type.toLowerCase()) {
                return cb(undefined, file);
            }
        }
    }

    return cb(new Error(util.format('Mime type %s is not accepted for upload',
        file.type)));
};
