# passport-stitchz

[![Build Status](https://travis-ci.org/stitchzdotnet/passport-stitchz.svg?branch=master)](https://travis-ci.org/stitchzdotnet/passport-stitchz)

The official Stitchz authentication strategy for Passport.js.

## Install

```bash
$	npm install passport-stitchz
```

## Usage

#### Setup Stitchz App

To get started, create an application at [Stitchz.net](https://login.stitchz.net/). Use your application settings in your strategy configuration.

#### Configure Strategy

The stitchz authentication strategy authenticates users with their Social 
Identity.  The strategy requires a `verify` callback, which accepts these
credentials and calls `done` providing a user.

```js
var StitchzStrategy = require('passport-stitchz'),
    passport = require('passport');

passport.use(new StitchzStrategy({
   apiKey:       'your Stitchz.net ApiKey',
   appSecret:    'your Stitchz.net AppSecret',
   appHost:      'your Stitchz.net App URL',  // i.e. appurl.stitchz.net
   redirectUri:  'http://localhost:3000/callback', // your website's callback URL
   version:      '2', // optional - default is '1'
   format:       'json', // optional - default is 'xml'
   debug:        false // optional - default is false
  },
  function(err, resp, done) {
     User.findOneOrCreate({ identifier: resp.profile.identifier }, 
     resp.profile,
     function (err, user) {
        if (err) {
            return done(err);
        }

        if (!user) {
            return done(null, false, {
                message: 'Unknown user'
            });
        }

        return done(null, user);
     });
  })
);
```
#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'stitchz'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```js
app.post('/callback',
  passport.authenticate('stitchz', { failureRedirect: '/login' }),
  function(req, res, next) {
    if (!req.user) {
      throw new Error('user null');
    }
    res.redirect("/");
  }
);
```
To add your application's login options, add the html code below to your login page...

```html
<div id="stitchzsociallogin">

</div>

<script src="/Scripts/stitchz.client.js" type="text/javascript"></script>
<script type="text/javascript">
    StitchzClient.ready(function (e) {
        StitchzClient.AddIframeToDOM({
            ApiKey: 'your Stitchz.net ApiKey',
            ReturnUrl: 'http://localhost:3000/callback',
            Height: '280', // optional
            Width: '330', // optional
            MaxHeight: '768', // optional
            MaxWidth: '500', // optional
            AutoResize: true, // optional
            AppURL: 'https://appurl.stitchz.net',
            Version: '2',
            HtmlElementIdNameToAddIframeTo: 'stitchzsociallogin'
        });
    });
</script>
```

## Examples

A complete example ...

## Documentation

For more information about [Stitchz](https://www.stitchz.com), including 
available profile properties, visit our [documentation page](https://www.stitchz.com/documentation).

## Author

[stitchzdotnet](http://github.com/stitchzdotnet)

## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.

Copyright (c) 2017-2018 Stitchz <[https://www.stitchz.net/](https://www.stitchz.net/)>