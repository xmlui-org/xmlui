# XMLUI Event Handling Pipeline

This document provides a comprehensive analysis of how component events are discovered, bound, and executed in XMLUI. It traces the complete flow from component markup definition through event handler execution, with a focus on understanding the exact event handler instance lifecycle for future enhancements.

## Overview

XMLUI's event handling system follows a multi-layered architecture that separates event discovery, binding, and execution into distinct phases. The system supports both inline arrow expressions and references to named actions defined in component code-behind files.

## Event Discovery and Binding Flow

### 1. Component Definition Parsing

Events are first discovered during component definition parsing:

```xml
<Button onClick="() => { this.count++; }" onMouseEnter="handleMouseEnter" />
```

The parser identifies:
- `onClick`: Inline arrow expression `"() => { this.count++; }"`
- `onMouseEnter`: Reference to named action `"handleMouseEnter"`

These are stored in the component definition's `events` property:

```typescript
{
  type: "Button",
  events: {
    click: "() => { this.count++; }",
    mouseEnter: "handleMouseEnter"
  }
}
```

### 2. ComponentAdapter Event Setup

The `ComponentAdapter` is responsible for setting up event handlers for each component instance. This happens in several key steps:

#### a) Component Instance Preparation

Each component receives a unique identifier (`uid`) that tracks the specific instance:

```typescript
// ComponentAdapter.tsx lines 68-69
const uid = useMemo(() => Symbol(safeNode.uid), [safeNode.uid]);
```

#### b) Event Handler Lookup Function Creation

The adapter creates a memoized event handler lookup function bound to the component instance:

```typescript
// ComponentAdapter.tsx lines 172-178
const memoedLookupEventHandler: LookupEventHandlerFn = useCallback(
  (eventName, actionOptions) => {
    const action = safeNode.events?.[eventName] || actionOptions?.defaultHandler;
    return lookupAction(action, uid, { eventName, ...actionOptions });
  },
  [lookupAction, safeNode.events, uid],
);
```

**Key aspects of event handler lookup:**
- **Instance Binding**: Each lookup is bound to the specific component instance via `uid`
- **Event Context**: The `eventName` is passed to provide context about which event triggered the handler
- **Fallback Support**: If no handler is defined for an event, an optional `defaultHandler` can be used
- **Action Resolution**: The actual handler execution is delegated to `lookupAction`

#### c) Mouse Event Handler Setup

For visual components, the adapter sets up standard mouse event handlers:

```typescript
// ComponentAdapter.tsx lines 181-184
const mouseEventHandlers = useMouseEventHandlers(
  memoedLookupEventHandler,
  descriptor?.nonVisual || isApiBound || isCompoundComponent,
);
```

The `useMouseEventHandlers` hook creates React event handlers for standard events:

```typescript
// event-handlers.ts lines 13-31
export function useMouseEventHandlers(lookupEvent: LookupEventHandlerFn, shouldSkip: boolean) {
  const onClick = useEventHandler("click", lookupEvent, shouldSkip);
  const onMouseLeave = useEventHandler("mouseLeave", lookupEvent, shouldSkip);
  const onMouseEnter = useEventHandler("mouseEnter", lookupEvent, shouldSkip);
  const onDoubleClick = useEventHandler("doubleClick", lookupEvent, shouldSkip);

  if (shouldSkip) {
    return EMPTY_OBJECT;
  }

  return Object.fromEntries(
    Object.entries({
      onClick,
      onMouseLeave,
      onMouseEnter,
      onDoubleClick,
    }).filter(([, value]) => value !== undefined)
  );
}
```

Each event handler:
1. Looks up the XMLUI action using `lookupEvent(eventName)`
2. Creates a React event handler that calls the XMLUI action
3. Automatically stops event propagation
4. Handles cases where no handler is defined

### 3. RendererContext Assembly

The adapter assembles a complete `RendererContext` that component renderers receive:

```typescript
// ComponentAdapter.tsx lines 248-266
const rendererContext: RendererContext<any> = {
  node: safeNode,
  state: state[uid] || EMPTY_OBJECT,
  contextVars,
  updateState: memoedUpdateState,
  appContext,
  extractValue: valueExtractor,
  lookupEventHandler: memoedLookupEventHandler,
  lookupAction: memoedLookupAction,
  lookupSyncCallback: memoedLookupSyncCallback,
  extractResourceUrl,
  renderChild: memoedRenderChild,
  registerComponentApi: memoedRegisterComponentApi,
  className,
  layoutContext: layoutContextRef?.current,
  uid,
};
```

**Critical for event handler tracking:**
- `uid`: Unique identifier for this component instance
- `lookupEventHandler`: Function to resolve event handlers by name
- `lookupAction`: Function to resolve and execute actions
- `state`: Component-specific state accessible to event handlers

## Event Handler Resolution Chain

### 1. Action Lookup Process

