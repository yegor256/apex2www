/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2024 Yegor Bugayenko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const url = require('url');
const { setHeader } = require('./utils/header');
const { oops, ok } = require('./utils/response');
const version = require('./version');
const { syncMiddleware } = require('./utils/middleware');
const TLS = require('tls');
const path = require('path');

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
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  const port = opts.port;
  const key = fs.readFileSync(path.join('ssl/key.pem'));
  const cert = fs.readFileSync(path.join('ssl/cert.pem'));
  const ctx = TLS.createSecureContext({
    cert,
    key,
  });
  const SNICallback = (_, cb) => cb(null, ctx);
  const serverOptions = {
    SNICallback,
    maxVersion: 'TLSv1.3',
    minVersion: 'TLSv1.2',
  };
  https
    .createServer(serverOptions, (req, res) => server(req, res, opts))
    .listen(port);
  console.info(
    'HTTPS server started at port %d (key.length=%d, cert.length=%d), hit Ctrl-C to stop it',
    port,
    key.length,
    cert.length
  );
};

module.exports = { createServerHTTPS, createServerHTTP };
