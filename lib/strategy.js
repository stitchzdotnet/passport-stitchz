var Strategy = require('passport-strategy'),
    util = require('util'),
    http = require('https'),
    querystring = require('querystring');


function StitchzStrategy(options, verify) {
  options = options || {};

  if (!verify) { throw new TypeError('StitchzStrategy requires a verify callback'); }
  if (!options.apiKey) { throw new TypeError('StitchzStrategy requires a Stitchz.net apiKey option'); }
  if (!options.appSecret) { throw new TypeError('StitchzStrategy requires a Stitchz.net appSecret option'); }
  if (!options.appHost) { throw new TypeError('StitchzStrategy requires a Stitchz.net appHost option'); }
  if (!options.redirectUri) { throw new TypeError('StitchzStrategy requires a redirectUri option'); }

  Strategy.call(this);
  this.name = 'stitchz';
  this._verify = verify;
  this._apiKey  = options.apiKey;
  this._appSecret = options.appSecret;
  this._version = options.version || '2'; // optional
  this._appHost = options.appHost;
  this._appPath = '/Authentication/v' + this._version + '/Auth';
  this._redirectUri = options.redirectUri;
  this._format = options.format || 'json'; // optional
  this._debug = options.debug || false; 

  if (typeof(window) !== 'undefined') {
    if (window.console) {
      this._console;
    }
  } else if (typeof(console) !== 'undefined') {
    this._console = console;
  }
}

util.inherits(StitchzStrategy, Strategy);

StitchzStrategy.prototype.authenticate = function(req, options) {
  if (!req._passport) { return this.error(new Error('passport.initialize() middleware not in use')); }
  this._token = req.query.token;
  this._state = req.query.state; // optional

  if (!this._token) { 
    if (this._debug && this._console) this._console.info('Token value received: %s', this._token);
    this.fail({ message: 'StitchzStrategy requires a valid token passed from Stitchz.net. Contact this site\u0027s administrator or https://www.stitchz.net/Documentation for more help' }, 400);
  }

  options = options || {};

  var self = this;

  function verified(err, user, info) {
    if (err) { return self.error(err); }
    if (!user) { return self.fail(info); }
    self.success(user, info);
  }

  var query = {
    format: self._format,
    client_id: self._apiKey,
    client_secret: self._appSecret,
    grant_type: 'authorization_code',
    redirect_uri: self._redirectUri,
    code: self._token,
    version: self._version
  };

  if (self._state) {
    query.state = self._state;
  }

  if (this._debug && this._console) this._console.info(query);

  self._getAuthentication(query, function(err, resp) {
      self._verify(err, resp, verified);
  });
};

StitchzStrategy.prototype._getAuthentication = function(query, callback) {
 
  function handleResponse(resp, json) {
      if( !(resp.statusCode >= 200 && resp.statusCode <= 299) && (resp.statusCode != 301) && (resp.statusCode != 302) ) {
        callback({ statusCode: resp.statusCode, data: result });
      } else {
        if (json.status == 'err') {
          callback(this.error(new Error(json.error.description)), null);
        } else {
          callback(null, json);
        }
      }
  }

  let body = querystring.stringify(query);

  let req = http.request(
    { 
      hostname: this._appHost,
      path:  this._appPath,
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(body)
      },
      rejectUnauthorized: false,
    },
    (response) => {
      response.setEncoding('utf8');
      let html = '';

      //another chunk of data has been recieved, so append it to `html`
      response.on('data', (chunk) => {
        html += chunk;
      });

      //the whole response has been recieved, so we just print it out here
      response.on('end', () => {
        let json = html;
        
        try {
            json = JSON.parse(html);
            if (this._debug && this._console) this._console.info('Message received: %O', json);
            handleResponse(response, json);
        } catch(ex) {
            if (this._console) this._console.error(ex);
            if (this._debug && this._console) this._console.log(html);
            return callback(new Error('Unexpected error getting response from Stitchz.net'), null);
        }
      });

      response.on('error', (err) => {
        // This prints the error message and stack trace to `stderr`.
        if (this._console) this._console.error(err.stack);
        return callback(err, null);
      });
  });

  req.write(body);
  req.end();
};

module.exports = StitchzStrategy;