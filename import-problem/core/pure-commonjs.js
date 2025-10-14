// Pure CommonJS module that will cause "Named export not found" error
// when imported as named exports from ES modules

const message = "Hello from pure CommonJS core!";

function test(name) {
  console.log(`Running test: ${name}`);
  return true;
}

function expect(actual) {
  return {
    toBe: (expected) => {
      if (actual === expected) {
        console.log("✓ Test passed");
      } else {
        console.log("✗ Test failed");
      }
    }
  };
}

function printMessage() {
  console.log(message);
}

function getMessage() {
  return message;
}

// Pure CommonJS exports - this creates the problematic scenario
// When ES modules try to do `import { test, expect } from "core"`
// Node.js can't find named exports because this is a default export
// containing an object with these properties
module.exports = {
  test: test,
  expect: expect,
  printMessage: printMessage,
  getMessage: getMessage
};

// The issue: ES modules expect named exports, but CommonJS provides
// a single default export with properties. Node.js can't automatically
// convert this when the package.json exports configuration incorrectly
// points both "import" and "require" to the same CommonJS file.
