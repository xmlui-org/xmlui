# SVG Diagram Drawing Rules for App Layout Documentation

## Purpose

These rules define how to create consistent, professional SVG diagrams illustrating app layout structures for the XMLUI App component documentation. The diagrams show main screen viewport boundaries, content blocks, scroll gutters, scrollbars, overflow content, and block arrangements.

**Destination Folder**: All generated SVG diagrams must be saved to `xmlui/dev-docs/images/`

---

## Table of Contents

1. [Canvas Specifications](#canvas-specifications)
2. [Typical Block Dimensions](#typical-block-dimensions)
3. [Color Palette](#color-palette)
4. [Text Styles](#text-styles)
5. [CSS Class Reference](#css-class-reference)
6. [Overflow Pattern Definition](#overflow-pattern-definition)
7. [Step-by-Step Diagram Creation Algorithm](#step-by-step-diagram-creation-algorithm)
8. [Quick Reference: Layout-Specific Parameters](#quick-reference-layout-specific-parameters)

---

## Canvas Specifications

### Standard Diagrams (No Overflow)
- **Dimensions**: 840x640 pixels (800x600 content + 20px padding on all sides)
- **ViewBox**: `viewBox="0 0 840 640"`
- **Main screen**: 800x600 (x=20, y=20, width=800, height=600)
- **Remaining Space**: Always show a shaded area (fill: #eeeeee, height: 125px) between Main Content and Footer to indicate unused vertical space, with centered label "Remaining space"

### Overflow Diagrams
- **Dimensions**: Variable height (e.g., 840x840 for 200px overflow)
- **ViewBox**: Adjusted to total height (e.g., `viewBox="0 0 840 840"`)
- **Display Size**: 420px width (half of actual size for side-by-side display in documentation)
- **Main screen**: 800x600 - the visible viewport, ALWAYS at (x=20, y=20) in top-scroll, SHIFTED DOWN in bottom-scroll
- **Overflow area**: Content outside viewport requiring scrolling
- **Important**: Create TWO diagrams per overflow case: top-scroll and bottom-scroll positions
- **Documentation Layout**: `<img src="...-top.svg" alt="..." width="420" /> <img src="...-bottom.svg" alt="..." width="420" />`

---

## Typical Block Dimensions

- **Header**: 45px height
- **Navigation Panel**: 45px height (horizontal layouts) or 200px width (vertical layouts)
- **Main Content**: Variable, fills remaining space
- **Footer**: 45px height
- **Scroll Gutters**: 15px width (each side, when enabled)
- **Scrollbar**: 15px width, 11px thumb width (2px padding)
- **Remaining Space**: 125px height (shown in non-overflow diagrams between Main Content and Footer to indicate unused vertical space)

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
- **Remaining Space**: #eeeeee (light gray) - Inline fill, used in non-overflow diagrams to show unused space

### Border Colors
- **Main screen border**: #333 (dark gray), 2px thick - CSS class `.main-screen-border`
- **Block separators**: #333 (dark gray), 1px solid - CSS class `.block-border`
- **Gutter edges**: #666 (medium gray), 1px dashed - CSS class `.gutter-edge`
- **Scrollbar border**: #999 (medium gray), 1px dashed - CSS class `.scrollbar-border`

### Overflow Pattern
- **Background**: #f5f5f5
- **Lines**: #e8e8e8 diagonal cross-hatch
- **CSS**: Pattern `.overflow-bg` with `url(#overflowPattern)`
- **Applied to**: ALL blocks (H, N, M, F) and gutters in overflow areas

---

## Text Styles

### Block Labels
- **Font**: Arial, sans-serif, 14px
- **Color**: #333
- **Style**: Italic, left-aligned
- **CSS Class**: `.text`
- **Position**: 10px from left edge of content area

### Overflow Indicators
- **Font**: Arial, sans-serif, 11px
- **Color**: #666
- **Style**: Italic, center-aligned
- **CSS Class**: `.text-overflow`
- **Usage**: "↑ Overflow" (top) or "↓ Overflow" (bottom)

### Remaining Space Labels
- **Font**: Arial, sans-serif, 14px
- **Color**: #666
- **Style**: Italic, center-aligned
- **CSS Class**: `.text-center`
- **Usage**: "Remaining space" - centered in the remaining space area of non-overflow diagrams

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
.scrollbar { fill: #999; }
.scrollbar-border { stroke: #999; stroke-width: 1; stroke-dasharray: 3,2; fill: none; }

/* Text */
.text { font-family: Arial, sans-serif; font-size: 14px; fill: #333; text-anchor: start; font-style: italic; }
.text-overflow { font-family: Arial, sans-serif; font-size: 11px; fill: #666; text-anchor: middle; font-style: italic; }
.text-center { font-family: Arial, sans-serif; font-size: 14px; fill: #666; text-anchor: middle; font-style: italic; }
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

## Step-by-Step Diagram Creation Algorithm

This section provides detailed algorithms for creating diagrams based on layout characteristics. Follow these steps in order to ensure correct layering and positioning.

### Input Parameters

Before starting, determine these configuration values:

1. **Layout Type**: horizontal | horizontal-sticky | vertical | vertical-sticky | condensed | condensed-sticky | desktop
2. **Scroll Configuration**:
   - `scrollWholePage`: true | false (determines scroll container)
   - `noScrollbarGutters`: true | false (determines gutter visibility)
3. **Content State**:
   - `hasOverflow`: true | false (whether content extends beyond viewport)
   - `scrollPosition`: "top" | "bottom" (for overflow diagrams)
4. **Layout Characteristics** (derived from layout type):
   - `headerSticky`: boolean
   - `navPanelSticky`: boolean
   - `footerSticky`: boolean
   - `navPanelPosition`: "top" | "left" | "inline-header"
   - `headerFullWidth`: boolean

### Algorithm 1: Horizontal-Sticky Layout

**Characteristics:**
- Header sticky to top of viewport
- NavPanel sticky to top, below header
- Footer sticky to bottom of viewport
- Main Content scrolls between header/navpanel and footer
- Scroll container: App Container (C) when `scrollWholePage=true`, Main Content (M) when `scrollWholePage=false`

#### Step 1: Determine Canvas Dimensions

```
IF hasOverflow = false THEN
  canvasWidth = 840
  canvasHeight = 640
  viewBox = "0 0 840 640"
ELSE
  canvasWidth = 840
  overflowHeight = 200  // or calculate based on content
  canvasHeight = 640 + overflowHeight
  viewBox = "0 0 840 {canvasHeight}"
END IF
```

#### Step 2: Calculate Viewport Position

```
IF hasOverflow = false OR scrollPosition = "top" THEN
  viewportY = 20
ELSE IF scrollPosition = "bottom" THEN
  viewportY = 20 + overflowHeight
END IF

viewportX = 20
viewportWidth = 800
viewportHeight = 600
```

#### Step 3: Calculate Block Positions Within Viewport

```
// Header block
headerY = viewportY
headerHeight = 45

// Navigation Panel block
navPanelY = headerY + headerHeight
navPanelHeight = 45

// Main Content block
contentY = navPanelY + navPanelHeight
contentHeight = viewportHeight - headerHeight - navPanelHeight - footerHeight
// contentHeight = 600 - 45 - 45 - 45 = 465

// Footer block
footerY = viewportY + viewportHeight - footerHeight
footerHeight = 45
```

#### Step 4: Calculate Gutter Positions (if enabled)

```
IF noScrollbarGutters = false THEN
  gutterWidth = 15
  
  // Left gutter (only for Main Content area)
  leftGutterX = viewportX
  leftGutterY = contentY
  leftGutterHeight = contentHeight
  
  // Right gutter (only for Main Content area, overlaid by scrollbar if overflow)
  rightGutterX = viewportX + viewportWidth - gutterWidth
  rightGutterY = contentY
  rightGutterHeight = contentHeight
  
  // Content area is narrowed
  contentX = viewportX + gutterWidth
  contentWidth = viewportWidth - (2 * gutterWidth)
ELSE
  contentX = viewportX
  contentWidth = viewportWidth
END IF
```

#### Step 5: Calculate Scrollbar Position (if overflow)

```
IF hasOverflow = true THEN
  scrollbarX = viewportX + viewportWidth - 15
  scrollbarY = viewportY
  scrollbarHeight = viewportHeight  // Always full viewport height
  scrollbarWidth = 15
  
  // Thumb dimensions
  thumbWidth = 11
  thumbX = scrollbarX + 2  // 2px padding
  thumbHeight = 154  // Fixed or calculated based on content ratio
  
  IF scrollPosition = "top" THEN
    thumbY = scrollbarY + 2  // 2px padding from top
  ELSE IF scrollPosition = "bottom" THEN
    thumbY = scrollbarY + scrollbarHeight - thumbHeight - 2  // 2px padding from bottom
  END IF
END IF
```

#### Step 6: Calculate Overflow Areas (if overflow)

```
IF hasOverflow = true THEN
  IF scrollPosition = "top" THEN
    // Overflow is below viewport
    overflowStartY = viewportY + viewportHeight
    overflowEndY = canvasHeight
    
    // Only Main Content block extends into overflow
    IF noScrollbarGutters = false THEN
      overflowLeftGutterY = overflowStartY
      overflowContentY = overflowStartY
      overflowRightGutterY = overflowStartY
    ELSE
      overflowContentY = overflowStartY
    END IF
    
  ELSE IF scrollPosition = "bottom" THEN
    // Overflow is above viewport
    overflowStartY = 20
    overflowEndY = viewportY
    
    // Only Main Content block extends into overflow
    IF noScrollbarGutters = false THEN
      overflowLeftGutterY = overflowStartY
      overflowContentY = overflowStartY
      overflowRightGutterY = overflowStartY
    ELSE
      overflowContentY = overflowStartY
    END IF
  END IF
END IF
```

#### Step 7: Draw Elements in Order

**Phase 1: Background and Overflow Areas**

```
1. Draw canvas background rectangle:
   SVG: <rect class="container-bg" x="0" y="0" width="{canvasWidth}" height="{canvasHeight}" rx="4"/>
   - Position: x=0, y=0, width=canvasWidth, height=canvasHeight
   - Style: class="container-bg" (fill: #f8f9fa)
   - Attributes: rx="4" (rounded corners)

2. IF hasOverflow = true AND scrollPosition = "bottom" THEN
   // Draw top overflow area first
   
   2a. IF noScrollbarGutters = false THEN
       Draw left gutter in overflow:
       SVG: <rect x="{viewportX}" y="{overflowStartY}" width="{gutterWidth}" height="{overflowEndY - overflowStartY}" class="overflow-bg"/>
       - Position: x=viewportX, y=overflowStartY
       - Dimensions: width=gutterWidth, height=(overflowEndY - overflowStartY)
       - Style: class="overflow-bg" (fill: url(#overflowPattern) - diagonal cross-hatch)
   END IF
   
   2b. Draw main content in overflow:
       SVG: <rect x="{contentX}" y="{overflowStartY}" width="{contentWidth}" height="{overflowEndY - overflowStartY}" class="overflow-bg"/>
       - Position: x=contentX, y=overflowStartY
       - Dimensions: width=contentWidth, height=(overflowEndY - overflowStartY)
       - Style: class="overflow-bg" (fill: url(#overflowPattern))
   
   2c. Add overflow text label:
       SVG: <text class="text" x="{viewportX + viewportWidth/2}" y="{overflowStartY + 30}">M: Main Content (overflow)</text>
       - Position: x=viewportX + (viewportWidth / 2), y=overflowStartY + 30
       - Style: class="text" (font: Arial 14px italic, fill: #333, text-anchor: start)
       - Content: "M: Main Content (overflow)"
   
   2d. IF noScrollbarGutters = false THEN
       Draw right gutter in overflow:
       SVG: <rect x="{rightGutterX}" y="{overflowStartY}" width="{gutterWidth}" height="{overflowEndY - overflowStartY}" class="overflow-bg"/>
       - Position: x=rightGutterX, y=overflowStartY
       - Dimensions: width=gutterWidth, height=(overflowEndY - overflowStartY)
       - Style: class="overflow-bg" (fill: url(#overflowPattern))
   END IF
END IF
```

**Phase 2: Main Viewport Blocks**

```
3. Draw Header block:
   SVG: <rect class="header" x="{viewportX}" y="{headerY}" width="{viewportWidth}" height="{headerHeight}"/>
   - Position: x=viewportX, y=headerY
   - Dimensions: width=viewportWidth, height=headerHeight
   - Style: class="header" (fill: #d0d0d0, NO stroke)
   - Note: Block itself has NO border - border drawn separately

4. Draw Header separator line:
   SVG: <line class="block-border" x1="{viewportX}" y1="{headerY + headerHeight}" x2="{viewportX + viewportWidth}" y2="{headerY + headerHeight}"/>
   - Position: x1=viewportX, y1=(headerY + headerHeight), x2=(viewportX + viewportWidth), y2=(headerY + headerHeight)
   - Style: class="block-border" (stroke: #333, stroke-width: 1, fill: none)
   - Note: Independent line element, NOT part of block

5. Add Header text label:
   SVG: <text class="text" x="{viewportX + 10}" y="{headerY + 27}">H: Header (docked to top)</text>
   - Position: x=(viewportX + 10), y=(headerY + 27)
   - Style: class="text" (font: Arial 14px italic, fill: #333, text-anchor: start)
   - Content: "H: Header (docked to top)"

6. Draw Navigation Panel block:
   SVG: <rect class="nav" x="{viewportX}" y="{navPanelY}" width="{viewportWidth}" height="{navPanelHeight}"/>
   - Position: x=viewportX, y=navPanelY
   - Dimensions: width=viewportWidth, height=navPanelHeight
   - Style: class="nav" (fill: #e0e0e0, NO stroke)

7. Draw NavPanel separator line:
   SVG: <line class="block-border" x1="{viewportX}" y1="{navPanelY + navPanelHeight}" x2="{viewportX + viewportWidth}" y2="{navPanelY + navPanelHeight}"/>
   - Position: x1=viewportX, y1=(navPanelY + navPanelHeight), x2=(viewportX + viewportWidth), y2=(navPanelY + navPanelHeight)
   - Style: class="block-border" (stroke: #333, stroke-width: 1, fill: none)

8. Add NavPanel text label:
   SVG: <text class="text" x="{viewportX + 10}" y="{navPanelY + 27}">N: Navigation Panel (docked to top)</text>
   - Position: x=(viewportX + 10), y=(navPanelY + 27)
   - Style: class="text" (font: Arial 14px italic, fill: #333, text-anchor: start)
   - Content: "N: Navigation Panel (docked to top)"
```

**Phase 3: Gutters and Content Area**

```
9. IF noScrollbarGutters = false THEN
   
   9a. Draw left gutter:
       SVG: <rect class="gutter" x="{leftGutterX}" y="{leftGutterY}" width="{gutterWidth}" height="{leftGutterHeight}"/>
       - Position: x=leftGutterX, y=leftGutterY
       - Dimensions: width=gutterWidth, height=leftGutterHeight
       - Style: class="gutter" (fill: #e9ecef)
   
   9b. Draw left gutter edge:
       SVG: <line class="gutter-edge" x1="{leftGutterX + gutterWidth}" y1="{leftGutterY}" x2="{leftGutterX + gutterWidth}" y2="{leftGutterY + leftGutterHeight}"/>
       - Position: x1=(leftGutterX + gutterWidth), y1=leftGutterY, x2=(leftGutterX + gutterWidth), y2=(leftGutterY + leftGutterHeight)
       - Style: class="gutter-edge" (stroke: #666, stroke-width: 1, stroke-dasharray: 4,2, fill: none)
END IF

10. Draw Main Content block (visible portion):
    SVG: <rect class="content" x="{contentX}" y="{contentY}" width="{contentWidth}" height="{contentHeight}"/>
    - Position: x=contentX, y=contentY
    - Dimensions: width=contentWidth, height=contentHeight
    - Style: class="content" (fill: #ffffff, NO stroke)

11. Add Main Content text label:
    SVG: <text class="text" x="{contentX + 10}" y="{contentY + 25}">M: Main Content (scrollable, top position)</text>
    - Position: x=(contentX + 10), y=(contentY + 25)
    - Style: class="text" (font: Arial 14px italic, fill: #333, text-anchor: start)
    - Content: 
      IF scrollPosition = "top" THEN
          "M: Main Content (scrollable, top position)"
      ELSE IF scrollPosition = "bottom" THEN
          "M: Main Content (scrollable, bottom position)"
      ELSE
          "M: Main Content (scrollable)"
      END IF

12. IF hasOverflow = true THEN
    Add overflow indicator:
    SVG: <text class="text-overflow" x="{viewportX + viewportWidth/2}" y="{indicatorY}">↓ Overflow</text>
    - Position: x=(viewportX + viewportWidth / 2), y=indicatorY
    - Style: class="text-overflow" (font: Arial 11px italic, fill: #666, text-anchor: middle)
    - Content and Position:
      IF scrollPosition = "top" THEN
          y=(contentY + contentHeight - 30)
          content: "↓ Overflow"
      ELSE IF scrollPosition = "bottom" THEN
          y=(contentY + 25)
          content: "↑ Overflow"
      END IF
END IF

13. IF noScrollbarGutters = false THEN
    
    13a. Draw right gutter edge:
         SVG: <line class="gutter-edge" x1="{rightGutterX}" y1="{rightGutterY}" x2="{rightGutterX}" y2="{rightGutterY + rightGutterHeight}"/>
         - Position: x1=rightGutterX, y1=rightGutterY, x2=rightGutterX, y2=(rightGutterY + rightGutterHeight)
         - Style: class="gutter-edge" (stroke: #666, stroke-width: 1, stroke-dasharray: 4,2, fill: none)
    
    13b. Draw right gutter (will be overlaid by scrollbar if overflow):
         SVG: <rect class="gutter" x="{rightGutterX}" y="{rightGutterY}" width="{gutterWidth}" height="{rightGutterHeight}"/>
         - Position: x=rightGutterX, y=rightGutterY
         - Dimensions: width=gutterWidth, height=rightGutterHeight
         - Style: class="gutter" (fill: #e9ecef)
END IF
```

**Phase 3.5: Remaining Space (No Overflow Only)**

```
13.5 IF hasOverflow = false THEN
     
     13.5a. Calculate remaining space position and height:
            remainingSpaceY = contentY + contentHeight
            remainingSpaceHeight = footerY - (contentY + contentHeight)
            // Standard height: 125px (when total content fills typical layout)
     
     13.5b. Draw remaining space area:
            SVG: <rect x="{viewportX}" y="{remainingSpaceY}" width="{viewportWidth}" height="{remainingSpaceHeight}" fill="#eeeeee"/>
            - Position: x=viewportX, y=remainingSpaceY
            - Dimensions: width=viewportWidth, height=remainingSpaceHeight
            - Style: fill="#eeeeee" (inline style, light gray)
            - Note: Simple shaded rectangle indicating unused vertical space
     
     13.5c. Add remaining space text label:
            SVG: <text class="text-center" x="{viewportX + viewportWidth/2}" y="{remainingSpaceY + remainingSpaceHeight/2}">Remaining space</text>
            - Position: x=(viewportX + viewportWidth / 2), y=(remainingSpaceY + remainingSpaceHeight / 2)
            - Style: class="text-center" (font: Arial 14px italic, fill: #666, text-anchor: middle)
            - Content: "Remaining space"
            - Note: Vertically and horizontally centered within remaining space area
     
     13.5d. Draw separator line between remaining space and footer:
            SVG: <line class="block-border" x1="{viewportX}" y1="{footerY}" x2="{viewportX + viewportWidth}" y2="{footerY}"/>
            - Position: x1=viewportX, y1=footerY, x2=(viewportX + viewportWidth), y2=footerY
            - Style: class="block-border" (stroke: #333, stroke-width: 1, fill: none)
            - Note: This line replaces the footer separator in step 14 for no-overflow diagrams
END IF
```

**Phase 4: Footer Block**

```
14. Draw Footer separator line (ONLY if hasOverflow = true):
    SVG: <line class="block-border" x1="{separatorX1}" y1="{footerY}" x2="{separatorX2}" y2="{footerY}"/>
    - Position: 
      IF noScrollbarGutters = false THEN
          x1=contentX, x2=rightGutterX
      ELSE
          x1=viewportX, x2=(viewportX + viewportWidth)
      END IF
      y1=footerY, y2=footerY
    - Style: class="block-border" (stroke: #333, stroke-width: 1, fill: none)
    - Note: For no-overflow diagrams, this separator is drawn in step 13.5d as part of remaining space

15. Draw Footer block:
    SVG: <rect class="footer" x="{viewportX}" y="{footerY}" width="{viewportWidth}" height="{footerHeight}"/>
    - Position: x=viewportX, y=footerY
    - Dimensions: width=viewportWidth, height=footerHeight
    - Style: class="footer" (fill: #d0d0d0, NO stroke)

16. Add Footer text label:
    SVG: <text class="text" x="{viewportX + 10}" y="{footerY + 27}">F: Footer (docked to bottom)</text>
    - Position: x=(viewportX + 10), y=(footerY + 27)
    - Style: class="text" (font: Arial 14px italic, fill: #333, text-anchor: start)
    - Content: "F: Footer (docked to bottom)"
```

**Phase 5: Scrollbar (if overflow)**

```
17. IF hasOverflow = true THEN
    
    17a. Draw scrollbar separator line:
         SVG: <line class="scrollbar-border" x1="{scrollbarX}" y1="{scrollbarY}" x2="{scrollbarX}" y2="{scrollbarY + scrollbarHeight}"/>
         - Position: x1=scrollbarX, y1=scrollbarY, x2=scrollbarX, y2=(scrollbarY + scrollbarHeight)
         - Style: class="scrollbar-border" (stroke: #999, stroke-width: 1, stroke-dasharray: 3,2, fill: none)
         - Note: Dashed line indicating scrollbar boundary
    
    17b. Draw scrollbar track:
         SVG: <rect fill="#e0e0e0" x="{scrollbarX}" y="{scrollbarY}" width="{scrollbarWidth}" height="{scrollbarHeight}"/>
         - Position: x=scrollbarX, y=scrollbarY
         - Dimensions: width=scrollbarWidth, height=scrollbarHeight
         - Style: fill="#e0e0e0" (inline fill, NO class, NO stroke)
         - Note: Simple rectangle with no borders or rounded corners
    
    17c. Draw scrollbar thumb:
         SVG: <rect class="scrollbar" x="{thumbX}" y="{thumbY}" width="{thumbWidth}" height="{thumbHeight}"/>
         - Position: x=thumbX, y=thumbY
         - Dimensions: width=thumbWidth, height=thumbHeight
         - Style: class="scrollbar" (fill: #999, NO stroke)
         - Note: Simple rectangle with no borders or rounded corners
END IF
```

**Phase 6: Bottom Overflow Area (if applicable)**

```
18. IF hasOverflow = true AND scrollPosition = "top" THEN
    // Draw bottom overflow area
    
    18a. IF noScrollbarGutters = false THEN
         Draw left gutter in overflow:
         SVG: <rect x="{viewportX}" y="{viewportY + viewportHeight}" width="{gutterWidth}" height="{overflowHeight}" class="overflow-bg"/>
         - Position: x=viewportX, y=(viewportY + viewportHeight)
         - Dimensions: width=gutterWidth, height=overflowHeight
         - Style: class="overflow-bg" (fill: url(#overflowPattern))
    END IF
    
    18b. Draw main content in overflow:
         SVG: <rect x="{contentX}" y="{viewportY + viewportHeight}" width="{contentWidth}" height="{overflowHeight}" class="overflow-bg"/>
         - Position: x=contentX, y=(viewportY + viewportHeight)
         - Dimensions: width=contentWidth, height=overflowHeight
         - Style: class="overflow-bg" (fill: url(#overflowPattern))
    
    18c. Add overflow text label:
         SVG: <text class="text" x="{contentX + 10}" y="{viewportY + viewportHeight + 30}">M: Main Content (overflow)</text>
         - Position: x=(contentX + 10), y=(viewportY + viewportHeight + 30)
         - Style: class="text" (font: Arial 14px italic, fill: #333, text-anchor: start)
         - Content: "M: Main Content (overflow)"
    
    18d. IF noScrollbarGutters = false THEN
         Draw right gutter in overflow:
         SVG: <rect x="{rightGutterX}" y="{viewportY + viewportHeight}" width="{gutterWidth}" height="{overflowHeight}" class="overflow-bg"/>
         - Position: x=rightGutterX, y=(viewportY + viewportHeight)
         - Dimensions: width=gutterWidth, height=overflowHeight
         - Style: class="overflow-bg" (fill: url(#overflowPattern))
    END IF
END IF
```

**Phase 7: Main Screen Border (FINAL ELEMENT)**

```
19. Draw main screen border:
    SVG: <rect class="main-screen-border" x="{viewportX}" y="{viewportY}" width="{viewportWidth}" height="{viewportHeight}"/>
    - Position: x=viewportX, y=viewportY
    - Dimensions: width=viewportWidth, height=viewportHeight
    - Style: class="main-screen-border" (stroke: #333, stroke-width: 2, fill: none)
    - CRITICAL: This MUST be the absolute last element drawn to appear on top of everything
    - Note: Only element with 2px border width - represents main viewport boundary
```

### Algorithm 2: Horizontal Layout (Non-Sticky)

**Characteristics:**
- All blocks scroll together as one unit
- No sticky positioning
- Scroll container: Always App Container (C) when `scrollWholePage=true`
- Layout same as horizontal-sticky but without sticky behavior

**Differences from Horizontal-Sticky:**
- Text labels indicate blocks are "static" not "docked"
- Same drawing algorithm as horizontal-sticky
- Apply to both `scrollWholePage=true` and `scrollWholePage=false` variants

### Algorithm 3: Condensed Layout

**Characteristics:**
- Header and NavPanel combined in same row
- Header/NavPanel positioned at top of viewport (STATIC, scrolls with page)
- Footer at bottom (STATIC, scrolls with page)
- Main Content fills space between
- Scroll container: App Container (C) when `scrollWholePage=true`, Main Content (M) when `scrollWholePage=false`
- **CRITICAL**: In overflow diagrams, Footer scrolls with content - appears in overflow area for top-scroll, in viewport for bottom-scroll

**Key Differences:**
- Skip NavPanel block drawing (it's embedded in header)
- Main Content starts at y = viewportY + headerHeight (no separate navPanel height)
- contentHeight = viewportHeight - headerHeight - footerHeight = 510px
- Header text label: "H/N: Header and Navigation Panel"
- Use class="header-nav" instead of separate "header" and "nav" classes

**Block Positioning:**

When `noScrollbarGutters=true` (NO gutters):
- Header/NavPanel: x=viewportX, y=viewportY, width=viewportWidth (800px), height=45
- Main Content: x=viewportX, y=viewportY+45, width=viewportWidth (800px), height=510
- Footer: x=viewportX, width=viewportWidth (800px), height=45
  - No overflow: y=viewportY+555 (in viewport)
  - Top-scroll overflow: y=viewportY+viewportHeight+overflowHeight-45 (in overflow area, not visible in viewport)
  - Bottom-scroll overflow: y=viewportY+viewportHeight-45 (in viewport at bottom)

When `noScrollbarGutters=false` (WITH gutters):
- Header/NavPanel: x=viewportX, y=viewportY, width=viewportWidth (800px), height=45
- Left Gutter: x=viewportX, y=viewportY+45, width=15, height=contentHeight
- Main Content: x=viewportX+15, y=viewportY+45, width=viewportWidth-30 (770px), height=contentHeight
- Right Gutter: x=viewportX+viewportWidth-15, y=viewportY+45, width=15, height=contentHeight
- Footer: x=viewportX, width=viewportWidth (800px), height=45
  - Footer separator line: from (contentX, footerY) to (rightGutterX, footerY)
  - Same y-position rules as no-gutter variant

**Scrollbar Positioning (when overflow):**

When `scrollWholePage=true` (App Container is scroll parent):
- Scrollbar spans entire viewport height
- Track: y=viewportY to y=viewportY+viewportHeight (600px height)
- When `noScrollbarGutters=true`: x=viewportX+viewportWidth-15 (805, overlays content edge)
- When `noScrollbarGutters=false`: x=viewportX+viewportWidth-15 (805, overlays right gutter)

When `scrollWholePage=false` (Main Content is scroll parent):
- **CRITICAL**: Scrollbar spans ONLY the Main Content area, NOT the entire viewport
- Track: y=viewportY+45 (below header) to y=viewportY+555 (above footer)
- Track height: 510px (Main Content height only)
- When `noScrollbarGutters=true`: x=viewportX+viewportWidth-15 (805, overlays content edge)
- When `noScrollbarGutters=false`: x=viewportX+viewportWidth-15 (805, overlays right gutter)
- Header and Footer DO NOT have scrollbars (they are static)

### Algorithm 4: Vertical Layout

**Characteristics:**
- NavPanel on left side with fixed width (200px), spanning FULL viewport height
- Header, Main Content, Footer in right column (narrower, 600px width each)
- NavPanel full viewport height (600px)
- Scroll container varies by `scrollWholePage`
- **CRITICAL**: When `scrollWholePage=true`, Header and Footer are NOT sticky - they scroll with content and can flow out of viewport

**Key Differences:**
- NavPanel: x=viewportX, y=viewportY, width=200, height=viewportHeight (600px - full height)
- Right column starts at x=viewportX + 200
- Right column width = viewportWidth - 200 = 600
- Header: x=220, y=viewportY, width=600, height=45 (narrower, right column only)
- Footer: x=220, y=varies, width=600, height=45 (narrower, right column only)
- Content widths = 600 (right column only)
- Gutters only apply to Main Content area in right column

**Overflow Behavior (when `scrollWholePage=true`):**

Top-scroll position:
- Viewport shows: NavPanel (full height), Header, Main Content (partial)
- Overflow below: NavPanel continues, Main Content continuation, Footer
- Footer is ONLY in overflow area (scrolled out of viewport)
- Main Content height in viewport: 555px (no footer visible)

Bottom-scroll position:
- Overflow above: NavPanel continues, Header, Main Content (partial)
- Viewport shows: NavPanel (full height), Main Content continuation, Footer
- Header is ONLY in overflow area (scrolled out of viewport)
- Main Content height in viewport: 555px (no header visible)

**Important**: NavPanel border line runs full height (y=viewportY to y=viewportY+600) in viewport

### Algorithm 5: Vertical-Sticky Layout

**Characteristics:**
- NavPanel on left, sticky to viewport top
- Header sticky to top of right column
- Footer sticky to bottom of right column
- Main Content scrolls between header and footer in right column

**Same as Vertical Layout with:**
- Sticky positioning indicators in text labels
- Scroll container: Main Content (M) when `scrollWholePage=false`

### Algorithm 6: Vertical-Full-Header Layout

**Characteristics:**
- Header spans full viewport width at top, sticky
- NavPanel on left below header, sticky
- Main Content on right
- Footer spans full viewport width at bottom, sticky

**Key Differences:**
- Header: full width (800px), at viewportY
- NavPanel: x=viewportX, y=viewportY + headerHeight, width=200, height=(viewportHeight - headerHeight - footerHeight)
- Main Content: x=viewportX + 200, y=viewportY + headerHeight, width=600, height=(viewportHeight - headerHeight - footerHeight)
- Footer: full width (800px), at viewportY + viewportHeight - footerHeight

### Algorithm 7: Desktop Layout

**Characteristics:**
- Stretches to 100vw × 100vh (or 100% × 100% when nested)
- No scroll gutters
- Header/Footer optional, sticky if present
- Main Content fills all available space
- No NavPanel rendering
- Zero padding/margins

**Key Differences:**
- Canvas: 840 × 640 (no overflow diagrams)
- No gutters ever
- No NavPanel block
- Main Content: x=viewportX, y=(viewportY + headerHeight if present), height fills to footer or viewport bottom
- Scroll container: Always Main Content (M) only

---

## Quick Reference: Layout-Specific Parameters

### Horizontal-Sticky
- Header: y=viewportY, height=45, sticky
- NavPanel: y=viewportY+45, height=45, sticky
- Content: y=viewportY+90, height=465
- Footer: y=viewportY+555, height=45, sticky
- Gutters: Main Content area only (y=90 to y=555)

### Horizontal (Non-Sticky)
- Same positions as horizontal-sticky
- Labels indicate "static" not "docked"

### Condensed-Sticky
- Header/NavPanel: y=viewportY, height=45, combined, sticky
- Content: y=viewportY+45, height=510
- Footer: y=viewportY+555, height=45, sticky
- Gutters: Main Content area only (y=45 to y=555)

### Vertical-Sticky
- NavPanel: x=20, y=20, width=200, height=600, left side
- Right column: x=220, width=600
  - Header: y=20, height=45, sticky
  - Content: y=65, height=490
  - Footer: y=555, height=45, sticky
- Gutters: Main Content area only in right column

### Vertical-Full-Header
- Header: y=20, width=800, height=45, full width, sticky
- NavPanel: x=20, y=65, width=200, height=510, left side, sticky
- Main Content: x=220, y=65, width=600, height=510
- Footer: y=575, width=800, height=45, full width, sticky
- Gutters: Main Content area only

---
