const { program } = require('commander');
const version = require('./version');

program
  .name('apex2www')
  .usage('[options]')
  .summary('Apex/root redirector to www')
  .description(
    'HTTP server that redirects all requests to www. (' +
      version.what +
      ' built on ' +
      version.when +
      ')'
  )
  .version(version.what, '-v, --version', 'Output the version number')
  .helpOption('-?, --help', 'Print this help information')
  .configureHelp({ sortOptions: true, sortSubcommands: true });

program
  .option('--port <integer>', 'TCP port to bind to', 80)
  .option(
    '--halt <string>',
    'If this value is provided in the X-Apex2www-Halt header, the app stops'
  )
  .option('--https', 'Listen to secure requests, instead of plain HTTP')
  .option('--debug', 'Print as much as possible to the console')
  .option('--verbose', 'Print every HTTP request to the console');

module.exports = { command: program };
