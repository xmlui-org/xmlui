const fs = require('fs');
const path = require('path');

function walk(dir, regex, results) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full, regex, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.md')) { // Check MD too
      const content = fs.readFileSync(full, 'utf8');
      let match;
      while ((match = regex.exec(content)) !== null) {
        if (!results[file]) results[file] = new Set();
        results[file].add(match[1]);
      }
    }
  }
}

const comps = {};
walk('xmlui/src/components', /\$([a-zA-Z0-9_]+)/g, comps);

for (const [file, vars] of Object.entries(comps)) {
  const filtered = Array.from(vars).filter(v => 
    !['event', 'oldValue', 'newValue', 'value'].includes(v) && 
    !file.endsWith('.test.ts') && !file.endsWith('.spec.ts')
  );
  if (filtered.length > 0) {
    console.log(`${file}: ${filtered.map(x => '$' + x).join(', ')}`);
  }
}
