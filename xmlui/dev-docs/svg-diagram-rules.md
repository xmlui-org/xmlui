# SVG Diagram Drawing Rules for App Layout Documentation

## Purpose

These rules define how to create consistent, professional SVG diagrams illustrating app layout structures for the XMLUI App component documentation. The diagrams show:
- Main screen viewport boundaries
- Content blocks (Header, Navigation Panel, Main Content, Footer)
- Scroll gutters and scrollbars
- Overflow content (content that extends beyond the viewport)
- Block arrangements and spacing

## Core Principles

1. **Main Screen Border**: The outermost 4px thick border represents the visible viewport (800x600)
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
- **Overflow area**: Below main screen (e.g., x=20, y=620, height=200) - scrollable content

---

## Border Hierarchy

### 1. Main Screen Border (Highest Priority)
- **Style**: 4px solid (#333)
- **CSS Class**: `.main-screen-border`
- **Position**: x=20, y=20, width=800, height=600
- **Purpose**: Represents the visible viewport boundary
- **Encloses**: Everything inside the main screen (gutters + content blocks)
- **CRITICAL**: This is the ONLY thick border - all other borders are thin (1px)

### 2. Block Separator Borders
- **Style**: 1px solid (#333)
- **CSS Class**: `.block-border`
- **Usage**: ONLY draw between adjacent blocks (never double borders)
- **Rules**:
  - Draw ONE horizontal line where blocks meet (e.g., bottom of Header when Nav is below)
  - Do NOT draw borders on both blocks - choose one side only
  - Convention: Draw border at the BOTTOM of upper block OR TOP of lower block (not both)
  - Container areas with no blocks have NO borders

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
<rect class="header" x="35" y="20" width="770" height="50"/>
<line class="block-border" x1="35" y1="70" x2="805" y2="70"/> <!-- Header bottom -->

<!-- Nav with top border -->
<rect class="nav" x="35" y="70" width="770" height="45"/>
<line class="block-border" x1="35" y1="70" x2="805" y2="70"/> <!-- Nav top - DUPLICATE! -->
```

✅ CORRECT:
```xml
<!-- Header with bottom border -->
<rect class="header" x="35" y="20" width="770" height="50"/>
<line class="block-border" x1="35" y1="70" x2="805" y2="70"/> <!-- SINGLE border between -->

<!-- Nav without top border (already drawn above) -->
<rect class="nav" x="35" y="70" width="770" height="45"/>
```

### Rule 2: Borders Only Between Adjacent Blocks
**Do NOT draw borders where there are no adjacent blocks.**

❌ WRONG:
```xml
<!-- App Container with top/bottom borders but no adjacent blocks -->
<rect x="35" y="20" width="770" height="600"/>
<line x1="35" y1="20" x2="805" y2="20"/> <!-- Top border - nothing above! -->
<line x1="35" y1="620" x2="805" y2="620"/> <!-- Bottom border - nothing below! -->
```

✅ CORRECT:
```xml
<!-- App Container with no borders (no adjacent blocks) -->
<rect x="35" y="20" width="770" height="600"/>
<!-- Only gutter edges (dashed) at x=35 and x=805 -->
```

### Rule 3: Container Areas Have No Inherent Borders
**Containers are just backgrounds - borders appear only at block boundaries.**

- App Container: NO borders, just fill color
- Scroll gutters: Fill color + dashed inner edges (not borders)
- Content areas: Fill color, borders only where blocks meet

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
- **Main screen border**: #333 (dark gray), 4px thick
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
- **Applied to**: Main Content blocks in overflow area only (not Footer)

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
2. Scroll gutters with fills (`.gutter`)
3. Gutter inner edges - dashed lines (`.gutter-edge`)
4. App Container area (if visible, same as canvas color)
5. Content blocks (`.header`, `.nav`, `.content`, `.footer`)
6. Block separator borders (`.block-border`) - between adjacent blocks only
7. Scrollbar track (`.scrollbar-track`) - if visible, overlays right gutter
8. Scrollbar thumb (`.scrollbar-thumb`)
9. Main screen border (`.main-screen-border`) - thick 4px, drawn LAST for clean edges
10. Text labels (`.text`) - always on top

### Overflow Diagrams
1. Canvas background (`.container-bg`)
2. **Main screen** gutters with fills
3. **Main screen** gutter inner edges (dashed)
4. **Main screen** content blocks
5. **Main screen** block separator borders (between adjacent blocks only)
6. Scrollbar track and thumb (main screen only)
7. Main screen border (thick 4px, around viewport only)
8. Viewport separator line (dotted, at y=620)
9. **Overflow area** gutters with fills
10. **Overflow area** gutter inner edges (dashed)
11. **Overflow area** content blocks (with overflow pattern if applicable)
12. **Overflow area** block separator borders (between adjacent blocks only)
13. **Overflow area** bottom edge (at very bottom)
14. Text labels (always on top)

---

## CSS Class Reference

```css
/* Backgrounds */
.container-bg { fill: #f8f9fa; }
.gutter { fill: #e9ecef; }

/* Blocks */
.header { fill: #d0d0d0; }
.nav { fill: #e0e0e0; }
.content { fill: #ffffff; }
.footer { fill: #d0d0d0; }
.overflow-bg { fill: url(#overflowPattern); }

/* Borders */
.main-screen-border { stroke: #333; stroke-width: 4; fill: none; }
.block-border { stroke: #333; stroke-width: 1; fill: none; }
.dotted-border { stroke: #666; stroke-width: 1; stroke-dasharray: 4,4; fill: none; }
.gutter-edge { stroke: #666; stroke-width: 1; stroke-dasharray: 4,2; fill: none; }

/* Scrollbar */
.scrollbar-track { fill: #e0e0e0; stroke: #999; stroke-width: 1; }
.scrollbar-thumb { fill: #999; stroke: #666; stroke-width: 1; }

/* Text */
.text { font-family: Arial, sans-serif; font-size: 14px; fill: #333; text-anchor: start; font-style: italic; }
.label { font-family: Arial, sans-serif; font-size: 10px; fill: #666; font-style: italic; }
```

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

- **Header**: 40-50px height
- **Navigation Panel**: 45-50px height  
- **Main Content**: Variable, fills remaining space
- **Footer**: 45-70px height
- **Scroll Gutters**: 15px width (each side)
- **Scrollbar**: 15px width (overlays right gutter)

Adjust as needed to demonstrate specific layout concepts.

---

## Quick Start Guide

### Creating a Standard Diagram (No Overflow)

1. **Set up canvas**: `<svg viewBox="0 0 840 640" width="840" height="640">`
2. **Add CSS classes** in `<defs><style>` section (copy from CSS Class Reference)
3. **Draw background**: Canvas background rectangle (`.container-bg`)
4. **Draw main screen border**: 4px thick rectangle at x=20, y=20, width=800, height=600 (`.main-screen-border`)
5. **Draw scroll gutters** (if needed): Left (x=20-35) and right (x=805-820) with dashed inner edges (`.gutter-edge`)
6. **Draw content blocks**: Header, Nav, Content, Footer (use appropriate CSS classes)
7. **Draw block separators**: ONE 1px line between adjacent blocks only (`.block-border`)
8. **Add scrollbar** (if needed): Track and thumb overlaying right gutter (`.scrollbar-track`, `.scrollbar-thumb`)
9. **Add labels**: Block names (`.text`)

### Creating an Overflow Diagram

1. **Set up canvas**: `<svg viewBox="0 0 840 840">` (or taller for more overflow)
2. **Follow steps 2-9 above** for main screen area (y=20 to y=620)
3. **Draw viewport separator**: Dotted line at y=620 (`.dotted-border`)
4. **Extend gutters** into overflow area (same x positions, starting at y=620)
5. **Draw overflow content blocks**: Continue blocks below y=620 with overflow pattern (`.overflow-bg`)
6. **Draw block separators**: Between adjacent blocks in overflow area
7. **Draw bottom edge**: 1px line at very bottom of content
8. **Add labels**: Indicate overflow content

### Common Mistakes to Avoid

❌ Drawing borders on both sides of adjacent blocks (double borders)  
❌ Drawing top/bottom borders on empty container areas  
❌ Using 2px borders for block separators (should be 1px)  
❌ Forgetting the main screen border (4px thick)  
❌ Drawing scrollbar in overflow area (only in viewport)  
❌ Placing scroll gutters outside the main screen border  

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
