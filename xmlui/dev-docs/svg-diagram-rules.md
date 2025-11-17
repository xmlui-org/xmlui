# SVG Diagram Drawing Rules for App Layout Documentation

## Purpose

These rules define how to create consistent, professional SVG diagrams illustrating app layout structures for the XMLUI App component documentation. The diagrams show:
- Main screen viewport boundaries
- Content blocks (Header, Navigation Panel, Main Content, Footer)
- Scroll gutters and scrollbars
- Overflow content (content that extends beyond the viewport)
- Block arrangements and spacing

## Canvas Specifications

### Standard Diagrams (No Overflow)
- **Dimensions**: 840x640 pixels (800x600 content + 20px padding on all sides)
- **ViewBox**: `viewBox="0 0 840 640"`
- **Main screen**: 800x600 (x=20, y=20, width=800, height=600)

### Overflow Diagrams
- **Dimensions**: Variable height (e.g., 840x840 for 200px overflow)
- **ViewBox**: Adjusted to total height (e.g., `viewBox="0 0 840 840"`)
- **Main screen**: 800x600 - the visible viewport
- **Main screen border**: COMPLETE 2px rectangle on all 4 sides, forming a closed boundary
- **Overflow area**: Content outside viewport (requires scrolling to see)
- **Important**: When creating overflow diagrams, create three: top-scroll, mid-scroll, and bottom-scroll positions

---

## Border Hierarchy

