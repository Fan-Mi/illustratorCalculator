'use strict';

var util = require('util');
var async = require('async');
var formidable = require('formidable');
var processors = require('./processors');

module.exports = function () {
    return new Upload();
};

var Upload = function () {
    this.chain = [];
};

Upload.prototype.accept = function (mimeTypes) {
    this.chain.push(processors.accept.bind(null, mimeTypes));
    return this;
};

Upload.prototype.to = function (targetDir, saveAs) {
    this.chain.push(processors.to.bind(null, targetDir, saveAs));
    return this;
};

Upload.prototype.resize = function (resizeOpts) {
    this.chain.push(processors.resize.bind(null, resizeOpts));
    return this;
};

Upload.prototype.imguri = function () {
    this.chain.push(processors.imguri.bind(null));
    return this;
};

Upload.prototype.process = function (fn) {
    this.chain.push(fn);
    return this;
};

Upload.prototype.exec = function (file, cb) {
    if (!file || typeof (file) === 'function' || !file.size) {
        var errcb = cb || file;

        return errcb(new Error('No file was given to upload'));
    }

    var chain = this.chain.slice(0);
    chain.unshift(function (lcb) {
        lcb(undefined, file);
    });

    async.waterfall(chain, cb);

    return this;
};

Upload.prototype.parse = function (req, cb) {
    var form = new formidable.IncomingForm();
    form.encoding = 'utf-8';
    form.type = 'multipart';
    form.keepExtensions = true;
    form.uploadDir = process.env.TMP || process.env.TMPDIR ||
        process.env.TEMP || '/tmp' || process.cwd();

    form.on('error', function (err) {
        util.log('[upload] ' + err.message);
    });

    form.on('aborted', function () {
        util.log('[upload] aborted by user');
    });

    form.parse(req, cb);
};

Upload.prototype.middleware = function (filename) {
    var self = this;

    return function (req, res, next) {
        self.parse(req, formParsed);

        function formParsed(err, fields, files) {
            if (err) return next(err);

            req.files = files;

            self.exec(req.files[filename], next);
        }

        function respond(err, file) {
            if (err) {
                return next(err);
            }
            
            req.files[filename] = file;
            next();
        }
    };
};
