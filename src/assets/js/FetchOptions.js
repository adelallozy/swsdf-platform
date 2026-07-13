class FetchOptions {
  constructor(options, mergeHeaders = true) {
    for (let key in options) {
      this[key] = options[key];
    }
  }

  merge(optionsObject) {
    for (let key in optionsObject) {
      if (typeof key == "Object") {
        Object.assign(this[key], { ...optionsObject[key] });
      } else {
        this[key] = optionsObject[key];
      }
    }
    return this;
  }

  removeContentTypeHeader() {
    if (this.headers["Content-Type"]) {
      delete this.headers["Content-Type"];
    }
    if (this.headers["Content-type"]) {
      delete this.headers["Content-type"];
    }
    if (this.headers["content-type"]) {
      delete this.headers["content-type"];
    }
  }
}

Object.defineProperty(FetchOptions, "headers", {
  get: function () {
    return this.headers;
  },
  set: function (headers) {
    this.headers = { ...headers };
  },
});

export default FetchOptions;
