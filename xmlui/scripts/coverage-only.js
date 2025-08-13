#!/usr/bin/env node

const script = require('./e2e-test-summary.js');

// Run without executing tests, just show coverage
console.log('XMLUI E2E Test Coverage Report');
console.log('===============================\n');

console.log('1. Extracting XMLUI components from metadata...');
const components = script.getXMLUIComponents();
console.log(`   Found ${components.length} XMLUI components`);

console.log('2. Scanning for e2e test files...');
const testFiles = script.getE2ETestFiles();
console.log(`   Found ${testFiles.length} e2e test files`);

console.log('3. Mapping components to test files...');
const componentTestMap = script.mapComponentsToTestFiles(components, testFiles);

// Display summary without test results
script.displaySummary(components, componentTestMap, null);
