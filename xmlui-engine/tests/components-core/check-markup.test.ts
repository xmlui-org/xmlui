import { describe, expect, it } from "vitest";
import { ComponentDescriptor } from "@abstractions/ComponentDescriptorDefs";
import { desc } from "@components-core/descriptorHelper";
import type { ComponentDef, CompoundComponentDef } from "@abstractions/ComponentDefs";
import { checkXmlUiMarkup } from "@components-core/markup-check";
import { createTestMetadataHandler } from "./test-metadata-handler";
import { layoutOptionKeys } from "@components-core/descriptorHelper";
import { parseXmlUiMarkup } from "@components-core/xmlui-parser";

const buttonMd: ComponentDescriptor<any> = {
  displayName: "Button",
  description: "Represent a button component, clicking of which triggers an action",
  props: {
    variant: desc("The button variant (solid, outlined, ghost) to use"),
    themeColor: desc("The button color scheme (primary, secondary, attention)"),
    size: desc("The size of the button (small, medium, large)"),
    label: desc(
      "Specifies the optional text to display in the button. If omitted, children can be used to set " +
        "the button's content."
    ),
    type: desc("The behavior type of the button"),
    enabled: desc("Indicates if the button is enabled"),
    icon: desc("Optional icon ID to display the particular icon in the button"),
    iconPosition: desc("Position of the icon displayed in the button"),
    contentPosition: desc("Determines how the label and icon should be placed inside the Button component"),
  },
  events: {
    click: desc("Triggers when the button is clicked"),
    gotFocus: desc("Triggers when he button is focused"),
    lostFocus: desc("Triggers when the button has lost focus"),
  },
  defaultThemeVars: {
    "width-Button": "fit-content",
    "height-Button": "fit-content",
    "radius-Button": "$radius",
    "font-size-Button": "$font-size-normal",
    "color-bg-Button-primary": "$color-primary-500",
    "color-bg-Button-attention": "$color-bg-attention",
    "color-border-Button-attention": "$color-attention",
    "color-bg-Button--disabled": "$color-bg--disabled",
    "color-border-Button--disabled": "$color-border--disabled",
    "style-border-Button": "solid",
    "color-text-Button--disabled": "$color-text--disabled",
    "color-outline-Button--focus": "$color-outline--focus",
    "thickness-outline-Button--focus": "$thickness-outline--focus",
    "style-outline-Button--focus": "$style-outline--focus",
    "offset-outline-Button--focus": "$offset-outline--focus",
    "padding-horizontal-xs-Button": "$space-1",
    "padding-vertical-xs-Button": "$space-0_5",
    "padding-horizontal-sm-Button": "$space-4",
    "padding-vertical-sm-Button": "$space-2",
    "padding-horizontal-md-Button": "$space-4",
    "padding-vertical-md-Button": "$space-3",
    "padding-horizontal-lg-Button": "$space-5",
    "padding-vertical-lg-Button": "$space-4",
    light: {
      "color-text-Button": "$color-surface-950",
      "color-text-Button-solid": "$color-surface-50",
      "color-border-Button-primary": "$color-primary-500",
      "color-bg-Button-primary--hover": "$color-primary-400",
      "color-bg-Button-primary--active": "$color-primary-500",
      "color-bg-Button-primary-outlined--hover": "$color-primary-50",
      "color-bg-Button-primary-outlined--active": "$color-primary-100",
      "color-border-Button-primary-outlined": "$color-primary-600",
      "color-border-Button-primary-outlined--hover": "$color-primary-500",
      "color-text-Button-primary-outlined": "$color-primary-900",
      "color-text-Button-primary-outlined--hover": "$color-primary-950",
      "color-text-Button-primary-outlined--active": "$color-primary-900",
      "color-bg-Button-primary-ghost--hover": "$color-primary-50",
      "color-bg-Button-primary-ghost--active": "$color-primary-100",
      "color-border-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary--hover": "$color-secondary-400",
      "color-bg-Button-secondary--active": "$color-secondary-500",
      "color-bg-Button-secondary-outlined--hover": "$color-secondary-50",
      "color-bg-Button-secondary-outlined--active": "$color-secondary-100",
      "color-bg-Button-secondary-ghost--hover": "$color-secondary-100",
      "color-bg-Button-secondary-ghost--active": "$color-secondary-100",
      "color-bg-Button-attention--hover": "$color-danger-400",
      "color-bg-Button-attention--active": "$color-danger-500",
      "color-bg-Button-attention-outlined--hover": "$color-danger-50",
      "color-bg-Button-attention-outlined--active": "$color-danger-100",
      "color-bg-Button-attention-ghost--hover": "$color-danger-50",
      "color-bg-Button-attention-ghost--active": "$color-danger-100",
    },
    dark: {
      "color-text-Button": "$color-surface-50",
      "color-text-Button-solid": "$color-surface-50",
      "color-border-Button-primary": "$color-primary-500",
      "color-bg-Button-primary--hover": "$color-primary-600",
      "color-bg-Button-primary--active": "$color-primary-500",
      "color-bg-Button-primary-outlined--hover": "$color-primary-900",
      "color-bg-Button-primary-outlined--active": "$color-primary-950",
      "color-border-Button-primary-outlined": "$color-primary-600",
      "color-border-Button-primary-outlined--hover": "$color-primary-500",
      "color-text-Button-primary-outlined": "$color-primary-100",
      "color-text-Button-primary-outlined--hover": "$color-primary-50",
      "color-text-Button-primary-outlined--active": "$color-primary-100",
      "color-bg-Button-primary-ghost--hover": "$color-primary-900",
      "color-bg-Button-primary-ghost--active": "$color-primary-950",
      "color-border-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary": "$color-secondary-500",
      "color-bg-Button-secondary--hover": "$color-secondary-400",
      "color-bg-Button-secondary--active": "$color-secondary-500",
      "color-bg-Button-secondary-outlined--hover": "$color-secondary-600",
      "color-bg-Button-secondary-outlined--active": "$color-secondary-500",
      "color-bg-Button-secondary-ghost--hover": "$color-secondary-900",
      "color-bg-Button-secondary-ghost--active": "$color-secondary-950",
      "color-bg-Button-attention--hover": "$color-danger-400",
      "color-bg-Button-attention--active": "$color-danger-500",
      "color-bg-Button-attention-outlined--hover": "$color-danger-900",
      "color-bg-Button-attention-outlined--active": "$color-danger-950",
      "color-bg-Button-attention-ghost--hover": "$color-danger-900",
      "color-bg-Button-attention-ghost--active": "$color-danger-950",
    },
  },
};

