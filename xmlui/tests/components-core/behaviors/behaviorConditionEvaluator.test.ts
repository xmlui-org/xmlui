import { describe, it, expect } from "vitest";
import { canBehaviorAttachToComponent } from "../../../src/components-core/behaviors/behaviorConditionEvaluator";
import { ComponentMetadataProvider } from "../../../src/language-server/services/common/metadata-utils";
import type { ComponentPropertyMetadata } from "../../../src/abstractions/ComponentDefs";
import type { BehaviorMetadata } from "../../../src/components-core/behaviors/BehavorMetadata";

// ============================================================================
// Helper Functions for Creating Test Metadata
// ============================================================================

/**
 * Creates a mock ComponentMetadataProvider for testing
 */
function createMockMetadataProvider(config: {
  props?: Record<string, ComponentPropertyMetadata>;
  events?: Record<string, string>;
  apis?: Record<string, string>;
  contextVars?: Record<string, string>;
  nonVisual?: boolean;
  allowArbitraryProps?: boolean;
  shortDescription?: string;
}): ComponentMetadataProvider {
  return new ComponentMetadataProvider({
    description: "Test component",
    shortDescription: config.shortDescription || "Test",
    status: "stable",
    props: config.props || {},
    events: config.events || {},
    apis: config.apis || {},
    contextVars: config.contextVars || {},
    allowArbitraryProps: config.allowArbitraryProps || false,
    nonVisual: config.nonVisual,
  });
}

/**
 * Create test behavior metadata to avoid importing actual behaviors
 * which trigger component imports with side effects
 */
const testBehaviorMetadata: Record<string, BehaviorMetadata> = {
  label: {
    name: "label",
    description: "Label behavior for testing",
    triggerProps: ["label"],
    props: {},
    condition: {
      type: "and",
      conditions: [
        { type: "hasNoProp", propName: "label" },
        { type: "hasNoProp", propName: "bindTo" },
        { type: "isNotType", nodeType: "FormItem" },
      ],
    },
  },
  animation: {
    name: "animation",
    description: "Animation behavior for testing",
    triggerProps: ["animation"],
    props: {},
    condition: {
      type: "visual",
    },
  },
  tooltip: {
    name: "tooltip",
    description: "Tooltip behavior for testing",
    triggerProps: ["tooltip"],
    props: {},
    condition: {
      type: "visual",
    },
  },
  variant: {
    name: "variant",
    description: "Variant behavior for testing",
    triggerProps: ["variant"],
    props: {},
    condition: {
      type: "visual",
    },
  },
  bookmark: {
    name: "bookmark",
    description: "Bookmark behavior for testing",
    triggerProps: ["bookmark"],
    props: {},
    condition: {
      type: "visual",
    },
  },
  pubsub: {
    name: "pubsub",
    description: "PubSub behavior for testing",
    triggerProps: ["subscribeToTopic"],
    props: {},
    // No condition - should allow attachment to any component
  },
  formBinding: {
    name: "formBinding",
    description: "Form binding behavior for testing",
    triggerProps: ["bindTo"],
    props: {},
    condition: {
      type: "and",
      conditions: [
        { type: "hasApi", apiName: "value" },
        { type: "hasApi", apiName: "setValue" },
      ],
    },
  },
  validation: {
    name: "validation",
    description: "Validation behavior for testing",
    triggerProps: ["bindTo"],
    props: {},
    condition: {
      type: "or",
      conditions: [
        {
          type: "and",
          conditions: [
            { type: "hasApi", apiName: "value" },
            { type: "hasApi", apiName: "setValue" },
          ],
        },
        { type: "isType", nodeType: "FormItem" },
      ],
    },
  },
};

// ============================================================================
// Label Behavior Tests
// ============================================================================

describe("Label Behavior Condition Evaluation", () => {
  const labelBehavior = testBehaviorMetadata.label;

  it("should allow attachment to component without label prop in metadata", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
      },
    });

    const result = canBehaviorAttachToComponent(labelBehavior, provider, "TextBox");
    expect(result).toBe(true);
  });

  it("should prevent attachment to component with label prop in metadata", () => {
    const provider = createMockMetadataProvider({
      props: {
        label: { valueType: "string", description: "Label" },
      },
    });

    const result = canBehaviorAttachToComponent(labelBehavior, provider, "Checkbox");
    expect(result).toBe(false);
  });

  it("should prevent attachment to component with bindTo prop in metadata", () => {
    const provider = createMockMetadataProvider({
      props: {
        bindTo: { valueType: "string", description: "Form binding" },
      },
    });

    const result = canBehaviorAttachToComponent(labelBehavior, provider, "TextBox");
    expect(result).toBe(false);
  });

  it("should prevent attachment to FormItem component", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
      },
    });

    const result = canBehaviorAttachToComponent(labelBehavior, provider, "FormItem");
    expect(result).toBe(false);
  });

  it("should allow attachment when all conditions are met (negative checks)", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
        placeholder: { valueType: "string", description: "Placeholder" },
      },
    });

    const result = canBehaviorAttachToComponent(labelBehavior, provider, "TextArea");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Animation Behavior Tests
