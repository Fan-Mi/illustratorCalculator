'use strict';

var fs = require('fs');
var path = require('path');
var util = require('util');
var mkdirp = require('mkdirp');

module.exports = function (options, saveas, file, cb) {
    options = options || {};

    if (typeof (options) === 'string') {
        options = {
            targetDir: options
        };
    } else if (util.isArray(options)) {
        options = {
            targetDir: path.join.apply(undefined, options)
        };
    }

    // check if targetDir is present
    fs.exists(options.targetDir, checkTargetDir);

    function checkTargetDir(exists) {
        if (exists) {
            proceed();
        } else {
            mkdirp(options.targetDir, proceed);
        }
    }

    function proceed(err) {
        if (err) {
            return cb(err);
        }

        var filename = file.name || path.basename(file.path);
        if (saveas) {
            var ext = path.extname(file.name);

            if (ext) {
                filename = saveas + ext;
            }
        }

        var target = path.join(options.targetDir, filename);

        fs.rename(file.path, target, function (err) {
            var oldpath = file.path;
            file.path = target;
            file.name = filename;

            cb(undefined, file);

            // cleanup temp file
            fs.unlink(oldpath, function () {});
        });
    }
};

//-- Test Code ----------------------------------------------------------
if (require.main === module) {
    (function () {
        var file = {
            "imagefile": {
                "size": 30932,
                "path": "/var/folders/5w/hs4021_j56d2vqybfx38b28m0000gn/T/7c37903e43821dab985505dbc84efe06.jpeg",
                "name": "53a1cd19d535cf368d00007c.jpeg",
                "type": "image/jpeg",
                "mtime": "2014-06-21T17:47:30.982Z"
            }
        };
        module.exports(null, file, console.log);
    })();
}
