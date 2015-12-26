var crypto = require('crypto');

// Flickr requires a signature to be built for auth requests
// There is a lot of encodeURIComponents here, but they're all needed...
// at least i think so
exports.sign = function(req, consumerSecret, tokenSecret){
  if(!req.queryParams){ req.queryParams = {};   }
  if(!req.method)     {req.method       = 'GET';}
  if(!tokenSecret)    { tokenSecret     = '';   }

  req.queryParams.oauth_signature_method = 'HMAC-SHA1';

  // Sort parameters and encode key value pairs
  // ignore banned parameters
  var paramKeys = Object.keys(req.queryParams).sort();
  var urlParams = [];
  paramKeys.forEach(function(key){
    var keyValuePair = encodeURIComponent(key + '=' + encodeURIComponent(req.queryParams[key]));
    urlParams.push(keyValuePair);
  });

  var url       = 'http://' + req.host + req.path;
  var urlString = req.method + '&' + encodeURIComponent(url) + '&' +  urlParams.join(encodeURIComponent('&'));
  var encodeKey = consumerSecret + '&' + tokenSecret;
  var encoded   = crypto.createHmac('sha1', encodeKey).update(urlString).digest('base64');

  return encoded;
};