// Copyright (c) 2024 Yegor Bugayenko
// 
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
// 
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

/*
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
