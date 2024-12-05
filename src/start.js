const { program } = require('commander');
const { command } = require('./command');
const { createServerHTTPS, createServerHTTP } = require('./server');

const start = () => {
  try {
    command.parse(process.argv);
    const opts = program.opts();
    const server = opts.https ? createServerHTTPS : createServerHTTP;
    server(opts);
  } catch (e) {
    console.error(e.message);
    console.debug(e.stack);
    process.exit(1);
  }
};

start();
