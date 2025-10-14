// This is an ES module trying to import named exports from a CommonJS module
// This should trigger the "Named export not found" error
import { test, expect } from "core";

console.log("Extension starting...");
console.log("Test function:", test());
console.log("Expect function:", expect());
console.log("Extension finished!");