const stackMd: ComponentDescriptor<any> = {
  displayName: "Stack",
  description: "A layout container of horizontally or vertically stacked content",
  props: {
    orientation: desc("The layout orientation of the component - works similarly to a CSS flexbox"),
    reverse: desc("Should reverse the order of child elements?"),
  },
  events: {
    click: desc("The stack is clicked"),
  },
};

const textBoxMd: ComponentDescriptor<any> = {
  displayName: "TextBox",
  description: "Represents an input component for textual data entry",
  props: {
    placeholder: desc("Placeholder text to sign the input is empty"),
    value: desc("The current value to display"),
    initialValue: desc("The initial value to display"),
    labelId: desc("ID of the label attached to this input"),
    maxLength: desc("The maximum length of the input text"),
    autoFocus: desc("Should the component be automatically focused?"),
    required: desc("Is the component value required (use for indication)?"),
    readOnly: desc("Is the component read-only?"),
    allowCopy: desc("Allow copying the component value to the clipboard?"),
    enabled: desc("Is the component enabled?"),
    validationStatus: desc("The validation status of the component"),
    // --- Adornment props
    startText: desc("Text rendered at the start of the input"),
    startIcon: desc("Icon rendered at the start of the input"),
    endText: desc("Text rendered at the end of the input"),
    endIcon: desc("Icon rendered at the end of the input"),
  },
  events: {
    change: desc("Triggered when the input value changes"),
    gotFocus: desc("Triggered when the input gains focus"),
    lostFocus: desc("triggered when the input has lost focus"),
  },
  defaultThemeVars: {
    // TODO: When FormItem is themed, move these defaults there
    "radius-Input": "$radius",
    "color-text-Input": "$color-text-primary",
    "color-bg-Input--disabled": "$color-bg--disabled",
    "thickness-border-Input": "1px",
    "style-border-Input": "solid",
    "color-border-Input--disabled": "$color-border--disabled",
    "color-text-Input--disabled": "$color-text--disabled",
    "color-border-Input-error": "$color-border-Input-default--error",
    "color-border-Input-warning": "$color-border-Input-default--warning",
    "color-border-Input-success": "$color-border-Input-default--success",
    "color-placeholder-Input": "$color-text-subtitle",
    "color-adornment-Input": "$color-text-subtitle",

    "color-outline-Input--focus": "$color-outline--focus",
    "thickness-outline-Input--focus": "$thickness-outline--focus",
    "style-outline-Input--focus": "$style-outline--focus",
    "offset-outline-Input--focus": "$offset-outline--focus",

    light: {
      // --- No light-specific theme vars
    },
    dark: {
      // --- No dark-specific theme vars
    },
  },
};

