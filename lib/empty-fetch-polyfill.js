// This is a stub to prevent fetch polyfills from overwriting the global fetch
const g = (typeof globalThis !== 'undefined' && globalThis) || 
          (typeof self !== 'undefined' && self) || 
          (typeof window !== 'undefined' && window) || 
          (typeof global !== 'undefined' && global) || 
          {};

const fetch = g.fetch;
const Headers = g.Headers;
const Request = g.Request;
const Response = g.Response;

// Neutralize any attempt to polyfill by returning the native classes/functions
module.exports = fetch;
module.exports.fetch = fetch;
module.exports.Headers = Headers;
module.exports.Request = Request;
module.exports.Response = Response;
module.exports.default = fetch;

// Also export as ES members if needed
if (typeof exports === 'object' && typeof module !== 'undefined') {
  exports.fetch = fetch;
  exports.Headers = Headers;
  exports.Request = Request;
  exports.Response = Response;
}