When an event occurs, the resolution follows this chain:

```
React Event → useEventHandler → lookupEventHandler → lookupAction → Container.runCodeAsync
```

#### a) React Event Handler

```typescript
// event-handlers.ts lines 37-49
const eventHandler: EventHandler<any> = useCallback(
  (event) => {
    if (onEvent) {
      if (typeof event.stopPropagation === "function") {
        event?.stopPropagation();
      }
      onEvent(event);
    }
  },
  [onEvent],
);
```

#### b) lookupEventHandler

```typescript
// ComponentAdapter.tsx lines 172-178
const memoedLookupEventHandler: LookupEventHandlerFn = useCallback(
  (eventName, actionOptions) => {
    const action = safeNode.events?.[eventName] || actionOptions?.defaultHandler;
    return lookupAction(action, uid, { eventName, ...actionOptions });
  },
  [lookupAction, safeNode.events, uid],
);
```

#### c) lookupAction

The `lookupAction` function is passed down from the `Container` component and ultimately calls `runCodeAsync`:

```typescript
// Container.tsx lines 195-200
lookupAction: (action, uid, actionOptions = {}) => {
  return lookupAction(action, uid, {
    ...actionOptions,
    ephemeral: true,
  });
},
```

### 2. Code Execution Context

When the action is executed in `Container.runCodeAsync`, a complete execution context is created:

```typescript
// Container.tsx lines 163-200
const runCodeAsync = useEvent(
  async (
    source: string | ParsedEventValue | ArrowExpression,
    componentUid: symbol,
    options: LookupActionOptions | undefined,
    ...eventArgs: any[]
  ) => {
    // State proxy creation for change tracking
    const getComponentStateClone = () => {
      changes.length = 0;
      const poj = cloneDeep({ ...stateRef.current, ...(options?.context || {}) });
      poj["$this"] = stateRef.current[componentUid];
      return buildProxy(poj, (changeInfo) => {
        const idRoot = (changeInfo.pathArray as string[])?.[0];
        if (idRoot?.startsWith("$")) {
          throw new Error("Cannot update a read-only variable");
        }
        changes.push(changeInfo);
      });
    };

    const evalContext: BindingTreeEvaluationContext = {
      appContext: evalAppContext,
      eventArgs,
      localContext: getComponentStateClone(),
      implicitContextGetter: () => {
        return {
          uid: componentUid,
          state: stateRef.current,
          getCurrentState: () => stateRef.current,
          dispatch,
          appContext: evalAppContext,
          apiInstance,
          navigate,
          location,
          lookupAction: (action, uid, actionOptions = {}) => {
            return lookupAction(action, uid, {
              ...actionOptions,
              ephemeral: true,
            });
          },
        };
      },
    };
```

**Key aspects of execution context:**
- **Component Identity**: `componentUid` identifies the exact component instance
- **State Access**: `$this` provides access to component-specific state
- **Change Tracking**: Proxy monitors state changes for updates
- **Event Arguments**: Original event arguments are available
- **Nested Actions**: Event handlers can call other actions

## Event Handler Execution Pipeline

### 1. Statement Processing

Event handlers are processed as statement queues by the script runner:

```typescript
// Container.tsx lines 240-280
if (typeof source === "string") {
  statements = prepareHandlerStatements(
    source,
    stateRef.current,
    appContext,
    componentUid.description ?? "unknown",
    options?.eventName ?? "unknown",
  );
} else if (source?._PARSED_EVENT_VALUE_) {
  statements = source.statements;
} else if (source?.type === T_ARROW_EXPRESSION) {
  // Arrow expression execution
  return await executeArrowExpression(source, evalContext, mainThread, ...eventArgs);
}

// Execute statement queue
await processStatementQueueAsync(statements, evalContext, {
  onStatementCompleted: (thread, info) => {
    // Statement completion tracking
  },
});
```

### 2. Arrow Expression Execution

For inline arrow expressions, execution follows a different path:

```typescript
// eval-tree-async.ts lines 112-133
export async function executeArrowExpression(
  expr: ArrowExpression,
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
  ...args: any[]
): Promise<any> {
  // Compile to native function
  const nativeFunction = await createArrowFunctionAsync(evaluator, expr);
  
  // Execute with context
  return await nativeFunction(expr.args, evalContext, thread ?? evalContext.mainThread, ...args);
}
```

## Event Handler Instance Tracking

### Current State

The current system provides several tracking points for event handler instances:

1. **Component Instance ID**: Each component has a unique `uid` (Symbol)
2. **Event Name**: Available in `actionOptions.eventName`
3. **Execution Context**: Complete context in `BindingTreeEvaluationContext`
4. **Statement Tracking**: Statement completion callbacks in statement processing

### Tracking Data Available

For each event handler execution, the following data is available:

