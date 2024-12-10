const assert = require('assert');
const http = require('http');
const https = require('https');
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

  it('should stop the server with correct Halt', (done) => {
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
        done();
      });
    });
  });

  it('should stop the HTTPS server with correct Halt', async function() {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    const port = await portfinder.getPortPromise();
    const url = `https://localhost:${port}/`;
    exec(`node ${server} --port=${port} --halt=${halt} --https`);
    await waitForServer(url);
    const expectedMessage = 'Will shutdown in a second...';
    return new Promise((resolve, reject) => {
      https
        .get(url, { headers: { 'X-Apex2www-Halt': halt } }, (response) => {
          let body = '';
          response.on('data', (chunk) => (body += chunk));
          response.on('end', () => {
            try {
              assert.equal(
                response.statusCode,
                200,
                'Status code should be 200'
              );
              assert.equal(response.headers['content-type'], 'text/plain');
              assert.equal(
                response.headers['content-length'],
                expectedMessage.length.toString()
              );
              assert.equal(
                response.headers['x-apex2www-version'],
                version.what
              );
              assert.equal(
                body,
                expectedMessage,
                'Response body should match expected message'
              );
              resolve();
            } catch (err) {
              reject(err);
            }
          });
        })
        .on('error', (err) => reject(err));
    });
  });
});
