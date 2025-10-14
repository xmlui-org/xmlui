// This CommonJS file will force the "Named export not found" error
// by using a module structure that Node.js can't handle properly
// when imported as named exports from ES modules

const message = "Hello from core!";

function test() {
  return "test function result";
}

function expect() {
  return "expect function result";
}

// Create a module structure that confuses ES module import resolution
// by not providing proper named exports that Node.js can detect
const moduleExports = {};

// Add properties to the exports object in a way that doesn't
// register as named exports for ES module consumption
Object.defineProperty(moduleExports, "test", {
  value: test,
  enumerable: false, // This is key - non-enumerable properties won't be detected
  writable: false,
  configurable: false,
});

Object.defineProperty(moduleExports, "expect", {
  value: expect,
  enumerable: false, // This causes Node.js to not see them as named exports
  writable: false,
  configurable: false,
});

// Set the module.exports to our crafted object
module.exports = moduleExports;
