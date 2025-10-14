// Test script to verify the working version of CommonJS exports
import { test, expect } from "core";

console.log("Testing working version...");

// Test the test function
const result = test("sample test");
console.log("Test function returned:", result);

// Test the expect function
const expectObj = expect(5);
console.log("Expect function returned:", expectObj);

// Test the assertion
expectObj.toBe(5); // Should pass
expectObj.toBe(10); // Should fail

console.log("Working version test completed!");

// Note: To use this file, you need to update core/package.json
// to point to working-version.js instead of force-error.js:
//
// "exports": {
//   ".": {
//     "import": "./working-version.js",
//     "require": "./working-version.js"
//   }
// }
