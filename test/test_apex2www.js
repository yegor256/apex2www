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

const assert = require('assert');
const http = require('http');
const path = require('path');
const { runSync, waitForServer } = require('./helpers');
const { exec } = require('child_process');
const version = require('../src/version');
const portfinder = require('portfinder');
const { before } = require('mocha');

describe('apex2www', () => {
  const server = path.resolve('./src/start.js');
  let port;
  let url;
  const halt = 'foo';

  before(async () => {
    port = await portfinder.getPortPromise({
      startPort: 5000,
      stopPort: 9000,
    });
    url = 'http://localhost:' + port + '/';
    exec(`node ${server} --port=${port} --halt=${halt} --debug true`);
    await waitForServer(url);
  });

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

  it('should check HTTP response headers and status', (done) => {
    http.get(url, (response) => {
      assert.equal(response.statusCode, 303);
      assert.deepEqual(
        response.headers['location'],
        'http://www.localhost:80/'
      );
      assert.deepEqual(response.headers['content-type'], 'text/plain');
      assert.deepEqual(response.headers['content-length'], '0');
      assert.deepEqual(response.headers['x-apex2www-version'], version.what);
      response.resume();
      response.on('end', () => {
        done();
      });
    });
  });

  it('should return 400 for non-GET requests', async () => {
    const options = {
      method: 'POST',
    };
    const request = await new Promise((resolve, reject) => {
      http
        .request(url, options, (response) => {
          let body = '';
          response.on('data', (chunk) => (body += chunk));
          response.on('end', () =>
            resolve({
              body,
              statusCode: response.statusCode,
              contentLength: response.headers['content-length'],
            })
          );
          response.on('error', reject);
        })
        .end();
    });
    const { body, statusCode, contentLength } = request;
    const errorMessage = 'Only GET method is supported';
    assert.equal(statusCode, 400);
    assert.equal(contentLength, errorMessage.length);
    assert.deepEqual(body, errorMessage);
  });

  it('should not stop the server with incorrect Halt', async () => {
    const message = 'Wrong halting key';
    http.get(url, { headers: { 'X-Apex2www-Halt': 'foo1' } }, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        assert.deepEqual(message, body);
        assert.equal(400, response.statusCode);
        assert.deepEqual(response.headers['content-type'], 'text/plain');
        assert.deepEqual(response.headers['content-length'], message.length);
        assert.deepEqual(response.headers['x-apex2www-version'], version.what);
      });
    });
  });

  it('should stop the server with correct Halt', async () => {
    const message = 'Will shutdown in a second...';
    http.get(url, { headers: { 'X-Apex2www-Halt': halt } }, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        assert.deepEqual(message, body);
        assert.equal(200, response.statusCode);
        assert.deepEqual(response.headers['content-type'], 'text/plain');
        assert.deepEqual(response.headers['content-length'], message.length);
        assert.deepEqual(response.headers['x-apex2www-version'], version.what);
      });
    });
  });
});
