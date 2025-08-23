#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Creating minimal XMLUI test app for HelloWorld component...\n');

// Get project name from command line or use default
const projectName = process.argv[2] || 'test-hello-world';
const projectPath = path.resolve(process.argv[2] ? process.argv[2] : path.join(process.env.HOME || process.env.USERPROFILE, projectName));

// Create project directory
if (!fs.existsSync(projectPath)) {
  fs.mkdirSync(projectPath, { recursive: true });
  fs.mkdirSync(path.join(projectPath, 'xmlui'), { recursive: true });
} else {
  console.log(`❌ Directory ${projectPath} already exists!`);
  process.exit(1);
}

// Check if we need to build the standalone XMLUI engine
const xmluiStandalonePath = path.join(__dirname, '../../xmlui/dist/standalone/xmlui-standalone.umd.js');
const docsStandalonePath = path.join(__dirname, '../../docs/public/resources/files/for-download/xmlui/xmlui-standalone.umd.js');

let standaloneSource = null;

if (fs.existsSync(docsStandalonePath)) {
  standaloneSource = docsStandalonePath;
  console.log('📦 Using existing XMLUI standalone from docs...');
} else if (fs.existsSync(xmluiStandalonePath)) {
  standaloneSource = xmluiStandalonePath;
  console.log('📦 Using existing XMLUI standalone from build...');
} else {
  console.log('🔨 Building XMLUI standalone engine...');
  try {
    execSync('npm run build:xmlui-standalone', {
      cwd: path.join(__dirname, '../../xmlui'),
      stdio: 'inherit'
    });
    standaloneSource = xmluiStandalonePath;
    console.log('✅ XMLUI standalone built successfully!');
  } catch (error) {
    console.log('❌ Failed to build XMLUI standalone. Please run: cd xmlui && npm run build:xmlui-standalone');
    process.exit(1);
  }
}

// Copy the standalone XMLUI engine
const xmluiLatestPath = path.join(projectPath, 'xmlui/xmlui-latest.js');
fs.copyFileSync(standaloneSource, xmluiLatestPath);
console.log('📋 Copied XMLUI engine to xmlui/xmlui-latest.js');

// Check if HelloWorld extension exists and copy it
const helloWorldSource = path.join(__dirname, '../../packages/xmlui-hello-world/dist/xmlui-hello-world.js');
const xmluiHelloWorldPath = path.join(projectPath, 'xmlui/xmlui-hello-world.js');

if (fs.existsSync(helloWorldSource)) {
  fs.copyFileSync(helloWorldSource, xmluiHelloWorldPath);
  console.log('📋 Copied HelloWorld extension to xmlui/xmlui-hello-world.js');
} else {
  console.log('⚠️  HelloWorld extension not found. You may need to build it first:');
  console.log('   cd packages/xmlui-hello-world && npm run build:extension');
  // Create a placeholder file
  fs.writeFileSync(xmluiHelloWorldPath, '// HelloWorld extension not found - please build it first\n');
}

// Main.xmlui
const mainXmlui = `<App xmlns:Extensions="component-ns:XMLUIExtensions">
  <VStack gap="2rem" padding="2rem">
    <Heading>HelloWorld Component Test</Heading>

    <Extensions:HelloWorld message="Hello from XMLUI!" />

    <Extensions:HelloWorld message="Success message" theme="success" />
  </VStack>
</App>`;

// index.html
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>HelloWorld Extension Test</title>
  <script src="xmlui/xmlui-latest.js"></script>
  <script src="xmlui/xmlui-hello-world.js"></script>
</head>
<body>
</body>
</html>`;

// Write files
fs.writeFileSync(path.join(projectPath, 'Main.xmlui'), mainXmlui);
fs.writeFileSync(path.join(projectPath, 'index.html'), indexHtml);

console.log(`\n✅ Created minimal XMLUI test app at: ${projectPath}`);
console.log(`📁 Project structure:`);
console.log(`   ${path.basename(projectPath)}/`);
console.log(`   ├── Main.xmlui`);
console.log(`   ├── index.html`);
console.log(`   └── xmlui/`);
console.log(`       ├── xmlui-latest.js`);
console.log(`       └── xmlui-hello-world.js`);

console.log(`\n🚀 To run the test app:`);
console.log(`   cd ${projectPath}`);
console.log(`   # If you have xmlui CLI installed globally:`);
console.log(`   xmlui start`);
console.log(`   # Or serve with any static server:`);
console.log(`   python3 -m http.server 8000`);
console.log(`   # Or with Node.js:`);
console.log(`   npx serve .`);

console.log(`\n🌐 Visit http://localhost:5173 (or 8000) to see your HelloWorld component!`);

if (!fs.existsSync(helloWorldSource)) {
  console.log(`\n⚠️  Note: HelloWorld extension needs to be built first. Run:`);
  console.log(`   cd packages/xmlui-hello-world && npm run build:extension`);
}
