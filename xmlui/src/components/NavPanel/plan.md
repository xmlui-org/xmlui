# NavPanel ScrollStyle Implementation Plan

## Overview
Add `scrollStyle` prop to NavPanel supporting "normal" (default) and "overlay" modes.

## Changes Required

### 1. Package Installation
- Install `overlayscrollbars-react` and `overlayscrollbars` packages

### 2. Metadata Updates (`NavPanel.tsx`)
- Add `scrollStyle` prop to metadata
  - Type: `"normal" | "overlay"`
  - Default: `"normal"`

### 3. Native Component (`NavPanelNative.tsx`)
- Import `OverlayScrollbarsComponent` from `overlayscrollbars-react`
- Add `scrollStyle` to Props interface
- Add to defaultProps
- Conditionally wrap scrollable content:
  - `scrollStyle === "overlay"`: Use `<OverlayScrollbarsComponent>`
  - `scrollStyle === "normal"`: Use standard div (existing behavior)
- Target wrapper: `div.wrapperInner` (contains scrollable children)
- Apply to both regular and drawer modes

### 4. Renderer (`NavPanel.tsx`)
- Extract `scrollStyle` prop
- Pass to NavPanelNative component

### 5. Styling (`NavPanel.module.scss`)
- Ensure `.wrapperInner` works with both scroll modes
- May need to adjust overflow properties based on scrollStyle

## OverlayScrollbars Configuration
```jsx
<OverlayScrollbarsComponent
  options={{
    scrollbars: {
      autoHide: 'leave',
      autoHideDelay: 200
    }
  }}
>
  {children}
</OverlayScrollbarsComponent>
```

## Files to Modify
1. `/xmlui/package.json` - Add dependencies
2. `/xmlui/src/components/NavPanel/NavPanel.tsx` - Metadata & renderer
3. `/xmlui/src/components/NavPanel/NavPanelNative.tsx` - Native implementation
4. `/xmlui/src/components/NavPanel/NavPanel.module.scss` - Styling (if needed)
