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
