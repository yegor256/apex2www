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
