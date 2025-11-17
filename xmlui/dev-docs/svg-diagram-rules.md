# SVG Diagram Drawing Rules for App Layout Documentation

## Purpose

These rules define how to create consistent, professional SVG diagrams illustrating app layout structures for the XMLUI App component documentation. The diagrams show:
- Main screen viewport boundaries
- Content blocks (Header, Navigation Panel, Main Content, Footer)
- Scroll gutters and scrollbars
- Overflow content (content that extends beyond the viewport)
- Block arrangements and spacing

## Core Principles

1. **Main Screen Border**: The outermost 2px thick border represents the visible viewport (800x600)
2. **No Double Borders**: Never draw borders on both sides of adjacent elements - only draw ONE border between them
3. **Borders Only Between Adjacent Blocks**: Container areas have no borders unless blocks are adjacent
4. **Gutters Inside Main Screen**: Scroll gutters are part of the main screen area, enclosed by the thick border
5. **Consistent Styling**: Use predefined CSS classes for all elements to maintain visual consistency

---

## Canvas Specifications

### Standard Diagrams (No Overflow)
- **Dimensions**: 840x640 pixels (800x600 content + 20px padding on all sides)
- **ViewBox**: `viewBox="0 0 840 640"`
- **Main screen**: 800x600 (x=20, y=20, width=800, height=600)

### Overflow Diagrams
- **Dimensions**: Variable height (e.g., 840x840 for 200px overflow)
- **ViewBox**: Adjusted to total height (e.g., `viewBox="0 0 840 840"`)
- **Main screen**: 800x600 (x=20, y=20, width=800, height=600) - the visible viewport
- **Main screen border**: COMPLETE 2px rectangle on all 4 sides, forming a closed boundary
- **Overflow area**: Below main screen (e.g., starting at y=620, height=200) - scrollable content outside viewport
- **Important**: The main screen's bottom border (at y=620) marks where viewport ends and overflow begins

---

## Border Hierarchy

