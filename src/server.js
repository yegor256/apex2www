const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const { setHeader } = require('./utils/header');
const { oops, ok } = require('./utils/response');
const version = require('./version');
const { syncMiddleware } = require('./utils/middleware');

const methodCheck = (context, next) => {
  const { request, response } = context;
  if (request.method !== 'GET') {
    return oops(response, 'Only GET method is supported');
  }
  next();
};
const logDebugMessage = (context, next) => {
  const { request, opts } = context;
  const parsedUrl = setHeader(request, opts);
  if (opts.debug) console.debug('%s %s', request.method, url.format(parsedUrl));
  next();
};
const haltCheck = (context, next) => {
  const { request, response, opts } = context;
  const halt = request.headers['x-apex2www-halt'];
  if (halt !== undefined) {
    if (opts.halt !== halt) return oops(response, 'Wrong halting key');
    console.info(
      'Halt header received with the right key, will shutdown in a second...'
    );
    setTimeout(() => {
      console.info('End of session');
      process.exit(0);
    }, 1000);
    return ok(response, 'Will shutdown in a second...');
  }
  next();
};
const redirect = (context) => {
  const { request, response, opts } = context;
  const parsedUrl = setHeader(request, opts);
  const from = url.format(parsedUrl);
  if (!parsedUrl.hostname.startsWith('www.')) {
    parsedUrl.hostname = 'www.' + parsedUrl.hostname;
  }
  const redirectUrl = url.format(parsedUrl);
  response
    .writeHead(303, 'Redirect', {
      'Content-Length': 0,
      'Content-Type': 'text/plain',
      Location: redirectUrl,
      'X-Apex2www-Version': version.what,
    })
    .end('');
  if (opts.verbose || opts.debug) console.info('%s -> %s', from, redirectUrl);
};

const middleware = syncMiddleware
  .addStep(methodCheck)
  .addStep(logDebugMessage)
  .addStep(haltCheck)
  .addStep(redirect);

const server = (request, response, opts) => {
  const context = { request, response, opts };
  middleware.startExecute(context);
};

const createServerHTTP = (opts) => {
  const port = opts.port;
  http.createServer((req, res) => server(req, res, opts)).listen(port);
  console.info('HTTP server started at port %d, hit Ctrl-C to stop it', port);
};

const createServerHTTPS = (opts) => {
  const port = opts.port;
  const key = fs.readFileSync('ssl/key.pem');
  const cert = fs.readFileSync('ssl/cert.pem');
  https
    .createServer({ key: key, cert: cert }, (req, res) =>
      server(req, res, opts)
    )
    .listen(port);
  console.info(
    'HTTPS server started at port %d (key.length=%d, cert.length=%d), hit Ctrl-C to stop it',
    port,
    key.length,
    cert.length
  );
};

module.exports = { createServerHTTPS, createServerHTTP };
