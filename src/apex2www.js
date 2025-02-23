#! /usr/bin/env node
/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2024 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const {program} = require('commander');
const version = require('./version');
const http = require('http');
const https = require('https');
const url = require('url');
const fs = require('fs');
const tls = require('tls');

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
  .option('--debug', 'Print as much as possible to the console')
  .option('--verbose', 'Print every HTTP request to the console');

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
  if (opts.debug) {
    console.debug('%s %s', request.method, url.format(u));
  }
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
    if (opts.verbose || opts.debug) {
      console.info('%s -> %s', from, redir);
    }
  }
};

if (opts.https) {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
  const sniDefaultKey = fs.readFileSync('ssl/key.pem');
  const sniDefaultCert = fs.readFileSync('ssl/cert.pem');
  const sniCallback = (serverName, callback) => {
    let cert = null;
    let key = null;

    if (serverName !== 'localhost') {
      cert = fs.readFileSync(path.join('ssl/cert.pem'));
      key = fs.readFileSync(path.join('ssl/key.pem'));
    } else {
      cert = sniDefaultCert;
      key = sniDefaultKey;
    }

    // eslint-disable-next-line new-cap
    callback(null, new tls.createSecureContext({
      cert,
      key,
    }));
  };

  const serverOptions = {
    SNICallback: sniCallback,
    maxVersion: 'TLSv1.3',
    minVersion: 'TLSv1.2'
  };
  https.createServer(
    serverOptions,
    servlet
  ).listen(port);
  console.info(
    'HTTPS server started at port %d (key.length=%d, cert.length=%d), hit Ctrl-C to stop it',
    port, sniDefaultKey.length, sniDefaultCert.length
  );
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
