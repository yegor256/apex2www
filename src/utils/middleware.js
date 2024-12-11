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

/**
 * Middleware class for synchronously executing a series of steps.
 */
class SyncMiddleware {
  /** @private @type {Array<Function>} */
  #steps = [];

  /**
   * Adds a new step to the middleware execution chain.
   * @param {Function} method - A function representing the middleware step.
   * The function receives `context` and a `next` callback as arguments.
   * @return {SyncMiddleware} The current instance for method chaining.
   */
  addStep(method) {
    this.#steps.push(method);
    return this;
  }

  /**
   * Starts executing the middleware steps in order.
   * Each step can call the `next` callback to proceed to the next step.
   * If `next` is not called, execution stops.
   * @param {Object} context - The context object passed to each middleware step.
   * @return {void} This method does not return any value.
   */
  startExecute(context) {
    for (let i = 0; i < this.#steps.length; i++) {
      let isNext = false;
      const next = () => (isNext = true);
      this.#steps[i](context, next);
      if (!isNext) return;
    }
  }
}

module.exports = { syncMiddleware: new SyncMiddleware() };
