// Working CommonJS module with proper exports for ES module interop
const message = "Hello from working CommonJS core!";

function test(name) {
  console.log(`Running test: ${name || 'default'}`);
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

// Proper CommonJS exports that work with ES module named imports
// Method 1: Using exports object
exports.test = test;
exports.expect = expect;
exports.printMessage = printMessage;
exports.getMessage = getMessage;

// Method 2: Alternative approach (commented out)
// module.exports = {
//   test,
//   expect,
//   printMessage,
//   getMessage
// };

// The key difference: These exports are enumerable and Node.js
// can properly detect them as named exports for ES module consumption
