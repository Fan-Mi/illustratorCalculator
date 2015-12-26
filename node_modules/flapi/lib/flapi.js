var path        = require('path');
var queryString = require('querystring');
var flickr      = require('./flickr');
var encode      = require('./encode');
var apiHost     = 'api.flickr.com';

// Any options passed in are defined as settings
var flapi = function(opts){
  this.settings = {};
  for(var key in opts){
    if(opts.hasOwnProperty(key)){
      this.settings[key] = opts[key];
    }
  }
};


// Automatically called when the app starts. Authorizes your app and returns
// a request token and signature you'll use to auth users
flapi.prototype.authApp = function(authCallbackURL, next){
  var self = this;
  var message = 'Please visit the flickr documentation http://www.flickr.com/services/api/, or retrieve your app creds here http://www.flickr.com/services/apps, or create an app here http://www.flickr.com/services/apps/create/ \n';

  if(!this.settings.oauth_consumer_key){
    throw new Error('An oauth_consumer_key (app key) is required. ' + message);
  }

  if(!this.settings.oauth_consumer_secret){
    throw new Error('An oauth_consumer_secret (app secret) is required. ' + message);
  }

  if(!authCallbackURL || typeof(authCallbackURL) !== 'string') {
    throw new Error('Please define a an auth callback url. ' + message);
  }

  var request = {
    method      : 'GET',
    host        : apiHost,
    path        : '/services/oauth/request_token',
    queryParams : flickr.addDefaultParams(this.settings, {
      oauth_callback : authCallbackURL
    })
  };

  request.queryParams.oauth_signature = encode.sign(request, this.settings.oauth_consumer_secret);

  flickr.makeRequest(request, function(body, res){
    var returnObj = queryString.parse(body);
    for(var key in returnObj){
      if(returnObj.hasOwnProperty(key)){
        self.settings[key] = returnObj[key];
      }
    }

    if(next){ next(self.settings, res); }
  });
};


// Return a URL with the oauth token
flapi.prototype.getUserAuthURL = function(){
  var perms = (this.settings.perms) ? '&perms=' + this.settings.perms : '';
  return 'http://' + apiHost + '/services/oauth/authorize?oauth_token=' + this.settings.oauth_token + perms;
};


// The "token" is really an object with an oauth_token and an
// oauth_token_secret unique to this individual
flapi.prototype.getUserAccessToken = function(oauth_verifier, next){
  var request = {
    method      : 'GET',
    path        : '/services/oauth/access_token',
    host        : apiHost,
    queryParams : flickr.addDefaultParams(this.settings, {
      oauth_verifier : oauth_verifier
    })
  };

  request.queryParams.oauth_signature = encode.sign(request,
    this.settings.oauth_consumer_secret,
    this.settings.oauth_token_secret
  );

  flickr.makeRequest(request, function(body, res){
    next(queryString.parse(body), res);
  });
};


// General method for handling all api calls
flapi.prototype.api = function(opts){

  if(!opts.method){
    throw new Error('Please pass an api method option as "method". You can find all available flickr methods within the flickr documentation at http://www.flickr.com/services/api/');
  }

  var queryParams = flickr.addDefaultParams(this.settings, {
    method          : opts.method,
    format          : 'json',
    nojsoncallback  : 1
  });

  // Any url params which are passed in should be added
  // to the query params object, ignore the photo
  opts.params = opts.params || {};
  for(var key in opts.params){
    if(key !== 'photo' && opts.params.hasOwnProperty(key)){
      queryParams[key] = opts.params[key];
    }
  }

  var request = {
    method      : flickr.getHttpMethod(opts.method),
    path        : '/services/rest/',
    host        : apiHost,
    queryParams : queryParams
  };

  // If the method is a photo upload, make a few changes
  if(opts.method === 'upload'){
    request.host = 'up.flickr.com';
    request.path = '/services/upload/';
  }

  // Attach the oath_token if passed
  if(opts.accessToken){
    request.queryParams.oauth_token     = opts.accessToken.oauth_token;
    request.queryParams.oauth_signature = encode.sign(request,
      this.settings.oauth_consumer_secret,
      opts.accessToken.oauth_token_secret
    );
  }

  if(!opts.preventCall){
    flickr.makeRequest(request, function(body, res){
      if(opts.next){
        var json = body;
        if(typeof body !== 'object'){
          if(body[0] === '{' || body[0] === '['){
            json = JSON.parse(body);
          } else {
            json = { stat : 'fail', message : body };
          }
        }
        opts.next(json, res);
      }
    }, opts.params.photo);
  }

  // Return the url just in case the end user wants to make
  // the request themselves
  var query = queryString.stringify(request.queryParams);
  var earl  = 'http://' + path.join(request.host, request.path);
  return earl + '?' + query;
};


module.exports = flapi;