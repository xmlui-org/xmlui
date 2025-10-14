// This is a CommonJS file that uses syntax that confuses Node.js module resolution
const message = "Hello from CommonJS core!";

function printMessage() {
  console.log(message);
}

function getMessage() {
  return message;
}

function test() {
  return "test function";
}

function expect() {
  return "expect function";
}

// This exports object structure that Node.js can't properly handle
// when imported as named exports from ES modules
module.exports = {
  printMessage: printMessage,
  getMessage: getMessage,
  test: test,
  expect: expect,
};

// The problem: when an ES module does `import { test, expect } from "core"`
// Node.js looks for named exports but finds a single default export
// containing an object with these properties