```typescript
interface EventHandlerTrackingData {
  // Component identity
  componentUid: symbol;           // Unique component instance
  componentType: string;          // Component type (e.g., "Button")
  componentDefinition: ComponentDef; // Full component definition
  
  // Event context
  eventName: string;              // Event that triggered the handler
  eventArgs: any[];              // Original event arguments
  
  // Handler definition
  handlerSource: string | ArrowExpression; // Source code or parsed expression
  handlerType: 'inline' | 'named'; // Whether it's inline or named action
  
  // Execution context
  executionContext: BindingTreeEvaluationContext;
  componentState: any;            // State before execution
  stateChanges: ChangeInfo[];     // Tracked state changes
  
  // Timing
  startTime: number;
  endTime?: number;
  
  // Result
  result?: any;
  error?: Error;
}
```

### Recommended Enhancement Points

To implement comprehensive event handler instance tracking, consider instrumenting these key points:

1. **Event Handler Registration** (ComponentAdapter)
   - Track when handlers are bound to components
   - Record handler source and component metadata

2. **Event Handler Invocation** (useEventHandler)
   - Capture when React events trigger XMLUI handlers
   - Record timing and event details

3. **Action Resolution** (lookupAction)
   - Track action lookup and resolution
   - Record whether actions are found or fall back to defaults

4. **Code Execution** (runCodeAsync)
   - Instrument statement processing
   - Track state changes and execution flow

5. **Statement Processing** (processStatementQueueAsync)
   - Monitor individual statement execution
   - Capture variable access and modification patterns

### Implementation Strategy

For future event handler tracking implementation:

1. **Create a EventHandlerTracker service** that can be injected into the component system
2. **Add tracking hooks** at each major transition point in the pipeline
3. **Implement correlation IDs** to track a single event through the entire pipeline
4. **Add debugging APIs** to query handler execution history
5. **Consider performance impact** and provide opt-in/opt-out mechanisms

## Key Files and Components

### Core Event Handling Files
- `ComponentAdapter.tsx` - Event handler setup and binding
- `event-handlers.ts` - React event handler creation
- `Container.tsx` - Action execution and state management
- `valueExtractor.ts` - Expression evaluation and state access

### Script Execution Files
- `process-statement-async.ts` - Statement queue processing
- `eval-tree-async.ts` - Arrow expression execution
- `BindingTreeEvaluationContext.ts` - Execution context definition

### Type Definitions
- `RendererDefs.ts` - Event handler function types
- `ActionDefs.ts` - Action lookup and execution types
- `ComponentDefs.ts` - Component definition structures

## Event Handler Instance Correlation

### Problem Statement

When the same event handler is triggered multiple times in rapid succession (e.g., typing two characters quickly into a TextBox), each invocation creates separate JavaScript function instances through the `executeArrowExpression` → `createArrowFunctionAsync` pipeline. However, there's a need to identify that these separate invocations belong to the same logical event handler definition.

### Available Correlation Mechanisms

The XMLUI architecture provides several mechanisms to correlate multiple invocations of the same event handler:

#### 1. Unique Event Handler Execution ID

**Location**: `Container.runCodeAsync`

Create a unique execution ID for each event handler invocation and pass it through the evaluation context:

```typescript
// In Container.tsx, within runCodeAsync function
const eventHandlerExecutionId = Symbol(`${componentUid.description}-${options?.eventName}-${Date.now()}-${Math.random()}`);

const evalContext: BindingTreeEvaluationContext = {
  appContext: evalAppContext,
  eventArgs,
  localContext: getComponentStateClone(),
  
  // Add execution tracking
  eventHandlerExecutionId,
  
  implicitContextGetter: () => {
    return {
      uid: componentUid,
      eventHandlerExecutionId, // Also available in implicit context
      // ... rest of context
    };
  },
  // ... rest of context
};
```

#### 2. Enhanced Context with Event Details (Recommended)

**Location**: `BindingTreeEvaluationContext` type extension

Extend the evaluation context to include comprehensive event handler identity:

```typescript
// Extend BindingTreeEvaluationContext type
export type BindingTreeEvaluationContext = {
  // ... existing properties
  
  // Add event handler tracking information
  eventHandlerContext?: {
    executionId: symbol;           // Unique per execution instance
    componentUid: symbol;          // Component instance identifier
    eventName: string;             // Event name (e.g., "didChange")
    componentType: string;         // Component type (e.g., "TextBox")
    handlerSource: string;         // Original handler source code
    handlerHash: string;           // Hash of handler source for identity
    startTime: number;             // Execution start timestamp
    sequenceNumber: number;        // Sequence within the component's event history
  };
};
```

Implementation in `Container.runCodeAsync`:

