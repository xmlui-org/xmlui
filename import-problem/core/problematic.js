// This file intentionally uses mixed CommonJS and ES module syntax
// to confuse Node.js module resolution

const message = "Hello from problematic core!";

// This looks like ES module syntax but in a CommonJS context
export function test() {
  return "test function";
}

export function expect() {
  return "expect function";
}

function printMessage() {
  console.log(message);
}

// Mixed exports - this will cause confusion
module.exports = {
  printMessage,
  default: {
    test,
    expect
  }
};

// This creates a scenario where Node.js can't determine
// if this is a CommonJS or ES module, leading to import errors
