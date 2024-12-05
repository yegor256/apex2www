class SyncMiddleware {
  #steps = [];

  addStep(method) {
    this.#steps.push(method);
    return this;
  }

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