const themeMd: ComponentDescriptor<any> = {
  displayName: "Theme",
  description: "This component allows defining a particular theming context for its nested components",
  props: {
    themeId: desc("The id of the theme to use"),
    tone: desc("The tone to use in the theming context"),
  },
}

const apiActionMd: ComponentDescriptor<any> = {
  displayName: "ApiAction",
  description: "ApiAction",
  props: {
    confirmTitle: desc("confirmTitle"),
    confirmMessage: desc("confirmMessage"),
    confirmButtonLabel: desc("confirmButtonLabel"),
    inProgressNotificationMessage: desc("inProgressNotificationMessage"),
    completedNotificationMessage: desc("completedNotificationMessage"),
    errorNotificationMessage: desc("errorNotificationMessage"),
    invalidates: desc("invalidates"),
    updates: desc("updates"),
    optimisticValue: desc("optimisticValue"),
    getOptimisticValue: desc("getOptimisticValue"),
    headers: desc("headers"),
    payloadType: desc("payloadType"),
    method: desc("method"),
    url: desc("url"),
    queryParams: desc("queryParams"),
    rawBody: desc("rawBody"),
    body: desc("body"),
  },
  events: {
    success: desc("success"),
    error: desc("error"),
    progress: desc("progress"),
    beforeRequest: desc("beforeRequest"),
  }
}

const metadataHash: Record<string, ComponentDescriptor<any>> = {
  Button: buttonMd,
  Stack: stackMd,
  TextBox: textBoxMd,
  Theme: themeMd,
  ApiAction: apiActionMd,
};

const metadataHandler = createTestMetadataHandler(metadataHash);

