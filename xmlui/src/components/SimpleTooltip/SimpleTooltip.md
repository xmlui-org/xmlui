# SimpleTooltip

A simple tooltip component that wraps Radix UI tooltip functionality for native React usage. This component provides a clean API for showing tooltip text when hovering over content.

## Basic Usage

```jsx
import { SimpleTooltip } from "../SimpleTooltip/SimpleTooltip";

<SimpleTooltip text="This is a helpful tooltip">
  <button>Hover me</button>
</SimpleTooltip>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | - | The text content to display in the tooltip |
| `delayDuration` | `number` | `700` | The duration from when the mouse enters a tooltip trigger until the tooltip opens (in ms) |
| `skipDelayDuration` | `number` | `300` | How much time a user has to enter another trigger without incurring a delay again (in ms) |
| `defaultOpen` | `boolean` | `false` | The open state of the tooltip when it is initially rendered |
| `showArrow` | `boolean` | `true` | Whether to show the arrow pointing to the trigger element |
| `side` | `"top" \| "right" \| "bottom" \| "left"` | `"top"` | The preferred side of the trigger to render against when open |
| `align` | `"start" \| "center" \| "end"` | `"center"` | The preferred alignment against the trigger |
| `sideOffset` | `number` | `4` | The distance in pixels from the trigger |
| `alignOffset` | `number` | `0` | An offset in pixels from the "start" or "end" alignment options |
| `avoidCollisions` | `boolean` | `true` | When true, overrides side and align preferences to prevent collisions with boundary edges |
| `triggerRef` | `RefObject<HTMLElement>` | - | A ref to an external element that will trigger the tooltip on hover |
| `children` | `ReactNode` | - | The content that will trigger the tooltip (used when triggerRef is not provided) |

## Examples

### Basic Tooltip

```jsx
<SimpleTooltip text="Basic tooltip">
  <span>Hover for info</span>
</SimpleTooltip>
```

### Custom Delay Duration

```jsx
<SimpleTooltip text="Quick tooltip" delayDuration={200}>
  <button>Quick hover</button>
</SimpleTooltip>
```

### With Skip Delay

```jsx
<div>
  <SimpleTooltip text="First tooltip" skipDelayDuration={100}>
    <button>Button 1</button>
  </SimpleTooltip>
  <SimpleTooltip text="Second tooltip" skipDelayDuration={100}>
    <button>Button 2</button>
  </SimpleTooltip>
</div>
```

### Default Open

```jsx
<SimpleTooltip text="This tooltip starts open" defaultOpen={true}>
  <div>Content with tooltip</div>
</SimpleTooltip>
```

### Without Children (Empty Trigger)

```jsx
<SimpleTooltip text="Tooltip without children" defaultOpen={true} />
```

### Using External Element Ref

```jsx
import { useRef } from 'react';

function ComponentWithExternalTooltip() {
  const buttonRef = useRef(null);
  
  return (
    <div>
      <button ref={buttonRef} onClick={() => console.log('Clicked!')}>
        Hover me for tooltip
      </button>
      
      <SimpleTooltip 
        text="This tooltip is attached via ref" 
        triggerRef={buttonRef} 
      />
    </div>
  );
}
```

### Multiple Tooltips for Same Element

```jsx
import { useRef } from 'react';

function MultipleTooltips() {
  const elementRef = useRef(null);
  
  return (
    <div>
      <div 
        ref={elementRef}
        style={{ 
          padding: '20px', 
          backgroundColor: '#f0f0f0',
          cursor: 'pointer'
        }}
      >
        Element with multiple tooltips
      </div>
      
      <SimpleTooltip 
        text="First tooltip" 
        triggerRef={elementRef}
        delayDuration={500}
      />
      
      <SimpleTooltip 
        text="Second tooltip (longer delay)" 
        triggerRef={elementRef}
        delayDuration={1500}
      />
    </div>
  );
}
```

### Custom Positioning

```jsx
<SimpleTooltip 
  text="Tooltip on the right side" 
  side="right"
  align="start"
  sideOffset={10}
>
  <button>Right tooltip</button>
</SimpleTooltip>
```

### Without Arrow

```jsx
<SimpleTooltip 
  text="Clean tooltip without arrow" 
  showArrow={false}
  side="bottom"
>
  <span>No arrow tooltip</span>
</SimpleTooltip>
```

### Advanced Positioning

```jsx
<div style={{ display: 'flex', gap: '20px', margin: '50px' }}>
  <SimpleTooltip 
    text="Left aligned tooltip" 
    side="top"
    align="start"
    alignOffset={-10}
  >
    <button>Left aligned</button>
  </SimpleTooltip>
  
  <SimpleTooltip 
    text="Right aligned tooltip" 
    side="top"
    align="end"
    alignOffset={10}
  >
    <button>Right aligned</button>
  </SimpleTooltip>
  
  <SimpleTooltip 
    text="Far from trigger" 
    side="bottom"
    sideOffset={20}
    avoidCollisions={false}
  >
    <button>Far tooltip</button>
  </SimpleTooltip>
</div>
```

## Styling

The tooltip uses CSS variables for theming:

- `--xmlui-color-tooltip-text`: Text color (default: white)
- `--xmlui-color-tooltip-background`: Background color (default: #222)

## Implementation Notes

- Built on top of `@radix-ui/react-tooltip`
- Provides animations for smooth appearance/disappearance
- Automatically positions the tooltip to avoid viewport edges
- Includes an arrow pointing to the trigger element
- Uses React forwardRef for proper ref handling