// ============================================================================

describe("Animation Behavior Condition Evaluation", () => {
  const animationBehavior = testBehaviorMetadata.animation;

  it("should allow attachment to visual components", () => {
    const provider = createMockMetadataProvider({
      props: {
        title: { valueType: "string", description: "Title" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(animationBehavior, provider, "Card");
    expect(result).toBe(true);
  });

  it("should prevent attachment to non-visual components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: true,
    });

    const result = canBehaviorAttachToComponent(animationBehavior, provider, "Fragment");
    expect(result).toBe(false);
  });

  it("should allow attachment to Button component", () => {
    const provider = createMockMetadataProvider({
      props: {
        label: { valueType: "string", description: "Label" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(animationBehavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should allow attachment to Stack component", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(animationBehavior, provider, "Stack");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Tooltip Behavior Tests
// ============================================================================

describe("Tooltip Behavior Condition Evaluation", () => {
  const tooltipBehavior = testBehaviorMetadata.tooltip;

  it("should allow attachment to visual components", () => {
    const provider = createMockMetadataProvider({
      props: {
        label: { valueType: "string", description: "Label" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(tooltipBehavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should prevent attachment to non-visual components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: true,
    });

    const result = canBehaviorAttachToComponent(tooltipBehavior, provider, "Slot");
    expect(result).toBe(false);
  });

  it("should allow attachment to Icon component", () => {
    const provider = createMockMetadataProvider({
      props: {
        name: { valueType: "string", description: "Icon name" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(tooltipBehavior, provider, "Icon");
    expect(result).toBe(true);
  });

  it("should allow attachment to Card component", () => {
    const provider = createMockMetadataProvider({
      props: {
        title: { valueType: "string", description: "Title" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(tooltipBehavior, provider, "Card");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Variant Behavior Tests
// ============================================================================

describe("Variant Behavior Condition Evaluation", () => {
  const variantBehavior = testBehaviorMetadata.variant;

  it("should allow attachment to visual components", () => {
    const provider = createMockMetadataProvider({
      props: {
        variant: { valueType: "string", description: "Variant" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(variantBehavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should prevent attachment to non-visual components", () => {
    const provider = createMockMetadataProvider({
      props: {
        variant: { valueType: "string", description: "Variant" },
      },
      nonVisual: true,
    });

    const result = canBehaviorAttachToComponent(variantBehavior, provider, "Fragment");
    expect(result).toBe(false);
  });

  it("should allow attachment to Badge component", () => {
    const provider = createMockMetadataProvider({
      props: {
        variant: { valueType: "string", description: "Variant" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(variantBehavior, provider, "Badge");
    expect(result).toBe(true);
  });

  it("should allow attachment to Alert component", () => {
    const provider = createMockMetadataProvider({
      props: {
        variant: { valueType: "string", description: "Variant" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(variantBehavior, provider, "Alert");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Bookmark Behavior Tests
// ============================================================================

describe("Bookmark Behavior Condition Evaluation", () => {
  const bookmarkBehavior = testBehaviorMetadata.bookmark;

  it("should allow attachment to visual components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(bookmarkBehavior, provider, "Stack");
    expect(result).toBe(true);
  });

  it("should prevent attachment to non-visual components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: true,
    });

    const result = canBehaviorAttachToComponent(bookmarkBehavior, provider, "Fragment");
    expect(result).toBe(false);
  });

  it("should allow attachment to Heading component", () => {
    const provider = createMockMetadataProvider({
      props: {
        level: { valueType: "number", description: "Heading level" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(bookmarkBehavior, provider, "Heading");
    expect(result).toBe(true);
  });

  it("should allow attachment to Card component", () => {
    const provider = createMockMetadataProvider({
      props: {
        title: { valueType: "string", description: "Title" },
      },
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(bookmarkBehavior, provider, "Card");
    expect(result).toBe(true);
  });
});

// ============================================================================
// PubSub Behavior Tests
// ============================================================================

describe("PubSub Behavior Condition Evaluation", () => {
  const pubsubBehavior = testBehaviorMetadata.pubsub;

  it("should allow attachment when no condition is defined", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const result = canBehaviorAttachToComponent(pubsubBehavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should allow attachment to visual components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: false,
    });

    const result = canBehaviorAttachToComponent(pubsubBehavior, provider, "TextBox");
    expect(result).toBe(true);
  });

  it("should allow attachment to non-visual components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      nonVisual: true,
    });

    const result = canBehaviorAttachToComponent(pubsubBehavior, provider, "Fragment");
    expect(result).toBe(true);
  });

  it("should allow attachment to any component type", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
      },
    });

    const result = canBehaviorAttachToComponent(pubsubBehavior, provider, "CustomComponent");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Form Binding Behavior Tests
// ============================================================================

describe("Form Binding Behavior Condition Evaluation", () => {
  const formBindingBehavior = testBehaviorMetadata.formBinding;

  it("should allow attachment to components with value and setValue APIs", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(formBindingBehavior, provider, "TextBox");
    expect(result).toBe(true);
  });

  it("should prevent attachment to components without value API", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(formBindingBehavior, provider, "Button");
    expect(result).toBe(false);
  });

  it("should prevent attachment to components without setValue API", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
      },
    });

    const result = canBehaviorAttachToComponent(formBindingBehavior, provider, "Text");
    expect(result).toBe(false);
  });

  it("should allow attachment to Select component", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(formBindingBehavior, provider, "Select");
    expect(result).toBe(true);
  });

  it("should allow attachment to Checkbox component", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(formBindingBehavior, provider, "Checkbox");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Validation Behavior Tests
// ============================================================================

describe("Validation Behavior Condition Evaluation", () => {
  const validationBehavior = testBehaviorMetadata.validation;

  it("should allow attachment to form-bindable components", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(validationBehavior, provider, "TextBox");
    expect(result).toBe(true);
  });

  it("should prevent attachment to components without value API", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(validationBehavior, provider, "Button");
    expect(result).toBe(false);
  });

  it("should prevent attachment to components without setValue API", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
      },
    });

    const result = canBehaviorAttachToComponent(validationBehavior, provider, "Icon");
    expect(result).toBe(false);
  });

  it("should allow attachment to NumberBox component", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(validationBehavior, provider, "NumberBox");
    expect(result).toBe(true);
  });

  it("should allow attachment to DatePicker component", () => {
    const provider = createMockMetadataProvider({
      props: {},
      apis: {
        value: "Gets the current value",
        setValue: "Sets the value",
      },
    });

    const result = canBehaviorAttachToComponent(validationBehavior, provider, "DatePicker");
    expect(result).toBe(true);
  });

  it("should allow attachment to FormItem component", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const result = canBehaviorAttachToComponent(validationBehavior, provider, "FormItem");
    expect(result).toBe(true);
  });
});

// ============================================================================
// Condition Type Tests (Testing the evaluator logic)
// ============================================================================

describe("Behavior Condition Evaluator - Logical Operators", () => {
  it("should evaluate AND conditions correctly - all true", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
        enabled: { valueType: "boolean", description: "Enabled" },
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "and" as const,
        conditions: [
          { type: "hasProp" as const, propName: "value" },
          { type: "hasProp" as const, propName: "enabled" },
        ],
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(true);
  });

  it("should evaluate AND conditions correctly - one false", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "and" as const,
        conditions: [
          { type: "hasProp" as const, propName: "value" },
          { type: "hasProp" as const, propName: "enabled" },
        ],
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(false);
  });

  it("should evaluate OR conditions correctly - one true", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "or" as const,
        conditions: [
          { type: "hasProp" as const, propName: "value" },
          { type: "hasProp" as const, propName: "enabled" },
        ],
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(true);
  });

  it("should evaluate OR conditions correctly - all false", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "or" as const,
        conditions: [
          { type: "hasProp" as const, propName: "value" },
          { type: "hasProp" as const, propName: "enabled" },
        ],
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(false);
  });

  it("should evaluate NOT condition correctly - negates true", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "not" as const,
        condition: { type: "hasProp" as const, propName: "value" },
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(false);
  });

  it("should evaluate NOT condition correctly - negates false", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "not" as const,
        condition: { type: "hasProp" as const, propName: "value" },
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(true);
  });
});

describe("Behavior Condition Evaluator - Event Checks", () => {
  it("should evaluate hasEvent condition - event exists", () => {
    const provider = createMockMetadataProvider({
      events: {
        click: "Click event",
        change: "Change event",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasEvent" as const,
        eventName: "click",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should evaluate hasEvent condition - event does not exist", () => {
    const provider = createMockMetadataProvider({
      events: {
        click: "Click event",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasEvent" as const,
        eventName: "change",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "Button");
    expect(result).toBe(false);
  });

  it("should evaluate hasNoEvent condition - event does not exist", () => {
    const provider = createMockMetadataProvider({
      events: {
        click: "Click event",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasNoEvent" as const,
        eventName: "change",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should evaluate hasNoEvent condition - event exists", () => {
    const provider = createMockMetadataProvider({
      events: {
        click: "Click event",
        change: "Change event",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasNoEvent" as const,
        eventName: "change",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "Button");
    expect(result).toBe(false);
  });
});

describe("Behavior Condition Evaluator - Context Variable Checks", () => {
  it("should evaluate hasContextVar condition - variable exists", () => {
    const provider = createMockMetadataProvider({
      contextVars: {
        item: "Current item",
        index: "Item index",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasContextVar" as const,
        contextVarName: "item",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "List");
    expect(result).toBe(true);
  });

  it("should evaluate hasContextVar condition - variable does not exist", () => {
    const provider = createMockMetadataProvider({
      contextVars: {
        item: "Current item",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasContextVar" as const,
        contextVarName: "index",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "List");
    expect(result).toBe(false);
  });

  it("should evaluate hasNoContextVar condition - variable does not exist", () => {
    const provider = createMockMetadataProvider({
      contextVars: {
        item: "Current item",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasNoContextVar" as const,
        contextVarName: "index",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "List");
    expect(result).toBe(true);
  });

  it("should evaluate hasNoContextVar condition - variable exists", () => {
    const provider = createMockMetadataProvider({
      contextVars: {
        item: "Current item",
        index: "Item index",
      },
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "hasNoContextVar" as const,
        contextVarName: "index",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "List");
    expect(result).toBe(false);
  });
});

describe("Behavior Condition Evaluator - Type Checks", () => {
  it("should evaluate isType condition - types match", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "isType" as const,
        nodeType: "Button",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "Button");
    expect(result).toBe(true);
  });

  it("should evaluate isType condition - types do not match", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "isType" as const,
        nodeType: "Button",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TextBox");
    expect(result).toBe(false);
  });

  it("should evaluate isNotType condition - types do not match", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "isNotType" as const,
        nodeType: "Button",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TextBox");
    expect(result).toBe(true);
  });

  it("should evaluate isNotType condition - types match", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "isNotType" as const,
        nodeType: "Button",
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "Button");
    expect(result).toBe(false);
  });
});

describe("Behavior Condition Evaluator - No Condition", () => {
  it("should return true when no condition is defined", () => {
    const provider = createMockMetadataProvider({
      props: {},
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      // No condition defined
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "AnyComponent");
    expect(result).toBe(true);
  });
});

describe("Behavior Condition Evaluator - Complex Nested Conditions", () => {
  it("should evaluate nested AND/OR conditions correctly", () => {
    const provider = createMockMetadataProvider({
      props: {
        value: { valueType: "string", description: "Value" },
        label: { valueType: "string", description: "Label" },
      },
      apis: {
        setValue: "Sets value",
      },
      nonVisual: false,
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "and" as const,
        conditions: [
          { type: "visual" as const },
          {
            type: "or" as const,
            conditions: [
              { type: "hasProp" as const, propName: "value" },
              { type: "hasProp" as const, propName: "text" },
            ],
          },
          {
            type: "not" as const,
            condition: { type: "hasApi" as const, apiName: "getValue" },
          },
        ],
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(true);
  });

  it("should evaluate nested conditions correctly - complex failure case", () => {
    const provider = createMockMetadataProvider({
      props: {
        text: { valueType: "string", description: "Text" },
      },
      nonVisual: true,
    });

    const behavior = {
      name: "test",
      description: "Test",
      triggerProps: [],
      props: {},
      condition: {
        type: "and" as const,
        conditions: [
          { type: "visual" as const },
          {
            type: "or" as const,
            conditions: [
              { type: "hasProp" as const, propName: "value" },
              { type: "hasProp" as const, propName: "text" },
            ],
          },
        ],
      },
    };

    const result = canBehaviorAttachToComponent(behavior, provider, "TestComponent");
    expect(result).toBe(false);
  });
});