describe("Markup checks", () => {
  it("Registered component works", () => {
    // --- Arrange
    const source = "<Button />";
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Unregistered component fails", () => {
    // --- Arrange
    const source = "<Dummy />";
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Root");
    expect(error.code).equal("M001");
    expect(error.message).toContain("'Dummy'");
  });

  it("Valid component ID works", () => {
    // --- Arrange
    const source = `<Button id="myId" />`;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  const invalidIdCases = ["123ert", "-dashed", "{myId}"];
  invalidIdCases.forEach((id) => {
    it(`Invalid component ID fails: ${id}`, () => {
      // --- Arrange
      const source = `<Button id="${id}" />`;
      const def = transformSource(source) as ComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(def, [], metadataHandler);

      // --- Assert
      expect(errors.length).equal(1);
      const error = errors[0];
      expect(error.name).equal("Button");
      expect(error.code).equal("M002");
      expect(error.message).toContain('Button');
      expect(error.message).toContain(`'${id}'`);
    });
  });

  it("Duplicated component ID fails", () => {
    // --- Arrange
    const source = `
      <Stack id="myId">
        <Button id="myId" />
      </Stack>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M003");
    expect(error.message).toContain("'myId'");
  });

  it("Component IDs are scoped", () => {
    // --- Arrange
    const source = `
      <Stack>
        <Button id="myId" />
      </Stack>
    `;
    const compoundCompSource = `
      <Component name="MyComp">
        <Button id="myId" />
      </Component>
    `;
    const def = transformSource(source) as ComponentDef;
    const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [compoundDef], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Unknown component property fails", () => {
    // --- Arrange
    const source = `
      <Button dummy="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M005");
    expect(error.message).toContain("'dummy'");
  });

  it("Registered component property works", () => {
    // --- Arrange
    const source = `
      <Button label="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Arbitrary property with Theme works", () => {
    // --- Arrange
    const source = `
      <Theme my-theme-var="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Property value parsing fails #1", () => {
    // --- Arrange
    const source = `
      <Button label="{some" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M006");
    expect(error.message).toContain("'label'");
    expect(error.message).toContain("Unclosed");
  });

  it("Property value parsing fails #2", () => {
    // --- Arrange
    const source = `
      <Button label="{/123}" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M006");
    expect(error.message).toContain("'label'");
    expect(error.message).toContain("Unexpected token");
  });

  layoutOptionKeys.forEach((key) => {
    it(`Layout property '${key}' works`, () => {
      // --- Arrange
      const source = `
        <Button ${key}="something" />
      `;
      const def = transformSource(source) as ComponentDef;
  
      // --- Act
      const errors = checkXmlUiMarkup(def, [], metadataHandler);
  
      // --- Assert
      expect(errors.length).equal(0);
    });
  });

  const invalidCompoundIdCases = ["C123:", "C-dashed", "C{myId}"];
  invalidCompoundIdCases.forEach((id) => {
    it(`Invalid reusable component name fails: ${id}`, () => {
      // --- Arrange
      const compoundCompSource = `
        <Component name="${id}">
          <Button />
        </Component>
      `;
      const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(null, [compoundDef], metadataHandler);

      // --- Assert
      expect(errors.length).equal(1);
      const error = errors[0];
      expect(error.name).equal("Component");
      expect(error.code).equal("M007");
      expect(error.message).toContain(`'${id}'`);
    });
  });

  it("Component name must not be: 'Component'", () => {
    // --- Arrange
    const compoundCompSource = `
      <Component name="Component">
        <Button />
      </Component>
    `;
    const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(null, [compoundDef], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Component");
    expect(error.code).equal("M008");
    expect(error.message).toContain(`'Component'`);
  });

  Object.keys(metadataHash).forEach((key) => {
    it(`Component name must not be: '${key}'`, () => {
      // --- Arrange
      const compoundCompSource = `
        <Component name="${key}">
          <Button />
        </Component>
      `;
      const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

      // --- Act
      const errors = checkXmlUiMarkup(null, [compoundDef], metadataHandler);

      // --- Assert
      expect(errors.length).equal(1);
      const error = errors[0];
      expect(error.name).equal("Component");
      expect(error.code).equal("M009");
      expect(error.message).toContain(`'${key}'`);
    });
  });

  it("Component name must be unique", () => {
    // --- Arrange
    const compoundCompSource = `
      <Component name="MyComp">
        <Button />
      </Component>
    `;
    const compoundDef = transformSource(compoundCompSource) as CompoundComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(null, [compoundDef, compoundDef], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Component");
    expect(error.code).equal("M010");
    expect(error.message).toContain(`'MyComp'`);
  });

  it("Unknown component event fails", () => {
    // --- Arrange
    const source = `
      <Button onDummy="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M011");
    expect(error.message).toContain("'dummy'");
  });

  it("Registered component event works", () => {
    // --- Arrange
    const source = `
      <Button onClick="something" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Event value parsing fails #1", () => {
    // --- Arrange
    const source = `
      <Button onClick="some?" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M012");
    expect(error.message).toContain("'click'");
  });

  it("Event with ApiAction works", () => {
    // --- Arrange
    const source = `
      <Button>
        <event name="click">
          <ApiAction url="/api/customers" method="post" />
        </event>
      </Button>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

  it("Event with ApiAction fails #1", () => {
    // --- Arrange
    const source = `
      <Button>
        <event name="click">
          <ApiAction dummy="something" />
        </event>
      </Button>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("ApiAction");
    expect(error.code).equal("M005");
    expect(error.message).toContain("'dummy'");
  });

  it("Event with ApiAction fails #2", () => {
    // --- Arrange
    const source = `
      <Button>
        <event name="click">
          <Dummy />
        </event>
      </Button>
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M001");
    expect(error.message).toContain("'Dummy'");
  });

  it("Custom validation fails in devMode", () => {
    // --- Arrange
    const source = `
      <Button label="q - should not start with q" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler, true);

    // --- Assert
    expect(errors.length).equal(1);
    const error = errors[0];
    expect(error.name).equal("Button");
    expect(error.code).equal("M013");
    expect(error.message).toContain("q");
  });

  it("Custom validation does not trigget in prod mode", () => {
    // --- Arrange
    const source = `
      <Button label="q - should not start with q" />
    `;
    const def = transformSource(source) as ComponentDef;

    // --- Act
    const errors = checkXmlUiMarkup(def, [], metadataHandler);

    // --- Assert
    expect(errors.length).equal(0);
  });

});

function transformSource(source: string): ComponentDef | CompoundComponentDef | null {
  return parseXmlUiMarkup(source);
}
