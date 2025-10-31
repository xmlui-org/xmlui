const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('component-metadata-results.json', 'utf8'));

// Remove duplicates
const unique = [];
const seen = new Set();
data.forEach(item => {
  const key = item.name;
  if (!seen.has(key)) {
    seen.add(key);
    unique.push(item);
  }
});

// Generate markdown
let md = '# Component Metadata Summary\n\n';
md += 'This document contains metadata information extracted from all XMLUI components.\n\n';
md += 'Generated on: ' + new Date().toISOString().split('T')[0] + '\n\n';
md += '## What This Document Contains\n\n';
md += 'For each component in the XMLUI library, this document shows:\n\n';
md += '- **Component Name**: The name of the component as defined in its metadata\n';
md += '- **Validation States**: Whether the component supports validation states (via the `validationStatus` prop)\n';
md += '- **Parts**: Named parts that can be targeted for styling or customization within the component\n';
md += '- **Unexposed Theme Variables**: Whether the component has theme variables defined in `@layer` or `@mixin` blocks that are not exposed through the component API\n\n';
md += '## Components Overview\n\n';
md += '| Component | Validation States | Parts | Unexposed Theme Variables |\n';
md += '|-----------|------------------|-------|---------------------------|\n';

unique.forEach(comp => {
  const name = comp.name;
  const hasValidation = comp.hasValidationStatus ? '✅' : '-';
  const parts = comp.parts ? comp.parts.join(', ') : '-';
  const hasUnexposedVars = comp.hasUnexposedThemeVars ? '✅' : '-';
  md += `| ${name} | ${hasValidation} | ${parts} | ${hasUnexposedVars} |\n`;
});

// Add statistics
const withValidation = unique.filter(c => c.hasValidationStatus).length;
const withParts = unique.filter(c => c.parts && c.parts.length > 0).length;
const withUnexposedVars = unique.filter(c => c.hasUnexposedThemeVars).length;

md += '\n## Statistics\n\n';
md += `- Total components: ${unique.length}\n`;
md += `- Components with validation states: ${withValidation}\n`;
md += `- Components with parts: ${withParts}\n`;
md += `- Components with unexposed theme variables: ${withUnexposedVars}\n`;

// Write to file
const outputPath = path.join('dev-docs', 'component-metadata.md');
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, md, 'utf8');

console.log(`Markdown file created at: ${outputPath}`);
