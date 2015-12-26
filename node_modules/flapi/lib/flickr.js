var fs          = require('fs');
var queryString = require('querystring');
var http        = require('http');
var restler     = require('restler');


// Make HTTP requests to flickr
exports.makeRequest = function(request, next, photo){
  var query    = (request.queryParams) ? '?' + queryString.stringify(request.queryParams) : '';
  var reqOpts  = {
    host    : request.host,
    path    : request.path + query,
    method  : request.method
  };

  // When posting, we need to pass all data in the body instead of the query
  // this is used only for image creation
  if(photo){
    var earl = 'http://' + reqOpts.host + reqOpts.path;
    var form = {};
    for(var key in request.queryParams){
      if(request.queryParams.hasOwnProperty(key)){
        form[key] = request.queryParams[key];
      }
    }

    var postForm = function(){
      restler.post(earl, {
        multipart : true,
        data      : form
      }).on('complete', function(xml, res) {
        var photoNode = xml.match('<photoid>(.*)</photoid>');
        var msgNode   = xml.match('<message>(.*)</message>');
        var body      = {
          stat : photoNode ? 'ok' : 'fail'
        };

        if(photoNode){ body.photoid = photoNode[1]; }
        if(msgNode)  { body.message = msgNode[1];   }

        next(body, res);
      });
    };

    fs.stat(photo, function (err, stats){
      form.photo = restler.file(photo, null, stats.size, null);
      postForm();
    });
  } else {
    var data    = [];
    var httpReq = http.request(reqOpts, function(res){
      res.on('data',function(chunk){
        data.push(chunk);
      });

      res.on('end',function(){
        next(data.join(''), res);
      });
    });

    httpReq.end();
  }
};


// Convenience for adding nonce, time stamp, and version
// ...also adds two objects together
// ...also strips out banned parameters
exports.addDefaultParams = function(original, additional){
  var obj = {
    oauth_nonce         : Math.floor(Math.random()*100) + new Date().getTime(),
    oauth_timestamp     : Math.floor(new Date()/1000),
    oauth_version       : '1.0'
  };

  // Make a copy of the original object
  for(var oKey in original){
    if(original.hasOwnProperty(oKey)){
      obj[oKey] = original[oKey];
    }
  }

  // If an object to add is passed, add it
  if(additional){
    for(var aKey in additional){
      if(additional.hasOwnProperty(aKey)){
        obj[aKey] = additional[aKey];
      }
    }
  }

  // Delete the banned params
  var bannedParams = ['consumer_secret', 'photo', 'perms', 'oauth_callback_confirmed'];
  bannedParams.forEach(function(banned){
    delete obj[banned];
  });

  return obj;
};


exports.getHttpMethod = function(methodName){
  var name = methodName.replace('flickr.', '');
  return postMethods.indexOf(name) === -1 ? 'GET' : 'POST';
};


var postMethods = [
  'upload',
  'blogs.postPhoto',
  'favorites.add',
  'favorites.remove',
  'galleries.addPhoto',
  'galleries.create',
  'galleries.editMeta',
  'galleries.editPhoto',
  'galleries.editPhotos',
  'groups.join',
  'groups.joinRequest',
  'groups.leave',
  'groups.discuss.replies.add',
  'groups.discuss.replies.delete',
  'groups.discuss.replies.edit',
  'groups.discuss.topics.add',
  'groups.pools.addPhoto',
  'groups.pools.remove',
  'photos.addTags',
  'photos.delete',
  'photos.removeTag',
  'photos.setContentType',
  'photos.setDates',
  'photos.setMeta',
  'photos.setPerms',
  'photos.setSafetyLevel',
  'photos.setTags',
  'photos.comments.addComment',
  'photos.comments.deleteComment',
  'photos.comments.editComment',
  'photos.geo.batchCorrectLocation',
  'photos.geo.correctLocation',
  'photos.geo.removeLocation',
  'photos.geo.setContext',
  'photos.geo.setLocation',
  'photos.geo.setPerms',
  'photos.licenses.setLicense',
  'photos.notes.add',
  'photos.notes.delete',
  'photos.notes.edit',
  'photos.people.add',
  'photos.people.delete',
  'photos.people.deleteCoords',
  'photos.people.editCoords',
  'photos.suggestions.approveSuggestion',
  'photos.suggestions.rejectSuggestion',
  'photos.suggestions.removeSuggestion',
  'photos.suggestions.suggestLocation',
  'photos.transform.rotate',
  'photosets.addPhoto',
  'photosets.create',
  'photosets.delete',
  'photosets.editMeta',
  'photosets.editPhotos',
  'photosets.orderSets',
  'photosets.removePhoto',
  'photosets.removePhotos',
  'photosets.reorderPhotos',
  'photosets.setPrimaryPhoto',
  'photosets.comments.addComment',
  'photosets.comments.deleteComment',
  'photosets.comments.editComment'
];