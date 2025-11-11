import type { ComponentMetadataCollection } from "../../src/language-server/services/common/metadata-utils";
import { MetadataProvider } from "../../src/language-server/services/common/metadata-utils";

export const mockMetadata = {
  "Stack": {
    "description": "`Stack` is a layout container displaying children in a horizontal or vertical stack.",
    "props": {
      "gap": {
        "description": "Optional size value indicating the gap between child elements.",
        "valueType": "string",
        "defaultValue": "$gap-normal"
      },
      "reverse": {
        "description": "Optional boolean property to reverse the order of child elements.",
        "valueType": "boolean",
        "defaultValue": false
      },
      "wrapContent": {
        "description": "Optional boolean which wraps the content if set to true and the available space is not big enough. Works only with horizontal orientations.",
        "valueType": "boolean",
        "defaultValue": false
      },
      "orientation": {
        "description": "An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).",
        "availableValues": [
          "horizontal",
          "vertical"
        ],
        "valueType": "string",
        "defaultValue": "vertical"
      },
      "horizontalAlignment": {
        "description": "Manages the horizontal content alignment for each child element in the Stack.",
        "availableValues": [
          "start",
          "center",
          "end"
        ],
        "valueType": "string",
        "defaultValue": "start"
      },
      "verticalAlignment": {
        "description": "Manages the vertical content alignment for each child element in the Stack.",
        "availableValues": [
          "start",
          "center",
          "end"
        ],
        "valueType": "string",
        "defaultValue": "start"
      },
      "hoverContainer": {
        "description": "Reserved for future use",
        "isInternal": true
      },
      "visibleOnHover": {
        "description": "Reserved for future use",
        "isInternal": true
      }
    },
    "events": {
      "click": {
        "description": "This event is triggered when the Stack is clicked."
      },
      "mounted": {
        "description": "Reserved for future use",
        "isInternal": true
      }
    },
  },
  "Button": {
    "description": "Button is an interactive element that triggers an action when clicked.",
    "status": "stable",
    "props": {
      "label": {
        "description": "This property is an optional string to set a label for the Button. If no label is specified and an icon is set, the Button will modify its styling to look like a small icon button. When the Button has nested children, it will display them and ignore the value of the `label` prop.",
        "type": "string"
      },
      "variant": {
        "description": "The button variant determines the level of emphasis the button should possess.",
        "isRequired": false,
        "type": "string",
        "availableValues": [
          {
            "value": "solid",
            "description": "A button with a border and a filled background."
          },
          {
            "value": "outlined",
            "description": "The button is displayed with a border and a transparent background."
          },
          {
            "value": "ghost",
            "description": "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked."
          }
        ],
        "defaultValue": "solid"
      },
    },
    "events": {
      "click": {
        "description": "This event is triggered when the Button is clicked."
      },
    },
  },
}

export const mockMetadataProvider = new MetadataProvider(mockMetadata as ComponentMetadataCollection);