```typescript
const handlerSource = typeof source === "string" ? source : source.toString();
const handlerHash = hashString(handlerSource); // Simple hash function
const eventHandlerExecutionId = Symbol(`${componentUid.description}-${options?.eventName}-${handlerHash}`);

const evalContext: BindingTreeEvaluationContext = {
  // ... existing properties
  eventHandlerContext: {
    executionId: eventHandlerExecutionId,
    componentUid,
    eventName: options?.eventName ?? "unknown",
    componentType: node.type, // Pass from ComponentAdapter
    handlerSource,
    handlerHash,
    startTime: Date.now(),
    sequenceNumber: getNextSequenceNumber(componentUid, options?.eventName),
  },
};
```

#### 3. Statement-Level Tracking Hooks

**Location**: `processStatementQueueAsync`

Use the existing `onStatementStarted` and `onStatementCompleted` hooks for fine-grained tracking:

```typescript
// In Container.runCodeAsync
const eventHandlerExecutionId = Symbol();
const statementTracker = new Map();

const evalContext: BindingTreeEvaluationContext = {
  // ... other properties
  onStatementStarted: async (context, statement) => {
    const trackingInfo = {
      eventHandlerExecutionId,
      componentUid,
      eventName: options?.eventName,
      componentType: node.type,
      statementId: statement.id || Symbol(),
      startTime: Date.now(),
    };
    
    statementTracker.set(statement, trackingInfo);
    
    // Log or store for analysis
    console.log(`Statement started for event handler ${eventHandlerExecutionId.toString()}`);
  },
  
  onStatementCompleted: async (context, statement) => {
    const trackingInfo = statementTracker.get(statement);
    if (trackingInfo) {
      trackingInfo.endTime = Date.now();
      trackingInfo.duration = trackingInfo.endTime - trackingInfo.startTime;
      
      console.log(`Statement completed for event handler ${trackingInfo.eventHandlerExecutionId.toString()}`);
      statementTracker.delete(statement);
    }
  },
};
```

#### 4. Component-Level Event Handler Registry

**Location**: `ComponentAdapter`

Create a registry at the component level that assigns persistent identifiers to event handlers:

```typescript
// In ComponentAdapter
const eventHandlerRegistry = useMemo(() => {
  const registry = new Map<string, symbol>();
  
  // Create persistent IDs for each event handler
  Object.entries(safeNode.events || {}).forEach(([eventName, handlerSource]) => {
    const handlerKey = `${eventName}:${hashString(handlerSource.toString())}`;
    registry.set(handlerKey, Symbol(`handler-${eventName}-${safeNode.uid}`));
  });
  
  return registry;
}, [safeNode.events, safeNode.uid]);

// Pass handler ID through action options
const memoedLookupEventHandler: LookupEventHandlerFn = useCallback(
  (eventName, actionOptions) => {
    const action = safeNode.events?.[eventName] || actionOptions?.defaultHandler;
    const handlerKey = `${eventName}:${hashString(action?.toString() || "")}`;
    const handlerDefinitionId = eventHandlerRegistry.get(handlerKey);
    
    return lookupAction(action, uid, { 
      eventName, 
      handlerDefinitionId,
      ...actionOptions 
    });
  },
  [lookupAction, safeNode.events, uid, eventHandlerRegistry],
);
```

### Practical Implementation for processStatementQueueAsync

To identify that multiple calls belong to the same event handler definition within `processStatementQueueAsync`:

```typescript
export async function processStatementQueueAsync(
  statements: Statement[],
  evalContext: BindingTreeEvaluationContext,
  thread?: LogicalThread,
): Promise<QueueInfo> {
  
  // Extract event handler identity information
  const eventHandlerContext = evalContext.eventHandlerContext;
  
  if (eventHandlerContext) {
    console.log(`Processing statements for event handler:
      Definition ID: ${eventHandlerContext.handlerHash}
      Execution ID: ${eventHandlerContext.executionId.toString()}
      Component: ${eventHandlerContext.componentType} (${eventHandlerContext.componentUid.toString()})
      Event: ${eventHandlerContext.eventName}
      Sequence: ${eventHandlerContext.sequenceNumber}
      Source: ${eventHandlerContext.handlerSource}`
    );
    
    // Store in a global registry for correlation
    EventHandlerTracker.registerExecution(eventHandlerContext);
  }
  
  // ... rest of function implementation
}
```

### Correlation Strategies

#### Same Event Handler Definition
Multiple executions that share the same:
- `componentUid` + `eventName` + `handlerHash`

#### Same Component Instance
Multiple executions that share the same:
- `componentUid`

#### Same Event Type Across Components
Multiple executions that share the same:
- `eventName` + `handlerHash` (but different `componentUid`)

### Example Usage

For the TextBox scenario with `onDidChange="(val) => field = val"`:

1. **First character typed**: 
   - `executionId`: `Symbol(TextBox-didChange-1730304000000-0.123)`
   - `handlerHash`: `"hash-of-arrow-expression"`
   - `sequenceNumber`: 1