### 1. Main Screen Border (Highest Priority)
- **Style**: 2px solid (#333)
- **CSS Class**: `.main-screen-border`
- **Position**: x=20, y=20, width=800, height=600
- **Purpose**: Represents the visible viewport boundary
- **Encloses**: Everything inside the main screen (gutters + content blocks)
- **CRITICAL**: This is the ONLY thick border - all other borders are thin (1px)
- **CRITICAL**: Main screen MUST be completely bordered on all 4 sides (top, right, bottom, left)
- **Drawing order**: Draw this LAST so it appears on top of all content
- **Overflow diagrams**: The 2px border forms a complete closed rectangle around the 800x600 viewport, even when overflow content is shown below

### 2. Block Separator Borders
- **Style**: 1px solid (#333)
- **CSS Class**: `.block-border`
- **Usage**: ONLY draw between adjacent blocks (never double borders)
- **CRITICAL**: Blocks themselves have NO borders - they are just filled rectangles
- **Rules**:
  - Draw ONE horizontal line where blocks meet (e.g., at y=70 between Header and Nav)
  - Separator lines are INDEPENDENT elements, NOT part of block rectangles
  - Do NOT add stroke to block `<rect>` elements - use separate `<line>` elements
  - Draw separator AFTER both adjacent blocks are drawn
  - No separator after the last block (e.g., Footer has no bottom separator)

### 3. Gutter Edge Indicators
- **Style**: 1px dashed (#666), stroke-dasharray="4,2"
- **CSS Class**: `.gutter-edge`
- **Position**: 
  - Left edge: x=35 (where content area begins)
  - Right edge: x=805 (where content area ends)
- **Purpose**: Indicate the boundary between gutters and content area
- **NOT borders**: These are visual guides, not structural borders

### 4. Viewport Separator (Overflow Diagrams Only)
- **Style**: 1px dotted (#666), stroke-dasharray="4,4"
- **CSS Class**: `.dotted-border`
- **Position**: y=620 (bottom of viewport, top of overflow)
- **Purpose**: Mark the boundary between visible viewport and overflow content

---

## Border Drawing Rules

### Rule 1: No Double Borders
**NEVER draw borders on both sides of adjacent elements.**

❌ WRONG:
```xml
<!-- Header with bottom border -->
<rect class="header" x="35" y="20" width="770" height="45"/>
<line class="block-border" x1="35" y1="65" x2="805" y2="65"/> <!-- Header bottom -->

<!-- Nav with top border -->
<rect class="nav" x="35" y="65" width="770" height="45"/>
<line class="block-border" x1="35" y1="65" x2="805" y2="65"/> <!-- Nav top - DUPLICATE! -->
```

✅ CORRECT:
```xml
<!-- Header block (NO border attribute) -->
<rect class="header" x="35" y="20" width="770" height="45"/>

<!-- Separator line between Header and Nav -->
<line class="block-border" x1="35" y1="65" x2="805" y2="65"/>

<!-- Nav block (NO border attribute) -->
<rect class="nav" x="35" y="65" width="770" height="45"/>
```

### Rule 2: Blocks Have NO Borders
**Content block rectangles are ONLY filled shapes - they have no stroke attribute.**

❌ WRONG:
```xml
<!-- Block with stroke attribute -->
<rect class="header" x="20" y="20" width="800" height="45" stroke="#333" stroke-width="1"/>
```

✅ CORRECT:
```xml
<!-- Block with only fill (via CSS class) -->
<rect class="header" x="20" y="20" width="800" height="45"/>

<!-- Borders are separate line elements -->
<line class="block-border" x1="20" y1="65" x2="820" y2="65"/>
```

### Rule 3: Separators Are Independent Lines
**Block separators are standalone `<line>` elements between blocks.**

❌ WRONG:
```xml
<!-- Trying to use rect border as separator -->
<rect class="header" x="20" y="20" width="800" height="45" stroke-bottom="#333"/>
```

✅ CORRECT:
```xml
<!-- Blocks are separate from their separators -->
<rect class="header" x="20" y="20" width="800" height="45"/>
<rect class="nav" x="20" y="65" width="800" height="45"/>

<!-- Separator is a separate line element -->
<line class="block-border" x1="20" y1="65" x2="820" y2="65"/>
```

### Rule 4: No Border on Last Block
**The last block in a sequence has no separator after it.**

❌ WRONG:
```xml
<!-- Footer with bottom border but nothing below -->
<rect class="footer" x="20" y="575" width="800" height="45"/>
<line class="block-border" x1="20" y1="620" x2="820" y2="620"/> <!-- WRONG - nothing below! -->
```

✅ CORRECT:
```xml
<!-- Footer with no separator after it -->
<rect class="footer" x="20" y="575" width="800" height="45"/>
<!-- No line here - Footer is the last block -->
```

---

## Scroll Gutters

### In Main Screen (Visible Viewport)
- **Width**: 15px on each side
- **Position**: Inside main screen border
  - Left gutter: x=20 to x=35
  - Right gutter: x=805 to x=820
  - Content area: x=35 to x=805 (770px width)
- **Fill**: #e9ecef (very light gray)
- **Inner edges**: Dashed lines (stroke-dasharray="4,2") at x=35 and x=805
- **NOT borders**: These are visual indicators, not structural borders
- **Height**: Full viewport (600px, y=20 to y=620)

### In Overflow Area
- **Same width and position**: Continues seamlessly from main screen
- **Inner edges**: Same dashed lines continue
- **NO outer borders**: No left/right borders on overflow gutters
- **Height**: Full overflow area height

---

## Scrollbars (Main Screen Only)

- **Width**: 15px (overlays right gutter)
- **Position**: x=805 to x=820, y=20 to y=620 (viewport only)
- **Track**: #e0e0e0 fill, #999 border
- **Thumb**: #999 fill, #666 border, 11px width, 3px border-radius
- **Height**: Proportional to visible content ratio
- **Visibility**: Only in main screen, never in overflow area

---

## Color Palette

### Block Colors
- **Header**: #d0d0d0 (medium gray) - CSS class `.header`
- **Navigation**: #e0e0e0 (light gray) - CSS class `.nav`
- **Main Content**: #ffffff (white) - CSS class `.content`
- **Footer**: #d0d0d0 (medium gray) - CSS class `.footer`

### Container Colors
- **Canvas Background**: #f8f9fa (very light gray) - CSS class `.container-bg`
- **App Container**: Same as canvas (#f8f9fa)
- **Scroll Gutters**: #e9ecef (very light gray) - CSS class `.gutter`

### Border Colors
- **Main screen border**: #333 (dark gray), 2px thick
- **Block separators**: #333 (dark gray), 1px solid
- **Gutter edges**: #666 (medium gray), 1px dashed
- **Viewport separator**: #666 (medium gray), 1px dotted

### Scrollbar Colors
- **Track**: #e0e0e0 fill, #999 border - CSS class `.scrollbar-track`
- **Thumb**: #999 fill, #666 border - CSS class `.scrollbar-thumb`

### Overflow Pattern
- **Background**: #f5f5f5
- **Lines**: #e8e8e8 diagonal cross-hatch
- **CSS**: Use pattern `.overflow-bg` with `url(#overflowPattern)`
- **Applied to**: ALL content blocks in overflow areas (Header, Navigation, Main Content, Footer)
- **CRITICAL**: Blocks in overflow areas must use `.overflow-bg` class instead of their normal class (`.header`, `.nav`, `.content`, `.footer`) so the diagonal pattern remains visible and indicates overflow content

---

## Text Styles

### Block Labels
- **Font**: Arial, sans-serif
- **Size**: 14px
- **Color**: #333
- **Style**: Italic, left-aligned
- **CSS Class**: `.text`
- **Position**: 10px from left edge of content (x=45 when content starts at x=35)
- **Vertical**: Centered or slightly above center in block

### Centered Text Labels
- **Font**: Arial, sans-serif
- **Size**: 14px
- **Color**: #666 (lighter for non-block areas)
- **Style**: Italic, center-aligned
- **CSS Class**: `.text-center`
- **Usage**: For "Remaining space" areas and other centered annotations
- **Position**: Centered both horizontally and vertically in the area

### Annotations (Minimal Use)
- **Font**: Arial, sans-serif
- **Size**: 10px
- **Color**: #666
- **Style**: Italic
- **CSS Class**: `.label`
- **Usage**: Rare, only for critical notes

---

## Drawing Order (Layering)

### Standard Diagrams
1. Canvas background (`.container-bg`)
2. Scroll gutters with fills (`.gutter`) - if present
3. Gutter inner edges - dashed lines (`.gutter-edge`) - if present
4. Content blocks (`.header`, `.nav`, `.content`, `.footer`) - **rectangles with NO stroke**
5. Block separator lines (`.block-border`) - **independent `<line>` elements between adjacent blocks**
6. Text labels (`.text`)
7. Scrollbar track (`.scrollbar-track`) - if visible, overlays right gutter
8. Scrollbar thumb (`.scrollbar-thumb`)
9. **Main screen border (`.main-screen-border`) - DRAW LAST so it appears on top of all content, including scrollbars**

**CRITICAL NOTES:**
- Main screen border is drawn LAST (absolute final element) so it appears on top of ALL content, including scrollbars
- Scrollbars must be drawn BEFORE the main screen border so they appear beneath it
- Block rectangles have NO stroke attribute - they are fill-only
- Separators are separate `<line>` elements, not part of block rectangles
- Each separator is drawn ONCE between two adjacent blocks

### Overflow Diagrams
1. Canvas background (`.container-bg`)
2. **Main screen** gutters with fills
3. **Main screen** gutter inner edges (dashed)
4. **Main screen** content blocks - **rectangles with NO stroke**
5. **Main screen** block separator lines - **between adjacent blocks only**
6. **Overflow area** gutters with fills
7. **Overflow area** content blocks - **with overflow pattern if applicable, NO stroke**
8. **Overflow area** block separator lines - **between adjacent blocks only**
9. **Overflow area** bottom edge (at very bottom) - only if needed
10. Text labels (always on top)
11. Scrollbar track and thumb (main screen only) - **draw BEFORE main screen border**
12. **Main screen border (`.main-screen-border`) - DRAW LAST (absolute final element) so it appears on top of ALL content including scrollbars**

**OVERFLOW NOTES:**
- Main screen border is a COMPLETE 2px rectangle around viewport (x=20, y=20, width=800, height=600)
- Main screen border MUST be drawn as the absolute final element (after scrollbars) so it appears on top of everything
- Scrollbars must be drawn BEFORE the main screen border so the border overlays them
- The bottom border of the main screen (at y=620) separates viewport from overflow area
- Overflow content continues below the main screen viewport with same block structure
- Overflow area is NOT enclosed by the main screen border - it's outside the viewport
- Separators in overflow area follow same rules: only between adjacent blocks

---

## CSS Class Reference

```css
/* Backgrounds */
.container-bg { fill: #f8f9fa; }
.gutter { fill: #e9ecef; }

/* Blocks - FILL ONLY, NO STROKE */
.header { fill: #d0d0d0; }
.nav { fill: #e0e0e0; }
.content { fill: #ffffff; }
.footer { fill: #d0d0d0; }
.overflow-bg { fill: url(#overflowPattern); }

/* Borders - USE ON <line> AND <rect> ELEMENTS ONLY FOR BORDERS */
.main-screen-border { stroke: #333; stroke-width: 2; fill: none; }
.block-border { stroke: #333; stroke-width: 1; fill: none; }  /* Use ONLY on <line> elements */
.dotted-border { stroke: #666; stroke-width: 1; stroke-dasharray: 4,4; fill: none; }
.gutter-edge { stroke: #666; stroke-width: 1; stroke-dasharray: 4,2; fill: none; }

/* Scrollbar */
.scrollbar-track { fill: #e0e0e0; stroke: #999; stroke-width: 1; }
.scrollbar-thumb { fill: #999; stroke: #666; stroke-width: 1; }

/* Text */
.text { font-family: Arial, sans-serif; font-size: 14px; fill: #333; text-anchor: start; font-style: italic; }
.text-center { font-family: Arial, sans-serif; font-size: 14px; fill: #666; text-anchor: middle; font-style: italic; }
.label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; font-style: italic; }
```

**USAGE NOTES:**
- `.header`, `.nav`, `.content`, `.footer` are for block `<rect>` elements - FILL ONLY
- `.block-border` is for separator `<line>` elements - NEVER use stroke on block rectangles
- `.main-screen-border` is for the outer viewport `<rect>` - stroke only, no fill

---

## Overflow Pattern Definition

```xml
<pattern id="overflowPattern" patternUnits="userSpaceOnUse" width="10" height="10">
  <rect width="10" height="10" fill="#f5f5f5"/>
  <path d="M 0,0 L 10,10 M 10,0 L 0,10" stroke="#e8e8e8" stroke-width="1" fill="none"/>
</pattern>
```

---

## Typical Block Dimensions

- **Header**: 45px height
- **Navigation Panel**: 45px height  
- **Main Content**: Variable, fills remaining space
- **Footer**: 45px height
- **Scroll Gutters**: 15px width (each side)
- **Scrollbar**: 15px width (overlays right gutter)

Adjust as needed to demonstrate specific layout concepts.

---

## Quick Start Guide

### Creating a Standard Diagram (No Overflow)

1. **Set up canvas**: `<svg viewBox="0 0 840 640" width="840" height="640">`
2. **Add CSS classes** in `<defs><style>` section (copy from CSS Class Reference)
3. **Draw background**: Canvas background rectangle (`.container-bg`)
4. **Draw scroll gutters** (if needed): Left (x=20-35) and right (x=805-820) with dashed inner edges (`.gutter-edge`)
5. **Draw content blocks**: Header, Nav, Content, Footer rectangles - **NO stroke attribute, fill only**
   ```xml
   <rect class="header" x="20" y="20" width="800" height="45"/>
   <rect class="nav" x="20" y="65" width="800" height="45"/>
   ```
6. **Draw block separators**: ONE `<line>` element between each pair of adjacent blocks
   ```xml
   <line class="block-border" x1="20" y1="65" x2="820" y2="65"/>  <!-- Header|Nav -->
   <line class="block-border" x1="20" y1="110" x2="820" y2="110"/>  <!-- Nav|Content -->
   ```
7. **Add labels**: Block names (`.text`)
8. **Add scrollbar** (if needed): Track and thumb overlaying right gutter (`.scrollbar-track`, `.scrollbar-thumb`)
9. **Draw main screen border LAST**: 2px thick rectangle at x=20, y=20, width=800, height=600 (`.main-screen-border`) - **MUST be the absolute final element so it appears on top of everything including scrollbars**

### Creating an Overflow Diagram

1. **Set up canvas**: `<svg viewBox="0 0 840 840">` (or taller for more overflow)
2. **Follow steps 2-7 above** for main screen area (y=20 to y=620)
3. **Draw viewport separator**: Dotted line at y=620 (`.dotted-border`)
4. **Extend gutters** into overflow area (same x positions, starting at y=620)
5. **Draw overflow content blocks**: Continue blocks below y=620 with overflow pattern (`.overflow-bg`)
6. **Draw block separators**: Between adjacent blocks in overflow area
7. **Draw bottom edge**: 1px line at very bottom of content
8. **Add labels**: Indicate overflow content
9. **Add scrollbar** (if needed): Track and thumb overlaying right gutter in main screen only
10. **Draw main screen border LAST**: 2px thick rectangle at x=20, y=20, width=800, height=600 (`.main-screen-border`) - **MUST be the absolute final element so it appears on top of everything including scrollbars and overflow content**

### Creating Diagrams with "Remaining Space" Areas

When showing diagrams where content fits in viewport but there's visible empty space below the last block:

1. **Draw all blocks** according to standard rules (Header, Nav, Content, Footer with separators)
2. **Draw separator line** after the last block (e.g., Footer) to show the boundary with remaining space
3. **Draw remaining space rectangle** with simple shading:
   ```xml
   <rect x="35" y="495" width="770" height="125" fill="#eeeeee"/>
   ```
4. **Add centered text label**:
   ```xml
   <text class="text-center" x="420" y="562">Remaining space</text>
   ```
   - Use `.text-center` class for center-aligned text
   - Position text at horizontal center of content area
   - Position text at vertical center of remaining space area

**Remaining Space Styling Rules:**
- Use simple shading (#eeeeee) instead of patterns to avoid visual artifacts at edges
- Do NOT draw redundant gutter edge lines on individual blocks - gutters have their own edges
- Remaining space should have a separator line at its top (after last block) but NOT at bottom (ends at main screen border)
- Text should be centered both horizontally and vertically
- Text color should be lighter (#666) than block labels (#333)

### Common Mistakes to Avoid

❌ Drawing borders on both sides of adjacent blocks (double borders)  
❌ Adding stroke attribute to block `<rect>` elements  
❌ Drawing borders on block rectangles instead of using separate `<line>` elements  
❌ Drawing bottom border on last block (Footer) when nothing is below it  
❌ Using 2px borders for block separators (should be 1px)  
❌ Drawing main screen border before scrollbars (scrollbars must come first)  
❌ Drawing main screen border anywhere except as the absolute final element  
❌ Forgetting the main screen border (2px thick)  
❌ Drawing scrollbar in overflow area (only in viewport)  
❌ Placing scroll gutters outside the main screen border  
❌ Using diagonal patterns that create visual artifacts at edges
❌ Drawing redundant gutter edge lines on each individual block
❌ Missing separator line between last block and remaining space
❌ Drawing bottom edge on remaining space area (main screen border provides this)

**GOLDEN RULES:**
1. Blocks = filled rectangles with NO stroke
2. Separators = independent `<line>` elements between blocks
3. Main screen border = ABSOLUTE FINAL ELEMENT drawn (appears on top of everything including scrollbars)
4. Scrollbars drawn BEFORE main screen border so border overlays them
5. One separator line per pair of adjacent blocks  
6. Remaining space = simple shading with centered text, no patterns  

---

## File Naming Convention

- `app-container-diagram.svg` - Basic container structure
- `app-container-with-gutters-diagram.svg` - Container with scroll gutters
- `horizontal-layout-diagram.svg` - Horizontal layout, no overflow
- `horizontal-layout-with-gutters-diagram.svg` - With gutters, no overflow
- `horizontal-layout-overflow-scrollbar.svg` - With overflow content
- `[layout-type]-[variant]-diagram.svg` - Follow this pattern for new diagrams

## Notes
- All dimensions in pixels
- Use CSS classes for consistent styling
- Pattern definitions go in `<defs>` section at top
- Keep label text concise and descriptive
- Maintain consistent spacing and alignment
- Round corners (rx="4") on outer background container for polish
- Main area = visible viewport (what user sees on screen)
- Overflow area = content beyond viewport (requires scrolling to see)