### 1. Main Screen Border (Highest Priority)
- **Style**: 2px solid (#333)
- **CSS Class**: `.main-screen-border`
- **Position**: x=20, y=20, width=800, height=600
- **Purpose**: Represents the visible viewport boundary
- **CRITICAL**: This is the ONLY thick border - all other borders are thin (1px)
- **CRITICAL**: Main screen MUST be completely bordered on all 4 sides
- **Drawing order**: Draw this LAST so it appears on top of all content

### 2. Block Separator Borders
- **Style**: 1px solid (#333)
- **CSS Class**: `.block-border`
- **Usage**: ONLY draw between adjacent blocks (never double borders)
- **CRITICAL**: Blocks themselves have NO borders - they are just filled rectangles
- **Rules**:
  - Draw ONE horizontal line where blocks meet
  - Separator lines are INDEPENDENT elements, NOT part of block rectangles
  - Do NOT add stroke to block `<rect>` elements - use separate `<line>` elements

### 3. Gutter Edge Indicators
- **Style**: 1px dashed (#666), stroke-dasharray="4,2"
- **CSS Class**: `.gutter-edge`
- **Position**: 
  - Left edge: x=35 (where content area begins)
  - Right edge: x=805 (where content area ends)
- **Purpose**: Indicate the boundary between gutters and content area

---

## Scroll Gutters

### Gutter Styling (Consistent Across All Layouts)
- **Fill color**: #e9ecef (very light gray) - CSS class `.gutter`
- **Edge style**: 1px dashed (#666), stroke-dasharray="4,2" - CSS class `.gutter-edge`
- **CRITICAL**: All diagrams must use these exact same gutter colors and edge styles

### When Scrollbar Gutters Are Enabled (`noScrollbarGutters=false`)

#### No Overflow (No Scrollbar)
- **Width**: 15px on each side
- **Position**: Flanking main content area only
  - Left gutter: x=20 to x=35
  - Right gutter: x=805 to x=820
  - Content area: x=35 to x=805 (770px width)
- **Fill**: #e9ecef (very light gray)
- **Inner edges**: Dashed lines at x=35 and x=805 (#666, dasharray="4,2")
- **Header, NavPanel, Footer**: Full width (no gutters)
- **Height**: Same height as main content area

#### With Overflow (Scrollbar Present)
- **Left gutter only**: x=20 to x=35 (15px width)
- **Right gutter**: NOT displayed (scrollbar overlays that space)
- **Content area**: x=35 to x=805 (770px width)
- **Left edge**: Dashed line at x=35 (#666, dasharray="4,2")
- **Right edge**: No gutter edge line (scrollbar separator line at x=805 instead)
- **Scrollbar position**: x=805 to x=820 (replaces right gutter)
- **IMPORTANT**: Left gutter continues seamlessly into overflow areas with same styling

---

## Scrollbars (Main Screen Only)

### Position and Dimensions
- **Track**: x=805, y=20, width=15, height=600 (full viewport height)
- **Track Fill**: #e0e0e0
- **Thumb**: x=807, width=11 (2px padding), height=154
- **Thumb Fill**: #999
- **No borders or rounded corners** on track or thumb
- **Overlays right gutter** when gutters are enabled

### Separator Line
- **Position**: x=805 (left edge of scrollbar track)
- **Style**: 1px dashed (#999), stroke-dasharray="3,2"
- **Purpose**: Visual separation between content area and scrollbar

### Thumb Vertical Positions
- **Top scroll**: y=20 (at track start)
- **Mid scroll**: y=443 (centered: 20 + (600-154)/2 = 343 for mid-scroll with viewport at y=120)
- **Bottom scroll**: y=666 (at track end: 820 - 154)
- **Calculation varies** based on viewport start position

### CSS Classes
```css
.scrollbar-track { fill: #e0e0e0; }
.scrollbar-thumb { fill: #999; }
.scrollbar-border { stroke: #999; stroke-width: 1; stroke-dasharray: 3,2; fill: none; }
```

---

## Color Palette

### Block Colors
- **Header**: #d0d0d0 (medium gray) - CSS class `.header`
- **Navigation**: #e0e0e0 (light gray) - CSS class `.nav`
- **Main Content**: #ffffff (white) - CSS class `.content`
- **Footer**: #d0d0d0 (medium gray) - CSS class `.footer`

### Container Colors
- **Canvas Background**: #f8f9fa (very light gray) - CSS class `.container-bg`
- **Scroll Gutters**: #e9ecef (very light gray) - CSS class `.gutter`

### Border Colors
- **Main screen border**: #333 (dark gray), 2px thick
- **Block separators**: #333 (dark gray), 1px solid
- **Gutter edges**: #666 (medium gray), 1px dashed
- **Scrollbar border**: #999 (medium gray), 1px dashed

### Overflow Pattern
- **Background**: #f5f5f5
- **Lines**: #e8e8e8 diagonal cross-hatch
- **CSS**: Use pattern `.overflow-bg` with `url(#overflowPattern)`
- **Applied to**: Content blocks in overflow areas

---

## Text Styles

### Block Labels
- **Font**: Arial, sans-serif
- **Size**: 14px
- **Color**: #333
- **Style**: Italic, left-aligned
- **CSS Class**: `.text`
- **Position**: 10px from left edge of content area

### Overflow Indicators
- **Font**: Arial, sans-serif
- **Size**: 11px
- **Color**: #666
- **Style**: Italic, center-aligned
- **CSS Class**: `.text-overflow`
- **Usage**:
  - **Top overflow**: Add "↑ Overflow" text near top of visible content area
  - **Bottom overflow**: Add "↓ Overflow" text near bottom of visible content area
  - **Mid-scroll**: Add both top and bottom overflow indicators
- **Position**: Horizontally centered in content area, vertically:
  - Top indicator: ~20-30px below top edge of visible content
  - Bottom indicator: ~20-30px above bottom edge of visible content

---

## Drawing Order (Layering)

### Standard Diagrams
1. Canvas background (`.container-bg`)
2. Scroll gutters (`.gutter`) - if present
3. Gutter inner edges (`.gutter-edge`) - if present
4. Content blocks (`.header`, `.nav`, `.content`, `.footer`)
5. Block separator lines (`.block-border`)
6. Text labels (`.text`)
7. Scrollbar separator line (`.scrollbar-border`) - if visible
8. Scrollbar track (`.scrollbar-track`) - if visible
9. Scrollbar thumb (`.scrollbar-thumb`) - if visible
10. **Main screen border (`.main-screen-border`) - DRAW LAST**

### Overflow Diagrams
1. Canvas background (`.container-bg`)
2. Overflow area gutters (if present)
3. Overflow area content blocks with overflow pattern
4. Main screen gutters (if present)
5. Main screen gutter inner edges
6. Main screen content blocks
7. Block separator lines
8. Text labels
9. Scrollbar separator line (if visible)
10. Scrollbar track (if visible)
11. Scrollbar thumb (if visible)
12. **Main screen border (`.main-screen-border`) - DRAW LAST**

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

/* Borders */
.main-screen-border { stroke: #333; stroke-width: 2; fill: none; }
.block-border { stroke: #333; stroke-width: 1; fill: none; }
.gutter-edge { stroke: #666; stroke-width: 1; stroke-dasharray: 4,2; fill: none; }

/* Scrollbar */
.scrollbar-track { fill: #e0e0e0; }
.scrollbar-thumb { fill: #999; }
.scrollbar-border { stroke: #999; stroke-width: 1; stroke-dasharray: 3,2; fill: none; }

/* Text */
.text { font-family: Arial, sans-serif; font-size: 14px; fill: #333; text-anchor: start; font-style: italic; }
.text-overflow { font-family: Arial, sans-serif; font-size: 11px; fill: #666; text-anchor: middle; font-style: italic; }
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

- **Header**: 45px height
- **Navigation Panel**: 45px height  
- **Main Content**: Variable, fills remaining space
- **Footer**: 45px height
- **Scroll Gutters**: 15px width (each side, when enabled)
- **Scrollbar**: 15px width (overlays right gutter)

---

## Common Mistakes to Avoid

❌ Drawing borders on both sides of adjacent blocks (double borders)  
❌ Adding stroke attribute to block `<rect>` elements  
❌ Using 2px borders for block separators (should be 1px)  
❌ Drawing main screen border before scrollbars (draw border last)  
❌ Drawing scrollbar in overflow area (only in viewport)  
❌ Placing scroll gutters outside the main screen border  
❌ Adding borders or rounded corners to scrollbar track or thumb
❌ Missing scrollbar separator line when scrollbar is visible

**GOLDEN RULES:**
1. Blocks = filled rectangles with NO stroke
2. Separators = independent `<line>` elements between blocks
3. Main screen border = ABSOLUTE FINAL ELEMENT (appears on top of everything)
4. Scrollbar track and thumb = simple filled rectangles (no borders, no rounded corners)
5. Scrollbar separator line = dashed line at x=805, drawn before track and thumb
6. Gutters only flank main content area, not header/nav/footer

---
