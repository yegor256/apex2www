#! /usr/bin/env node
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

const {program} = require('commander');
const version = require('./version');
const http = require('http');
const https = require('https');
const url = require('url');

program
  .name('apex2www')
  .usage('[options]')
  .summary('Apex/root redirector to www')
  .description('HTTP server that redirects all requests to www. (' +
    version.what + ' built on ' + version.when + ')')
  .version(version.what, '-v, --version', 'Output the version number')
  .helpOption('-?, --help', 'Print this help information')
  .configureHelp({sortOptions: true, sortSubcommands: true});

program
  .option('--port <integer>', 'TCP port to bind to', 80)
  .option('--halt <string>',
    'If this value is provided in the X-Apex2www-Halt header, the app stops')
  .option('--https', 'Listen to secure requests, instead of plain HTTP')
  .option('--verbose', 'Print every HTTP request to console');

try {
  program.parse(process.argv);
} catch (e) {
  console.error(e.message);
  console.debug(e.stack);
  process.exit(1);
}

const opts = program.opts();
const port = opts.port;
servlet = function(request, response) {
  const u = url.parse(request.url);
  u.hostname = request.headers['host'].replace(/:[0-9]+$/, '');
  u.protocol = opts.https ? 'https' : 'http';
  u.port = opts.https ? '443' : '80';
  const from = url.format(u);
  const halt = request.headers['x-apex2www-halt'];
  if (halt != undefined) {
    if (halt == opts.halt && opts.halt != undefined) {
      console.info('Halt header received with the right key, will shutdown in a second...');
      setTimeout(
        function() {
          console.info('End of session');
          process.exit(0);
        },
        100
      );
      ok(response, 'Will shutdown in a second...');
    } else {
      oops(response, 'Wrong halting key');
    }
  } else if (request.method != 'GET') {
    oops(response, 'Only GET method is supported');
  } else {
    if (!u.hostname.startsWith('www.')) {
      u.hostname = 'www.' + u.hostname;
    }
    const redir = url.format(u);
    response.writeHead(
      303,
      'Redirect',
      {
        'Content-Length': 0,
        'Content-Type': 'text/plain',
        'Location': redir,
        'X-Apex2www-Version': version.what
      }
    ).end('');
    if (opts.verbose) {
      console.info('%s -> %s', from, redir);
    }
  }
};

if (opts.https) {
  https.createServer(servlet).listen(port);
  console.info('HTTPS server started at port %d, hit Ctrl-C to stop it', port);
} else {
  http.createServer(servlet).listen(port);
  console.info('HTTP server started at port %d, hit Ctrl-C to stop it', port);
}

/**
 * Return an error.
 *
 * @param {Response} response - The response
 * @param {String} body - The message
 */
function oops(response, body) {
  response.writeHead(
    400,
    'Error',
    {
      'Content-Length': body.length,
      'Content-Type': 'text/plain',
      'X-Apex2www-Version': version.what
    }
  ).end(body);
}

/**
 * Return a success.
 *
 * @param {Response} response - The response
 * @param {String} body - The message
 */
function ok(response, body) {
  response.writeHead(
    200,
    'OK',
    {
      'Content-Length': body.length,
      'Content-Type': 'text/plain',
      'X-Apex2www-Version': version.what
    }
  ).end(body);
}
