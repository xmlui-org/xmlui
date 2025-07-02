# TypeScript Abstractions Conventions

This document outlines best practices and conventions for working with TypeScript abstractions in the XMLUI project. Following these conventions ensures that files in the abstractions folder only contain type definitions and don't generate JavaScript code when compiled.

## Core Principles

The abstractions folder is intended to contain **type definitions only** with no runtime JavaScript code generation.

## Conventions for Type Definitions

### 1. Type-Only Constructs

Use these TypeScript constructs in abstractions files:
- `interface` for defining object shapes
- `type` for type aliases and unions
- `declare` keyword for values that must exist at runtime

Avoid these constructs that generate JavaScript:
- `class` declarations
- `function` declarations
- `const`, `let`, or `var` declarations without `declare`
- Regular `enum` declarations

### 2. Implementation Patterns

#### Pattern A: Type-Only Declarations
Use the `declare` keyword to indicate that a value exists at runtime but its implementation is elsewhere:
```typescript
export declare const MY_CONSTANT: 42;
export declare enum MyEnum { Value1, Value2 }
export declare function myFunction(): void;
```

#### Pattern B: Implementation Separation
Place implementation files outside the abstractions folder:
```typescript
// In abstractions/MyTypes.ts
export type MyType = { prop: string };

// In implementation/MyImplementation.ts
import type { MyType } from "../abstractions/MyTypes";
export const createMyType = (): MyType => ({ prop: "value" });
```

### 3. Import Patterns

- Always use `import type` for type imports in abstractions:
```typescript
import type { SomeType } from "./OtherFile";
```

## Common Scenarios

1. **Constants**: Use `declare const` in abstractions
2. **Enums**: Use `declare enum` or type unions
3. **Functions**: Use `declare function` or move implementation outside
4. **Classes**: Use interfaces instead or move implementation outside

## Benefits

- Clear separation between types and implementation
- Improved maintainability and refactoring
- No runtime overhead from abstraction files
- Better TypeScript compilation performance

By following these conventions, you help maintain a clean architecture with proper separation between type definitions and runtime implementation.