2. **Second character typed**:
   - `executionId`: `Symbol(TextBox-didChange-1730304000100-0.456)`
   - `handlerHash`: `"hash-of-arrow-expression"` (same)
   - `sequenceNumber`: 2

Both executions can be correlated as belonging to the same event handler definition through the matching `componentUid`, `eventName`, and `handlerHash`.

## Conclusion

XMLUI's event handling system provides a sophisticated pipeline for event discovery, binding, and execution. The architecture maintains clear separation between React's event system and XMLUI's action system while providing comprehensive tracking capabilities for debugging and enhancement.

The system's design makes it well-suited for implementing detailed event handler tracking by instrumenting the key transition points identified in this analysis. The unique component identifiers, execution contexts, and statement processing provide sufficient granularity to track individual event handler instances throughout their lifecycle.

The correlation mechanisms detailed above enable precise tracking of event handler executions, allowing developers to identify when multiple invocations belong to the same logical event handler definition while maintaining the ability to distinguish between separate execution instances.

## Debounce Function Instance Problem

### Problem Description

The XMLUI `debounce` function faces a critical issue due to the event handler execution pipeline. Each time an event handler executes, the pipeline creates a new JavaScript function instance through `executeArrowExpression` → `createArrowFunctionAsync`. This means that the current debounce implementation, which uses `func.toString()` as a key, fails to properly correlate multiple calls from the same logical event handler.

**Example scenario:**
```xml
<TextBox onDidChange="e => debounce(500, (val) => handleSearch(val), e)" />
```

When typing two characters quickly:
1. First character: Creates Function Instance A
2. Second character: Creates Function Instance B
3. `debounce` sees two different functions and doesn't cancel the first timer

### Current Implementation Analysis

The current debounce implementation in `misc.ts`:

```typescript
export function debounce<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  ...args: any[]
): void {
  // This fails because func is a new instance each time
  const key = func.toString();
  
  // Clear existing timeout for this key
  const existing = debounceRegistry.get(key);
  if (existing !== undefined) {
    clearTimeout(existing.timeoutId);
  }
  // ... rest of implementation
}
```

**Root cause**: `func.toString()` returns different strings for each function instance, even though they represent the same logical event handler.

### Solution 1: Event Handler Context-Based Debounce

**Location**: Extend `debounce` function to accept event handler context

Modify the debounce function to use event handler identity from the execution context:

```typescript
// Enhanced debounce function signature
export function debounce<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  ...args: any[]
): void;

export function debounceWithContext<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  context: EventHandlerContext,
  ...args: any[]
): void {
  // Use stable event handler identity instead of function instance
  const key = `${context.componentUid.toString()}-${context.eventName}-${context.handlerHash}`;
  
  // Clear existing timeout for this key
  const existing = debounceRegistry.get(key);
  if (existing !== undefined) {
    clearTimeout(existing.timeoutId);
  }

  // Set new timeout with captured arguments
  const timeoutId = setTimeout(() => {
    const entry = debounceRegistry.get(key);
    if (entry) {
      func(...entry.args);
      debounceRegistry.delete(key);
    }
  }, delayMs);

  debounceRegistry.set(key, { timeoutId, args });
}
```

### Solution 2: Automatic Context Injection

**Location**: Modify `BindingTreeEvaluationContext` and script execution

Automatically inject event handler context into the global scope:

```typescript
// In Container.runCodeAsync, add to evalContext.localContext
const evalContext: BindingTreeEvaluationContext = {
  // ... existing properties
  localContext: {
    ...getComponentStateClone(),
    
    // Inject enhanced debounce function
    debounce: (delayMs: number, func: Function, ...args: any[]) => {
      return debounceWithContext(delayMs, func, eventHandlerContext, ...args);
    }
  },
};
```

This makes the enhanced debounce automatically available in event handlers without changing the API:

```xml
<!-- No API changes needed -->
<TextBox onDidChange="e => debounce(500, (val) => handleSearch(val), e)" />
```

### Solution 3: Source Code Hash-Based Approach

**Location**: Parse and hash the function source at compile time

Use the original handler source code to generate stable keys:

```typescript
// In ComponentAdapter or during component definition parsing
function createStableDebounceKey(
  componentUid: symbol,
  eventName: string, 
  handlerSource: string
): string {
  const handlerHash = hashString(handlerSource);
  return `${componentUid.toString()}-${eventName}-${handlerHash}`;
}

// Enhanced debounce with source-based key
export function debounceWithSource<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  sourceKey: string,
  ...args: any[]
): void {
  // Use stable source-based key
  const existing = debounceRegistry.get(sourceKey);
  if (existing !== undefined) {
    clearTimeout(existing.timeoutId);
  }

  const timeoutId = setTimeout(() => {
    const entry = debounceRegistry.get(sourceKey);
    if (entry) {
      func(...entry.args);
      debounceRegistry.delete(sourceKey);
    }
  }, delayMs);

  debounceRegistry.set(sourceKey, { timeoutId, args });
}
```

