const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, '..', 'src', 'components');

// Component directories to scan
const componentDirs = [
  'Accordion', 'APICall', 'App', 'AppHeader', 'AppState', 'AutoComplete', 'Avatar',
  'Backdrop', 'Badge', 'Bookmark', 'Breakout', 'Button', 'Card', 'Carousel', 
  'ChangeListener', 'Checkbox', 'CodeBlock', 'ColorPicker', 'Column', 'ContentSeparator',
  'DataSource', 'DateInput', 'DatePicker', 'DropdownMenu', 'EmojiSelector', 'ExpandableItem',
  'FileInput', 'FileUploadDropZone', 'FlowLayout', 'Footer', 'Form', 'FormItem', 'Fragment',
  'Heading', 'HoverCard', 'IFrame', 'Image', 'InspectButton', 'Items', 'Link', 'List',
  'Logo', 'Markdown', 'ModalDialog', 'NavGroup', 'NavLink', 'NavPanel', 'NestedApp',
  'NoResult', 'NumberBox', 'Option', 'PageMetaTitle', 'Pages', 'Pagination',
  'PositionedContainer', 'ProfileMenu', 'ProgressBar', 'Queue', 'RadioGroup',
  'RealTimeAdapter', 'Redirect', 'ResponsiveBar', 'Select', 'SelectionStore', 'Slider',
  'Slot', 'SpaceFiller', 'Spinner', 'Splitter', 'Stack', 'StickyBox', 'Switch', 'Table',
  'TableOfContents', 'Tabs', 'Text', 'TextArea', 'TextBox', 'Theme', 'TimeInput', 'Timer',
  'Toggle', 'ToneChangerButton', 'ToneSwitch', 'Tooltip', 'Tree', 'TreeDisplay',
  'ValidationSummary', 'Charts/AreaChart', 'Charts/BarChart', 'Charts/DonutChart',
  'Charts/LabelList', 'Charts/Legend', 'Charts/LineChart', 'Charts/PieChart', 'Charts/RadarChart'
];

const results = [];

// Function to check if SCSS file has unexposed theme variables
function hasUnexposedThemeVars(componentDir) {
  try {
    const files = fs.readdirSync(componentDir);
    const scssFiles = files.filter(f => f.endsWith('.scss') || f.endsWith('.module.scss'));
    
    for (const scssFile of scssFiles) {
      const scssPath = path.join(componentDir, scssFile);
      const content = fs.readFileSync(scssPath, 'utf8');
      
      // Find all @layer blocks and check if createThemeVar is called inside them
      if (hasCreateThemeVarInBlock(content, '@layer')) {
        return true;
      }
      
      // Find all @mixin blocks and check if createThemeVar is called inside them
      if (hasCreateThemeVarInBlock(content, '@mixin')) {
        return true;
      }
    }
  } catch (error) {
    // Ignore errors for directories that don't exist or can't be read
  }
  return false;
}

// Helper function to check if createThemeVar is called inside a specific block type
function hasCreateThemeVarInBlock(content, blockType) {
  const lines = content.split('\n');
  let insideBlock = false;
  let braceCount = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if we're entering a block
    if (new RegExp(`${blockType}\\s`).test(line)) {
      insideBlock = true;
    }
    
    if (insideBlock) {
      // Count braces
      const openBraces = (line.match(/\{/g) || []).length;
      const closeBraces = (line.match(/\}/g) || []).length;
      braceCount += openBraces - closeBraces;
      
      // Check if createThemeVar is called in this line
      if (/createThemeVar\s*\(/i.test(line)) {
        return true;
      }
      
      // If we've closed all braces, we're out of the block
      if (braceCount === 0 && openBraces > 0) {
        insideBlock = false;
      }
    }
  }
  
  return false;
}

// Function to extract metadata from a file
function extractMetadata(filePath, componentName) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Find all createMetadata calls
    const metadataRegex = /export const (\w+Md) = createMetadata\(\{([\s\S]*?)\n\}\);/g;
    let match;
    
    while ((match = metadataRegex.exec(content)) !== null) {
      const mdName = match[1];
      const mdContent = match[2];
      
      // Extract component name from metadata name (e.g., ButtonMd -> Button)
      const name = mdName.replace(/Md$/, '');
      
      // Check if it has validationStatus in props
      const hasValidationStatus = mdContent.includes('validationStatus:');
      
      // Extract parts - improved to handle nested braces
      let parts = [];
      let defaultPart = null;
      
      const partsStartIdx = mdContent.indexOf('parts: {');
      if (partsStartIdx !== -1) {
        let braceCount = 0;
        let partsEndIdx = -1;
        let startIdx = partsStartIdx + 'parts: {'.length - 1; // start at the opening brace
        
        for (let i = startIdx; i < mdContent.length; i++) {
          if (mdContent[i] === '{') braceCount++;
          else if (mdContent[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              partsEndIdx = i;
              break;
            }
          }
        }
        
        if (partsEndIdx !== -1) {
          const partsContent = mdContent.substring(startIdx + 1, partsEndIdx);
          // Match part names - look for word followed by : and then { (part definition)
          // This ensures we only get part names, not properties within parts like "description"
          const partMatches = partsContent.match(/^\s*(\w+)\s*:\s*\{/gm);
          if (partMatches) {
            parts = partMatches.map(p => p.trim().replace(/:\s*\{$/, '').trim());
          }
        }
      }
      
      // Extract defaultPart
      const defaultPartMatch = mdContent.match(/defaultPart:\s*["'](\w+)["']/);
      if (defaultPartMatch) {
        defaultPart = defaultPartMatch[1];
      }
      
      // Get the directory of the component file to check for SCSS
      const componentDir = path.dirname(filePath);
      const hasUnexposedVars = hasUnexposedThemeVars(componentDir);
      
      results.push({
        name,
        hasValidationStatus,
        parts: parts.length > 0 ? parts : null,
        hasUnexposedThemeVars: hasUnexposedVars
      });
    }
  } catch (error) {
    // Ignore errors for files that don't exist
  }
}

// Scan all component directories
componentDirs.forEach(dir => {
  const fullPath = path.join(componentsDir, dir);
  
  // Try to find the main component file
  const baseName = dir.split('/').pop();
  const possibleFiles = [
    path.join(fullPath, `${baseName}.tsx`),
    path.join(fullPath, `${baseName}Component.tsx`),
  ];
  
  possibleFiles.forEach(filePath => {
    if (fs.existsSync(filePath)) {
      extractMetadata(filePath, baseName);
    }
  });
});

// Also check for special files
const specialFiles = [
  'DropdownMenu/DropdownMenu.tsx', // has multiple components
  'Carousel/CarouselItem.tsx',
  'RadioGroup/RadioItem.tsx',
  'Tabs/TabItem.tsx',
  'FormSection/FormSection.tsx',
];

specialFiles.forEach(file => {
  const filePath = path.join(componentsDir, file);
  const baseName = path.basename(file, '.tsx');
  extractMetadata(filePath, baseName);
});

// Sort by component name
results.sort((a, b) => a.name.localeCompare(b.name));

// Output as JSON
console.log(JSON.stringify(results, null, 2));
