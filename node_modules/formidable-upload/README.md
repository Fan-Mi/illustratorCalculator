# Formidable Upload

Chainable file upload api for express using [formidable](https://github.com/felixge/node-formidable).

## Installation

    $ npm install formidable-upload

## Usage

    var upload = require('formidable-upload');

    // ..

    upload()
        .accept('image/jpeg')
        .to(['public', 'images'])
        .resize({
            use: 'resize',
            settings: {
                width: 800,
                quality: 80
            }
        })
        .imguri()
        .exec(req.files.displayImage, function(err, file) {
            // further process file
        });

## Processing Chains

After creating an `Upload` object by calling `upload()` the upload object exposes API methods

### accept
Restricts files accepted by upload to specified mime types. Mime types can be specified as strings, array of strings, regex or array of regex. In case match fails an `err` object is passed to the `exec` callback field `accept` set to true.

#### Examples

Accept mp4, ogg and jpeg files in upload

      accept(['audio/mp4', 'audio/ogg', 'image/jpeg'])

Accept only mp4

      accept('audio/mp4')

Accept all image mime types

      accept([/image*/])

### to
Moves files from temp express upload location to the target location. The `to` processor modifies `file.path` and `file.name` fields of the original express upload file to point to the moved upload file. `to` will use any given file extension from the original `file.name`. A target directory is expected as argument, in case an array of strings is passed this array will be joined via `path.join`.

#### Examples

Moves uploaded files to public/images

      to(['public', 'images'])

Moves uploaded files to public/images

      to('public/images')

### resize
Allows uploaded files to be processed via Magickwand. See [magickwand page](https://github.com/qzaidi/magickwand) for using magickwand. Magicwand supports `resize` and `thumbnail` methods. Please refer the magickwand page if you face any issue while installing the module.

#### Examples

Resize an uploaded image to width of 800 and quality of 80 maintaining the aspect ratio.

      resize({
          use: 'resize',
          settings: {
              width: 800,
              quality: 80
          }
      })


### imguri
Convert the uploaded image to data uri, sets `req.files.userfile.data` with Base64 encoded data.

      imguri()


### process
Generic handler to pass custom transformation code in the processing chain. Functions passed to `process` must have the signature

      fn(file, cb)

Where file is the processed upload file and `cb` is the callback.

### exec
Executes a processing chain. Processing chains are reusable and may be executed multiple times. In case the file is not part of the upload or is empty an `err` is passed to the callback with a field `noFile` set to true.


## Middleware
Instead of executing and managing upload file processing in your routes, express-upload can be used as middleware in express. Any processing errors (no file, file type not accepted,...) are stored in a `err` property of the file to upload.

### Example

      // Build an upload instance but don't execute it right now
      var uploader = upload()
          .accept('image/jpeg')
          .to(['public', 'images'])
          .resize({
              use: 'resize',
              settings: {
                  width: 800,
                  quality: 80
              }
          })
          .imguri();


      // Define a middleware for handling image upload
      app.post('/upload', uploader.middleware('userfile'), routes.upload);

In case an error would occur when uploading the next middleware will be called with the error.

## Example Code
[Formidable Upload Example](https://github.com/vnykmshr/formidable-upload-example).