### Solution 4: Global Event Handler Registry

**Location**: Create a global registry that persists across executions

Implement a global registry that maps event handler definitions to stable identifiers:

```typescript
// Global event handler registry
class EventHandlerRegistry {
  private static instance: EventHandlerRegistry;
  private handlerMap = new Map<string, symbol>();
  
  static getInstance(): EventHandlerRegistry {
    if (!EventHandlerRegistry.instance) {
      EventHandlerRegistry.instance = new EventHandlerRegistry();
    }
    return EventHandlerRegistry.instance;
  }
  
  getHandlerId(componentUid: symbol, eventName: string, handlerSource: string): symbol {
    const key = `${componentUid.toString()}-${eventName}-${hashString(handlerSource)}`;
    
    if (!this.handlerMap.has(key)) {
      this.handlerMap.set(key, Symbol(`handler-${key}`));
    }
    
    return this.handlerMap.get(key)!;
  }
}

// Enhanced debounce using global registry
export function debounce<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  ...args: any[]
): void {
  // Get handler identity from current execution context
  const context = getCurrentEventHandlerContext(); // Need to implement
  const registry = EventHandlerRegistry.getInstance();
  
  const handlerId = registry.getHandlerId(
    context.componentUid,
    context.eventName,
    context.handlerSource
  );
  
  const key = handlerId.toString();
  
  // Rest of debounce implementation using stable key
  // ...
}
```

### Solution 5: Compile-Time Debounce Key Injection

**Location**: XMLUI parser/compiler

Inject stable debounce keys at compile time:

