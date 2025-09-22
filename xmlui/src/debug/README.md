# XMLUI Reactivity Debugger

A centralized debugging system for XMLUI reactivity issues, focused on providing actionable insights rather than overwhelming logs.

## Default Behavior (No Configuration Needed)

**✅ WITHOUT any setup, you'll see:**
- 🚨 Render storms with suggested fixes
- 🔄 Unnecessary API refetches with explanations  
- 🔗 Render cascades that might indicate problems
- 💡 Only logs that include actionable suggestions

**❌ You WON'T see (unless you configure it):**
- Verbose component render logs
- Every state change (too noisy)
- All user interactions (too noisy)
- Stack traces (use `verbose` level for these)

## Quick Start

The debugging system works out of the box with smart defaults. To customize:

```javascript
// Focus debugging on specific components only
setupReactivityDebugging({
  focusComponents: ['tube-status', 'user-form'],
  actionableOnly: true
})

// See everything (verbose mode)
setupReactivityDebugging({
  level: 'verbose',
  focusComponents: ['problematic-component']
})

// Debug all state changes (noisy but thorough)
setupReactivityDebugging({
  level: 'detailed',
  actionableOnly: false
})
```

## What's New

### 1. **Actionable Logging**
Instead of raw data dumps, logs now include suggested actions:
- ✅ `💡 Suggested Action: Consider memoizing expensive computations`
- ✅ `💡 Suggested Action: Check for infinite re-render loop`
- ✅ `💡 Suggested Action: Keys are deep equal but reference changed`

### 2. **Focused Debugging**
- Debug specific components by ID
- Filter out noisy logs
- Only show logs with actionable suggestions

### 3. **Correlated Events**
- Groups related events together (interaction → state change → re-render)
- Shows timing relationships between events

## Configuration

The system supports three levels of detail:
- `minimal`: Only critical issues with suggested actions
- `detailed`: Include component data and dependencies  
- `verbose`: Full debugging information including stack traces

## Current Features

- **Render Storm Detection**: Identifies excessive re-renders with suggestions
- **Query Key Analysis**: Detects unnecessary API refetches with explanations
- **User Interaction Correlation**: Links user actions to subsequent renders
- **Component Focusing**: Debug only specific components by ID

## Usage Examples

```javascript
// Debug a specific form that's re-rendering too much
setupReactivityDebugging({
  focusComponents: ['contact-form'],
  actionableOnly: true,
  level: 'detailed'
})

// Debug all components but only show critical issues
setupReactivityDebugging({
  actionableOnly: true,
  level: 'minimal'
})
```

## Implementation Status

✅ **Completed in this commit:**
- Centralized ReactivityDebugger class
- Actionable logging with suggested fixes
- Render storm detection with specific guidance
- Query key change analysis with explanations
- Component focusing capability
- Quick setup helper function

🔄 **Next steps:**
- Integrate with more components (StateContainer, Container)
- Add performance impact measurement
- Create debugging UI panel
- Add automated fix suggestions
