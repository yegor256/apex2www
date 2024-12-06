const version = require('../version');

const oops = (response, body) => {
  response
    .writeHead(400, 'Error', {
      'Content-Length': body.length,
      'Content-Type': 'text/plain',
      'X-Apex2www-Version': version.what,
    })
    .end(body);
};

const ok = (response, body) => {
  response
    .writeHead(200, 'OK', {
      'Content-Length': body.length,
      'Content-Type': 'text/plain',
      'X-Apex2www-Version': version.what,
    })
    .end(body);
};

module.exports = { oops, ok };
