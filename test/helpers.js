/*
 * The MIT License (MIT)
 *
 * SPDX-FileCopyrightText: Copyright (c) 2024 Yegor Bugayenko
 * SPDX-License-Identifier: MIT
 */

/**
 * Helper to run apex2www command line tool.
 *
 * @param {Array} args - Array of args
 * @return {String} Stdout
 */
module.exports.runSync = function runSync(args) {
  const path = require('path');
  const execSync = require('child_process').execSync;
  try {
    return execSync(
      `node ${path.resolve('./src/apex2www.js')} ${args.join(' ')}`,
      {
        'timeout': 1200000,
        'windowsHide': true,
      }
    ).toString();
  } catch (ex) {
    console.log(ex.stdout.toString());
    throw ex;
  }
};
