// This is a workaround example showing how to import from CommonJS
// when named exports are not available due to the configuration issue

// Instead of using named imports (which fails):
// import { test, expect } from "core";

// Use default import and destructure:
import pkg from "core";
const { test, expect } = pkg;

console.log("Extension starting with workaround...");

// Now we can use the functions normally
const result = test("workaround test");
console.log("Test function returned:", result);

const expectResult = expect(42);
console.log("Expect function returned:", expectResult);

// Note: The actual exports from force-error.js return simple strings,
// not complex objects with methods like toBe()

console.log("Extension finished with workaround!");

// This workaround works because:
// 1. Default import gets the entire module.exports object
// 2. We can then destructure the properties we need
// 3. This bypasses Node.js's named export detection issues
