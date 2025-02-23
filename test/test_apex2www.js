/*
 * SPDX-FileCopyrightText: Copyright (c) 2024 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

const assert = require('assert');
const http = require('http');
const https = require('https');
const path = require('path');
const runSync = require('./helpers').runSync;
const exec = require('child_process').exec;
const version = require('../src/version');
const util = require('node:util');
const portfinder = require('portfinder');

describe('apex2www', function() {
  it('prints its own version', function(done) {
    const stdout = runSync(['--version']);
    assert.equal(version.what + '\n', stdout);
    done();
  });

  it('prints help screen', function(done) {
    const stdout = runSync(['--help']);
    assert(stdout.includes('Usage: apex2www'));
    assert(stdout.includes(version.what));
    assert(stdout.includes(version.when));
    done();
  });

  const js = path.resolve('./src/apex2www.js');

  it('runs web server and responds to HTTP requests', function(done) {
    const execPromise = util.promisify(exec);
    portfinder.getPort(function(err, port) {
      const p = execPromise(`node ${js} --port=${port} --halt=foo`);
      setTimeout(function() {
        const url = 'http://localhost:' + port + '/';
        http.get(url, function(response) {
          assert(response.headers['location'] == 'http://www.localhost:80/');
          http.get(url, {headers: {'X-Apex2www-Halt': 'foo'}}, async function(response) {
            const {stdout, stderr} = await p;
            assert(stdout.includes('End of session'));
            assert(stderr == '');
            done();
          });
        });
      }, 100);
    });
  });

  it('runs web server and responds to HTTPS requests', function(done) {
    const execPromise = util.promisify(exec);
    process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0;
    portfinder.getPort(function(err, port) {
      const p = execPromise(`node ${js} --https --port=${port} --halt=foo`);
      setTimeout(function() {
        const url = 'https://localhost:' + port + '/';
        https.get(url, function(response) {
          assert(response.headers['location'] == 'https://www.localhost:443/');
          https.get(
            {host: 'localhost', port, headers: {'X-Apex2www-Halt': 'foo'}},
            async function(response) {
              const {stdout, stderr} = await p;
              assert(stdout.includes('End of session'));
              assert(stderr == '');
              done();
            },
          );
        });
      }, 100);
    });
  });
});