```typescript
// During .xmlui parsing, transform:
// onDidChange="e => debounce(500, (val) => handleSearch(val), e)"
// 
// Into:
// onDidChange="e => debounce(500, (val) => handleSearch(val), '__debounce_key_TextBox_didChange_hash123__', e)"

// Parser enhancement
function injectDebounceKeys(handlerSource: string, componentType: string, eventName: string): string {
  const handlerHash = hashString(handlerSource);
  const debounceKey = `__debounce_key_${componentType}_${eventName}_${handlerHash}__`;
  
  // Replace debounce calls to include stable key
  return handlerSource.replace(
    /debounce\s*\(\s*(\d+)\s*,\s*([^,]+)\s*,/g,
    `debounce($1, $2, '${debounceKey}',`
  );
}

// Enhanced debounce signature
export function debounce<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  keyOrFirstArg: string | any,
  ...args: any[]
): void {
  let key: string;
  let actualArgs: any[];
  
  if (typeof keyOrFirstArg === 'string' && keyOrFirstArg.startsWith('__debounce_key_')) {
    // Compile-time injected key
    key = keyOrFirstArg;
    actualArgs = args;
  } else {
    // Fallback to function-based key
    key = func.toString();
    actualArgs = [keyOrFirstArg, ...args];
  }
  
  // Use stable key for debouncing
  // ... rest of implementation
}
```

### Recommended Implementation

**Solution 2 (Automatic Context Injection)** is recommended because:

1. **No API Changes**: Existing markup continues to work
2. **Transparent**: Developers don't need to understand the implementation
3. **Reliable**: Uses the established event handler context system
4. **Performance**: Minimal overhead, reuses existing infrastructure

### Implementation Steps

1. **Extend BindingTreeEvaluationContext** with event handler identity
2. **Modify Container.runCodeAsync** to inject enhanced debounce function
3. **Update debounce implementation** to use stable keys from context
4. **Add fallback logic** for cases where context is unavailable

This solution leverages the event handler correlation mechanisms already identified in the pipeline analysis, providing a robust foundation for solving the debounce function instance problem.

## EventHandlerContextAware Function Invocation System

### Analysis of Function Invocation Pipeline

The XMLUI script runner implements function invocations through `evalFunctionInvocationAsync` in `eval-tree-async.ts`. The key insight is that this function already has access to:

1. **Function Identity**: The `expr.obj` contains the function being called
2. **Function Arguments**: The `expr.arguments` array contains all arguments
3. **Execution Context**: The `evalContext` with our new `eventHandlerContext`
4. **Implicit Context Support**: Already supports injecting additional arguments via `implicitContextGetter`

### Current Function Invocation Flow

```typescript
// In evalFunctionInvocationAsync
async function evalFunctionInvocationAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: FunctionInvocationExpression,  // Contains function name and arguments
  evalContext: BindingTreeEvaluationContext,  // Contains our eventHandlerContext
  thread: LogicalThread,
): Promise<any> {
  // Function object resolution
  let functionObj: any;
  if (expr.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
    // Method calls like obj.method()
  } else {
    // Direct function calls like functionName()
    await evaluator(thisStack, expr.obj, evalContext, thread);
    functionObj = await completeExprValue(expr.obj, thread);
  }
  
  // Argument processing
  const functionArgs: any[] = [];
  // ... process arguments
  
  // Implicit context injection (existing mechanism)
  if (implicitContextObject) {
    if (evalContext.implicitContextGetter) {
      const implicitContext = evalContext.implicitContextGetter(implicitContextObject);
      functionArgs.unshift(implicitContext);  // Inject as first argument
    }
  }
  
  // Function invocation
  const value = (functionObj as Function).call(currentContext, ...functionArgs);
}
```

### Proposed EventHandlerContextAware Function Enhancement

#### 1. EventHandlerContextAware Function Registry

Create a registry of functions that should receive event handler context, similar to `bannedFunctions.ts`:

```typescript
// New file: src/components-core/script-runner/event-handler-context-aware-functions.ts
import { debounce } from "../misc"; // Import our stable function references
import { throttle } from "../misc"; // Assuming we have throttle too

export interface EventHandlerContextAwareFunctionInfo {
  func: (...args: any[]) => any;
  injectContext: boolean;
  transformArgs?: (context: EventHandlerContext, args: any[]) => any[];
  help?: string;
}

/**
 * Registry of functions that should receive event handler context as their first argument.
 * Uses direct function references like bannedFunctions.ts to ensure we only affect our own functions.
 */
const eventHandlerContextAwareFunctions: EventHandlerContextAwareFunctionInfo[] = [
  {
    func: debounce,
    injectContext: true,
    transformArgs: (context, args) => {
      // Transform debounce(delay, func, ...args) 
      // to debounce(context, delay, func, ...args)
      return args;
    },
    help: "Enhanced with event handler context for stable debouncing"
  },
  {
    func: throttle,
    injectContext: true,
    help: "Enhanced with event handler context for stable throttling"
  },
  // Add other XMLUI functions that need event handler context
];

export function isEventHandlerContextAwareFunction(functionObj: any): EventHandlerContextAwareFunctionInfo | undefined {
  if (functionObj === undefined) {
    return undefined;
  }
  return eventHandlerContextAwareFunctions.find(f => f.func === functionObj);
}
```

#### 2. Enhanced Function Invocation Logic

Modify `evalFunctionInvocationAsync` to inject context for registered functions:

```typescript
// In eval-tree-async.ts - enhanced evalFunctionInvocationAsync
import { isEventHandlerContextAwareFunction } from "./event-handler-context-aware-functions";

async function evalFunctionInvocationAsync(
  evaluator: EvaluatorAsyncFunction,
  thisStack: any[],
  expr: FunctionInvocationExpression,
  evalContext: BindingTreeEvaluationContext,
  thread: LogicalThread,
): Promise<any> {
  // ... existing function resolution logic ...

  // Resolve the actual function object
  let functionObj: any;
  if (expr.obj.type === T_MEMBER_ACCESS_EXPRESSION) {
    // Method calls like obj.method()
    // ... existing logic
  } else {
    // Direct function calls like functionName()
    await evaluator(thisStack, expr.obj, evalContext, thread);
    functionObj = await completeExprValue(expr.obj, thread);
  }

  // NEW: Check if this is an EventHandlerContextAware function using direct reference
  const eventHandlerContextAwareInfo = isEventHandlerContextAwareFunction(functionObj);
  
  // Keep function arguments here, we pass it to the function later
  const functionArgs: any[] = [];

  // ... existing arrow function handling ...

  // Process regular function arguments
  for (let i = 0; i < expr.arguments.length; i++) {
    // ... existing argument processing ...
    functionArgs.push(funcArg);
  }

  // NEW: Inject event handler context for registered functions
  if (eventHandlerContextAwareInfo?.injectContext && evalContext.eventHandlerContext) {
    if (eventHandlerContextAwareInfo.transformArgs) {
      // Allow custom argument transformation
      const transformedArgs = eventHandlerContextAwareInfo.transformArgs(
        evalContext.eventHandlerContext, 
        functionArgs
      );
      functionArgs.length = 0;
      functionArgs.push(evalContext.eventHandlerContext, ...transformedArgs);
    } else {
      // Default: inject context as first argument
      functionArgs.unshift(evalContext.eventHandlerContext);
    }
  }

  // ... existing implicit context logic ...
  
  // Function invocation proceeds with modified arguments
  const value = (functionObj as Function).call(currentContext, ...functionArgs);
  
  // ... rest of function ...
}
```

#### 3. Enhanced Debounce Function

Update the debounce function to accept and use event handler context:

```typescript
// In misc.ts - enhanced debounce function
export function debounce<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  ...args: any[]
): void;

export function debounce<F extends (...args: any[]) => any>(
  context: EventHandlerContext,
  delayMs: number,
  func: F,
  ...args: any[]
): void;

export function debounce<F extends (...args: any[]) => any>(
  contextOrDelayMs: EventHandlerContext | number,
  delayMsOrFunc: number | F,
  funcOrFirstArg?: F | any,
  ...restArgs: any[]
): void {
  let context: EventHandlerContext | undefined;
  let delayMs: number;
  let func: F;
  let args: any[];

  // Handle both signatures
  if (typeof contextOrDelayMs === 'object' && contextOrDelayMs.executionId) {
    // New signature: debounce(context, delayMs, func, ...args)
    context = contextOrDelayMs as EventHandlerContext;
    delayMs = delayMsOrFunc as number;
    func = funcOrFirstArg as F;
    args = restArgs;
  } else {
    // Legacy signature: debounce(delayMs, func, ...args)
    delayMs = contextOrDelayMs as number;
    func = delayMsOrFunc as F;
    args = funcOrFirstArg ? [funcOrFirstArg, ...restArgs] : restArgs;
  }

  // Generate stable key
  let key: string;
  if (context) {
    // Use stable event handler identity
    key = `${context.componentUid.toString()}-${context.eventName}-${context.handlerHash}`;
  } else {
    // Fallback to function source (existing behavior)
    key = func.toString();
  }

  // Clear existing timeout for this key
  const existing = debounceRegistry.get(key);
  if (existing !== undefined) {
    clearTimeout(existing.timeoutId);
  }

  // Set new timeout with captured arguments
  const timeoutId = setTimeout(() => {
    const entry = debounceRegistry.get(key);
    if (entry) {
      func(...entry.args);
      debounceRegistry.delete(key);
    }
  }, delayMs);

  debounceRegistry.set(key, { timeoutId, args });
}
```

#### 4. Automatic Context Detection

For maximum transparency, automatically detect context availability:

```typescript
// Enhanced version that works with or without context
export function debounce<F extends (...args: any[]) => any>(
  delayMs: number,
  func: F,
  ...args: any[]
): void {
  // Try to get current event handler context from execution stack
  const context = getCurrentEventHandlerContext(); // Need to implement
  
  let key: string;
  if (context) {
    // Use stable event handler identity when available
    key = `${context.componentUid.toString()}-${context.eventName}-${context.handlerHash}`;
  } else {
    // Fallback to function source for non-event-handler contexts
    key = func.toString();
  }
  
  // Rest of debounce implementation...
}

// Utility to get current context from execution stack
function getCurrentEventHandlerContext(): EventHandlerContext | undefined {
  // Implementation to traverse execution stack and find current context
  // This would require adding context tracking to the execution pipeline
  return undefined; // Placeholder
}
```

### Implementation Strategy

#### Phase 1: Basic Context Injection
1. **Create EventHandlerContextAware function registry** with `debounce` as first entry
2. **Modify `evalFunctionInvocationAsync`** to inject context for registered functions
3. **Update debounce function** to handle both signatures
4. **Test with simple debounce scenarios**

#### Phase 2: Enhanced Detection
1. **Add function name extraction utilities**
2. **Implement argument transformation hooks**
3. **Add automatic context detection**
4. **Extend to other functions** (throttle, etc.)

#### Phase 3: Developer Experience
1. **Add TypeScript overloads** for better IntelliSense
2. **Create debugging utilities** to inspect context injection
3. **Add performance monitoring** for EventHandlerContextAware functions
4. **Documentation and examples**

### Usage Examples

#### Before (Multiple Function Instances Problem)
```xml
<TextBox onDidChange="e => debounce(500, (val) => search(val), e)" />
```

Each keystroke creates new function instance → Multiple debounce timers → No debouncing

#### After (EventHandlerContextAware Solution)
```xml
<TextBox onDidChange="e => debounce(500, (val) => search(val), e)" />
```

Context automatically injected → Stable key from `handlerHash` → Single debounce timer → Perfect debouncing

#### Advanced Usage
```xml
<TextBox onDidChange="e => {
  // All these calls share the same debounce timer due to stable context
  debounce(500, (val) => {
    console.log('Searching for:', val);
    search(val);
  }, e);
}" />
```

### Benefits

1. **Transparent Enhancement**: Existing code works without changes
2. **Stable Correlation**: Uses the event handler correlation infrastructure
3. **Performance**: Minimal overhead, only for registered functions
4. **Extensible**: Easy to add other EventHandlerContextAware functions
5. **Debuggable**: Clear correlation logs and context tracking
6. **Type Safe**: Full TypeScript support with proper overloads
7. **Robust Function Targeting**: Uses direct function references like `bannedFunctions.ts` to ensure only XMLUI's own functions are affected, not user-defined functions with the same name

This approach leverages the existing function invocation pipeline and our new event handler correlation infrastructure to solve the debounce function instance problem without breaking existing APIs or requiring developer code changes. The use of direct function references ensures that only XMLUI's built-in EventHandlerContextAware functions receive context injection, preventing interference with user-defined functions.