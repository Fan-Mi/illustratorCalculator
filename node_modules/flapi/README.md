# Flapi [![Build Status](https://travis-ci.org/joelongstreet/flapi.png)](https://travis-ci.org/joelongstreet/flapi) [![NPM version](https://badge.fury.io/js/flapi.png)](http://badge.fury.io/js/flapi) [![Code Climate](https://codeclimate.com/github/joelongstreet/flapi.png)](https://codeclimate.com/github/joelongstreet/flapi)

## Feature Set
I know there are several existing node flickr modules, but... I thought the community could use one with the following features:

* Simple api wrapper
* Fully tested
* Oauth support
* Extra light dependency tree
* Example code


### Quick Start (...quickish)
1 - Instantiate the flapi client:
``` javascript
var Flapi = require('flapi');
var flapiClient = new Flapi({
  oauth_consumer_key    : FLICKR_KEY,
  oauth_consumer_secret : FLICKR_SECRET
});
```

2 - Listen for an http request from flickr and respond
``` javascript
var server = http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end();
});
```

3 - Authenticate your application
``` javascript
flapiClient.authApp('http://localhost:3000/auth_callback');
```

4 - When application authentication is finished, prompt users to authenticate with your app by giving them the app auth url.
``` javascript
var url = flapiClient.getUserAuthURL();
```

5 - Get the user's access token to make individual requests.
``` javascript
var userAccessToken;
flapiClient.getUserAccessToken(function(accessToken){
  userAccessToken = accessToken;
});
```

6 - Make requests on the user's behalf
``` javascript
flapiClient.api({
  method      : 'flickr.people.getPhotos',
  params      :  { user_id : userAccessToken.user_nsid },
  accessToken : userAccessToken,
  next        : function(data){
      console.log('User Photos: ', data)
  }
});
```



## Making API requests
Once you've authorized your application and have permissions from a user, you should be able to make api requests on their behalf.

With the exception of photo uploading, all api methods match the [flickr documentation](http://www.flickr.com/services/api/). To get a [listing of photos](http://www.flickr.com/services/api/flickr.people.getPhotos.html), you'll need a `user_id` and the user's access token (the `api_key` is automatically sent via the access token). The request can be completed with the following:

``` javascript
flapiClient.api({
  method      : 'flickr.people.getPhotos',
  params      :  { user_id : userAccessToken.user_nsid },
  accessToken : userAccessToken,
  next        : function(data){
      console.log('User Photos: ', data)
  }
});
```

* `method` - The flickr API Method
* `params` - Any API options to send
* `accessToken` - A user's unique access token
* `next` - The callback used when the api call is complete


### Uploading Photos
To upload a photo, use the method `upload` and pass the file path as param. Example:

``` javascript
flapiClient.api({
  method      : 'upload',
  params      :  { photo : 'test/image.jpg' },
  accessToken : userAccessToken,
  next        : function(data){
      console.log('New Photo: ', data)
  }
});
```


### Setting Application permissions
According to the [flickr documentation](http://www.flickr.com/services/api/), you should be able to set your application's permission set (`read`, `write`, or `delete`) from the edit screen of your app. I've never been able to find these settings. Instead, you can set it in the flickr module constructor with the `perms` option:

``` javascript
var flapiClient = new Flapi({
  oauth_consumer_key    : FLICKR_KEY,
  oauth_consumer_secret : FLICKR_SECRET,
  perms                 : 'delete'
});
```


### Unauthorized API Requests
Some of flickr's api methods don't require authorization (ex: `flickr.cameras.getBrandModels` and `flickr.interestingness.getList`). To use these without user authentication, omit the `accessToken` option from the api call:

``` javascript
flapiClient.api({
  method : 'flickr.interestingness.getList',
  params : { brand : 'apple' },
  next   : function(data){
    console.log('TADA!', data)
  }
});
```


### Handling Errors
API errors are passed directly to the next function. You can catch them by checking the stat property of the data returned. In most scenarios a message property should also be passed.
``` javascript
flapiClient.api({
  method : 'flickr.class.method',
  params : {},
  next   : function(data){
    if(data.stat == 'fail'){
      console.log(data.code);
      console.log(data.message);
    }
  }
});
```


### Other Notes
If you're looking to have a client make the http request, delay the request for some reason, or want to handle the request on your own... you can prevent the call to flickr by passing the option `preventCall : true`. Regardless of this option, the full url of the intended request will always be passed back.
``` javascript
  var flickrAPIurl = flapiClient.api({
    method      : 'flickr.people.getPhotos',
    params      : { user_id : this.accessToken.user_nsid },
    accessToken : this.accessToken,
    preventCall : true
  });
```



## Data Persistence 
To keep users from having to authenticate every time your node application restarts, you'll need to persist your application's `oauth_token` and `oauth_token_secret` as well as each user's individual `access_token`.

To instantiate the client with a token and secret, pass those properties when creating the object.

``` javascript
var flapiClient = new Flapi({
  oauth_consumer_key    : FLICKR_KEY,
  oauth_consumer_secret : FLICKR_SECRET,
  oauth_token           : FLICKR_OAUTH_TOKEN,
  oauth_token_secret    : FLICKR_OAUTH_TOKEN_SECRET
});
```

You only need to authorize your application once. If you're passing the token and secret, you can skip steps 2 and 3 described in the quick start above.



## Examples
Using this module within express or any other node server framework should be fairly straight forward. Check out the examples directory of this project for more details.



## Running the Tests
To run the tests, please make sure you've installed the project's dev dependencies and have the following environment variables set:

* `FLICKR_KEY` - Your flickr application's key
* `FLICKR_SECRET` - Your flickr application's secret
* `FLICKR_USERNAME` - Your flickr user name, used to simulate a yahoo and flickr app authentication flow
* `FLICKR_PASSWORD` - Your flickr password, used to simulate a yahoo and flickr app authentication flow

### With Auth
Calling `make test` from the root of the project will run all tests in the correct order.

On occasion, the numerous flickr redirects required to simulate authentication will fail. This causes every subsequent test to then fail. If you're running tests and experience this oddity, just run again.

### Without Auth
You can skip the auth steps and still test all the API methods by running `make test-without-auth`. For this to work, you'll also need the following environment variables set:

* `FLICKR_OAUTH_USER_TOKEN` - Can retrieve this from the standard auth above.
* `FLICKR_OAUTH_USER_SECRET` - Can retrieve this from the standard auth above.
* `FLICKR_NSID` - Can retrieve this from the standard auth above.
* `FLICKR_USERNAME` - Not currently used in the tests, but good to include anyways