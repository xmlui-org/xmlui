export default {
  Accordion: {
    description:
      "(**NOT IMPLEMENTED YET**) The `Accordion` component is a collapsible container that toggles the display of content sections. It helps organize information by expanding or collapsing it based on user interaction.",
    status: "in progress",
    props: {
      triggerPosition: {
        description:
          "This property indicates the position where the trigger icon should be displayed. The `start` value signs the trigger is before the header text (template), and `end` indicates that it follows the header.",
        availableValues: ["start", "end"],
        valueType: null,
        defaultValue: "end",
      },
      collapsedIcon: {
        description:
          "This property is the name of the icon that is displayed when the accordion is collapsed.",
      },
      expandedIcon: {
        description:
          "This property is the name of the icon that is displayed when the accordion is expanded.",
      },
      hideIcon: {
        description: "This property indicates that the trigger icon is not displayed (`true`).",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
      },
      rotateExpanded: {
        description:
          "This optional property defines the rotation angle of the expanded icon (relative to the collapsed icon).",
      },
    },
    events: {
      displayDidChange: {
        description: "This event is triggered when value of Accordion has changed.",
      },
    },
    apis: {
      expanded: {
        description:
          "This property indicates if the Accordion is expanded (`true`) or collapsed (`false`).",
      },
      expand: {
        description: "This method expands the Accordion.",
      },
      collapse: {
        description: "This method collapses the Accordion.",
      },
      toggle: {
        description:
          "This method toggles the state of the Accordion between expanded and collapsed.",
      },
      focus: {
        description: "This method sets the focus on the Accordion.",
      },
    },
    themeVars: {
      "radius-Accordion": "var(--xmlui-radius-Accordion)",
      "color-border-Accordion": "var(--xmlui-color-border-Accordion)",
      "thickness-border-Accordion": "var(--xmlui-thickness-border-Accordion)",
      "style-border-Accordion": "var(--xmlui-style-border-Accordion)",
      "align-vertical-header-Accordion": "var(--xmlui-align-vertical-header-Accordion)",
      "font-size-header-Accordion": "var(--xmlui-font-size-header-Accordion)",
      "font-weight-header-Accordion": "var(--xmlui-font-weight-header-Accordion)",
      "font-style-header-Accordion": "var(--xmlui-font-style-header-Accordion)",
      "padding-vertical-header-Accordion": "var(--xmlui-padding-vertical-header-Accordion)",
      "padding-horizontal-header-Accordion": "var(--xmlui-padding-horizontal-header-Accordion)",
      "color-bg-header-Accordion": "var(--xmlui-color-bg-header-Accordion)",
      "color-header-Accordion": "var(--xmlui-color-header-Accordion)",
      "color-bg-header-Accordion-hover": "var(--xmlui-color-bg-header-Accordion-hover)",
      "color-content-Accordion": "var(--xmlui-color-content-Accordion)",
      "color-bg-content-Accordion": "var(--xmlui-color-bg-content-Accordion)",
      "width-icon-Accordion": "var(--xmlui-width-icon-Accordion)",
      "height-icon-Accordion": "var(--xmlui-height-icon-Accordion)",
      "color-icon-Accordion": "var(--xmlui-color-icon-Accordion)",
    },
    defaultThemeVars: {
      "padding-horizontal-header-Accordion": "$space-3",
      "padding-vertical-header-Accordion": "$space-3",
      "align-vertical-header-Accordion": "center",
      "font-size-header-Accordion": "$font-size-normal",
      "font-weight-header-Accordion": "$font-weight-normal",
      "font-family-header-Accordion": "$font-family",
      "radius-Accordion": "$radius",
      "thickness-border-Accordion": "0",
      "style-border-Accordion": "solid",
      "width-icon-Accordion": "",
      "height-icon-Accordion": "",
      light: {
        "color-bg-header-Accordion": "$color-primary-500",
        "color-bg-header-Accordion-hover": "$color-primary-400",
        "color-header-Accordion": "$color-surface-50",
        "color-content-Accordion": "$color-text-primary",
        "color-bg-content-Accordion": "transparent",
        "color-border-Accordion": "transparent",
        "color-icon-Accordion": "$color-surface-50",
      },
      dark: {
        "color-bg-header-Accordion": "$color-primary-500",
        "color-bg-header-Accordion-hover": "$color-primary-600",
        "color-header-Accordion": "$color-surface-50",
        "color-content-Accordion": "$color-text-primary",
        "color-bg-content-Accordion": "transparent",
        "color-border-Accordion": "transparent",
        "color-icon-Accordion": "$color-surface-50",
      },
    },
  },
  Alert: {
    description:
      "(**NOT IMPLEMENTED YET**) The `Alert` component is a panel used to display important notifications or feedback to users. It helps convey different statuses or levels of urgency, such as success, warning, error, and others.",
    status: "in progress",
    props: {
      statusColor: {
        description:
          "The value of this optional property sets the string to provide a color scheme for the Alert.",
        availableValues: [
          {
            value: "primary",
            description: "Primary theme color, no default icon",
          },
          {
            value: "secondary",
            description: "Secondary theme color, no default icon",
          },
          {
            value: "success",
            description: 'Success theme color, "success" icon',
          },
          {
            value: "danger",
            description: 'Warning theme color, "warning" icon',
          },
          {
            value: "warning",
            description: 'Danger theme color, "danger" icon',
          },
          {
            value: "info",
            description: 'Info theme color, "info" icon',
          },
          {
            value: "light",
            description: "Light theme color, no default icon",
          },
          {
            value: "dark",
            description: "Dark theme color, no default icon",
          },
        ],
        valueType: "string",
        defaultValue: "primary",
      },
      dismissable: {
        description:
          "This property's `true` value indicates if this alert is dismissable by the user. When the user closes the Alert, it gets hidden.",
      },
      autoDismissInMs: {
        description: "Timeout for the alert to be dismissed",
      },
      showIcon: {
        description: "Indicates if the alert should display an icon",
      },
      icon: {
        description: "Icon to be displayed in the alert",
      },
    },
    events: {},
    apis: {
      dismiss: {
        description:
          "This method dismisses the Alert. It triggers the `didDismiss` event with the argument set to `false`.",
      },
    },
    themeVars: [],
    defaultThemeVars: {
      light: {},
      dark: {},
    },
  },
  APICall: {
    description:
      "`APICall` is used to mutate (create, update or delete) some data on the backend. It is similar in nature to the `DataSource` component which retrieves data from the backend.",
    props: {
      method: {
        description:
          "The method of data manipulation can be done via setting this property. The following HTTP methods are available: `post`, `put`, and `delete`.",
        descriptionRef: "APICall/APICall.mdx?method",
      },
      url: {
        description: "Use this property to set the URL to send data to.",
        descriptionRef: "APICall/APICall.mdx?url",
      },
      rawBody: {
        description:
          "This property sets the request body to the value provided here without any conversion. Use the * `body` property if you want the object sent in JSON. When you define `body` and `rawBody`, the latest one prevails.",
        descriptionRef: "APICall/APICall.mdx?rawBody",
      },
      body: {
        description:
          "This property sets the request body. The object you pass here will be serialized to JSON when sending the request. Use the `rawBody` property to send another request body using its native format. When you define `body` and `rawBody`, the latest one prevails.",
        descriptionRef: "APICall/APICall.mdx?body",
      },
      queryParams: {
        description:
          "This property sets the query parameters for the request. The object you pass here will be serialized to a query string and appended to the request URL. You can specify key and value pairs where the key is the name of a particular query parameter and the value is that parameter's value.",
        descriptionRef: "APICall/APICall.mdx?queryParams",
      },
      headers: {
        description:
          "You can define request header values as key and value pairs, where the key is the ID of the particular header and the value is that header's value.",
        descriptionRef: "APICall/APICall.mdx?headers",
      },
      confirmTitle: {
        description:
          "This optional string sets the title in the confirmation dialog that is displayed before the `APICall` is executed.",
        descriptionRef: "APICall/APICall.mdx?confirmTitle",
      },
      confirmMessage: {
        description:
          "This optional string sets the message in the confirmation dialog that is displayed before the `APICall` is executed.",
        descriptionRef: "APICall/APICall.mdx?confirmMessage",
      },
      confirmButtonLabel: {
        description:
          "This optional string property enables the customization of the submit button in the confirmation dialog that is displayed before the `APICall` is executed.",
        descriptionRef: "APICall/APICall.mdx?confirmButtonLabel",
      },
      inProgressNotificationMessage: {
        description:
          "This property customizes the message that is displayed in a toast while the API operation is in progress.",
        descriptionRef: "APICall/APICall.mdx?inProgressNotificationMessage",
      },
      errorNotificationMessage: {
        description:
          "This property defines the message to display automatically when the operation results in an error.",
        descriptionRef: "APICall/APICall.mdx?errorNotificationMessage",
      },
      completedNotificationMessage: {
        description:
          "This property defines the message to display automatically when the operation has been completed.",
        descriptionRef: "APICall/APICall.mdx?completedNotificationMessage",
      },
      payloadType: {
        description: "This property is for internal use only.",
        isInternal: true,
        descriptionRef: "APICall/APICall.mdx?payloadType",
      },
      invalidates: {
        description: "This property is for internal use only.",
        isInternal: true,
        descriptionRef: "APICall/APICall.mdx?invalidates",
      },
      updates: {
        description: "This property is for internal use only.",
        isInternal: true,
        descriptionRef: "APICall/APICall.mdx?updates",
      },
      optimisticValue: {
        description: "This property is for internal use only.",
        isInternal: true,
        descriptionRef: "APICall/APICall.mdx?optimisticValue",
      },
      getOptimisticValue: {
        description: "This property is for internal use only.",
        isInternal: true,
        descriptionRef: "APICall/APICall.mdx?getOptimisticValue",
      },
    },
    events: {
      beforeRequest: {
        description:
          "This event fires before the request is sent. Returning an explicit boolean'false' value will prevent the request from being sent.",
        descriptionRef: "APICall/APICall.mdx?beforeRequest",
      },
      success: {
        description: "This event fires when a request results in a success.",
        descriptionRef: "APICall/APICall.mdx?success",
      },
      error: {
        description: "This event fires when a request results in an error.",
        descriptionRef: "APICall/APICall.mdx?error",
      },
      progress: {
        description: "This property is for internal use only.",
        isInternal: true,
        descriptionRef: "APICall/APICall.mdx?progress",
      },
    },
    contextVars: {
      $param: {
        description:
          "This value represents the first parameters passed to the `execute()` method to display the modal dialog.",
        descriptionRef: "APICall/APICall.mdx?$param",
      },
      $params: {
        description:
          "This value represents the array of parameters passed to the `execute()` method. You can use `$params[0]` to access the first and `$params[1]` to access the second (and so on) parameters. `$param` is the same as `$params[0]`.",
        descriptionRef: "APICall/APICall.mdx?$params",
      },
    },
    apis: {
      execute: {
        description:
          "This method triggers the invocation of the API. You can pass an arbitrary number of parameters to the method. In the `APICall` instance, you can access those with the `$param` and `$params` context values.",
        descriptionRef: "APICall/APICall.mdx?execute",
      },
    },
  },
  App: {
    description:
      "The `App` component provides a UI frame for XMLUI apps. According to predefined (and run-time configurable) structure templates, `App` allows you to display your preferred layout.",
    status: "stable",
    props: {
      layout: {
        description:
          "This property sets the layout template of the app. This setting determines the position and size of the app parts (such as header, navigation bar, footer, etc.) and the app's scroll behavior.",
        availableValues: [
          {
            value: "vertical",
            description:
              "This layout puts the navigation bar on the left side and displays its items vertically. The main content is aligned to the right (including the header and the footer), and its content is a single scroll container; every part of it moves as you scroll the page. This layout does not display the logo in the app header.",
          },
          {
            value: "vertical-sticky",
            description:
              "Similar to `vertical`, the header and the navigation bar dock to the top of the main content's viewport, while the footer sticks to the bottom. This layout does not display the logo in the app header.",
          },
          {
            value: "vertical-full-header",
            description:
              "Similar to `vertical-sticky`. However, the header and the navigation bar dock to the top of the app's window, while the footer sticks to the bottom.",
          },
          {
            value: "condensed",
            description:
              "Similar to `horizontal`. However, the header and the navigation bar are in a single header block. (default)",
          },
          {
            value: "condensed-sticky",
            description: "However, the header and the navigation bar are in a single header block.",
          },
          {
            value: "horizontal",
            description:
              "This layout stacks the layout sections in a single column in this order: header, navigation bar, main content, and footer. The application is a single scroll container; every part moves as you scroll the page.",
          },
          {
            value: "horizontal-sticky",
            description:
              "Similar to `horizontal`, the header and the navigation bar dock to the top of the viewport, while the footer sticks to the bottom.",
          },
        ],
        descriptionRef: "App/App.mdx?layout",
      },
      loggedInUser: {
        description: "Stores information about the currently logged in user.",
        descriptionRef: "App/App.mdx?loggedInUser",
      },
      logoTemplate: {
        description: "Optional template of the app logo",
        valueType: "ComponentDef",
        descriptionRef: "App/App.mdx?logoTemplate",
      },
      logo: {
        description: "Optional logo path",
        descriptionRef: "App/App.mdx?logo",
      },
      "logo-dark": {
        description: "Optional logo path in dark tone",
        descriptionRef: "App/App.mdx?logo-dark",
      },
      "logo-light": {
        description: "Optional logo path in light tone",
        descriptionRef: "App/App.mdx?logo-light",
      },
      name: {
        description: "Optional application name (visible in the browser tab)",
        descriptionRef: "App/App.mdx?name",
      },
      scrollWholePage: {
        description:
          "This boolean property specifies whether the whole page should scroll (`true`) or just the content area (`false`). The default value is `true`.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "App/App.mdx?scrollWholePage",
      },
      noScrollbarGutters: {
        description:
          "This boolean property specifies whether the scrollbar gutters should be hidden.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "App/App.mdx?noScrollbarGutters",
      },
      defaultTone: {
        description: 'This property sets the app\'s default tone ("light" or "dark").',
        availableValues: null,
        valueType: "string",
        defaultValue: "light",
        descriptionRef: "App/App.mdx?defaultTone",
      },
      defaultTheme: {
        description: "This property sets the app's default theme.",
        availableValues: null,
        valueType: "string",
        defaultValue: "xmlui",
        descriptionRef: "App/App.mdx?defaultTheme",
      },
    },
    events: {
      ready: {
        description: "This event fires when the `App` component finishes rendering on the page.",
        descriptionRef: "App/App.mdx?ready",
      },
    },
    themeVars: {
      "width-navPanel-App": "var(--xmlui-width-navPanel-App)",
      "shadow-header-App": "var(--xmlui-shadow-header-App)",
      "shadow-pages-App": "var(--xmlui-shadow-pages-App)",
      "max-content-width-App": "var(--xmlui-max-content-width-App)",
      "color-bg-AppHeader": "var(--xmlui-color-bg-AppHeader)",
      "border-bottom-AppHeader": "var(--xmlui-border-bottom-AppHeader)",
    },
    defaultThemeVars: {
      "width-navPanel-App": "$space-64",
      "max-content-width-App": "$max-content-width",
      "shadow-header-App": "$shadow-spread",
      "shadow-pages-App": "$shadow-spread",
      light: {},
      dark: {},
    },
  },
  AppHeader: {
    description: "`AppHeader` is a placeholder within `App` to define a custom application header.",
    status: "experimental",
    props: {
      profileMenuTemplate: {
        description:
          "This property makes the profile menu slot of the `AppHeader` component customizable.",
        valueType: "ComponentDef",
        descriptionRef: "AppHeader/AppHeader.mdx?profileMenuTemplate",
      },
      logoTemplate: {
        description:
          "This property defines the template to use for the logo. With this property, you can construct your custom logo instead of using a single image.",
        valueType: "ComponentDef",
        descriptionRef: "AppHeader/AppHeader.mdx?logoTemplate",
      },
      titleTemplate: {
        description:
          "This property defines the template to use for the title. With this property, you can construct your custom title instead of using a single image.",
        valueType: "ComponentDef",
        descriptionRef: "AppHeader/AppHeader.mdx?titleTemplate",
      },
      title: {
        description: "Title for the application logo",
        descriptionRef: "AppHeader/AppHeader.mdx?title",
      },
      showLogo: {
        description: "Show the logo in the header",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "AppHeader/AppHeader.mdx?showLogo",
      },
    },
    themeVars: {
      "padding-horizontal-AppHeader": "var(--xmlui-padding-horizontal-AppHeader)",
      "padding-vertical-AppHeader": "var(--xmlui-padding-vertical-AppHeader)",
      "padding-top-AppHeader": "var(--xmlui-padding-top-AppHeader)",
      "padding-bottom-AppHeader": "var(--xmlui-padding-bottom-AppHeader)",
      "padding-left-AppHeader": "var(--xmlui-padding-left-AppHeader)",
      "padding-right-AppHeader": "var(--xmlui-padding-right-AppHeader)",
      "padding-AppHeader": "var(--xmlui-padding-AppHeader)",
      "padding-horizontal-logo-AppHeader": "var(--xmlui-padding-horizontal-logo-AppHeader)",
      "padding-vertical-logo-AppHeader": "var(--xmlui-padding-vertical-logo-AppHeader)",
      "padding-top-logo-AppHeader": "var(--xmlui-padding-top-logo-AppHeader)",
      "padding-bottom-logo-AppHeader": "var(--xmlui-padding-bottom-logo-AppHeader)",
      "padding-left-logo-AppHeader": "var(--xmlui-padding-left-logo-AppHeader)",
      "padding-right-logo-AppHeader": "var(--xmlui-padding-right-logo-AppHeader)",
      "padding-logo-AppHeader": "var(--xmlui-padding-logo-AppHeader)",
      "color-border-horizontal-AppHeader": "var(--xmlui-color-border-horizontal-AppHeader)",
      "thickness-border-horizontal-AppHeader": "var(--xmlui-thickness-border-horizontal-AppHeader)",
      "style-border-horizontal-AppHeader": "var(--xmlui-style-border-horizontal-AppHeader)",
      "color-border-vertical-AppHeader": "var(--xmlui-color-border-vertical-AppHeader)",
      "thickness-border-vertical-AppHeader": "var(--xmlui-thickness-border-vertical-AppHeader)",
      "style-border-vertical-AppHeader": "var(--xmlui-style-border-vertical-AppHeader)",
      "color-border-left-AppHeader": "var(--xmlui-color-border-left-AppHeader)",
      "thickness-border-left-AppHeader": "var(--xmlui-thickness-border-left-AppHeader)",
      "style-border-left-AppHeader": "var(--xmlui-style-border-left-AppHeader)",
      "color-border-right-AppHeader": "var(--xmlui-color-border-right-AppHeader)",
      "thickness-border-right-AppHeader": "var(--xmlui-thickness-border-right-AppHeader)",
      "style-border-right-AppHeader": "var(--xmlui-style-border-right-AppHeader)",
      "color-border-top-AppHeader": "var(--xmlui-color-border-top-AppHeader)",
      "thickness-border-top-AppHeader": "var(--xmlui-thickness-border-top-AppHeader)",
      "style-border-top-AppHeader": "var(--xmlui-style-border-top-AppHeader)",
      "color-border-bottom-AppHeader": "var(--xmlui-color-border-bottom-AppHeader)",
      "thickness-border-bottom-AppHeader": "var(--xmlui-thickness-border-bottom-AppHeader)",
      "style-border-bottom-AppHeader": "var(--xmlui-style-border-bottom-AppHeader)",
      "color-border-AppHeader": "var(--xmlui-color-border-AppHeader)",
      "thickness-border-AppHeader": "var(--xmlui-thickness-border-AppHeader)",
      "style-border-AppHeader": "var(--xmlui-style-border-AppHeader)",
      "radius-AppHeader": "var(--xmlui-radius-AppHeader)",
      "width-logo-AppHeader": "var(--xmlui-width-logo-AppHeader)",
      "height-AppHeader": "var(--xmlui-height-AppHeader)",
      "color-bg-AppHeader": "var(--xmlui-color-bg-AppHeader)",
      "max-content-width-AppHeader": "var(--xmlui-max-content-width-AppHeader)",
    },
    defaultThemeVars: {
      "height-AppHeader": "$space-14",
      "max-content-width-AppHeader": "$max-content-width-App",
      "radius-AppHeader": "0px",
      "color-border-left-AppHeader": "$color-border",
      "thickness-border-left-AppHeader": "0",
      "style-border-left-AppHeader": "solid",
      "border-left-AppHeader":
        "$thickness-border-left-AppHeader $style-border-left-AppHeader $color-border-left-AppHeader",
      "color-border-right-AppHeader": "$color-border",
      "thickness-border-right-AppHeader": "0",
      "style-border-right-AppHeader": "solid",
      "border-right-AppHeader":
        "$thickness-border-right-AppHeader $style-border-right-AppHeader $color-border-right-AppHeader",
      "color-border-top-AppHeader": "$color-border",
      "thickness-border-top-AppHeader": "0",
      "style-border-top-AppHeader": "solid",
      "border-top-AppHeader":
        "$thickness-border-top-AppHeader $style-border-top-AppHeader $color-border-top-AppHeader",
      "color-border-bottom-AppHeader": "$color-border",
      "thickness-border-bottom-AppHeader": "1px",
      "style-border-bottom-AppHeader": "solid",
      "border-bottom-AppHeader":
        "$thickness-border-bottom-AppHeader $style-border-bottom-AppHeader $color-border-bottom-AppHeader",
      "color-border-horizontal-AppHeader": "$color-border",
      "thickness-border-horizontal-AppHeader": "0",
      "style-border-horizontal-AppHeader": "solid",
      "border-horizontal-AppHeader":
        "$thickness-border-horizontal-AppHeader $style-border-horizontal-AppHeader $color-border-horizontal-AppHeader",
      "color-border-vertical-AppHeader": "$color-border",
      "thickness-border-vertical-AppHeader": "0",
      "style-border-vertical-AppHeader": "solid",
      "border-vertical-AppHeader":
        "$thickness-border-vertical-AppHeader $style-border-vertical-AppHeader $color-border-vertical-AppHeader",
      "color-border-AppHeader": "$color-border",
      "thickness-border-AppHeader": "0",
      "style-border-AppHeader": "solid",
      "border-AppHeader": "0 solid $color-border ",
      "padding-left-logo-AppHeader": "$padding-horizontal-logo-AppHeader",
      "padding-right-logo-AppHeader": "$padding-horizontal-logo-AppHeader",
      "padding-top-logo-AppHeader": "$padding-vertical-logo-AppHeader",
      "padding-bottom-logo-AppHeader": "$padding-vertical-logo-AppHeader",
      "padding-horizontal-logo-AppHeader": "$space-0",
      "padding-vertical-logo-AppHeader": "$space-4",
      "padding-logo-AppHeader":
        "$padding-top-logo-AppHeader $padding-right-logo-AppHeader $padding-bottom-logo-AppHeader $padding-left-logo-AppHeader",
      "padding-left-AppHeader": "$padding-horizontal-AppHeader",
      "padding-right-AppHeader": "$padding-horizontal-AppHeader",
      "padding-top-AppHeader": "$padding-vertical-AppHeader",
      "padding-bottom-AppHeader": "$padding-vertical-AppHeader",
      "padding-horizontal-AppHeader": "$space-4",
      "padding-vertical-AppHeader": "$space-0",
      "padding-AppHeader":
        "$padding-top-AppHeader $padding-right-AppHeader $padding-bottom-AppHeader $padding-left-AppHeader",
      light: {
        "color-bg-AppHeader": "white",
      },
      dark: {
        "color-bg-AppHeader": "$color-surface-900",
      },
    },
  },
  AppState: {
    description:
      "AppState is a functional component (without a visible user interface) that helps store and manage the app's state.",
    props: {
      bucket: {
        description:
          "This property is the identifier of the bucket to which the `AppState` instance is bound. Multiple `AppState` instances with the same bucket will share the same state object: any of them updating the state will cause the other instances to view the new, updated state.",
        descriptionRef: "AppState/AppState.mdx?bucket",
      },
      initialValue: {
        description:
          "This property contains the initial state value. Though you can use multiple `AppState`component instances for the same bucket with their `initialValue` set, it may result in faulty app logic. When xmlui instantiates an `AppState` with an explicit initial value, that value is immediately set. Multiple initial values may result in undesired initialization.",
        descriptionRef: "AppState/AppState.mdx?initialValue",
      },
    },
    nonVisual: true,
  },
  AutoComplete: {
    description:
      "This component is a dropdown with a list of options. According to the `multi` property, the user can select one or more items.",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?initialValue",
      },
      maxLength: {
        description: "This property sets the maximum length of the input it accepts.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?maxLength",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "AutoComplete/AutoComplete.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "AutoComplete/AutoComplete.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "AutoComplete/AutoComplete.mdx?validationStatus",
      },
      dropdownHeight: {
        description: "This property sets the height of the dropdown list.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?dropdownHeight",
      },
      multi: {
        description:
          "The `true` value of the property indicates if the user can select multiple items.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "AutoComplete/AutoComplete.mdx?multi",
      },
      optionTemplate: {
        description:
          "This property enables the customization of list items. To access the attributes of a list item use the `$item` context variable.",
        valueType: "ComponentDef",
        descriptionRef: "AutoComplete/AutoComplete.mdx?optionTemplate",
      },
      emptyListTemplate: {
        description:
          "This property defines the template to display when the list of options is empty.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?emptyListTemplate",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the AutoComplete has received the focus.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the AutoComplete has lost the focus.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of AutoComplete has changed.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?didChange",
      },
    },
    contextVars: {
      $item: {
        description:
          "This context value represents an item when you define an option item template. Use `$item.value` and `$item.label` to refer to the value and label of the particular option.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?$item",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the AutoComplete.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?focus",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "AutoComplete/AutoComplete.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "AutoComplete/AutoComplete.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-AutoComplete-default": "var(--xmlui-radius-AutoComplete-default)",
      "Input:color-border-AutoComplete-default": "var(--xmlui-color-border-AutoComplete-default)",
      "Input:thickness-border-AutoComplete-default":
        "var(--xmlui-thickness-border-AutoComplete-default)",
      "Input:style-border-AutoComplete-default": "var(--xmlui-style-border-AutoComplete-default)",
      "Input:font-size-AutoComplete-default": "var(--xmlui-font-size-AutoComplete-default)",
      "Input:color-bg-AutoComplete-default": "var(--xmlui-color-bg-AutoComplete-default)",
      "Input:shadow-AutoComplete-default": "var(--xmlui-shadow-AutoComplete-default)",
      "Input:color-text-AutoComplete-default": "var(--xmlui-color-text-AutoComplete-default)",
      "Input:color-border-AutoComplete-default--hover":
        "var(--xmlui-color-border-AutoComplete-default--hover)",
      "Input:color-bg-AutoComplete-default--hover":
        "var(--xmlui-color-bg-AutoComplete-default--hover)",
      "Input:shadow-AutoComplete-default--hover": "var(--xmlui-shadow-AutoComplete-default--hover)",
      "Input:color-text-AutoComplete-default--hover":
        "var(--xmlui-color-text-AutoComplete-default--hover)",
      "Input:color-placeholder-AutoComplete-default":
        "var(--xmlui-color-placeholder-AutoComplete-default)",
      "Input:radius-AutoComplete-error": "var(--xmlui-radius-AutoComplete-error)",
      "Input:color-border-AutoComplete-error": "var(--xmlui-color-border-AutoComplete-error)",
      "Input:thickness-border-AutoComplete-error":
        "var(--xmlui-thickness-border-AutoComplete-error)",
      "Input:style-border-AutoComplete-error": "var(--xmlui-style-border-AutoComplete-error)",
      "Input:font-size-AutoComplete-error": "var(--xmlui-font-size-AutoComplete-error)",
      "Input:color-bg-AutoComplete-error": "var(--xmlui-color-bg-AutoComplete-error)",
      "Input:shadow-AutoComplete-error": "var(--xmlui-shadow-AutoComplete-error)",
      "Input:color-text-AutoComplete-error": "var(--xmlui-color-text-AutoComplete-error)",
      "Input:color-border-AutoComplete-error--hover":
        "var(--xmlui-color-border-AutoComplete-error--hover)",
      "Input:color-bg-AutoComplete-error--hover": "var(--xmlui-color-bg-AutoComplete-error--hover)",
      "Input:shadow-AutoComplete-error--hover": "var(--xmlui-shadow-AutoComplete-error--hover)",
      "Input:color-text-AutoComplete-error--hover":
        "var(--xmlui-color-text-AutoComplete-error--hover)",
      "Input:color-placeholder-AutoComplete-error":
        "var(--xmlui-color-placeholder-AutoComplete-error)",
      "Input:radius-AutoComplete-warning": "var(--xmlui-radius-AutoComplete-warning)",
      "Input:color-border-AutoComplete-warning": "var(--xmlui-color-border-AutoComplete-warning)",
      "Input:thickness-border-AutoComplete-warning":
        "var(--xmlui-thickness-border-AutoComplete-warning)",
      "Input:style-border-AutoComplete-warning": "var(--xmlui-style-border-AutoComplete-warning)",
      "Input:font-size-AutoComplete-warning": "var(--xmlui-font-size-AutoComplete-warning)",
      "Input:color-bg-AutoComplete-warning": "var(--xmlui-color-bg-AutoComplete-warning)",
      "Input:shadow-AutoComplete-warning": "var(--xmlui-shadow-AutoComplete-warning)",
      "Input:color-text-AutoComplete-warning": "var(--xmlui-color-text-AutoComplete-warning)",
      "Input:color-border-AutoComplete-warning--hover":
        "var(--xmlui-color-border-AutoComplete-warning--hover)",
      "Input:color-bg-AutoComplete-warning--hover":
        "var(--xmlui-color-bg-AutoComplete-warning--hover)",
      "Input:shadow-AutoComplete-warning--hover": "var(--xmlui-shadow-AutoComplete-warning--hover)",
      "Input:color-text-AutoComplete-warning--hover":
        "var(--xmlui-color-text-AutoComplete-warning--hover)",
      "Input:color-placeholder-AutoComplete-warning":
        "var(--xmlui-color-placeholder-AutoComplete-warning)",
      "Input:radius-AutoComplete-success": "var(--xmlui-radius-AutoComplete-success)",
      "Input:color-border-AutoComplete-success": "var(--xmlui-color-border-AutoComplete-success)",
      "Input:thickness-border-AutoComplete-success":
        "var(--xmlui-thickness-border-AutoComplete-success)",
      "Input:style-border-AutoComplete-success": "var(--xmlui-style-border-AutoComplete-success)",
      "Input:font-size-AutoComplete-success": "var(--xmlui-font-size-AutoComplete-success)",
      "Input:color-bg-AutoComplete-success": "var(--xmlui-color-bg-AutoComplete-success)",
      "Input:shadow-AutoComplete-success": "var(--xmlui-shadow-AutoComplete-success)",
      "Input:color-text-AutoComplete-success": "var(--xmlui-color-text-AutoComplete-success)",
      "Input:color-border-AutoComplete-success--hover":
        "var(--xmlui-color-border-AutoComplete-success--hover)",
      "Input:color-bg-AutoComplete-success--hover":
        "var(--xmlui-color-bg-AutoComplete-success--hover)",
      "Input:shadow-AutoComplete-success--hover": "var(--xmlui-shadow-AutoComplete-success--hover)",
      "Input:color-text-AutoComplete-success--hover":
        "var(--xmlui-color-text-AutoComplete-success--hover)",
      "Input:color-placeholder-AutoComplete-success":
        "var(--xmlui-color-placeholder-AutoComplete-success)",
      "Input:color-bg-AutoComplete--disabled": "var(--xmlui-color-bg-AutoComplete--disabled)",
      "Input:color-text-AutoComplete--disabled": "var(--xmlui-color-text-AutoComplete--disabled)",
      "Input:color-border-AutoComplete--disabled":
        "var(--xmlui-color-border-AutoComplete--disabled)",
      "Input:thickness-outline-AutoComplete--focus":
        "var(--xmlui-thickness-outline-AutoComplete--focus)",
      "Input:color-outline-AutoComplete--focus": "var(--xmlui-color-outline-AutoComplete--focus)",
      "Input:style-outline-AutoComplete--focus": "var(--xmlui-style-outline-AutoComplete--focus)",
      "Input:offset-outline-AutoComplete--focus": "var(--xmlui-offset-outline-AutoComplete--focus)",
      "padding-vertical-AutoComplete-badge": "var(--xmlui-padding-vertical-AutoComplete-badge)",
      "padding-horizontal-AutoComplete-badge": "var(--xmlui-padding-horizontal-AutoComplete-badge)",
      "Input:font-size-AutoComplete-badge": "var(--xmlui-font-size-AutoComplete-badge)",
      "Input:color-bg-AutoComplete-badge": "var(--xmlui-color-bg-AutoComplete-badge)",
      "Input:color-text-AutoComplete-badge": "var(--xmlui-color-text-AutoComplete-badge)",
      "Input:color-bg-AutoComplete-badge--hover": "var(--xmlui-color-bg-AutoComplete-badge--hover)",
      "Input:color-text-AutoComplete-badge--hover":
        "var(--xmlui-color-text-AutoComplete-badge--hover)",
      "Input:color-bg-AutoComplete-badge--active":
        "var(--xmlui-color-bg-AutoComplete-badge--active)",
      "Input:color-text-AutoComplete-badge--active":
        "var(--xmlui-color-text-AutoComplete-badge--active)",
      "Input:color-placeholder-AutoComplete": "var(--xmlui-color-placeholder-AutoComplete)",
      "Input:color-bg-menu-AutoComplete": "var(--xmlui-color-bg-menu-AutoComplete)",
      "Input:radius-menu-AutoComplete": "var(--xmlui-radius-menu-AutoComplete)",
      "Input:shadow-menu-AutoComplete": "var(--xmlui-shadow-menu-AutoComplete)",
      "color-bg-item-AutoComplete": "var(--xmlui-color-bg-item-AutoComplete)",
      "color-bg-item-AutoComplete--hover": "var(--xmlui-color-bg-item-AutoComplete--hover)",
      "color-text-item-AutoComplete--disabled":
        "var(--xmlui-color-text-item-AutoComplete--disabled)",
    },
    defaultThemeVars: {
      "color-bg-menu-AutoComplete": "$color-bg-primary",
      "shadow-menu-AutoComplete": "$shadow-md",
      "radius-menu-AutoComplete": "$radius",
      "color-bg-item-AutoComplete": "$color-bg-dropdown-item",
      "color-bg-item-AutoComplete--hover": "$color-bg-dropdown-item--active",
      "color-bg-item-AutoComplete--active": "$color-bg-dropdown-item--active",
      "min-height-Input": "39px",
      "color-bg-AutoComplete-badge": "$color-primary-500",
      "font-size-AutoComplete-badge": "$font-size-small",
      "padding-horizontal-AutoComplete-badge": "$space-1",
      "padding-vertical-AutoComplete-badge": "$space-1",
      light: {
        "color-bg-AutoComplete-badge--hover": "$color-primary-400",
        "color-bg-AutoComplete-badge--active": "$color-primary-500",
        "color-text-item-AutoComplete--disabled": "$color-surface-200",
        "color-text-AutoComplete-badge": "$color-surface-50",
      },
      dark: {
        "color-bg-AutoComplete-badge--hover": "$color-primary-600",
        "color-bg-AutoComplete-badge--active": "$color-primary-500",
        "color-text-AutoComplete-badge": "$color-surface-50",
        "color-text-item-AutoComplete--disabled": "$color-surface-800",
      },
    },
  },
  Avatar: {
    description:
      "The `Avatar` component represents a user, group (or other entity's) avatar with a small image or initials.",
    props: {
      size: {
        description: "This property defines the display size of the Avatar.",
        availableValues: [
          {
            value: "xs",
            description: "Extra small button",
          },
          {
            value: "sm",
            description: "Small button",
          },
          {
            value: "md",
            description: "Medium button",
          },
          {
            value: "lg",
            description: "Large button",
          },
        ],
        valueType: "string",
        defaultValue: "sm",
        descriptionRef: "Avatar/Avatar.mdx?size",
      },
      name: {
        description: "This property sets the name value the Avatar uses to display initials.",
        descriptionRef: "Avatar/Avatar.mdx?name",
      },
      url: {
        description: "This property specifies the URL of the image to display in the Avatar.",
        descriptionRef: "Avatar/Avatar.mdx?url",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the avatar is clicked.",
        descriptionRef: "Avatar/Avatar.mdx?click",
      },
    },
    themeVars: {
      "color-bg-Avatar": "var(--xmlui-color-bg-Avatar)",
      "color-border-Avatar": "var(--xmlui-color-border-Avatar)",
      "thickness-border-Avatar": "var(--xmlui-thickness-border-Avatar)",
      "style-border-Avatar": "var(--xmlui-style-border-Avatar)",
      "border-Avatar": "var(--xmlui-border-Avatar)",
      "radius-Avatar": "var(--xmlui-radius-Avatar)",
      "shadow-Avatar": "var(--xmlui-shadow-Avatar)",
      "color-text-Avatar": "var(--xmlui-color-text-Avatar)",
      "font-weight-Avatar": "var(--xmlui-font-weight-Avatar)",
    },
    defaultThemeVars: {
      "radius-Avatar": "4px",
      "thickness-border-Avatar": "0px",
      "style-border-Avatar": "solid",
      "border-Avatar": "$thickness-border-Avatar $style-border-Avatar $color-border-Avatar",
      "shadow-Avatar": "inset 0 0 0 1px rgba(4,32,69,0.1)",
      "color-text-Avatar": "$color-text-secondary",
      "font-weight-Avatar": "$font-weight-bold",
      light: {
        "color-bg-Avatar": "$color-surface-100",
        "color-border-Avatar": "$color-surface-400A80",
      },
      dark: {
        "color-bg-Avatar": "$color-surface-800",
        "color-border-Avatar": "$color-surface-700",
      },
    },
  },
  Badge: {
    description:
      "The `Badge` is a text label that accepts a color map to define its background color and, optionally, its label color.",
    status: "stable",
    props: {
      value: {
        description: "The text that the component displays",
        descriptionRef: "Badge/Badge.mdx?value",
      },
      variant: {
        description:
          "Modifies the shape of the component. Comes in the regular `badge` variant or the `pill` variant with fully rounded corners.",
        descriptionRef: "Badge/Badge.mdx?variant",
      },
      colorMap: {
        description:
          "The `Badge` component supports the mapping of a list of colors using the `value` prop as the key. Provide the component with a list or key-value pairs in two ways:",
        descriptionRef: "Badge/Badge.mdx?colorMap",
      },
      themeColor: {
        description: "(**NOT IMPLEMENTED YET**) The theme color of the component.",
        descriptionRef: "Badge/Badge.mdx?themeColor",
      },
      indicatorText: {
        description:
          "(**NOT IMPLEMENTED YET**) This property defines the text to display in the indicator. If it is not defined or empty, no indicator is displayed unless the `forceIndicator` property is set.",
        descriptionRef: "Badge/Badge.mdx?indicatorText",
      },
      forceIndicator: {
        description:
          "(**NOT IMPLEMENTED YET**) This property forces the display of the indicator, even if the `indicatorText` property is not defined or empty.",
        descriptionRef: "Badge/Badge.mdx?forceIndicator",
      },
      indicatorThemeColor: {
        description: "(**NOT IMPLEMENTED YET**) The theme color of the indicator.",
        descriptionRef: "Badge/Badge.mdx?indicatorThemeColor",
      },
      indicatorPosition: {
        description: "(**NOT IMPLEMENTED YET**) The position of the indicator.",
        descriptionRef: "Badge/Badge.mdx?indicatorPosition",
      },
    },
    events: {},
    themeVars: {
      "color-bg-Badge": "var(--xmlui-color-bg-Badge)",
      "radius-Badge": "var(--xmlui-radius-Badge)",
      "color-text-Badge": "var(--xmlui-color-text-Badge)",
      "font-size-Badge": "var(--xmlui-font-size-Badge)",
      "font-size-Badge-pill": "var(--xmlui-font-size-Badge-pill)",
      "font-weight-Badge": "var(--xmlui-font-weight-Badge)",
      "font-weight-Badge-pill": "var(--xmlui-font-weight-Badge-pill)",
      "padding-horizontal-Badge": "var(--xmlui-padding-horizontal-Badge)",
      "padding-vertical-Badge": "var(--xmlui-padding-vertical-Badge)",
      "padding-Badge": "var(--xmlui-padding-Badge)",
      "padding-horizontal-Badge-pill": "var(--xmlui-padding-horizontal-Badge-pill)",
      "padding-vertical-Badge-pill": "var(--xmlui-padding-vertical-Badge-pill)",
      "padding-Badge-pill": "var(--xmlui-padding-Badge-pill)",
    },
    defaultThemeVars: {
      "padding-horizontal-Badge": "$space-2",
      "padding-vertical-Badge": "$space-0_5",
      "padding-Badge": "$padding-vertical-Badge $padding-horizontal-Badge",
      "padding-Badge-pill": "$padding-vertical-Badge-pill $padding-horizontal-Badge-pill",
      "radius-Badge": "4px",
      "font-size-Badge": "0.8em",
      "font-size-Badge-pill": "0.8em",
      light: {
        "color-bg-Badge": "rgba($color-secondary-500-rgb, .6)",
        "color-text-Badge": "white",
      },
      dark: {
        "color-bg-Badge": "rgba($color-secondary-500-rgb, .6)",
        "color-text-Badge": "$color-surface-50",
      },
    },
  },
  BarChart: {
    description: "The `BarChart` component represents a bar chart.",
    status: "deprecated",
    props: {
      data: {
        description:
          "This property is used to provide the component with data to display. The data itself needs to be an array of objects.",
      },
      keys: {
        description: "This property specifies what the label texts are for each bar.",
      },
      groupMode: {
        description:
          "This property determines how the bars are layed out. The `grouped` variant lays out the bars next to each other on the primary axis. The `stacked` variant stacks the bars on top of each other.",
      },
      layout: {
        description:
          "This property determines the orientation of the bar chart. The `vertical` variant specifies the horizontal axis as the primary and lays out the bars from left to right. The `horizontal` variant specifies the vertical axis as the primary and has the bars spread from top to bottom.",
      },
      indexBy: {
        description: "Determines which attribute groups the bars together.",
      },
    },
    themeVars: {
      "color-PieChart": "var(--xmlui-color-PieChart)",
    },
    defaultThemeVars: {
      "scheme-BarChart": "pastel1",
      "color-text-BarChart": "$color-text-secondary",
      "color-ticks-BarChart": "$color-text-primary",
      "color-bg-tooltip-BarChart": "$color-bg-primary",
      "color-text-tooltip-BarChart": "$color-text-primary",
      "color-axis-BarChart": "$color-text-primary",
      light: {
        "scheme-BarChart": "set3",
      },
      dark: {
        "scheme-BarChart": "dark2",
      },
    },
  },
  Bookmark: {
    description:
      "As its name suggests, this component places a bookmark into its parent component's view. The component has an `id` that you can use in links to navigate (scroll to) the bookmark's location.",
    props: {
      id: {
        description:
          "The unique identifier of the bookmark. You can use this identifier in links to navigate to this component's location.",
        descriptionRef: "Bookmark/Bookmark.mdx?id",
      },
      level: {
        description:
          "The level of the bookmark. The level is used to determine the bookmark's position in the table of contents.",
        descriptionRef: "Bookmark/Bookmark.mdx?level",
      },
    },
    opaque: true,
  },
  Breakout: {
    description:
      "The `Breakout` component creates a breakout section. It allows its child to occupy the entire width of the UI even if the app or the parent container constrains the maximum content width.",
  },
  Button: {
    description: "Button is an interactive element that triggers an action when clicked.",
    status: "stable",
    props: {
      autoFocus: {
        description: "Indicates if the button should receive focus when the page loads.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Button/Button.mdx?autoFocus",
      },
      variant: {
        description:
          "The button variant determines the level of emphasis the button should possess.",
        availableValues: [
          {
            value: "solid",
            description: "A button with a border and a filled background.",
          },
          {
            value: "outlined",
            description: "The button is displayed with a border and a transparent background.",
          },
          {
            value: "ghost",
            description:
              "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked.",
          },
        ],
        valueType: "string",
        defaultValue: "solid",
        descriptionRef: "Button/Button.mdx?variant",
      },
      themeColor: {
        description: "Sets the button color scheme defined in the application theme.",
        availableValues: [
          {
            value: "attention",
            description: "Attention state theme color",
          },
          {
            value: "primary",
            description: "Primary theme color",
          },
          {
            value: "secondary",
            description: "Secondary theme color",
          },
        ],
        valueType: "string",
        defaultValue: "primary",
        descriptionRef: "Button/Button.mdx?themeColor",
      },
      size: {
        description: "The size of the button.",
        availableValues: [
          {
            value: "xs",
            description: "Extra small button",
          },
          {
            value: "sm",
            description: "Small button",
          },
          {
            value: "md",
            description: "Medium button",
          },
          {
            value: "lg",
            description: "Large button",
          },
        ],
        valueType: "string",
        defaultValue: "sm",
        descriptionRef: "Button/Button.mdx?size",
      },
      label: {
        description:
          "This property is an optional string to set a label for the Button. If no label is specified and an icon is set, the Button will modify its styling to look like a small icon button. When the Button has nested children, it will display them and ignore the value of the `label` prop.",
        descriptionRef: "Button/Button.mdx?label",
      },
      type: {
        description:
          "This optional string describes how the Button appears in an HTML context. You rarely need to set this property explicitly.",
        availableValues: [
          {
            value: "button",
            description: "Regular behavior that only executes logic if explicitly determined.",
          },
          {
            value: "submit",
            description:
              "The button submits the form data to the server. This is the default for buttons in a Form or NativeForm component.",
          },
          {
            value: "reset",
            description:
              "Resets all the controls to their initial values. Using it is ill advised for UX reasons.",
          },
        ],
        valueType: "string",
        defaultValue: "button",
        descriptionRef: "Button/Button.mdx?type",
      },
      enabled: {
        description:
          "The value of this property indicates whether the button accepts actions (`true`) or does not react to them (`false`).",
        availableValues: null,
        valueType: null,
        defaultValue: true,
        descriptionRef: "Button/Button.mdx?enabled",
      },
      icon: {
        description:
          "This string value denotes an icon name. The framework will render an icon if XMLUI recognizes the icon by its name. If no label is specified and an icon is set, the Button displays only that icon.",
        descriptionRef: "Button/Button.mdx?icon",
      },
      iconPosition: {
        description: "This optional string determines the location of the icon in the Button.",
        availableValues: [
          {
            value: "left",
            description: "The icon will appear on the left side",
          },
          {
            value: "right",
            description: "The icon will appear on the right side",
          },
          {
            value: "start",
            description:
              "The icon will appear at the start (left side when the left-to-right direction is set)",
          },
          {
            value: "end",
            description:
              "The icon will appear at the end (right side when the left-to-right direction is set)",
          },
        ],
        valueType: "string",
        defaultValue: "left",
        descriptionRef: "Button/Button.mdx?iconPosition",
      },
      contentPosition: {
        description:
          "This optional value determines how the label and icon (or nested children) should be placedinside the Button component.",
        availableValues: [
          {
            value: "center",
            description: "Place the content in the middle",
          },
          {
            value: "start",
            description: "Justify the content to the left (to the right if in right-to-left)",
          },
          {
            value: "end",
            description: "Justify the content to the right (to the left if in right-to-left)",
          },
        ],
        valueType: "string",
        defaultValue: "center",
        descriptionRef: "Button/Button.mdx?contentPosition",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Button is clicked.",
        descriptionRef: "Button/Button.mdx?click",
      },
      gotFocus: {
        description: "This event is triggered when the Button has received the focus.",
        descriptionRef: "Button/Button.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the Button has lost the focus.",
        descriptionRef: "Button/Button.mdx?lostFocus",
      },
    },
    themeVars: {
      "width-Button": "var(--xmlui-width-Button)",
      "height-Button": "var(--xmlui-height-Button)",
      "padding-vertical-xs-Button": "var(--xmlui-padding-vertical-xs-Button)",
      "padding-horizontal-xs-Button": "var(--xmlui-padding-horizontal-xs-Button)",
      "padding-vertical-sm-Button": "var(--xmlui-padding-vertical-sm-Button)",
      "padding-horizontal-sm-Button": "var(--xmlui-padding-horizontal-sm-Button)",
      "padding-vertical-md-Button": "var(--xmlui-padding-vertical-md-Button)",
      "padding-horizontal-md-Button": "var(--xmlui-padding-horizontal-md-Button)",
      "padding-vertical-lg-Button": "var(--xmlui-padding-vertical-lg-Button)",
      "padding-horizontal-lg-Button": "var(--xmlui-padding-horizontal-lg-Button)",
      "font-size-Button-primary-solid": "var(--xmlui-font-size-Button-primary-solid)",
      "font-weight-Button-primary-solid": "var(--xmlui-font-weight-Button-primary-solid)",
      "radius-Button-primary-solid": "var(--xmlui-radius-Button-primary-solid)",
      "thickness-border-Button-primary-solid": "var(--xmlui-thickness-border-Button-primary-solid)",
      "color-border-Button-primary-solid": "var(--xmlui-color-border-Button-primary-solid)",
      "style-border-Button-primary-solid": "var(--xmlui-style-border-Button-primary-solid)",
      "color-bg-Button-primary-solid": "var(--xmlui-color-bg-Button-primary-solid)",
      "color-text-Button-primary-solid": "var(--xmlui-color-text-Button-primary-solid)",
      "shadow-Button-primary-solid": "var(--xmlui-shadow-Button-primary-solid)",
      "thickness-outline-Button-primary-solid--focus":
        "var(--xmlui-thickness-outline-Button-primary-solid--focus)",
      "color-outline-Button-primary-solid--focus":
        "var(--xmlui-color-outline-Button-primary-solid--focus)",
      "style-outline-Button-primary-solid--focus":
        "var(--xmlui-style-outline-Button-primary-solid--focus)",
      "offset-outline-Button-primary-solid--focus":
        "var(--xmlui-offset-outline-Button-primary-solid--focus)",
      "color-border-Button-primary-solid--hover":
        "var(--xmlui-color-border-Button-primary-solid--hover)",
      "color-bg-Button-primary-solid--hover": "var(--xmlui-color-bg-Button-primary-solid--hover)",
      "color-text-Button-primary-solid--hover":
        "var(--xmlui-color-text-Button-primary-solid--hover)",
      "color-border-Button-primary-solid--active":
        "var(--xmlui-color-border-Button-primary-solid--active)",
      "color-bg-Button-primary-solid--active": "var(--xmlui-color-bg-Button-primary-solid--active)",
      "color-text-Button-primary-solid--active":
        "var(--xmlui-color-text-Button-primary-solid--active)",
      "color-bg-Button--disabled": "var(--xmlui-color-bg-Button--disabled)",
      "color-text-Button--disabled": "var(--xmlui-color-text-Button--disabled)",
      "color-border-Button--disabled": "var(--xmlui-color-border-Button--disabled)",
      "font-size-Button-secondary-solid": "var(--xmlui-font-size-Button-secondary-solid)",
      "font-weight-Button-secondary-solid": "var(--xmlui-font-weight-Button-secondary-solid)",
      "radius-Button-secondary-solid": "var(--xmlui-radius-Button-secondary-solid)",
      "thickness-border-Button-secondary-solid":
        "var(--xmlui-thickness-border-Button-secondary-solid)",
      "color-border-Button-secondary-solid": "var(--xmlui-color-border-Button-secondary-solid)",
      "style-border-Button-secondary-solid": "var(--xmlui-style-border-Button-secondary-solid)",
      "color-bg-Button-secondary-solid": "var(--xmlui-color-bg-Button-secondary-solid)",
      "color-text-Button-secondary-solid": "var(--xmlui-color-text-Button-secondary-solid)",
      "shadow-Button-secondary-solid": "var(--xmlui-shadow-Button-secondary-solid)",
      "thickness-outline-Button-secondary-solid--focus":
        "var(--xmlui-thickness-outline-Button-secondary-solid--focus)",
      "color-outline-Button-secondary-solid--focus":
        "var(--xmlui-color-outline-Button-secondary-solid--focus)",
      "style-outline-Button-secondary-solid--focus":
        "var(--xmlui-style-outline-Button-secondary-solid--focus)",
      "offset-outline-Button-secondary-solid--focus":
        "var(--xmlui-offset-outline-Button-secondary-solid--focus)",
      "color-border-Button-secondary-solid--hover":
        "var(--xmlui-color-border-Button-secondary-solid--hover)",
      "color-bg-Button-secondary-solid--hover":
        "var(--xmlui-color-bg-Button-secondary-solid--hover)",
      "color-text-Button-secondary-solid--hover":
        "var(--xmlui-color-text-Button-secondary-solid--hover)",
      "color-border-Button-secondary-solid--active":
        "var(--xmlui-color-border-Button-secondary-solid--active)",
      "color-bg-Button-secondary-solid--active":
        "var(--xmlui-color-bg-Button-secondary-solid--active)",
      "color-text-Button-secondary-solid--active":
        "var(--xmlui-color-text-Button-secondary-solid--active)",
      "font-size-Button-attention-solid": "var(--xmlui-font-size-Button-attention-solid)",
      "font-weight-Button-attention-solid": "var(--xmlui-font-weight-Button-attention-solid)",
      "radius-Button-attention-solid": "var(--xmlui-radius-Button-attention-solid)",
      "thickness-border-Button-attention-solid":
        "var(--xmlui-thickness-border-Button-attention-solid)",
      "color-border-Button-attention-solid": "var(--xmlui-color-border-Button-attention-solid)",
      "style-border-Button-attention-solid": "var(--xmlui-style-border-Button-attention-solid)",
      "color-bg-Button-attention-solid": "var(--xmlui-color-bg-Button-attention-solid)",
      "color-text-Button-attention-solid": "var(--xmlui-color-text-Button-attention-solid)",
      "shadow-Button-attention-solid": "var(--xmlui-shadow-Button-attention-solid)",
      "thickness-outline-Button-attention-solid--focus":
        "var(--xmlui-thickness-outline-Button-attention-solid--focus)",
      "color-outline-Button-attention-solid--focus":
        "var(--xmlui-color-outline-Button-attention-solid--focus)",
      "style-outline-Button-attention-solid--focus":
        "var(--xmlui-style-outline-Button-attention-solid--focus)",
      "offset-outline-Button-attention-solid--focus":
        "var(--xmlui-offset-outline-Button-attention-solid--focus)",
      "color-border-Button-attention-solid--hover":
        "var(--xmlui-color-border-Button-attention-solid--hover)",
      "color-bg-Button-attention-solid--hover":
        "var(--xmlui-color-bg-Button-attention-solid--hover)",
      "color-text-Button-attention-solid--hover":
        "var(--xmlui-color-text-Button-attention-solid--hover)",
      "color-border-Button-attention-solid--active":
        "var(--xmlui-color-border-Button-attention-solid--active)",
      "color-bg-Button-attention-solid--active":
        "var(--xmlui-color-bg-Button-attention-solid--active)",
      "color-text-Button-attention-solid--active":
        "var(--xmlui-color-text-Button-attention-solid--active)",
      "font-size-Button-primary-outlined": "var(--xmlui-font-size-Button-primary-outlined)",
      "font-weight-Button-primary-outlined": "var(--xmlui-font-weight-Button-primary-outlined)",
      "radius-Button-primary-outlined": "var(--xmlui-radius-Button-primary-outlined)",
      "thickness-border-Button-primary-outlined":
        "var(--xmlui-thickness-border-Button-primary-outlined)",
      "color-border-Button-primary-outlined": "var(--xmlui-color-border-Button-primary-outlined)",
      "style-border-Button-primary-outlined": "var(--xmlui-style-border-Button-primary-outlined)",
      "color-text-Button-primary-outlined": "var(--xmlui-color-text-Button-primary-outlined)",
      "shadow-Button-primary-outlined": "var(--xmlui-shadow-Button-primary-outlined)",
      "thickness-outline-Button-primary-outlined--focus":
        "var(--xmlui-thickness-outline-Button-primary-outlined--focus)",
      "color-outline-Button-primary-outlined--focus":
        "var(--xmlui-color-outline-Button-primary-outlined--focus)",
      "style-outline-Button-primary-outlined--focus":
        "var(--xmlui-style-outline-Button-primary-outlined--focus)",
      "offset-outline-Button-primary-outlined--focus":
        "var(--xmlui-offset-outline-Button-primary-outlined--focus)",
      "color-border-Button-primary-outlined--hover":
        "var(--xmlui-color-border-Button-primary-outlined--hover)",
      "color-bg-Button-primary-outlined--hover":
        "var(--xmlui-color-bg-Button-primary-outlined--hover)",
      "color-text-Button-primary-outlined--hover":
        "var(--xmlui-color-text-Button-primary-outlined--hover)",
      "color-border-Button-primary-outlined--active":
        "var(--xmlui-color-border-Button-primary-outlined--active)",
      "color-bg-Button-primary-outlined--active":
        "var(--xmlui-color-bg-Button-primary-outlined--active)",
      "color-text-Button-primary-outlined--active":
        "var(--xmlui-color-text-Button-primary-outlined--active)",
      "font-size-Button-secondary-outlined": "var(--xmlui-font-size-Button-secondary-outlined)",
      "font-weight-Button-secondary-outlined": "var(--xmlui-font-weight-Button-secondary-outlined)",
      "radius-Button-secondary-outlined": "var(--xmlui-radius-Button-secondary-outlined)",
      "thickness-border-Button-secondary-outlined":
        "var(--xmlui-thickness-border-Button-secondary-outlined)",
      "color-border-Button-secondary-outlined":
        "var(--xmlui-color-border-Button-secondary-outlined)",
      "style-border-Button-secondary-outlined":
        "var(--xmlui-style-border-Button-secondary-outlined)",
      "color-text-Button-secondary-outlined": "var(--xmlui-color-text-Button-secondary-outlined)",
      "shadow-Button-secondary-outlined": "var(--xmlui-shadow-Button-secondary-outlined)",
      "thickness-outline-Button-secondary-outlined--focus":
        "var(--xmlui-thickness-outline-Button-secondary-outlined--focus)",
      "color-outline-Button-secondary-outlined--focus":
        "var(--xmlui-color-outline-Button-secondary-outlined--focus)",
      "style-outline-Button-secondary-outlined--focus":
        "var(--xmlui-style-outline-Button-secondary-outlined--focus)",
      "offset-outline-Button-secondary-outlined--focus":
        "var(--xmlui-offset-outline-Button-secondary-outlined--focus)",
      "color-border-Button-secondary-outlined--hover":
        "var(--xmlui-color-border-Button-secondary-outlined--hover)",
      "color-bg-Button-secondary-outlined--hover":
        "var(--xmlui-color-bg-Button-secondary-outlined--hover)",
      "color-text-Button-secondary-outlined--hover":
        "var(--xmlui-color-text-Button-secondary-outlined--hover)",
      "color-border-Button-secondary-outlined--active":
        "var(--xmlui-color-border-Button-secondary-outlined--active)",
      "color-bg-Button-secondary-outlined--active":
        "var(--xmlui-color-bg-Button-secondary-outlined--active)",
      "color-text-Button-secondary-outlined--active":
        "var(--xmlui-color-text-Button-secondary-outlined--active)",
      "font-size-Button-attention-outlined": "var(--xmlui-font-size-Button-attention-outlined)",
      "font-weight-Button-attention-outlined": "var(--xmlui-font-weight-Button-attention-outlined)",
      "radius-Button-attention-outlined": "var(--xmlui-radius-Button-attention-outlined)",
      "thickness-border-Button-attention-outlined":
        "var(--xmlui-thickness-border-Button-attention-outlined)",
      "color-border-Button-attention-outlined":
        "var(--xmlui-color-border-Button-attention-outlined)",
      "style-border-Button-attention-outlined":
        "var(--xmlui-style-border-Button-attention-outlined)",
      "color-text-Button-attention-outlined": "var(--xmlui-color-text-Button-attention-outlined)",
      "shadow-Button-attention-outlined": "var(--xmlui-shadow-Button-attention-outlined)",
      "thickness-outline-Button-attention-outlined--focus":
        "var(--xmlui-thickness-outline-Button-attention-outlined--focus)",
      "color-outline-Button-attention-outlined--focus":
        "var(--xmlui-color-outline-Button-attention-outlined--focus)",
      "style-outline-Button-attention-outlined--focus":
        "var(--xmlui-style-outline-Button-attention-outlined--focus)",
      "offset-outline-Button-attention-outlined--focus":
        "var(--xmlui-offset-outline-Button-attention-outlined--focus)",
      "color-border-Button-attention-outlined--hover":
        "var(--xmlui-color-border-Button-attention-outlined--hover)",
      "color-bg-Button-attention-outlined--hover":
        "var(--xmlui-color-bg-Button-attention-outlined--hover)",
      "color-text-Button-attention-outlined--hover":
        "var(--xmlui-color-text-Button-attention-outlined--hover)",
      "color-border-Button-attention-outlined--active":
        "var(--xmlui-color-border-Button-attention-outlined--active)",
      "color-bg-Button-attention-outlined--active":
        "var(--xmlui-color-bg-Button-attention-outlined--active)",
      "color-text-Button-attention-outlined--active":
        "var(--xmlui-color-text-Button-attention-outlined--active)",
      "font-size-Button-primary-ghost": "var(--xmlui-font-size-Button-primary-ghost)",
      "font-weight-Button-primary-ghost": "var(--xmlui-font-weight-Button-primary-ghost)",
      "radius-Button-primary-ghost": "var(--xmlui-radius-Button-primary-ghost)",
      "thickness-border-Button-primary-ghost": "var(--xmlui-thickness-border-Button-primary-ghost)",
      "color-text-Button-primary-ghost": "var(--xmlui-color-text-Button-primary-ghost)",
      "thickness-outline-Button-primary-ghost--focus":
        "var(--xmlui-thickness-outline-Button-primary-ghost--focus)",
      "color-outline-Button-primary-ghost--focus":
        "var(--xmlui-color-outline-Button-primary-ghost--focus)",
      "style-outline-Button-primary-ghost--focus":
        "var(--xmlui-style-outline-Button-primary-ghost--focus)",
      "offset-outline-Button-primary-ghost--focus":
        "var(--xmlui-offset-outline-Button-primary-ghost--focus)",
      "color-bg-Button-primary-ghost--hover": "var(--xmlui-color-bg-Button-primary-ghost--hover)",
      "color-text-Button-primary-ghost--hover":
        "var(--xmlui-color-text-Button-primary-ghost--hover)",
      "color-bg-Button-primary-ghost--active": "var(--xmlui-color-bg-Button-primary-ghost--active)",
      "color-text-Button-primary-ghost--active":
        "var(--xmlui-color-text-Button-primary-ghost--active)",
      "font-size-Button-secondary-ghost": "var(--xmlui-font-size-Button-secondary-ghost)",
      "font-weight-Button-secondary-ghost": "var(--xmlui-font-weight-Button-secondary-ghost)",
      "radius-Button-secondary-ghost": "var(--xmlui-radius-Button-secondary-ghost)",
      "thickness-border-Button-secondary-ghost":
        "var(--xmlui-thickness-border-Button-secondary-ghost)",
      "color-text-Button-secondary-ghost": "var(--xmlui-color-text-Button-secondary-ghost)",
      "thickness-outline-Button-secondary-ghost--focus":
        "var(--xmlui-thickness-outline-Button-secondary-ghost--focus)",
      "color-outline-Button-secondary-ghost--focus":
        "var(--xmlui-color-outline-Button-secondary-ghost--focus)",
      "style-outline-Button-secondary-ghost--focus":
        "var(--xmlui-style-outline-Button-secondary-ghost--focus)",
      "offset-outline-Button-secondary-ghost--focus":
        "var(--xmlui-offset-outline-Button-secondary-ghost--focus)",
      "color-bg-Button-secondary-ghost--hover":
        "var(--xmlui-color-bg-Button-secondary-ghost--hover)",
      "color-text-Button-secondary-ghost--hover":
        "var(--xmlui-color-text-Button-secondary-ghost--hover)",
      "color-bg-Button-secondary-ghost--active":
        "var(--xmlui-color-bg-Button-secondary-ghost--active)",
      "color-text-Button-secondary-ghost--active":
        "var(--xmlui-color-text-Button-secondary-ghost--active)",
      "font-size-Button-attention-ghost": "var(--xmlui-font-size-Button-attention-ghost)",
      "font-weight-Button-attention-ghost": "var(--xmlui-font-weight-Button-attention-ghost)",
      "radius-Button-attention-ghost": "var(--xmlui-radius-Button-attention-ghost)",
      "thickness-border-Button-attention-ghost":
        "var(--xmlui-thickness-border-Button-attention-ghost)",
      "color-text-Button-attention-ghost": "var(--xmlui-color-text-Button-attention-ghost)",
      "thickness-outline-Button-attention-ghost--focus":
        "var(--xmlui-thickness-outline-Button-attention-ghost--focus)",
      "color-outline-Button-attention-ghost--focus":
        "var(--xmlui-color-outline-Button-attention-ghost--focus)",
      "style-outline-Button-attention-ghost--focus":
        "var(--xmlui-style-outline-Button-attention-ghost--focus)",
      "offset-outline-Button-attention-ghost--focus":
        "var(--xmlui-offset-outline-Button-attention-ghost--focus)",
      "color-bg-Button-attention-ghost--hover":
        "var(--xmlui-color-bg-Button-attention-ghost--hover)",
      "color-text-Button-attention-ghost--hover":
        "var(--xmlui-color-text-Button-attention-ghost--hover)",
      "color-bg-Button-attention-ghost--active":
        "var(--xmlui-color-bg-Button-attention-ghost--active)",
      "color-text-Button-attention-ghost--active":
        "var(--xmlui-color-text-Button-attention-ghost--active)",
    },
    defaultThemeVars: {
      "width-Button": "fit-content",
      "height-Button": "fit-content",
      "radius-Button": "$radius",
      "font-size-Button": "$font-size-small",
      "font-weight-Button": "$font-weight-medium",
      "color-bg-Button-primary": "$color-primary-500",
      "color-bg-Button-attention": "$color-bg-attention",
      "color-border-Button-attention": "$color-attention",
      "color-bg-Button--disabled": "$color-bg--disabled",
      "color-border-Button--disabled": "$color-border--disabled",
      "style-border-Button": "solid",
      "color-text-Button--disabled": "$color-text--disabled",
      "color-outline-Button--focus": "$color-outline--focus",
      "thickness-border-Button": "1px",
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
        "color-border-Button-secondary": "$color-secondary-100",
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
  },
  ButtonGroup: {
    description:
      "(**NOT IMPLEMENTED YET**) The `ButtonGroup` component is a container that embeds buttons used together for a particular reason. It provides a view that emphasizes this coherency.",
    status: "in progress",
    props: {
      themeColor: {
        description:
          "This optional property specifies the default theme color for the buttons in the group. Individual buttons may override this setting with their `themeColor` property.",
        availableValues: [
          {
            value: "attention",
            description: "Attention state theme color",
          },
          {
            value: "primary",
            description: "Primary theme color",
          },
          {
            value: "secondary",
            description: "Secondary theme color",
          },
        ],
        valueType: "string",
        defaultValue: "primary",
      },
      variant: {
        description:
          "This optional property specifies the default variant for the buttons in the group. Individual buttons may override this setting with their `variant` property.",
        availableValues: [
          {
            value: "solid",
            description: "A button with a border and a filled background.",
          },
          {
            value: "outlined",
            description: "The button is displayed with a border and a transparent background.",
          },
          {
            value: "ghost",
            description:
              "A button with no border and fill. Only the label is visible; the background is colored when hovered or clicked.",
          },
        ],
        valueType: "string",
        defaultValue: "solid",
      },
      orientation: {
        description:
          "This property sets the main axis along which the nested components are rendered.",
        availableValues: [
          {
            value: "horizontal",
            description: "The component will fill the available space horizontally",
          },
          {
            value: "vertical",
            description: "The component will fill the available space vertically",
          },
        ],
        valueType: "string",
        defaultValue: "horizontal",
      },
      buttonWidth: {
        description:
          "When this optional property is set, all buttons within the group will have the specified width. If it is empty, each button's width accommodates its content.",
      },
      gap: {
        description:
          "When this optional property is set, adjacent buttons will have the specified gap between them. If this property is not set, the buttons will be merged into one group.",
      },
    },
    themeVars: [],
    defaultThemeVars: {
      light: {},
      dark: {},
    },
  },
  Card: {
    description:
      "The `Card` component is a container for cohesive elements, often rendered visually as a card.",
    props: {
      avatarUrl: {
        description:
          "Show the avatar (`true`) or not (`false`). If not specified, the Card will show the first letters of the [`title`](#title).",
        descriptionRef: "Card/Card.mdx?avatarUrl",
      },
      showAvatar: {
        description: "Indicates whether the Card should be displayed",
        availableValues: null,
        valueType: "boolean",
        descriptionRef: "Card/Card.mdx?showAvatar",
      },
      title: {
        description: "This prop sets the prestyled title.",
        descriptionRef: "Card/Card.mdx?title",
      },
      subtitle: {
        description: "This prop sets the prestyled subtitle.",
        descriptionRef: "Card/Card.mdx?subtitle",
      },
      linkTo: {
        description:
          "This property wraps the title in a `Link` component that is clickable to navigate.",
        descriptionRef: "Card/Card.mdx?linkTo",
      },
      orientation: {
        description:
          "An optional property that governs the Card's orientation (whether the Card lays out its children in a row or a column). If the orientation is set to `horizontal`, the Card will display its children in a row, except for its [`title`](#title) and [`subtitle`](#subtitle).",
        availableValues: [
          {
            value: "horizontal",
            description: "The component will fill the available space horizontally",
          },
          {
            value: "vertical",
            description: "The component will fill the available space vertically",
          },
        ],
        valueType: "string",
        defaultValue: "vertical",
        descriptionRef: "Card/Card.mdx?orientation",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Card is clicked.",
        descriptionRef: "Card/Card.mdx?click",
      },
    },
    themeVars: {
      "padding-Card": "var(--xmlui-padding-Card)",
      "padding-horizontal-Card": "var(--xmlui-padding-horizontal-Card)",
      "padding-vertical-Card": "var(--xmlui-padding-vertical-Card)",
      "shadow-Card": "var(--xmlui-shadow-Card)",
      "color-bg-Card": "var(--xmlui-color-bg-Card)",
      "radius-Card": "var(--xmlui-radius-Card)",
      "color-border-Card": "var(--xmlui-color-border-Card)",
      "thickness-border-Card": "var(--xmlui-thickness-border-Card)",
      "style-border-Card": "var(--xmlui-style-border-Card)",
      "border-Card": "var(--xmlui-border-Card)",
    },
    defaultThemeVars: {
      "padding-horizontal-Card": "$space-4",
      "padding-vertical-Card": "$space-4",
      "padding-Card": "$padding-vertical-Card $padding-horizontal-Card",
      "color-border-Card": "$color-border",
      "thickness-border-Card": "1px",
      "style-border-Card": "solid",
      "border-Card": "$thickness-border-Card $style-border-Card $color-border-Card",
      "radius-Card": "$radius",
      "shadow-Card": "none",
      light: {
        "color-bg-Card": "white",
      },
      dark: {
        "color-bg-Card": "$color-surface-900",
      },
    },
  },
  Carousel: {
    description:
      "This component displays a slideshow by cycling through elements (images, text, or custom slides) like a carousel.",
    status: "in progress",
    props: {
      orientation: {
        description:
          "This property indicates the orientation of the carousel. The `horizontal` value indicates that the carousel moves horizontally, and the `vertical` value indicates that the carousel moves vertically.",
        availableValues: ["horizontal", "vertical"],
        valueType: null,
        defaultValue: "horizontal",
      },
      indicators: {
        description: "This property indicates whether the carousel displays the indicators.",
        availableValues: null,
        valueType: null,
        defaultValue: "true",
      },
      controls: {
        description: "This property indicates whether the carousel displays the controls.",
        availableValues: null,
        valueType: null,
        defaultValue: "true",
      },
      autoplay: {
        description: "This property indicates whether the carousel automatically scrolls.",
        availableValues: null,
        valueType: null,
        defaultValue: "false",
      },
      loop: {
        description: "This property indicates whether the carousel loops.",
        availableValues: null,
        valueType: null,
        defaultValue: "false",
      },
      startIndex: {
        description: "This property indicates the index of the first slide to display.",
        availableValues: null,
        valueType: null,
        defaultValue: "0",
      },
      prevIcon: {
        description: "This property specifies the icon to display for the previous control.",
      },
      nextIcon: {
        description: "This property specifies the icon to display for the next control.",
      },
      keyboard: {
        description: "This property indicates whether the carousel responds to keyboard events.",
      },
    },
    events: {
      displayDidChange: {
        description: "This event is triggered when value of Carousel has changed.",
      },
    },
    apis: {
      canScrollPrev: {
        description: "This method returns `true` if the carousel can scroll to the previous slide.",
      },
      canScrollNext: {
        description: "This method returns `true` if the carousel can scroll to the next slide.",
      },
      scrollTo: {
        description: "This method scrolls the carousel to the specified slide index.",
      },
      scrollPrev: {
        description: "This method scrolls the carousel to the previous slide.",
      },
      scrollNext: {
        description: "This method scrolls the carousel to the next slide.",
      },
    },
    themeVars: {
      "width-Carousel": "var(--xmlui-width-Carousel)",
      "height-Carousel": "var(--xmlui-height-Carousel)",
      "height-control-Carousel": "var(--xmlui-height-control-Carousel)",
      "width-control-Carousel": "var(--xmlui-width-control-Carousel)",
      "color-text-control-Carousel": "var(--xmlui-color-text-control-Carousel)",
      "color-bg-control-Carousel": "var(--xmlui-color-bg-control-Carousel)",
      "radius-control-Carousel": "var(--xmlui-radius-control-Carousel)",
      "color-bg-control-hover-Carousel": "var(--xmlui-color-bg-control-hover-Carousel)",
      "color-text-control-hover-Carousel": "var(--xmlui-color-text-control-hover-Carousel)",
      "color-bg-control-active-Carousel": "var(--xmlui-color-bg-control-active-Carousel)",
      "color-text-control-active-Carousel": "var(--xmlui-color-text-control-active-Carousel)",
      "color-text-control-disabled-Carousel": "var(--xmlui-color-text-control-disabled-Carousel)",
      "color-bg-control-disabled-Carousel": "var(--xmlui-color-bg-control-disabled-Carousel)",
      "width-indicator-Carousel": "var(--xmlui-width-indicator-Carousel)",
      "height-indicator-Carousel": "var(--xmlui-height-indicator-Carousel)",
      "color-text-indicator-Carousel": "var(--xmlui-color-text-indicator-Carousel)",
      "color-bg-indicator-Carousel": "var(--xmlui-color-bg-indicator-Carousel)",
      "color-bg-indicator-hover-Carousel": "var(--xmlui-color-bg-indicator-hover-Carousel)",
      "color-text-indicator-hover-Carousel": "var(--xmlui-color-text-indicator-hover-Carousel)",
      "color-bg-indicator-active-Carousel": "var(--xmlui-color-bg-indicator-active-Carousel)",
      "color-text-indicator-active-Carousel": "var(--xmlui-color-text-indicator-active-Carousel)",
    },
    defaultThemeVars: {
      "color-bg-control-Carousel": "$color-primary",
      "color-text-control-Carousel": "$color-primary",
      "color-bg-control-hover-Carousel": "$color-primary",
      "color-text-control-hover-Carousel": "$color-primary",
      "color-bg-control-active-Carousel": "$color-primary",
      "color-bg-control-disabled-Carousel": "$color-surface-200",
      "color-text-control-disabled-Carousel": "$color-text-disabled",
      "color-text-control-active-Carousel": "$color-primary",
      "color-bg-indicator-Carousel": "$color-surface-200",
      "color-bg-indicator-active-Carousel": "$color-primary",
      "color-text-indicator-Carousel": "$color-primary",
      "color-text-indicator-active-Carousel": "$color-primary",
      "color-bg-indicator-hover-Carousel": "$color-surface-200",
      "color-text-indicator-hover-Carousel": "$color-primary",
      "width-indicator-Carousel": "25px",
      "height-indicator-Carousel": "6px",
      "height-control-Carousel": "36px",
      "width-control-Carousel": "36px",
      "radius-control-Carousel": "50%",
      "height-Carousel": "100%",
      "width-Carousel": "100%",
    },
  },
  ChangeListener: {
    description:
      "`ChangeListener` is a functional component (it renders no UI) to trigger an action when a particular value (component property, state, etc.) changes.",
    props: {
      listenTo: {
        description: "Value to the changes of which this component listens.",
        descriptionRef: "ChangeListener/ChangeListener.mdx?listenTo",
      },
      throttleWaitInMs: {
        description:
          "This variable sets a throttling time (in milliseconds) to apply when executing the `didChange` event handler. All changes within that throttling time will only fire the `didChange` event once.",
        descriptionRef: "ChangeListener/ChangeListener.mdx?throttleWaitInMs",
      },
    },
    events: {
      didChange: {
        description: "This event is triggered when value of ChangeListener has changed.",
        descriptionRef: "ChangeListener/ChangeListener.mdx?didChange",
      },
    },
  },
  Chart: {
    description: "(**OBSOLETE**) A chart component",
    status: "deprecated",
    props: {
      type: {
        description: "(**OBSOLETE**)",
      },
      labels: {
        description: "(**OBSOLETE**)",
      },
      series: {
        description: "(**OBSOLETE**)",
      },
      stacked: {
        description: "(**OBSOLETE**)",
      },
      showAxisLabels: {
        description: "(**OBSOLETE**)",
      },
      tooltipEnabled: {
        description: "(**OBSOLETE**)",
      },
      showLegend: {
        description: "(**OBSOLETE**)",
      },
    },
  },
  Checkbox: {
    description:
      "The `Checkbox` component allows users to make binary choices, typically between checked or unchecked. It consists of a small box that can be toggled on or off by clicking on it.",
    status: "stable",
    props: {
      indeterminate: {
        description:
          "The `true` value of this property signals that the component is in an _intedeterminate state_.",
        descriptionRef: "Checkbox/Checkbox.mdx?indeterminate",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "Checkbox/Checkbox.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "right",
        descriptionRef: "Checkbox/Checkbox.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `Checkbox`.",
        descriptionRef: "Checkbox/Checkbox.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `Checkbox` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Checkbox/Checkbox.mdx?labelBreak",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "Checkbox/Checkbox.mdx?required",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        defaultValue: false,
        descriptionRef: "Checkbox/Checkbox.mdx?initialValue",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Checkbox/Checkbox.mdx?autoFocus",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "Checkbox/Checkbox.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "Checkbox/Checkbox.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "Checkbox/Checkbox.mdx?validationStatus",
      },
      description: {
        description:
          "(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description of the Checkbox besides its label.",
        descriptionRef: "Checkbox/Checkbox.mdx?description",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Checkbox is clicked.",
        descriptionRef: "Checkbox/Checkbox.mdx?click",
      },
      gotFocus: {
        description: "This event is triggered when the Checkbox has received the focus.",
        descriptionRef: "Checkbox/Checkbox.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the Checkbox has lost the focus.",
        descriptionRef: "Checkbox/Checkbox.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of Checkbox has changed.",
        descriptionRef: "Checkbox/Checkbox.mdx?didChange",
      },
    },
    apis: {
      value: {
        description:
          "You can query this read-only API property to query the component's current value (`true`: checked, `false`: unchecked).",
        descriptionRef: "Checkbox/Checkbox.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "Checkbox/Checkbox.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-Checkbox-default": "var(--xmlui-radius-Checkbox-default)",
      "Input:color-border-Checkbox-default": "var(--xmlui-color-border-Checkbox-default)",
      "Input:color-bg-Checkbox-default": "var(--xmlui-color-bg-Checkbox-default)",
      "Input:thickness-outline-Checkbox-default--focus":
        "var(--xmlui-thickness-outline-Checkbox-default--focus)",
      "Input:color-outline-Checkbox-default--focus":
        "var(--xmlui-color-outline-Checkbox-default--focus)",
      "Input:style-outline-Checkbox-default--focus":
        "var(--xmlui-style-outline-Checkbox-default--focus)",
      "Input:offset-outline-Checkbox-default--focus":
        "var(--xmlui-offset-outline-Checkbox-default--focus)",
      "Input:color-border-Checkbox-default--hover":
        "var(--xmlui-color-border-Checkbox-default--hover)",
      "Input:color-bg-Checkbox--disabled": "var(--xmlui-color-bg-Checkbox--disabled)",
      "Input:color-border-Checkbox--disabled": "var(--xmlui-color-border-Checkbox--disabled)",
      "Input:radius-Checkbox-error": "var(--xmlui-radius-Checkbox-error)",
      "Input:color-border-Checkbox-error": "var(--xmlui-color-border-Checkbox-error)",
      "Input:color-bg-Checkbox-error": "var(--xmlui-color-bg-Checkbox-error)",
      "Input:thickness-outline-Checkbox-error--focus":
        "var(--xmlui-thickness-outline-Checkbox-error--focus)",
      "Input:color-outline-Checkbox-error--focus":
        "var(--xmlui-color-outline-Checkbox-error--focus)",
      "Input:style-outline-Checkbox-error--focus":
        "var(--xmlui-style-outline-Checkbox-error--focus)",
      "Input:offset-outline-Checkbox-error--focus":
        "var(--xmlui-offset-outline-Checkbox-error--focus)",
      "Input:radius-Checkbox-warning": "var(--xmlui-radius-Checkbox-warning)",
      "Input:color-border-Checkbox-warning": "var(--xmlui-color-border-Checkbox-warning)",
      "Input:color-bg-Checkbox-warning": "var(--xmlui-color-bg-Checkbox-warning)",
      "Input:thickness-outline-Checkbox-warning--focus":
        "var(--xmlui-thickness-outline-Checkbox-warning--focus)",
      "Input:color-outline-Checkbox-warning--focus":
        "var(--xmlui-color-outline-Checkbox-warning--focus)",
      "Input:style-outline-Checkbox-warning--focus":
        "var(--xmlui-style-outline-Checkbox-warning--focus)",
      "Input:offset-outline-Checkbox-warning--focus":
        "var(--xmlui-offset-outline-Checkbox-warning--focus)",
      "Input:radius-Checkbox-success": "var(--xmlui-radius-Checkbox-success)",
      "Input:color-border-Checkbox-success": "var(--xmlui-color-border-Checkbox-success)",
      "Input:color-bg-Checkbox-success": "var(--xmlui-color-bg-Checkbox-success)",
      "Input:thickness-outline-Checkbox-success--focus":
        "var(--xmlui-thickness-outline-Checkbox-success--focus)",
      "Input:color-outline-Checkbox-success--focus":
        "var(--xmlui-color-outline-Checkbox-success--focus)",
      "Input:style-outline-Checkbox-success--focus":
        "var(--xmlui-style-outline-Checkbox-success--focus)",
      "Input:offset-outline-Checkbox-success--focus":
        "var(--xmlui-offset-outline-Checkbox-success--focus)",
      "color-bg-indicator-Checkbox": "var(--xmlui-color-bg-indicator-Checkbox)",
      "Input:color-border-checked-Checkbox": "var(--xmlui-color-border-checked-Checkbox)",
      "Input:color-bg-checked-Checkbox": "var(--xmlui-color-bg-checked-Checkbox)",
      "Input:color-border-checked-Checkbox-error":
        "var(--xmlui-color-border-checked-Checkbox-error)",
      "Input:color-bg-checked-Checkbox-error": "var(--xmlui-color-bg-checked-Checkbox-error)",
      "Input:color-border-checked-Checkbox-warning":
        "var(--xmlui-color-border-checked-Checkbox-warning)",
      "Input:color-bg-checked-Checkbox-warning": "var(--xmlui-color-bg-checked-Checkbox-warning)",
      "Input:color-border-checked-Checkbox-success":
        "var(--xmlui-color-border-checked-Checkbox-success)",
      "Input:color-bg-checked-Checkbox-success": "var(--xmlui-color-bg-checked-Checkbox-success)",
      "Input:color-border-Switch": "var(--xmlui-color-border-Switch)",
      "Input:color-bg-Switch": "var(--xmlui-color-bg-Switch)",
      "Input:color-border-Switch-default--hover": "var(--xmlui-color-border-Switch-default--hover)",
      "Input:color-bg-Switch--disabled": "var(--xmlui-color-bg-Switch--disabled)",
      "Input:color-border-Switch--disabled": "var(--xmlui-color-border-Switch--disabled)",
      "Input:color-border-Switch-error": "var(--xmlui-color-border-Switch-error)",
      "Input:color-border-Switch-warning": "var(--xmlui-color-border-Switch-warning)",
      "Input:color-border-Switch-success": "var(--xmlui-color-border-Switch-success)",
      "color-bg-indicator-Switch": "var(--xmlui-color-bg-indicator-Switch)",
      "Input:color-border-checked-Switch": "var(--xmlui-color-border-checked-Switch)",
      "Input:color-bg-checked-Switch": "var(--xmlui-color-bg-checked-Switch)",
      "Input:color-border-checked-Switch-error": "var(--xmlui-color-border-checked-Switch-error)",
      "Input:color-bg-checked-Switch-error": "var(--xmlui-color-bg-checked-Switch-error)",
      "Input:color-border-checked-Switch-warning":
        "var(--xmlui-color-border-checked-Switch-warning)",
      "Input:color-bg-checked-Switch-warning": "var(--xmlui-color-bg-checked-Switch-warning)",
      "Input:color-border-checked-Switch-success":
        "var(--xmlui-color-border-checked-Switch-success)",
      "Input:color-bg-checked-Switch-success": "var(--xmlui-color-bg-checked-Switch-success)",
      "Input:thickness-outline-Switch--focus": "var(--xmlui-thickness-outline-Switch--focus)",
      "Input:color-outline-Switch--focus": "var(--xmlui-color-outline-Switch--focus)",
      "Input:style-outline-Switch--focus": "var(--xmlui-style-outline-Switch--focus)",
      "Input:offset-outline-Switch--focus": "var(--xmlui-offset-outline-Switch--focus)",
    },
    defaultThemeVars: {
      "color-border-checked-Checkbox-error": "$color-border-Checkbox-error",
      "color-bg-checked-Checkbox-error": "$color-border-Checkbox-error",
      "color-border-checked-Checkbox-warning": "$color-border-Checkbox-warning",
      "color-bg-checked-Checkbox-warning": "$color-border-Checkbox-warning",
      "color-border-checked-Checkbox-success": "$color-border-Checkbox-success",
      "color-bg-checked-Checkbox-success": "$color-border-Checkbox-success",
      light: {
        "color-bg-indicator-Checkbox": "$color-bg-primary",
        "color-border-checked-Checkbox": "$color-primary-500",
        "color-bg-checked-Checkbox": "$color-primary-500",
        "color-bg-Checkbox--disabled": "$color-surface-200",
      },
      dark: {
        "color-bg-indicator-Checkbox": "$color-bg-primary",
        "color-border-checked-Checkbox": "$color-primary-400",
        "color-bg-checked-Checkbox": "$color-primary-400",
        "color-bg-Checkbox--disabled": "$color-surface-800",
      },
    },
  },
  Column: {
    description:
      "The `Column` component can be used within a `Table` to define a particular table column's visual properties and data bindings.",
    props: {
      bindTo: {
        description: "Indicates what part of the data to lay out in the column.",
        descriptionRef: "Column/Column.mdx?bindTo",
      },
      header: {
        description: "Adds a label for a particular column.",
        descriptionRef: "Column/Column.mdx?header",
      },
      width: {
        description:
          "This property defines the width of the column. You can use a numeric value, a pixel value (such as `100px`), or a star size value (such as `*`, `2*`, etc.). You will get an error if you use any other unit (or value).",
        descriptionRef: "Column/Column.mdx?width",
      },
      minWidth: {
        description: "Indicates the minimum width a particular column can have.",
        descriptionRef: "Column/Column.mdx?minWidth",
      },
      maxWidth: {
        description: "Indicates the maximum width a particular column can have.",
        descriptionRef: "Column/Column.mdx?maxWidth",
      },
      canSort: {
        description:
          "This property sets whether the user can sort by a column by clicking on its header (`true`) or not (`false`).",
        descriptionRef: "Column/Column.mdx?canSort",
      },
      pinTo: {
        description:
          "This property allows the column to be pinned to the `left` or right `edge` of the table.",
        descriptionRef: "Column/Column.mdx?pinTo",
      },
      canResize: {
        description:
          "This property indicates whether the user can resize the column. If set to `true`, the column can be resized by dragging the column border. If set to `false`, the column cannot be resized. Double-clicking the column border resets to the original size.",
        descriptionRef: "Column/Column.mdx?canResize",
      },
    },
  },
  ContentSeparator: {
    description:
      "A `ContentSeparator` is a component that divides or separates content visually within a layout. It serves as a visual cue to distinguish between different sections or groups of content, helping to improve readability and organization.",
    props: {
      size: {
        description:
          "This property defines the component's height (if the `orientation` is horizontal) or the width (if the `orientation` is vertical).",
        descriptionRef: "ContentSeparator/ContentSeparator.mdx?size",
      },
      orientation: {
        description: "Sets the main axis of the component",
        availableValues: [
          {
            value: "horizontal",
            description: "The component will fill the available space horizontally",
          },
          {
            value: "vertical",
            description: "The component will fill the available space vertically",
          },
        ],
        descriptionRef: "ContentSeparator/ContentSeparator.mdx?orientation",
      },
    },
    themeVars: {
      "color-bg-ContentSeparator": "var(--xmlui-color-bg-ContentSeparator)",
      "size-ContentSeparator": "var(--xmlui-size-ContentSeparator)",
    },
    defaultThemeVars: {
      "color-bg-ContentSeparator": "$color-border",
      "size-ContentSeparator": "1px",
      light: {},
      dark: {},
    },
  },
  DataSource: {
    description:
      "The `DataSource` component manages fetching data from a web API endpoint. This component automatically manages the complexity of the fetch operation and caching. To manipulate data on the backend, use the [`APICall`](./APICall.mdx) component.",
    status: "stable",
    props: {
      method: {
        description:
          "By default, data fetching uses the `get` operation method. You can change it by setting this property to other supported methods, such as `post`, `put`, `delete`, and others.",
        descriptionRef: "DataSource/DataSource.mdx?method",
      },
      url: {
        description: "This property represents the URL to fetch the data.",
        descriptionRef: "DataSource/DataSource.mdx?url",
      },
      rawBody: {
        description:
          "This property sets the request body to the value provided here without any conversion. Use the `body` property if you want the object sent in JSON. When you define `body` and `rawBody`, the latest one prevails.",
        descriptionRef: "DataSource/DataSource.mdx?rawBody",
      },
      body: {
        description:
          "This property sets the request body. The object you pass here will be serialized to JSON when sending the request. Use the `rawBody` property to send another request body using its native format. When you define `body` and `rawBody`, the latest one prevails.",
        descriptionRef: "DataSource/DataSource.mdx?body",
      },
      queryParams: {
        description:
          "This property sets the request body. The object you pass here will be serialized to JSON when sending the request. Use the `rawBody` property to send another request body using its native format. When you define `body` and `rawBody`, the latest one prevails.",
        descriptionRef: "DataSource/DataSource.mdx?queryParams",
      },
      headers: {
        description:
          "You can define request header values as key and value pairs, where the key is the ID of the particular header and the value is that header's value.",
        descriptionRef: "DataSource/DataSource.mdx?headers",
      },
      pollIntervalInSeconds: {
        description:
          "By setting this property, you can define periodic data fetching. The `DataSource` component will refresh its data according to the time specified as seconds. When the data changes during the refresh, it will trigger the update mechanism of XMLUI and re-render the UI accordingly.",
        descriptionRef: "DataSource/DataSource.mdx?pollIntervalInSeconds",
      },
      inProgressNotificationMessage: {
        description:
          "This property defines the message to display while the fetch operation progresses.",
        descriptionRef: "DataSource/DataSource.mdx?inProgressNotificationMessage",
      },
      completedNotificationMessage: {
        description:
          "This property defines the message to display automatically when the data fetch operation has been completed.",
        descriptionRef: "DataSource/DataSource.mdx?completedNotificationMessage",
      },
      errorNotificationMessage: {
        description:
          "This property defines the message to display automatically when the data fetch operation results in an error.",
        descriptionRef: "DataSource/DataSource.mdx?errorNotificationMessage",
      },
      resultSelector: {
        description:
          "The response of a data-fetching query may include additional information that the UI cannot (or does not intend) to process. With this property, you can define a selector that extracts the data from the response body.",
        descriptionRef: "DataSource/DataSource.mdx?resultSelector",
      },
      prevPageSelector: {
        description:
          "When using `DataSource` with paging, the response may contain information about the previous and next page. This property defines the selector that extracts the previous page information from the response deserialized to an object.",
        descriptionRef: "DataSource/DataSource.mdx?prevPageSelector",
      },
      nextPageSelector: {
        description:
          "When using `DataSource` with paging, the response may contain information about the previous and next page. This property defines the selector that extracts the next page information from the response deserialized to an object.",
        descriptionRef: "DataSource/DataSource.mdx?nextPageSelector",
      },
    },
    events: {
      loaded: {
        description:
          "The component triggers this event when the fetch operation has been completed and the data is loaded. The argument of the event is the data loaded.",
        descriptionRef: "DataSource/DataSource.mdx?loaded",
      },
      error: {
        description: "This event fires when a request results in an error.",
        descriptionRef: "DataSource/DataSource.mdx?error",
      },
    },
  },
  DatePicker: {
    description:
      "A datepicker component enables the selection of a date or a range of dates in a specified format from an interactive display.",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "DatePicker/DatePicker.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "DatePicker/DatePicker.mdx?initialValue",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "DatePicker/DatePicker.mdx?autoFocus",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "DatePicker/DatePicker.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "DatePicker/DatePicker.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "DatePicker/DatePicker.mdx?validationStatus",
      },
      mode: {
        description: "The mode of the datepicker (single or range)",
        descriptionRef: "DatePicker/DatePicker.mdx?mode",
      },
      dateFormat: {
        description: "The format of the date displayed in the input field",
        descriptionRef: "DatePicker/DatePicker.mdx?dateFormat",
      },
      showWeekNumber: {
        description: "Whether to show the week number in the calendar",
        descriptionRef: "DatePicker/DatePicker.mdx?showWeekNumber",
      },
      weekStartsOn: {
        description: "The first day of the week. 0 is Sunday, 1 is Monday, etc.",
        descriptionRef: "DatePicker/DatePicker.mdx?weekStartsOn",
      },
      fromDate: {
        description: "The start date of the range of selectable dates",
        descriptionRef: "DatePicker/DatePicker.mdx?fromDate",
      },
      toDate: {
        description: "The end date of the range of selectable dates",
        descriptionRef: "DatePicker/DatePicker.mdx?toDate",
      },
      disabledDates: {
        description: "An array of dates that are disabled",
        descriptionRef: "DatePicker/DatePicker.mdx?disabledDates",
      },
    },
    events: {
      didChange: {
        description: "This event is triggered when value of DatePicker has changed.",
        descriptionRef: "DatePicker/DatePicker.mdx?didChange",
      },
      gotFocus: {
        description: "This event is triggered when the DatePicker has received the focus.",
        descriptionRef: "DatePicker/DatePicker.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the DatePicker has lost the focus.",
        descriptionRef: "DatePicker/DatePicker.mdx?lostFocus",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the DatePicker.",
        descriptionRef: "DatePicker/DatePicker.mdx?focus",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "DatePicker/DatePicker.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "DatePicker/DatePicker.mdx?setValue",
      },
    },
    themeVars: {
      "Input:min-height-DatePicker": "var(--xmlui-min-height-DatePicker)",
      "Input:font-size-DatePicker": "var(--xmlui-font-size-DatePicker)",
      "Input:radius-DatePicker-default": "var(--xmlui-radius-DatePicker-default)",
      "Input:color-border-DatePicker-default": "var(--xmlui-color-border-DatePicker-default)",
      "Input:thickness-border-DatePicker-default":
        "var(--xmlui-thickness-border-DatePicker-default)",
      "Input:style-border-DatePicker-default": "var(--xmlui-style-border-DatePicker-default)",
      "Input:color-bg-DatePicker-default": "var(--xmlui-color-bg-DatePicker-default)",
      "Input:shadow-DatePicker-default": "var(--xmlui-shadow-DatePicker-default)",
      "Input:color-text-DatePicker-default": "var(--xmlui-color-text-DatePicker-default)",
      "Input:color-border-DatePicker-default--hover":
        "var(--xmlui-color-border-DatePicker-default--hover)",
      "Input:color-bg-DatePicker-default--hover": "var(--xmlui-color-bg-DatePicker-default--hover)",
      "Input:shadow-DatePicker-default--hover": "var(--xmlui-shadow-DatePicker-default--hover)",
      "Input:color-text-DatePicker-default--hover":
        "var(--xmlui-color-text-DatePicker-default--hover)",
      "Input:thickness-outline-DatePicker-default--focus":
        "var(--xmlui-thickness-outline-DatePicker-default--focus)",
      "Input:color-outline-DatePicker-default--focus":
        "var(--xmlui-color-outline-DatePicker-default--focus)",
      "Input:style-outline-DatePicker-default--focus":
        "var(--xmlui-style-outline-DatePicker-default--focus)",
      "Input:offset-outline-DatePicker-default--focus":
        "var(--xmlui-offset-outline-DatePicker-default--focus)",
      "Input:color-placeholder-DatePicker-default":
        "var(--xmlui-color-placeholder-DatePicker-default)",
      "Input:radius-DatePicker-error": "var(--xmlui-radius-DatePicker-error)",
      "Input:color-border-DatePicker-error": "var(--xmlui-color-border-DatePicker-error)",
      "Input:thickness-border-DatePicker-error": "var(--xmlui-thickness-border-DatePicker-error)",
      "Input:style-border-DatePicker-error": "var(--xmlui-style-border-DatePicker-error)",
      "Input:color-bg-DatePicker-error": "var(--xmlui-color-bg-DatePicker-error)",
      "Input:shadow-DatePicker-error": "var(--xmlui-shadow-DatePicker-error)",
      "Input:color-text-DatePicker-error": "var(--xmlui-color-text-DatePicker-error)",
      "Input:color-border-DatePicker-error--hover":
        "var(--xmlui-color-border-DatePicker-error--hover)",
      "Input:color-bg-DatePicker-error--hover": "var(--xmlui-color-bg-DatePicker-error--hover)",
      "Input:shadow-DatePicker-error--hover": "var(--xmlui-shadow-DatePicker-error--hover)",
      "Input:color-text-DatePicker-error--hover": "var(--xmlui-color-text-DatePicker-error--hover)",
      "Input:thickness-outline-DatePicker-error--focus":
        "var(--xmlui-thickness-outline-DatePicker-error--focus)",
      "Input:color-outline-DatePicker-error--focus":
        "var(--xmlui-color-outline-DatePicker-error--focus)",
      "Input:style-outline-DatePicker-error--focus":
        "var(--xmlui-style-outline-DatePicker-error--focus)",
      "Input:offset-outline-DatePicker-error--focus":
        "var(--xmlui-offset-outline-DatePicker-error--focus)",
      "Input:color-placeholder-DatePicker-error": "var(--xmlui-color-placeholder-DatePicker-error)",
      "Input:radius-DatePicker-warning": "var(--xmlui-radius-DatePicker-warning)",
      "Input:color-border-DatePicker-warning": "var(--xmlui-color-border-DatePicker-warning)",
      "Input:thickness-border-DatePicker-warning":
        "var(--xmlui-thickness-border-DatePicker-warning)",
      "Input:style-border-DatePicker-warning": "var(--xmlui-style-border-DatePicker-warning)",
      "Input:color-bg-DatePicker-warning": "var(--xmlui-color-bg-DatePicker-warning)",
      "Input:shadow-DatePicker-warning": "var(--xmlui-shadow-DatePicker-warning)",
      "Input:color-text-DatePicker-warning": "var(--xmlui-color-text-DatePicker-warning)",
      "Input:color-border-DatePicker-warning--hover":
        "var(--xmlui-color-border-DatePicker-warning--hover)",
      "Input:color-bg-DatePicker-warning--hover": "var(--xmlui-color-bg-DatePicker-warning--hover)",
      "Input:shadow-DatePicker-warning--hover": "var(--xmlui-shadow-DatePicker-warning--hover)",
      "Input:color-text-DatePicker-warning--hover":
        "var(--xmlui-color-text-DatePicker-warning--hover)",
      "Input:thickness-outline-DatePicker-warning--focus":
        "var(--xmlui-thickness-outline-DatePicker-warning--focus)",
      "Input:color-outline-DatePicker-warning--focus":
        "var(--xmlui-color-outline-DatePicker-warning--focus)",
      "Input:style-outline-DatePicker-warning--focus":
        "var(--xmlui-style-outline-DatePicker-warning--focus)",
      "Input:offset-outline-DatePicker-warning--focus":
        "var(--xmlui-offset-outline-DatePicker-warning--focus)",
      "Input:color-placeholder-DatePicker-warning":
        "var(--xmlui-color-placeholder-DatePicker-warning)",
      "Input:radius-DatePicker-success": "var(--xmlui-radius-DatePicker-success)",
      "Input:color-border-DatePicker-success": "var(--xmlui-color-border-DatePicker-success)",
      "Input:thickness-border-DatePicker-success":
        "var(--xmlui-thickness-border-DatePicker-success)",
      "Input:style-border-DatePicker-success": "var(--xmlui-style-border-DatePicker-success)",
      "Input:color-bg-DatePicker-success": "var(--xmlui-color-bg-DatePicker-success)",
      "Input:shadow-DatePicker-success": "var(--xmlui-shadow-DatePicker-success)",
      "Input:color-text-DatePicker-success": "var(--xmlui-color-text-DatePicker-success)",
      "Input:color-border-DatePicker-success--hover":
        "var(--xmlui-color-border-DatePicker-success--hover)",
      "Input:color-bg-DatePicker-success--hover": "var(--xmlui-color-bg-DatePicker-success--hover)",
      "Input:shadow-DatePicker-success--hover": "var(--xmlui-shadow-DatePicker-success--hover)",
      "Input:color-text-DatePicker-success--hover":
        "var(--xmlui-color-text-DatePicker-success--hover)",
      "Input:thickness-outline-DatePicker-success--focus":
        "var(--xmlui-thickness-outline-DatePicker-success--focus)",
      "Input:color-outline-DatePicker-success--focus":
        "var(--xmlui-color-outline-DatePicker-success--focus)",
      "Input:style-outline-DatePicker-success--focus":
        "var(--xmlui-style-outline-DatePicker-success--focus)",
      "Input:offset-outline-DatePicker-success--focus":
        "var(--xmlui-offset-outline-DatePicker-success--focus)",
      "Input:color-placeholder-DatePicker-success":
        "var(--xmlui-color-placeholder-DatePicker-success)",
      "Input:color-bg-DatePicker--disabled": "var(--xmlui-color-bg-DatePicker--disabled)",
      "Input:color-text-DatePicker--disabled": "var(--xmlui-color-text-DatePicker--disabled)",
      "Input:color-border-DatePicker--disabled": "var(--xmlui-color-border-DatePicker--disabled)",
      "Input:shadow-menu-DatePicker": "var(--xmlui-shadow-menu-DatePicker)",
      "Input:color-bg-menu-DatePicker": "var(--xmlui-color-bg-menu-DatePicker)",
      "Input:radius-menu-DatePicker": "var(--xmlui-radius-menu-DatePicker)",
      "Input:color-bg-item-DatePicker--active": "var(--xmlui-color-bg-item-DatePicker--active)",
      "Input:color-bg-item-DatePicker--hover": "var(--xmlui-color-bg-item-DatePicker--hover)",
      "Input:color-text-value-DatePicker": "var(--xmlui-color-text-value-DatePicker)",
    },
    defaultThemeVars: {
      "shadow-menu-DatePicker": "$shadow-md",
      "radius-menu-DatePicker": "$radius",
      "color-text-value-DatePicker": "$color-text-primary",
      "color-bg-menu-DatePicker": "$color-bg-primary",
      "color-bg-item-DatePicker--hover": "$color-bg-dropdown-item--active",
      "color-bg-item-DatePicker--active": "$color-bg-dropdown-item--active",
      light: {
        "color-bg-menu-DatePicker": "$color-bg-primary",
      },
      dark: {
        "color-bg-menu-DatePicker": "$color-bg-primary",
      },
    },
  },
  DropdownMenu: {
    description:
      "This component represents a dropdown menu with a trigger. When the user clicks the trigger, the dropdown menu displays its items.",
    props: {
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?label",
      },
      triggerTemplate: {
        description:
          "This property allows you to define a custom trigger instead of the default one provided by `DropdownMenu`.",
        valueType: "ComponentDef",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?triggerTemplate",
      },
      alignment: {
        description:
          "This property allows you to determine the alignment of the displayed menu items.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?alignment",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?enabled",
      },
      triggerButtonVariant: {
        description:
          "This property defines the theme variant of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?triggerButtonVariant",
      },
      triggerButtonThemeColor: {
        description:
          "This property defines the theme color of the `Button` as the dropdown menu's trigger. It has no effect when a custom trigger is defined with `triggerTemplate`.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?triggerButtonThemeColor",
      },
      triggerButtonIcon: {
        description: "This property defines the icon to display on the trigger button.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?triggerButtonIcon",
      },
      triggerButtonIconPosition: {
        description: "This property defines the position of the icon on the trigger button.",
        availableValues: ["left", "right", "start", "end"],
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?triggerButtonIconPosition",
      },
    },
    events: {
      willOpen: {
        description: "This event fires when the `DropdownMenu` component is opened.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?willOpen",
      },
    },
    apis: {
      close: {
        description: "This method command closes the dropdown.",
        descriptionRef: "DropdownMenu/DropdownMenu.mdx?close",
      },
    },
    themeVars: {
      "color-bg-DropdownMenu": "var(--xmlui-color-bg-DropdownMenu)",
      "radius-DropdownMenu": "var(--xmlui-radius-DropdownMenu)",
      "shadow-DropdownMenu": "var(--xmlui-shadow-DropdownMenu)",
      "color-border-DropdownMenu-content": "var(--xmlui-color-border-DropdownMenu-content)",
      "thickness-border-DropdownMenu-content": "var(--xmlui-thickness-border-DropdownMenu-content)",
      "style-border-DropdownMenu-content": "var(--xmlui-style-border-DropdownMenu-content)",
      "min-width-DropdownMenu": "var(--xmlui-min-width-DropdownMenu)",
      "color-bg-MenuItem": "var(--xmlui-color-bg-MenuItem)",
      "color-MenuItem": "var(--xmlui-color-MenuItem)",
      "font-family-MenuItem": "var(--xmlui-font-family-MenuItem)",
      "gap-MenuItem": "var(--xmlui-gap-MenuItem)",
      "font-size-MenuItem": "var(--xmlui-font-size-MenuItem)",
      "padding-vertical-MenuItem": "var(--xmlui-padding-vertical-MenuItem)",
      "padding-horizontal-MenuItem": "var(--xmlui-padding-horizontal-MenuItem)",
      "color-bg-MenuItem--hover": "var(--xmlui-color-bg-MenuItem--hover)",
      "color-bg-MenuItem--active": "var(--xmlui-color-bg-MenuItem--active)",
      "color-bg-MenuItem--active--hover": "var(--xmlui-color-bg-MenuItem--active--hover)",
      "color-MenuItem--hover": "var(--xmlui-color-MenuItem--hover)",
      "color-MenuItem--active": "var(--xmlui-color-MenuItem--active)",
      "color-MenuItem--active--hover": "var(--xmlui-color-MenuItem--active--hover)",
      "margin-top-MenuSeparator": "var(--xmlui-margin-top-MenuSeparator)",
      "margin-bottom-MenuSeparator": "var(--xmlui-margin-bottom-MenuSeparator)",
      "width-MenuSeparator": "var(--xmlui-width-MenuSeparator)",
      "height-MenuSeparator": "var(--xmlui-height-MenuSeparator)",
      "color-MenuSeparator": "var(--xmlui-color-MenuSeparator)",
    },
    defaultThemeVars: {
      "color-bg-DropdownMenu": "$color-bg-primary",
      "min-width-DropdownMenu": "160px",
      "shadow-DropdownMenu": "$shadow-xl",
      "style-border-DropdownMenu-content": "solid",
      "radius-DropdownMenu": "$radius",
    },
  },
  Fragment: {
    description:
      "The `Fragment` component encloses multiple child components into a single root component, so it can be used where only a single component definition is allowed.",
    opaque: true,
  },
  MenuItem: {
    description:
      "This property represents a leaf item in a menu hierarchy. Clicking the item triggers an action.",
    props: {
      iconPosition: {
        description:
          "This property allows you to determine the position of the icon displayed in the menu item.",
        availableValues: [
          {
            value: "start",
            description:
              "The icon will appear at the start (left side when the left-to-right direction is set)",
          },
          {
            value: "end",
            description:
              "The icon will appear at the end (right side when the left-to-right direction is set)",
          },
        ],
        descriptionRef: "DropdownMenu/MenuItem.mdx?iconPosition",
      },
      icon: {
        description: "This property names an optional icon to display with the menu item.",
        descriptionRef: "DropdownMenu/MenuItem.mdx?icon",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "DropdownMenu/MenuItem.mdx?label",
      },
      to: {
        description:
          "This property defines the URL of the menu item. If this property is defined (and the `click` event does not have an event handler), clicking the menu item navigates to this link.",
        descriptionRef: "DropdownMenu/MenuItem.mdx?to",
      },
      active: {
        description: "This property indicates if the specified menu item is active.",
        descriptionRef: "DropdownMenu/MenuItem.mdx?active",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the MenuItem is clicked.",
        descriptionRef: "DropdownMenu/MenuItem.mdx?click",
      },
    },
    themeVars: {
      "color-bg-DropdownMenu": "var(--xmlui-color-bg-DropdownMenu)",
      "radius-DropdownMenu": "var(--xmlui-radius-DropdownMenu)",
      "shadow-DropdownMenu": "var(--xmlui-shadow-DropdownMenu)",
      "color-border-DropdownMenu-content": "var(--xmlui-color-border-DropdownMenu-content)",
      "thickness-border-DropdownMenu-content": "var(--xmlui-thickness-border-DropdownMenu-content)",
      "style-border-DropdownMenu-content": "var(--xmlui-style-border-DropdownMenu-content)",
      "min-width-DropdownMenu": "var(--xmlui-min-width-DropdownMenu)",
      "color-bg-MenuItem": "var(--xmlui-color-bg-MenuItem)",
      "color-MenuItem": "var(--xmlui-color-MenuItem)",
      "font-family-MenuItem": "var(--xmlui-font-family-MenuItem)",
      "gap-MenuItem": "var(--xmlui-gap-MenuItem)",
      "font-size-MenuItem": "var(--xmlui-font-size-MenuItem)",
      "padding-vertical-MenuItem": "var(--xmlui-padding-vertical-MenuItem)",
      "padding-horizontal-MenuItem": "var(--xmlui-padding-horizontal-MenuItem)",
      "color-bg-MenuItem--hover": "var(--xmlui-color-bg-MenuItem--hover)",
      "color-bg-MenuItem--active": "var(--xmlui-color-bg-MenuItem--active)",
      "color-bg-MenuItem--active--hover": "var(--xmlui-color-bg-MenuItem--active--hover)",
      "color-MenuItem--hover": "var(--xmlui-color-MenuItem--hover)",
      "color-MenuItem--active": "var(--xmlui-color-MenuItem--active)",
      "color-MenuItem--active--hover": "var(--xmlui-color-MenuItem--active--hover)",
      "margin-top-MenuSeparator": "var(--xmlui-margin-top-MenuSeparator)",
      "margin-bottom-MenuSeparator": "var(--xmlui-margin-bottom-MenuSeparator)",
      "width-MenuSeparator": "var(--xmlui-width-MenuSeparator)",
      "height-MenuSeparator": "var(--xmlui-height-MenuSeparator)",
      "color-MenuSeparator": "var(--xmlui-color-MenuSeparator)",
    },
    defaultThemeVars: {
      "color-bg-MenuItem": "$color-bg-dropdown-item",
      "color-MenuItem": "$color-text-primary",
      "font-family-MenuItem": "$font-family",
      "font-size-MenuItem": "$font-size-small",
      "padding-vertical-MenuItem": "$space-2",
      "padding-horizontal-MenuItem": "$space-3",
      "color-bg-MenuItem--hover": "$color-bg-dropdown-item--hover",
      "color-MenuItem--hover": "inherit",
      "gap-MenuItem": "$space-2",
      "color-MenuItem--active": "$color-primary",
      "color-bg-MenuItem--active": "$color-bg-dropdown-item--active",
      light: {},
      dark: {},
    },
    docFolder: "DropdownMenu",
  },
  SubMenuItem: {
    description: "This component represents a nested menu item within another menu or menu item.",
    props: {
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "DropdownMenu/SubMenuItem.mdx?label",
      },
      triggerTemplate: {
        description:
          "This property allows you to define a custom trigger instead of the default one provided by `SubMenuItem`.",
        valueType: "ComponentDef",
        descriptionRef: "DropdownMenu/SubMenuItem.mdx?triggerTemplate",
      },
    },
    docFolder: "DropdownMenu",
  },
  EmojiSelector: {
    description:
      "The `EmojiSelector` component provides users with a graphical interface to browse, search and select emojis to insert into text fields, messages, or other forms of communication.",
    status: "experimental",
    props: {
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "EmojiSelector/EmojiSelector.mdx?autoFocus",
      },
    },
    events: {
      select: {
        description: "This event is fired when the user selects an emoticon from this component.",
        descriptionRef: "EmojiSelector/EmojiSelector.mdx?select",
      },
    },
  },
  FileInput: {
    description:
      "The `FileInput` is a user interface component that allows users to select files from their device's file system for upload (or processing its content otherwise).",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "FileInput/FileInput.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "FileInput/FileInput.mdx?initialValue",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "FileInput/FileInput.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "FileInput/FileInput.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "FileInput/FileInput.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "FileInput/FileInput.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "FileInput/FileInput.mdx?validationStatus",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "FileInput/FileInput.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "FileInput/FileInput.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `FileInput`.",
        descriptionRef: "FileInput/FileInput.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `FileInput` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "FileInput/FileInput.mdx?labelBreak",
      },
      buttonVariant: {
        description: "The button variant to use",
        availableValues: ["solid", "outlined", "ghost"],
        descriptionRef: "FileInput/FileInput.mdx?buttonVariant",
      },
      buttonLabel: {
        description: "This property is an optional string to set a label for the button part.",
        descriptionRef: "FileInput/FileInput.mdx?buttonLabel",
      },
      buttonIcon: {
        description: "The ID of the icon to display in the button",
        descriptionRef: "FileInput/FileInput.mdx?buttonIcon",
      },
      buttonIconPosition: {
        description: "This optional string determines the location of the button icon.",
        availableValues: ["left", "right", "start", "end"],
        descriptionRef: "FileInput/FileInput.mdx?buttonIconPosition",
      },
      acceptsFileType: {
        description: "A list of file types the input controls accepts provided as a string array.",
        descriptionRef: "FileInput/FileInput.mdx?acceptsFileType",
      },
      multiple: {
        description:
          "This boolean property enables to add not just one (`false`), but multiple files to the field (`true`). This is done either by dragging onto the field or by selecting multiple files in the browser menu after clicking the input field button.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "FileInput/FileInput.mdx?multiple",
      },
      directory: {
        description:
          "This boolean property indicates whether the component allows selecting directories (`true`) or files only (`false`).",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "FileInput/FileInput.mdx?directory",
      },
      buttonSize: {
        description: "The size of the button (small, medium, large)",
        availableValues: [
          {
            value: "xs",
            description: "Extra small button",
          },
          {
            value: "sm",
            description: "Small button",
          },
          {
            value: "md",
            description: "Medium button",
          },
          {
            value: "lg",
            description: "Large button",
          },
        ],
        descriptionRef: "FileInput/FileInput.mdx?buttonSize",
      },
      buttonThemeColor: {
        description: "The button color scheme (primary, secondary, attention)",
        availableValues: ["attention", "primary", "secondary"],
        descriptionRef: "FileInput/FileInput.mdx?buttonThemeColor",
      },
    },
    events: {
      didChange: {
        description: "This event is triggered when value of FileInput has changed.",
        descriptionRef: "FileInput/FileInput.mdx?didChange",
      },
      gotFocus: {
        description: "This event is triggered when the FileInput has received the focus.",
        descriptionRef: "FileInput/FileInput.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the FileInput has lost the focus.",
        descriptionRef: "FileInput/FileInput.mdx?lostFocus",
      },
    },
    apis: {
      value: {
        description:
          "By setting an ID for the component, you can refer to the value of the field if set. If no value is set, the value will be undefined.",
        descriptionRef: "FileInput/FileInput.mdx?value",
      },
      setValue: {
        description:
          "(**NOT IMPLEMENTED YET**) You can use this method to set the component's current value programmatically.",
        descriptionRef: "FileInput/FileInput.mdx?setValue",
      },
      focus: {
        description: "This method sets the focus on the FileInput.",
        descriptionRef: "FileInput/FileInput.mdx?focus",
      },
      open: {
        description: "This API command triggers the file browsing dialog to open.",
        descriptionRef: "FileInput/FileInput.mdx?open",
      },
    },
    themeVars: [],
  },
  FileUploadDropZone: {
    description:
      "The `FileUploadDropZone` component allows users to upload files to a web application by dragging and dropping files from their local file system onto a designated area within the UI.",
    props: {
      text: {
        description:
          'With this property, you can change the default text ("Drop files here") to display when files are dragged over the drop zone.',
        descriptionRef: "FileUploadDropZone/FileUploadDropZone.mdx?text",
      },
      allowPaste: {
        description:
          "This property indicates if the drop zone accepts files pasted from the clipboard (`true`) or only dragged files (`false`).",
        descriptionRef: "FileUploadDropZone/FileUploadDropZone.mdx?allowPaste",
      },
      enabled: {
        description:
          "If set to `false`, the drop zone will be disabled and users will not be able to upload files.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "FileUploadDropZone/FileUploadDropZone.mdx?enabled",
      },
    },
    events: {
      upload: {
        description:
          "This component accepts files for upload but does not perform the actual operation. It fires the `upload` event and passes the list files to upload in the method's argument. You can use the passed file information to implement the upload (according to the protocol your backend supports).",
        descriptionRef: "FileUploadDropZone/FileUploadDropZone.mdx?upload",
      },
    },
    themeVars: {
      "color-bg-FileUploadDropZone": "var(--xmlui-color-bg-FileUploadDropZone)",
      "color-text-FileUploadDropZone": "var(--xmlui-color-text-FileUploadDropZone)",
      "color-bg-dropping-FileUploadDropZone": "var(--xmlui-color-bg-dropping-FileUploadDropZone)",
      "opacity-dropping-FileUploadDropZone": "var(--xmlui-opacity-dropping-FileUploadDropZone)",
    },
    defaultThemeVars: {
      "color-bg-FileUploadDropZone": "$color-bg",
      "color-bg-dropping-FileUploadDropZone": "$color-bg--selected",
      "opacity-dropping-FileUploadDropZone": "0.5",
      "color-text-FileUploadDropZone": "$color-text",
      light: {},
      dark: {},
    },
  },
  FlowLayout: {
    description:
      "This layout component is used to position content in rows with an auto wrapping feature: if the length of the items exceed the available space the layout will wrap into a new line.",
    props: {
      gap: {
        description:
          "This property defines the gap between items in the same row and between rows. The FlowLayout component creates a new row when an item is about to overflow the current row.",
        descriptionRef: "FlowLayout/FlowLayout.mdx?gap",
      },
      columnGap: {
        description:
          "The `columnGap` property specifies the space between items in a single row; it overrides the `gap` value.",
        descriptionRef: "FlowLayout/FlowLayout.mdx?columnGap",
      },
      rowGap: {
        description:
          "The `rowGap` property specifies the space between the FlowLayout rows; it overrides the `gap` value.",
        descriptionRef: "FlowLayout/FlowLayout.mdx?rowGap",
      },
      shadow: {
        description: "FlowLayout does not support shadow, we're waiting for a decent solution.",
        descriptionRef: "FlowLayout/FlowLayout.mdx?shadow",
      },
    },
    themeVars: [],
  },
  Footer: {
    description: "The `Footer` is a component that acts as a placeholder within `App`.",
    themeVars: {
      "padding-horizontal-Footer": "var(--xmlui-padding-horizontal-Footer)",
      "padding-vertical-Footer": "var(--xmlui-padding-vertical-Footer)",
      "padding-top-Footer": "var(--xmlui-padding-top-Footer)",
      "padding-bottom-Footer": "var(--xmlui-padding-bottom-Footer)",
      "padding-left-Footer": "var(--xmlui-padding-left-Footer)",
      "padding-right-Footer": "var(--xmlui-padding-right-Footer)",
      "padding-Footer": "var(--xmlui-padding-Footer)",
      "color-border-horizontal-Footer": "var(--xmlui-color-border-horizontal-Footer)",
      "thickness-border-horizontal-Footer": "var(--xmlui-thickness-border-horizontal-Footer)",
      "style-border-horizontal-Footer": "var(--xmlui-style-border-horizontal-Footer)",
      "color-border-vertical-Footer": "var(--xmlui-color-border-vertical-Footer)",
      "thickness-border-vertical-Footer": "var(--xmlui-thickness-border-vertical-Footer)",
      "style-border-vertical-Footer": "var(--xmlui-style-border-vertical-Footer)",
      "color-border-left-Footer": "var(--xmlui-color-border-left-Footer)",
      "thickness-border-left-Footer": "var(--xmlui-thickness-border-left-Footer)",
      "style-border-left-Footer": "var(--xmlui-style-border-left-Footer)",
      "color-border-right-Footer": "var(--xmlui-color-border-right-Footer)",
      "thickness-border-right-Footer": "var(--xmlui-thickness-border-right-Footer)",
      "style-border-right-Footer": "var(--xmlui-style-border-right-Footer)",
      "color-border-top-Footer": "var(--xmlui-color-border-top-Footer)",
      "thickness-border-top-Footer": "var(--xmlui-thickness-border-top-Footer)",
      "style-border-top-Footer": "var(--xmlui-style-border-top-Footer)",
      "color-border-bottom-Footer": "var(--xmlui-color-border-bottom-Footer)",
      "thickness-border-bottom-Footer": "var(--xmlui-thickness-border-bottom-Footer)",
      "style-border-bottom-Footer": "var(--xmlui-style-border-bottom-Footer)",
      "color-border-Footer": "var(--xmlui-color-border-Footer)",
      "thickness-border-Footer": "var(--xmlui-thickness-border-Footer)",
      "style-border-Footer": "var(--xmlui-style-border-Footer)",
      "radius-Footer": "var(--xmlui-radius-Footer)",
      "color-bg-Footer": "var(--xmlui-color-bg-Footer)",
      "color-text-Footer": "var(--xmlui-color-text-Footer)",
      "height-Footer": "var(--xmlui-height-Footer)",
      "font-size-Footer": "var(--xmlui-font-size-Footer)",
      "align-vertical-Footer": "var(--xmlui-align-vertical-Footer)",
      "max-content-width-Footer": "var(--xmlui-max-content-width-Footer)",
    },
    defaultThemeVars: {
      "color-bg-Footer": "$color-bg-AppHeader",
      "align-vertical-Footer": "center",
      "font-size-Footer": "$font-size-small",
      "color-text-Footer": "$color-text-secondary",
      "max-content-width-Footer": "$max-content-width",
      "padding-left-Footer": "$padding-horizontal-Footer",
      "padding-right-Footer": "$padding-horizontal-Footer",
      "padding-top-Footer": "$padding-vertical-Footer",
      "padding-bottom-Footer": "$padding-vertical-Footer",
      "padding-horizontal-Footer": "$space-4",
      "padding-vertical-Footer": "$space-2",
      "padding-Footer":
        "$padding-top-Footer $padding-right-Footer $padding-bottom-Footer $padding-left-Footer",
      "radius-Footer": "$radius",
      "color-border-left-Footer": "",
      "thickness-border-left-Footer": "",
      "style-border-left-Footer": "",
      "border-left-Footer":
        "$thickness-border-left-Footer $style-border-left-Footer $color-border-left-Footer",
      "color-border-right-Footer": "",
      "thickness-border-right-Footer": "",
      "style-border-right-Footer": "",
      "border-right-Footer":
        "$thickness-border-right-Footer $style-border-right-Footer $color-border-right-Footer",
      "color-border-top-Footer": "$color-border",
      "thickness-border-top-Footer": "1px",
      "style-border-top-Footer": "solid",
      "border-top-Footer":
        "$thickness-border-top-Footer $style-border-top-Footer $color-border-top-Footer",
      "color-border-bottom-Footer": "",
      "thickness-border-bottom-Footer": "",
      "style-border-bottom-Footer": "",
      "border-bottom-Footer":
        "$thickness-border-bottom-Footer $style-border-bottom-Footer $color-border-bottom-Footer",
      "color-border-horizontal-Footer": "",
      "thickness-border-horizontal-Footer": "",
      "style-border-horizontal-Footer": "",
      "border-horizontal-Footer":
        "$thickness-border-horizontal-Footer $style-border-horizontal-Footer $color-border-horizontal-Footer",
      "color-border-vertical-Footer": "",
      "thickness-border-vertical-Footer": "",
      "style-border-vertical-Footer": "",
      "border-vertical-Footer":
        "$thickness-border-vertical-Footer $style-border-vertical-Footer $color-border-vertical-Footer",
      "color-border-Footer": "",
      "thickness-border-Footer": "",
      "style-border-Footer": "",
      "border-Footer": "$thickness-border-Footer $style-border-Footer $color-border-Footer ",
      light: {},
      dark: {},
    },
  },
  Form: {
    description:
      "A `Form` is a fundamental component that displays user interfaces that allow users to input (or change) data and submit it to the app (a server) for further processing.",
    status: "experimental",
    props: {
      buttonRowTemplate: {
        description:
          "This property allows defining a custom component to display the buttons at the bottom of the form.",
        valueType: "ComponentDef",
        descriptionRef: "Form/Form.mdx?buttonRowTemplate",
      },
      itemLabelPosition: {
        description:
          "This property sets the position of the item labels within the form. The default value is `top`. Individual `FormItem` instances can override this property.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        valueType: "string",
        descriptionRef: "Form/Form.mdx?itemLabelPosition",
      },
      itemLabelWidth: {
        description:
          "This property sets the width of the item labels within the form. Individual `FormItem` instances can override this property.",
        descriptionRef: "Form/Form.mdx?itemLabelWidth",
      },
      itemLabelBreak: {
        description:
          "This boolean value indicates if form item labels can be split into multiple lines if it would overflow the available label width. Individual `FormItem` instances can override this property.",
        descriptionRef: "Form/Form.mdx?itemLabelBreak",
      },
      data: {
        description:
          "This property sets the initial value of the form's data structure. The form infrastructure uses this value to set the initial state of form items within the form.",
        descriptionRef: "Form/Form.mdx?data",
      },
      cancelLabel: {
        description: 'This property defines the label of the Cancel button, by default, "Cancel".',
        descriptionRef: "Form/Form.mdx?cancelLabel",
      },
      saveLabel: {
        description: 'This property defines the label of the Save button, by default, "Save".',
        descriptionRef: "Form/Form.mdx?saveLabel",
      },
      saveInProgressLabel: {
        description:
          "This property defines the label of the Save button to display during the form data submit (save) operation. By default, the value of `saveLabel`.",
        descriptionRef: "Form/Form.mdx?saveInProgressLabel",
      },
      swapCancelAndSave: {
        description:
          "By default, the Cancel button is to the left of the Save button. Set this property to `true` to swap them or `false` to keep their original location.",
        descriptionRef: "Form/Form.mdx?swapCancelAndSave",
      },
      submitUrl: {
        description: "URL to submit the form data.",
        descriptionRef: "Form/Form.mdx?submitUrl",
      },
      submitMethod: {
        description: "HTTP method to use when submitting the form data.",
        descriptionRef: "Form/Form.mdx?submitMethod",
      },
      enabled: {
        description: "Whether the form is enabled or not. The default value is `true`.",
        descriptionRef: "Form/Form.mdx?enabled",
      },
      _data_url: {
        description: "when we have an api bound data prop, we inject the url here",
        isInternal: true,
        descriptionRef: "Form/Form.mdx?_data_url",
      },
    },
    events: {
      submit: {
        description:
          "The form infrastructure fires this event when the form is submitted. The event argument is the current `data` value to save.",
        descriptionRef: "Form/Form.mdx?submit",
      },
      cancel: {
        description: "The form infrastructure fires this event when the form is canceled.",
        descriptionRef: "Form/Form.mdx?cancel",
      },
      reset: {
        description: "The form infrastructure fires this event when the form is reset.",
        descriptionRef: "Form/Form.mdx?reset",
      },
    },
    contextVars: {
      $data: {
        description:
          "This property represents the value of the form data. You can access the fields of the form using the IDs in the `bindTo` property of nested `FormItem` instances.",
        descriptionRef: "Form/Form.mdx?$data",
      },
    },
    themeVars: {
      "gap-Form": "var(--xmlui-gap-Form)",
      "gap-buttonRow-Form": "var(--xmlui-gap-buttonRow-Form)",
    },
    defaultThemeVars: {
      "gap-Form": "$space-4",
      "gap-buttonRow-Form": "$space-4",
      light: {
        "color-bg-ValidationDisplay-error": "$color-danger-100",
        "color-bg-ValidationDisplay-warning": "$color-warn-100",
        "color-bg-ValidationDisplay-info": "$color-primary-100",
        "color-bg-ValidationDisplay-valid": "$color-success-100",
        "color-accent-ValidationDisplay-error": "$color-error",
        "color-accent-ValidationDisplay-warning": "$color-warning",
        "color-accent-ValidationDisplay-info": "$color-info",
        "color-accent-ValidationDisplay-valid": "$color-valid",
        "color-text-ValidationDisplay-error": "$color-error",
        "color-text-ValidationDisplay-warning": "$color-warning",
        "color-text-ValidationDisplay-info": "$color-info",
        "color-text-ValidationDisplay-valid": "$color-valid",
      },
      dark: {
        "color-bg-ValidationDisplay-error": "$color-danger-900",
        "color-bg-ValidationDisplay-warning": "$color-warn-900",
        "color-bg-ValidationDisplay-info": "$color-secondary-800",
        "color-bg-ValidationDisplay-valid": "$color-success-900",
        "color-accent-ValidationDisplay-error": "$color-danger-500",
        "color-accent-ValidationDisplay-warning": "$color-warn-700",
        "color-accent-ValidationDisplay-info": "$color-surface-200",
        "color-accent-ValidationDisplay-valid": "$color-success-600",
        "color-text-ValidationDisplay-error": "$color-danger-500",
        "color-text-ValidationDisplay-warning": "$color-warn-700",
        "color-text-ValidationDisplay-info": "$color-secondary-200",
        "color-text-ValidationDisplay-valid": "$color-success-600",
      },
    },
  },
  FormItem: {
    description:
      "A `FormItem` component represents a single input element within a `Form`. The value within the `FormItem` may be associated with a particular property within the encapsulating `Form` component's data.",
    status: "experimental",
    props: {
      bindTo: {
        description:
          "This property binds a particular input field to one of the attributes of the `Form` data. It names the property of the form's `data` data to get the input's initial value.When the field is saved, its value will be stored in the `data` property with this name.",
        descriptionRef: "FormItem/FormItem.mdx?bindTo",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "FormItem/FormItem.mdx?autoFocus",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "FormItem/FormItem.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        descriptionRef: "FormItem/FormItem.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the item label.",
        descriptionRef: "FormItem/FormItem.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the label can be split into multiple lines if it would overflow the available label width.",
        descriptionRef: "FormItem/FormItem.mdx?labelBreak",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "FormItem/FormItem.mdx?enabled",
      },
      type: {
        description:
          "This property is used to determine the specific input control the FormItem will wrap around. Note that the control names start with a lowercase letter and map to input components found in XMLUI.",
        descriptionRef: "FormItem/FormItem.mdx?type",
      },
      customValidationsDebounce: {
        description:
          "This optional number prop determines the time interval between two runs of a custom validation.",
        descriptionRef: "FormItem/FormItem.mdx?customValidationsDebounce",
      },
      validationMode: {
        description:
          "This property sets what kind of validation mode or strategy to employ for a particular input field.",
        descriptionRef: "FormItem/FormItem.mdx?validationMode",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "FormItem/FormItem.mdx?initialValue",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "FormItem/FormItem.mdx?required",
      },
      requiredInvalidMessage: {
        description:
          "This optional string property is used to customize the message that is displayed if the field is not filled in.",
        descriptionRef: "FormItem/FormItem.mdx?requiredInvalidMessage",
      },
      minLength: {
        description: "Checks whether the input has a minimum length of a specified value.",
        descriptionRef: "FormItem/FormItem.mdx?minLength",
      },
      maxLength: {
        description: "Checks whether the input has a maximum length of a specified value.",
        descriptionRef: "FormItem/FormItem.mdx?maxLength",
      },
      maxTextLength: {
        description: "The maximum length of the text in the input field",
        descriptionRef: "FormItem/FormItem.mdx?maxTextLength",
      },
      lengthInvalidMessage: {
        description:
          "This optional string property is used to customize the message that is displayed on a failed length check: [minLength](#minlength) or [maxLength](#maxlength).",
        descriptionRef: "FormItem/FormItem.mdx?lengthInvalidMessage",
      },
      lengthInvalidSeverity: {
        description: "This property sets the severity level of length validations.",
        descriptionRef: "FormItem/FormItem.mdx?lengthInvalidSeverity",
      },
      minValue: {
        description: "Checks whether the input has the minimum specified value.",
        descriptionRef: "FormItem/FormItem.mdx?minValue",
      },
      maxValue: {
        description: "Checks whether the input has the maximum specified value.",
        descriptionRef: "FormItem/FormItem.mdx?maxValue",
      },
      rangeInvalidMessage: {
        description:
          "This optional string property is used to customize the message that is displayed when a value is out of range.",
        descriptionRef: "FormItem/FormItem.mdx?rangeInvalidMessage",
      },
      rangeInvalidSeverity: {
        description: "This property sets the severity level of the value range validation.",
        descriptionRef: "FormItem/FormItem.mdx?rangeInvalidSeverity",
      },
      pattern: {
        description: "Checks whether the input fits a predefined regular expression.",
        descriptionRef: "FormItem/FormItem.mdx?pattern",
      },
      patternInvalidMessage: {
        description:
          "This optional string property is used to customize the message that is displayed on a failed pattern test.",
        descriptionRef: "FormItem/FormItem.mdx?patternInvalidMessage",
      },
      patternInvalidSeverity: {
        description: "This property sets the severity level of the pattern validation.",
        descriptionRef: "FormItem/FormItem.mdx?patternInvalidSeverity",
      },
      regex: {
        description: "Checks whether the input fits the provided regular expression.",
        descriptionRef: "FormItem/FormItem.mdx?regex",
      },
      regexInvalidMessage: {
        description:
          "This optional string property is used to customize the message that is displayed on a failed regular expression test.",
        descriptionRef: "FormItem/FormItem.mdx?regexInvalidMessage",
      },
      regexInvalidSeverity: {
        description: "This property sets the severity level of regular expression validation.",
        descriptionRef: "FormItem/FormItem.mdx?regexInvalidSeverity",
      },
    },
    events: {
      validate: {
        description: "This event is used to define a custom validation function.",
        descriptionRef: "FormItem/FormItem.mdx?validate",
      },
    },
    contextVars: {
      $value: {
        description:
          "The context variable represents the current value of the `FormItem`. It can be used in expressions and code snippets within the `FormItem` instance.",
        descriptionRef: "FormItem/FormItem.mdx?$value",
      },
      $setValue: {
        description:
          "This function can be invoked to set the `FormItem` instance's value. The function has a single argument, the new value to set.",
        descriptionRef: "FormItem/FormItem.mdx?$setValue",
      },
      $validationResult: {
        description:
          "This variable represents the result of the latest validation of the `FormItem` instance.",
        descriptionRef: "FormItem/FormItem.mdx?$validationResult",
      },
    },
    themeVars: {
      "color-text-FormItemLabel": "var(--xmlui-color-text-FormItemLabel)",
      "font-size-FormItemLabel": "var(--xmlui-font-size-FormItemLabel)",
      "font-weight-FormItemLabel": "var(--xmlui-font-weight-FormItemLabel)",
      "font-style-FormItemLabel": "var(--xmlui-font-style-FormItemLabel)",
      "textTransform-FormItemLabel": "var(--xmlui-textTransform-FormItemLabel)",
      "color-text-FormItemLabel-required": "var(--xmlui-color-text-FormItemLabel-required)",
      "font-size-FormItemLabel-required": "var(--xmlui-font-size-FormItemLabel-required)",
      "font-weight-FormItemLabel-required": "var(--xmlui-font-weight-FormItemLabel-required)",
      "font-style-FormItemLabel-required": "var(--xmlui-font-style-FormItemLabel-required)",
      "transform-text-FormItemLabel-required": "var(--xmlui-transform-text-FormItemLabel-required)",
      "color-text-FormItemLabel-requiredMark": "var(--xmlui-color-text-FormItemLabel-requiredMark)",
    },
    defaultThemeVars: {
      "color-text-FormItemLabel": "$color-text-primary",
      "font-size-FormItemLabel": "$font-size-small",
      "font-weight-FormItemLabel": "$font-weight-medium",
      "font-style-FormItemLabel": "normal",
      "transform-text-FormItemLabel": "none",
      "color-text-FormItemLabel-requiredMark": "$color-danger-400",
    },
  },
  FormSection: {
    description:
      "The `FormSection` is a component that groups cohesive elements together within a `Form`. This grouping is indicated visually: the child components of the `FormSection` are placed in a [`FlowLayout`](./FlowLayout.mdx) component.",
    status: "experimental",
  },
  Heading: {
    description: "Represents a heading text",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      level: {
        description: "This property sets the visual significance (level) of the heading.",
        descriptionRef: "Heading/Heading.mdx?level",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
      ellipses: {
        description:
          "This property indicates whether ellipses should be displayed (`true`) when the heading text is cropped or not (`false`).",
        descriptionRef: "Heading/Heading.mdx?ellipses",
      },
      preserveLinebreaks: {
        description:
          "This property indicates whether linebreaks should be preserved when displaying text.",
        descriptionRef: "Heading/Heading.mdx?preserveLinebreaks",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-family-Heading": "$font-family",
      "color-text-Heading": "$color-text-primary",
      "font-weight-Heading": "$font-weight-bold",
      "letter-spacing-Heading ": "0",
      light: {},
      dark: {},
    },
  },
  H1: {
    description: "Represents a heading level 1 text",
    specializedFrom: "Heading",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-size-H1": "$font-size-large",
      "line-height-H1": "$line-height-none",
      "margin-top-H1": "0",
      "margin-bottom-H1": "0",
      light: {},
      dark: {},
    },
  },
  H2: {
    description: "Represents a heading level 2 text",
    specializedFrom: "Heading",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-size-H2": "$font-size-medium",
      "line-height-H2": "$line-height-none",
      "margin-top-H2": "0",
      "margin-bottom-H2": "0",
      light: {},
      dark: {},
    },
  },
  H3: {
    description: "Represents a heading level 3 text",
    specializedFrom: "Heading",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-size-H3": "$font-size-normal",
      "line-height-H3": "$line-height-none",
      "margin-top-H3": "0",
      "margin-bottom-H3": "0",
      light: {},
      dark: {},
    },
  },
  H4: {
    description: "Represents a heading level 4 text",
    specializedFrom: "Heading",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-size-H4": "$font-size-small",
      "line-height-H4": "$line-height-none",
      "margin-top-H4": "0",
      "margin-bottom-H4": "0",
      light: {},
      dark: {},
    },
  },
  H5: {
    description: "Represents a heading level 5 text",
    specializedFrom: "Heading",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-size-H5": "$font-size-smaller",
      "line-height-H5": "$line-height-none",
      "margin-top-H5": "0",
      "margin-bottom-H5": "0",
      light: {},
      dark: {},
    },
  },
  H6: {
    description: "Represents a heading level 6 text",
    specializedFrom: "Heading",
    props: {
      value: {
        description:
          "This property determines the text displayed in the heading. `Heading` also accepts nested text instead of specifying the `value`. If both `value` and a nested text are used, the `value` will be displayed.",
        descriptionRef: "Heading/H6.mdx?value",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is not enough space for all of the text, the component wraps the text up to as many lines as specified.",
        descriptionRef: "Heading/H6.mdx?maxLines",
      },
    },
    themeVars: {
      "Heading:color-text-H1": "var(--xmlui-color-text-H1)",
      "Heading:letter-spacing-H1": "var(--xmlui-letter-spacing-H1)",
      "Heading:font-family-H1": "var(--xmlui-font-family-H1)",
      "Heading:font-weight-H1": "var(--xmlui-font-weight-H1)",
      "font-size-H1": "var(--xmlui-font-size-H1)",
      "line-height-H1": "var(--xmlui-line-height-H1)",
      "margin-top-H1": "var(--xmlui-margin-top-H1)",
      "margin-bottom-H1": "var(--xmlui-margin-bottom-H1)",
      "Heading:line-decoration-H1": "var(--xmlui-line-decoration-H1)",
      "Heading:color-decoration-H1": "var(--xmlui-color-decoration-H1)",
      "Heading:style-decoration-H1": "var(--xmlui-style-decoration-H1)",
      "Heading:thickness-decoration-H1": "var(--xmlui-thickness-decoration-H1)",
      "Heading:offset-decoration-H1": "var(--xmlui-offset-decoration-H1)",
      "Heading:color-text-H2": "var(--xmlui-color-text-H2)",
      "Heading:letter-spacing-H2": "var(--xmlui-letter-spacing-H2)",
      "Heading:font-family-H2": "var(--xmlui-font-family-H2)",
      "Heading:font-weight-H2": "var(--xmlui-font-weight-H2)",
      "font-size-H2": "var(--xmlui-font-size-H2)",
      "line-height-H2": "var(--xmlui-line-height-H2)",
      "margin-top-H2": "var(--xmlui-margin-top-H2)",
      "margin-bottom-H2": "var(--xmlui-margin-bottom-H2)",
      "Heading:line-decoration-H2": "var(--xmlui-line-decoration-H2)",
      "Heading:color-decoration-H2": "var(--xmlui-color-decoration-H2)",
      "Heading:style-decoration-H2": "var(--xmlui-style-decoration-H2)",
      "Heading:thickness-decoration-H2": "var(--xmlui-thickness-decoration-H2)",
      "Heading:offset-decoration-H2": "var(--xmlui-offset-decoration-H2)",
      "Heading:color-text-H3": "var(--xmlui-color-text-H3)",
      "Heading:letter-spacing-H3": "var(--xmlui-letter-spacing-H3)",
      "Heading:font-family-H3": "var(--xmlui-font-family-H3)",
      "Heading:font-weight-H3": "var(--xmlui-font-weight-H3)",
      "font-size-H3": "var(--xmlui-font-size-H3)",
      "line-height-H3": "var(--xmlui-line-height-H3)",
      "margin-top-H3": "var(--xmlui-margin-top-H3)",
      "margin-bottom-H3": "var(--xmlui-margin-bottom-H3)",
      "Heading:line-decoration-H3": "var(--xmlui-line-decoration-H3)",
      "Heading:color-decoration-H3": "var(--xmlui-color-decoration-H3)",
      "Heading:style-decoration-H3": "var(--xmlui-style-decoration-H3)",
      "Heading:thickness-decoration-H3": "var(--xmlui-thickness-decoration-H3)",
      "Heading:offset-decoration-H3": "var(--xmlui-offset-decoration-H3)",
      "Heading:color-text-H4": "var(--xmlui-color-text-H4)",
      "Heading:letter-spacing-H4": "var(--xmlui-letter-spacing-H4)",
      "Heading:font-family-H4": "var(--xmlui-font-family-H4)",
      "Heading:font-weight-H4": "var(--xmlui-font-weight-H4)",
      "font-size-H4": "var(--xmlui-font-size-H4)",
      "line-height-H4": "var(--xmlui-line-height-H4)",
      "margin-top-H4": "var(--xmlui-margin-top-H4)",
      "margin-bottom-H4": "var(--xmlui-margin-bottom-H4)",
      "Heading:line-decoration-H4": "var(--xmlui-line-decoration-H4)",
      "Heading:color-decoration-H4": "var(--xmlui-color-decoration-H4)",
      "Heading:style-decoration-H4": "var(--xmlui-style-decoration-H4)",
      "Heading:thickness-decoration-H4": "var(--xmlui-thickness-decoration-H4)",
      "Heading:offset-decoration-H4": "var(--xmlui-offset-decoration-H4)",
      "Heading:color-text-H5": "var(--xmlui-color-text-H5)",
      "Heading:letter-spacing-H5": "var(--xmlui-letter-spacing-H5)",
      "Heading:font-family-H5": "var(--xmlui-font-family-H5)",
      "Heading:font-weight-H5": "var(--xmlui-font-weight-H5)",
      "font-size-H5": "var(--xmlui-font-size-H5)",
      "line-height-H5": "var(--xmlui-line-height-H5)",
      "margin-top-H5": "var(--xmlui-margin-top-H5)",
      "margin-bottom-H5": "var(--xmlui-margin-bottom-H5)",
      "Heading:line-decoration-H5": "var(--xmlui-line-decoration-H5)",
      "Heading:color-decoration-H5": "var(--xmlui-color-decoration-H5)",
      "Heading:style-decoration-H5": "var(--xmlui-style-decoration-H5)",
      "Heading:thickness-decoration-H5": "var(--xmlui-thickness-decoration-H5)",
      "Heading:offset-decoration-H5": "var(--xmlui-offset-decoration-H5)",
      "Heading:color-text-H6": "var(--xmlui-color-text-H6)",
      "Heading:letter-spacing-H6": "var(--xmlui-letter-spacing-H6)",
      "Heading:font-family-H6": "var(--xmlui-font-family-H6)",
      "Heading:font-weight-H6": "var(--xmlui-font-weight-H6)",
      "font-size-H6": "var(--xmlui-font-size-H6)",
      "line-height-H6": "var(--xmlui-line-height-H6)",
      "margin-top-H6": "var(--xmlui-margin-top-H6)",
      "margin-bottom-H6": "var(--xmlui-margin-bottom-H6)",
      "Heading:line-decoration-H6": "var(--xmlui-line-decoration-H6)",
      "Heading:color-decoration-H6": "var(--xmlui-color-decoration-H6)",
      "Heading:style-decoration-H6": "var(--xmlui-style-decoration-H6)",
      "Heading:thickness-decoration-H6": "var(--xmlui-thickness-decoration-H6)",
      "Heading:offset-decoration-H6": "var(--xmlui-offset-decoration-H6)",
    },
    defaultThemeVars: {
      "font-size-H6": "$font-size-tiny",
      "line-height-H6": "$line-height-none",
      "margin-top-H6": "0",
      "margin-bottom-H6": "0",
      light: {},
      dark: {},
    },
  },
  HoverCard: {
    description:
      "(**OBSOLETE**) This component displays some content when its parent component is hovered.",
    status: "deprecated",
    props: {
      triggerTemplate: {
        description: "The component that opens the hover card when hovered.",
        valueType: "ComponentDef",
      },
    },
  },
  Icon: {
    description: "This component is the representation of an icon.",
    status: "experimental",
    props: {
      name: {
        description:
          "This string property specifies the name of the icon to display. All icons have unique names and identifying the name is case-sensitive.",
        descriptionRef: "Icon/Icon.mdx?name",
      },
      size: {
        description:
          "This property defines the size of the `Icon`. Note that setting the `height` and/or the `width` of the component will override this property.",
        descriptionRef: "Icon/Icon.mdx?size",
      },
      fallback: {
        description:
          "This optional property provides a way to handle situations when the provided [icon name](#name) is not found in the registry.",
        descriptionRef: "Icon/Icon.mdx?fallback",
      },
    },
    themeVars: {
      "size-Icon": "var(--xmlui-size-Icon)",
      "thickness-stroke-Icon": "var(--xmlui-thickness-stroke-Icon)",
    },
    defaultThemeVars: {
      "size-Icon": "1.25em",
    },
  },
  IconInfoCard: {
    description: "This component displays an icon and some content in a card.",
    status: "experimental",
    props: {
      height: {
        description: "The height of the card.",
        descriptionRef: "IconInfoCard/IconInfoCard.mdx?height",
      },
      iconBackgroundColor: {
        description: "The background color of the icon.",
        descriptionRef: "IconInfoCard/IconInfoCard.mdx?iconBackgroundColor",
      },
      iconName: {
        description: "The name of the icon to display.",
        descriptionRef: "IconInfoCard/IconInfoCard.mdx?iconName",
      },
    },
  },
  Image: {
    description:
      "The `Image` component represents or depicts an object, scene, idea, or other concept with a picture.",
    props: {
      src: {
        description: "This property is used to indicate the source (path) of the image to display.",
        descriptionRef: "Image/Image.mdx?src",
      },
      alt: {
        description: "This property specifies an alternate text for the image.",
        descriptionRef: "Image/Image.mdx?alt",
      },
      fit: {
        description:
          "This property sets how the image content should be resized to fit its container.",
        descriptionRef: "Image/Image.mdx?fit",
      },
      lazyLoad: {
        description:
          "Lazy loading instructs the browser to load the image only when it is imminently needed (e.g. user scrolls to it). The default value is eager (`false`).",
        descriptionRef: "Image/Image.mdx?lazyLoad",
      },
      aspectRatio: {
        description:
          "This property sets a preferred aspect ratio for the image, which will be used in the calculation of auto sizes and some other layout functions.",
        descriptionRef: "Image/Image.mdx?aspectRatio",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Image is clicked.",
        descriptionRef: "Image/Image.mdx?click",
      },
    },
    themeVars: [],
  },
  Items: {
    description:
      "The `Items` component maps sequential data items into component instances, representing each data item as a particular component.",
    props: {
      items: {
        description: "This property contains the list of data items this component renders.",
        valueType: "ComponentDef",
        descriptionRef: "Items/Items.mdx?items",
      },
      data: {
        description:
          "This property contains the list of data items (obtained from a data source) this component renders.",
        descriptionRef: "Items/Items.mdx?data",
      },
      reverse: {
        description:
          "This property reverses the order in which data is mapped to template components.",
        descriptionRef: "Items/Items.mdx?reverse",
      },
      itemTemplate: {
        description: "The component template to display a single item",
        valueType: "ComponentDef",
        descriptionRef: "Items/Items.mdx?itemTemplate",
      },
    },
    contextVars: {
      $item: {
        description:
          "This value represents the current iteration item while the component renders its children.",
        valueType: "ComponentDef",
        descriptionRef: "Items/Items.mdx?$item",
      },
      $itemIndex: {
        description:
          "This integer value represents the current iteration index (zero-based) while rendering children.",
        valueType: "ComponentDef",
        descriptionRef: "Items/Items.mdx?$itemIndex",
      },
      $isFirst: {
        description: "This boolean value indicates if the component renders its first item.",
        valueType: "ComponentDef",
        descriptionRef: "Items/Items.mdx?$isFirst",
      },
      $isLast: {
        description: "This boolean value indicates if the component renders its last item.",
        valueType: "ComponentDef",
        descriptionRef: "Items/Items.mdx?$isLast",
      },
    },
    opaque: true,
  },
  Link: {
    description:
      "A `Link` component represents a navigation target within the app or a reference to an external web URL.",
    props: {
      to: {
        description: "This property defines the URL of the link.",
        descriptionRef: "Link/Link.mdx?to",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "Link/Link.mdx?enabled",
      },
      active: {
        description:
          "Indicates whether this link is active or not. If so, it will have a distinct visual appearance.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Link/Link.mdx?active",
      },
      target: {
        description:
          "This property specifies where to open the link represented by the `Link`. This property accepts the following values (in accordance with the HTML standard):",
        availableValues: [
          {
            value: "_self",
            description: "The link will open in the same frame as it was clicked.",
          },
          {
            value: "_blank",
            description: "The link will open in a new window or tab.",
          },
          {
            value: "_parent",
            description: "The link will open in the parent frame. If no parent, behaves as _self.",
          },
          {
            value: "_top",
            description:
              "The topmost browsing context. The link will open in the full body of the window. If no ancestors, behaves as _self.",
          },
        ],
        valueType: "string",
        defaultValue: "_self",
        descriptionRef: "Link/Link.mdx?target",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "Link/Link.mdx?label",
      },
      icon: {
        description:
          "This property allows you to add an icon (specify the icon's name) to the link.",
        descriptionRef: "Link/Link.mdx?icon",
      },
    },
    themeVars: {
      "color-text-Link": "var(--xmlui-color-text-Link)",
      "color-text-Link--active": "var(--xmlui-color-text-Link--active)",
      "color-text-Link--hover": "var(--xmlui-color-text-Link--hover)",
      "color-text-Link--hover--active": "var(--xmlui-color-text-Link--hover--active)",
      "font-size-Link": "var(--xmlui-font-size-Link)",
      "font-weight-Link": "var(--xmlui-font-weight-Link)",
      "font-weight-Link--active": "var(--xmlui-font-weight-Link--active)",
      "color-decoration-Link": "var(--xmlui-color-decoration-Link)",
      "offset-decoration-Link": "var(--xmlui-offset-decoration-Link)",
      "line-decoration-Link": "var(--xmlui-line-decoration-Link)",
      "style-decoration-Link": "var(--xmlui-style-decoration-Link)",
      "thickness-decoration-Link": "var(--xmlui-thickness-decoration-Link)",
      "padding-icon-Link": "var(--xmlui-padding-icon-Link)",
      "gap-icon-Link": "var(--xmlui-gap-icon-Link)",
      "thickness-outline-Link--focus": "var(--xmlui-thickness-outline-Link--focus)",
      "color-outline-Link--focus": "var(--xmlui-color-outline-Link--focus)",
      "style-outline-Link--focus": "var(--xmlui-style-outline-Link--focus)",
      "offset-outline-Link--focus": "var(--xmlui-offset-outline-Link--focus)",
    },
    defaultThemeVars: {
      "color-text-Link--hover--active": "$color-text-Link--active",
      "color-text-decoration-Link--hover": "$color-surface-400A80",
      "color-text-decoration-Link--active": "$color-surface200",
      "font-weight-Link--active": "$font-weight-bold",
      "color-decoration-Link": "$color-surface-400",
      "offset-decoration-Link": "$space-1",
      "line-decoration-Link": "underline",
      "style-decoration-Link": "dashed",
      "thickness-decoration-Link": "$space-0_5",
      "color-outline-Link--focus": "$color-outline--focus",
      "thickness-outline-Link--focus": "$thickness-outline--focus",
      "style-outline-Link--focus": "$style-outline--focus",
      "offset-outline-Link--focus": "$offset-outline--focus",
      "font-size-Link": "inherit",
      "gap-icon-Link": "$gap-tight",
      "padding-icon-Link": "$space-0_5",
      light: {
        "color-text-Link": "$color-primary-500",
        "color-text-Link--active": "$color-primary-500",
      },
      dark: {
        "color-text-Link": "$color-primary-500",
        "color-text-Link--active": "$color-primary-500",
      },
    },
  },
  List: {
    description:
      "The `List` component is a robust layout container that renders associated data items as a list of components. `List` is virtualized; it renders only items that are visible in the viewport.",
    status: "experimental",
    props: {
      data: {
        description:
          "The component receives data via this property. The `data` property is a list of items that the `List` can display.",
        descriptionRef: "List/List.mdx?data",
      },
      items: {
        description:
          "You can use `items` as an alias for the `data` property. When you bind the list to a data source (e.g. an API endpoint), the `data` acts as the property that accepts a URL to fetch information from an API.When both `items` and `data` are used, `items` has priority.",
        descriptionRef: "List/List.mdx?items",
      },
      loading: {
        description:
          "This property delays the rendering of children until it is set to `false`, or the component receives usable list items via the [`data`](#data) property.",
        descriptionRef: "List/List.mdx?loading",
      },
      limit: {
        description: "This property limits the number of items displayed in the `List`.",
        descriptionRef: "List/List.mdx?limit",
      },
      scrollAnchor: {
        description:
          "This property pins the scroll position to a specified location of the list. Available values are shown below.",
        availableValues: ["top", "bottom"],
        valueType: "string",
        defaultValue: "top",
        descriptionRef: "List/List.mdx?scrollAnchor",
      },
      groupBy: {
        description:
          "This property sets which attribute of the data is used to group the list items. If the attribute does not appear in the data, it will be ignored.",
        descriptionRef: "List/List.mdx?groupBy",
      },
      orderBy: {
        description:
          "This property enables the ordering of list items by specifying an attribute in the data.",
        descriptionRef: "List/List.mdx?orderBy",
      },
      availableGroups: {
        description: "This property is an array of group names that the `List` will display.",
        descriptionRef: "List/List.mdx?availableGroups",
      },
      groupHeaderTemplate: {
        description:
          "Enables the customization of how the groups are displayed, similarly to the [`itemTemplate`](#itemtemplate). You can use the `$item` context variable to access an item group and map its individual attributes.",
        valueType: "ComponentDef",
        descriptionRef: "List/List.mdx?groupHeaderTemplate",
      },
      groupFooterTemplate: {
        description:
          "Enables the customization of how the the footer of each group is displayed. Combine with [`groupHeaderTemplate`](#groupHeaderTemplate) to customize sections. You can use the `$item` context variable to access an item group and map its individual attributes.",
        valueType: "ComponentDef",
        descriptionRef: "List/List.mdx?groupFooterTemplate",
      },
      itemTemplate: {
        description:
          "This property allows the customization of mapping data items to components. You can use the `$item` context variable to access an item and map its individual attributes.",
        valueType: "ComponentDef",
        descriptionRef: "List/List.mdx?itemTemplate",
      },
      emptyListTemplate: {
        description: "This property defines the template to display when the list is empty.",
        valueType: "ComponentDef",
        descriptionRef: "List/List.mdx?emptyListTemplate",
      },
      pageInfo: {
        description:
          "This property contains the current page information. Setting this property also enures the `List` uses pagination.",
        descriptionRef: "List/List.mdx?pageInfo",
      },
      idKey: {
        description:
          'Denotes which attribute of an item acts as the ID or key of the item. Default is `"id"`.',
        descriptionRef: "List/List.mdx?idKey",
      },
      selectedIndex: {
        description: "This property scrolls to a specific item indicated by its index.",
        descriptionRef: "List/List.mdx?selectedIndex",
      },
      groupsInitiallyExpanded: {
        description:
          "This Boolean property defines whether the list groups are initially expanded.",
        descriptionRef: "List/List.mdx?groupsInitiallyExpanded",
      },
      defaultGroups: {
        description:
          "This property adds a list of default groups for the `List` and displays the group headers in the specified order. If the data contains group headers not in this list, those headers are also displayed (after the ones in this list); however, their order is not deterministic.",
        descriptionRef: "List/List.mdx?defaultGroups",
      },
      hideEmptyGroups: {
        description:
          "This boolean property indicates if empty groups should be hidden (no header and footer are displayed).",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "List/List.mdx?hideEmptyGroups",
      },
      borderCollapse: {
        description: "Collapse items borders",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "List/List.mdx?borderCollapse",
      },
    },
    contextVars: {
      $item: {
        description: "This property represents the value of an item in the data list.",
        descriptionRef: "List/List.mdx?$item",
      },
    },
    themeVars: [],
  },
  Logo: {
    description:
      "The `Logo` component represents a logo or a brand symbol. Usually, you use this component in the [`AppHeader`](./AppHeader.mdx#logotemplate).",
    status: "experimental",
  },
  Markdown: {
    description: "`Markdown` displays plain text styled using markdown syntax.",
    props: {
      content: {
        description: "This property sets the markdown content to display.",
        descriptionRef: "Markdown/Markdown.mdx?content",
      },
      removeIndents: {
        description:
          "This boolean property specifies whether leading indents should be removed from the markdown content. If set to `true`, the shortest indent found at the start of the content lines is removed from the beginning of every line.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Markdown/Markdown.mdx?removeIndents",
      },
    },
    themeVars: {
      "color-border-HorizontalRule": "var(--xmlui-color-border-HorizontalRule)",
      "thickness-border-HorizontalRule": "var(--xmlui-thickness-border-HorizontalRule)",
      "style-border-HorizontalRule": "var(--xmlui-style-border-HorizontalRule)",
      "color-bg-Blockquote": "var(--xmlui-color-bg-Blockquote)",
      "accent-Blockquote": "var(--xmlui-accent-Blockquote)",
      "radius-Blockquote": "var(--xmlui-radius-Blockquote)",
      "shadow-Blockquote": "var(--xmlui-shadow-Blockquote)",
      "padding-Blockquote": "var(--xmlui-padding-Blockquote)",
      "margin-Blockquote": "var(--xmlui-margin-Blockquote)",
      "padding-left-UnorderedList": "var(--xmlui-padding-left-UnorderedList)",
      "padding-left-OrderedList": "var(--xmlui-padding-left-OrderedList)",
      "padding-left-ListItem": "var(--xmlui-padding-left-ListItem)",
      "color-marker-ListItem": "var(--xmlui-color-marker-ListItem)",
    },
    defaultThemeVars: {
      "color-border-HorizontalRule": "$color-border",
      "thickness-border-HorizontalRule": "1px",
      "style-border-HorizontalRule": "solid",
      "accent-Blockquote": "$color-primary",
      "padding-Blockquote": "$space-2 $space-6",
      "margin-Blockquote": "$space-2",
      "padding-left-UnorderedList": "$space-6",
      "padding-left-OrderedList": "$space-6",
      "padding-left-ListItem": "$space-1",
      light: {},
      dark: {},
    },
  },
  MenuSeparator: {
    description: "This component displays a separator line between menu items.",
    themeVars: {
      "color-bg-DropdownMenu": "var(--xmlui-color-bg-DropdownMenu)",
      "radius-DropdownMenu": "var(--xmlui-radius-DropdownMenu)",
      "shadow-DropdownMenu": "var(--xmlui-shadow-DropdownMenu)",
      "color-border-DropdownMenu-content": "var(--xmlui-color-border-DropdownMenu-content)",
      "thickness-border-DropdownMenu-content": "var(--xmlui-thickness-border-DropdownMenu-content)",
      "style-border-DropdownMenu-content": "var(--xmlui-style-border-DropdownMenu-content)",
      "min-width-DropdownMenu": "var(--xmlui-min-width-DropdownMenu)",
      "color-bg-MenuItem": "var(--xmlui-color-bg-MenuItem)",
      "color-MenuItem": "var(--xmlui-color-MenuItem)",
      "font-family-MenuItem": "var(--xmlui-font-family-MenuItem)",
      "gap-MenuItem": "var(--xmlui-gap-MenuItem)",
      "font-size-MenuItem": "var(--xmlui-font-size-MenuItem)",
      "padding-vertical-MenuItem": "var(--xmlui-padding-vertical-MenuItem)",
      "padding-horizontal-MenuItem": "var(--xmlui-padding-horizontal-MenuItem)",
      "color-bg-MenuItem--hover": "var(--xmlui-color-bg-MenuItem--hover)",
      "color-bg-MenuItem--active": "var(--xmlui-color-bg-MenuItem--active)",
      "color-bg-MenuItem--active--hover": "var(--xmlui-color-bg-MenuItem--active--hover)",
      "color-MenuItem--hover": "var(--xmlui-color-MenuItem--hover)",
      "color-MenuItem--active": "var(--xmlui-color-MenuItem--active)",
      "color-MenuItem--active--hover": "var(--xmlui-color-MenuItem--active--hover)",
      "margin-top-MenuSeparator": "var(--xmlui-margin-top-MenuSeparator)",
      "margin-bottom-MenuSeparator": "var(--xmlui-margin-bottom-MenuSeparator)",
      "width-MenuSeparator": "var(--xmlui-width-MenuSeparator)",
      "height-MenuSeparator": "var(--xmlui-height-MenuSeparator)",
      "color-MenuSeparator": "var(--xmlui-color-MenuSeparator)",
    },
    defaultThemeVars: {
      "margin-top-MenuSeparator": "$space-1",
      "margin-bottom-MenuSeparator": "$space-1",
      "width-MenuSeparator": "100%",
      "height-MenuSeparator": "1px",
      "color-MenuSeparator": "$color-border-dropdown-item",
      "marginHorizontal-MenuSeparator": "12px",
    },
    docFolder: "DropdownMenu",
  },
  ModalDialog: {
    description:
      "The `ModalDialog` component defines a modal dialog UI element that can be displayed over the existing UI - triggered by some action.",
    props: {
      fullScreen: {
        description:
          "Toggles whether the dialog encompasses the whole UI (`true`) or not and has a minimum width and height (`false`).",
        descriptionRef: "ModalDialog/ModalDialog.mdx?fullScreen",
      },
      title: {
        description: "Provides a prestyled heading to display the intent of the dialog.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?title",
      },
      closeButtonVisible: {
        description:
          "Shows (`true`) or hides (`false`) the visibility of the close button on the dialog.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?closeButtonVisible",
      },
      isInitiallyOpen: {
        description:
          "This property sets whether the modal dialog appears open (`true`) or not (`false`) when the page is it is defined on is rendered.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?isInitiallyOpen",
      },
    },
    events: {
      open: {
        description:
          "This event is fired when the `ModalDialog` is opened either via a `when` or an imperative API call (`open()`).",
        descriptionRef: "ModalDialog/ModalDialog.mdx?open",
      },
      close: {
        description:
          "This event is fired when the close button is pressed or the user clicks outside the `ModalDialog`.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?close",
      },
    },
    contextVars: {
      $param: {
        description:
          "This value represents the first parameters passed to the `open()` method to display the modal dialog.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?$param",
      },
      $params: {
        description:
          "This value represents the array of parameters passed to the `open()` method. You can use `$params[0]` to access the first and `$params[1]` to access the second (and so on) parameters. `$param` is the same as `$params[0]`.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?$params",
      },
    },
    apis: {
      close: {
        description:
          "This method is used to close the `ModalDialog`. Invoke it using `modalId.close()` where `modalId` refers to a `ModalDialog` component.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?close",
      },
      open: {
        description:
          "This method imperatively opens the modal dialog. You can pass an arbitrary number of parameters to the method. In the `ModalDialog` instance, you can access those with the `$paramq` and `$params` context values.",
        descriptionRef: "ModalDialog/ModalDialog.mdx?open",
      },
    },
    themeVars: {
      "padding-horizontal-ModalDialog": "var(--xmlui-padding-horizontal-ModalDialog)",
      "padding-vertical-ModalDialog": "var(--xmlui-padding-vertical-ModalDialog)",
      "padding-top-ModalDialog": "var(--xmlui-padding-top-ModalDialog)",
      "padding-bottom-ModalDialog": "var(--xmlui-padding-bottom-ModalDialog)",
      "padding-left-ModalDialog": "var(--xmlui-padding-left-ModalDialog)",
      "padding-right-ModalDialog": "var(--xmlui-padding-right-ModalDialog)",
      "padding-ModalDialog": "var(--xmlui-padding-ModalDialog)",
      "padding-horizontal-overlay-ModalDialog":
        "var(--xmlui-padding-horizontal-overlay-ModalDialog)",
      "padding-vertical-overlay-ModalDialog": "var(--xmlui-padding-vertical-overlay-ModalDialog)",
      "padding-top-overlay-ModalDialog": "var(--xmlui-padding-top-overlay-ModalDialog)",
      "padding-bottom-overlay-ModalDialog": "var(--xmlui-padding-bottom-overlay-ModalDialog)",
      "padding-left-overlay-ModalDialog": "var(--xmlui-padding-left-overlay-ModalDialog)",
      "padding-right-overlay-ModalDialog": "var(--xmlui-padding-right-overlay-ModalDialog)",
      "padding-overlay-ModalDialog": "var(--xmlui-padding-overlay-ModalDialog)",
      "Dialog:color-bg-ModalDialog": "var(--xmlui-color-bg-ModalDialog)",
      "Dialog:color-bg-overlay-ModalDialog": "var(--xmlui-color-bg-overlay-ModalDialog)",
      "Dialog:radius-ModalDialog": "var(--xmlui-radius-ModalDialog)",
      "Dialog:font-family-ModalDialog": "var(--xmlui-font-family-ModalDialog)",
      "Dialog:color-text-ModalDialog": "var(--xmlui-color-text-ModalDialog)",
      "Dialog:min-width-ModalDialog": "var(--xmlui-min-width-ModalDialog)",
      "Dialog:max-width-ModalDialog": "var(--xmlui-max-width-ModalDialog)",
      "Dialog:margin-bottom-title-ModalDialog": "var(--xmlui-margin-bottom-title-ModalDialog)",
    },
    defaultThemeVars: {
      "padding-left-ModalDialog": "$padding-horizontal-ModalDialog",
      "padding-right-ModalDialog": "$padding-horizontal-ModalDialog",
      "padding-top-ModalDialog": "$padding-vertical-ModalDialog",
      "padding-bottom-ModalDialog": "$padding-vertical-ModalDialog",
      "padding-horizontal-ModalDialog": "",
      "padding-vertical-ModalDialog": "",
      "padding-ModalDialog": "$space-7",
      "color-bg-ModalDialog": "$color-bg-primary",
      "color-bg-overlay-ModalDialog": "$color-bg-overlay",
      "color-text-ModalDialog": "$color-text-primary",
      "radius-ModalDialog": "$radius",
      "font-family-ModalDialog": "$font-family",
      "max-width-ModalDialog": "450px",
      "margin-bottom-title-ModalDialog": "0",
      dark: {
        "color-bg-ModalDialog": "$color-bg-primary",
      },
    },
  },
  NavGroup: {
    description:
      "The `NavGroup` component is a container for grouping related navigation targets (`NavLink` components). It can be displayed as a submenu in the App's UI.",
    props: {
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "NavGroup/NavGroup.mdx?label",
      },
      icon: {
        description:
          "This property defines an optional icon to display along with the `NavGroup` label.",
        descriptionRef: "NavGroup/NavGroup.mdx?icon",
      },
      to: {
        description: "This property defines an optional navigation link.",
        descriptionRef: "NavGroup/NavGroup.mdx?to",
      },
    },
    themeVars: {
      "color-bg-dropdown-NavGroup": "var(--xmlui-color-bg-dropdown-NavGroup)",
      "shadow-dropdown-NavGroup": "var(--xmlui-shadow-dropdown-NavGroup)",
      "radius-dropdown-NavGroup": "var(--xmlui-radius-dropdown-NavGroup)",
    },
    defaultThemeVars: {
      "color-bg-dropdown-NavGroup": "$color-bg-primary",
      "radius-dropdown-NavGroup": "$radius",
      "shadow-dropdown-NavGroup": "$shadow-spread",
    },
  },
  NavLink: {
    description:
      "The `NavLink` component defines a navigation target (app navigation menu item) within the app; it is associated with a particular in-app navigation target (or an external link).",
    props: {
      to: {
        description: "This property defines the URL of the link.",
        descriptionRef: "NavLink/NavLink.mdx?to",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "NavLink/NavLink.mdx?enabled",
      },
      active: {
        description:
          "This property indicates if the particular navigation is an active link. An active link has a particular visual appearance, provided its [`displayActive`](#displayactive) property is set to `true`.",
        descriptionRef: "NavLink/NavLink.mdx?active",
      },
      target: {
        description: "This property specifies how to open the clicked link.",
        descriptionRef: "NavLink/NavLink.mdx?target",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "NavLink/NavLink.mdx?label",
      },
      vertical: {
        description:
          "This property sets how the active status is displayed on the `NavLink` component. If set to true, the indicator is displayed on the side which lends itself to a vertically aligned navigation menu.",
        descriptionRef: "NavLink/NavLink.mdx?vertical",
      },
      displayActive: {
        description:
          "This Boolean property indicates if the active state of a link should have a visual indication. Setting it to `false` removes the visual indication of an active link.",
        descriptionRef: "NavLink/NavLink.mdx?displayActive",
      },
      icon: {
        description:
          "This property allows you to add an icon (specify the icon's name) to the navigation link.",
        descriptionRef: "NavLink/NavLink.mdx?icon",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the NavLink is clicked.",
        descriptionRef: "NavLink/NavLink.mdx?click",
      },
    },
    themeVars: {
      "radius-NavLink": "var(--xmlui-radius-NavLink)",
      "color-bg-NavLink": "var(--xmlui-color-bg-NavLink)",
      "color-bg-NavLink--hover": "var(--xmlui-color-bg-NavLink--hover)",
      "color-bg-NavLink--hover--active": "var(--xmlui-color-bg-NavLink--hover--active)",
      "color-bg-NavLink--active": "var(--xmlui-color-bg-NavLink--active)",
      "color-bg-NavLink--pressed": "var(--xmlui-color-bg-NavLink--pressed)",
      "color-bg-NavLink--pressed--active": "var(--xmlui-color-bg-NavLink--pressed--active)",
      "padding-horizontal-NavLink": "var(--xmlui-padding-horizontal-NavLink)",
      "padding-vertical-NavLink": "var(--xmlui-padding-vertical-NavLink)",
      "font-size-NavLink": "var(--xmlui-font-size-NavLink)",
      "color-text-NavLink": "var(--xmlui-color-text-NavLink)",
      "color-text-NavLink--hover": "var(--xmlui-color-text-NavLink--hover)",
      "color-text-NavLink--active": "var(--xmlui-color-text-NavLink--active)",
      "color-text-NavLink--hover--active": "var(--xmlui-color-text-NavLink--hover--active)",
      "color-text-NavLink--pressed": "var(--xmlui-color-text-NavLink--pressed)",
      "color-text-NavLink--pressed--active": "var(--xmlui-color-text-NavLink--pressed--active)",
      "color-icon-NavLink": "var(--xmlui-color-icon-NavLink)",
      "font-family-NavLink": "var(--xmlui-font-family-NavLink)",
      "font-weight-NavLink": "var(--xmlui-font-weight-NavLink)",
      "font-weight-NavLink--pressed": "var(--xmlui-font-weight-NavLink--pressed)",
      "font-weight-NavLink--active": "var(--xmlui-font-weight-NavLink--active)",
      "radius-indicator-NavLink": "var(--xmlui-radius-indicator-NavLink)",
      "thickness-indicator-NavLink": "var(--xmlui-thickness-indicator-NavLink)",
      "color-indicator-NavLink": "var(--xmlui-color-indicator-NavLink)",
      "color-indicator-NavLink--hover": "var(--xmlui-color-indicator-NavLink--hover)",
      "color-indicator-NavLink--active": "var(--xmlui-color-indicator-NavLink--active)",
      "color-indicator-NavLink--pressed": "var(--xmlui-color-indicator-NavLink--pressed)",
      "thickness-outline-NavLink--focus": "var(--xmlui-thickness-outline-NavLink--focus)",
      "color-outline-NavLink--focus": "var(--xmlui-color-outline-NavLink--focus)",
      "style-outline-NavLink--focus": "var(--xmlui-style-outline-NavLink--focus)",
      "offset-outline-NavLink--focus": "var(--xmlui-offset-outline-NavLink--focus)",
    },
    defaultThemeVars: {
      "radius-NavLink": "$radius",
      "color-bg-NavLink": "transparent",
      "padding-horizontal-NavLink": "$space-4",
      "padding-vertical-NavLink": "$space-2",
      "font-size-NavLink": "$font-size-small",
      "font-weight-NavLink": "$font-weight-normal",
      "font-family-NavLink": "$font-family",
      "color-text-NavLink": "$color-text-primary",
      "font-weight-NavLink--pressed": "$font-weight-normal",
      "thickness-indicator-NavLink": "$space-0_5",
      "color-outline-NavLink--focus": "$color-outline--focus",
      "thickness-outline-NavLink--focus": "$thickness-outline--focus",
      "style-outline-NavLink--focus": "$style-outline--focus",
      "offset-outline-NavLink--focus": "-1px",
      "radius-indicator-NavLink": "$radius",
      light: {
        "color-icon-NavLink": "$color-surface-500",
        "color-indicator-NavLink--active": "$color-primary-500",
        "color-indicator-NavLink--pressed": "$color-primary-500",
        "color-indicator-NavLink--hover": "$color-primary-600",
      },
      dark: {
        "color-indicator-NavLink--active": "$color-primary-500",
        "color-indicator-NavLink--pressed": "$color-primary-500",
        "color-indicator-NavLink--hover": "$color-primary-400",
      },
    },
  },
  NavPanel: {
    description:
      "`NavPanel` is a placeholder within `App` to define the app's navigation (menu) structure.",
    props: {
      logoTemplate: {
        description:
          "This property defines the logo template to display in the navigation panel with the `vertical` and `vertical-sticky` layout.",
        valueType: "ComponentDef",
        descriptionRef: "NavPanel/NavPanel.mdx?logoTemplate",
      },
    },
    themeVars: {
      "color-border-horizontal-NavPanel": "var(--xmlui-color-border-horizontal-NavPanel)",
      "thickness-border-horizontal-NavPanel": "var(--xmlui-thickness-border-horizontal-NavPanel)",
      "style-border-horizontal-NavPanel": "var(--xmlui-style-border-horizontal-NavPanel)",
      "color-border-vertical-NavPanel": "var(--xmlui-color-border-vertical-NavPanel)",
      "thickness-border-vertical-NavPanel": "var(--xmlui-thickness-border-vertical-NavPanel)",
      "style-border-vertical-NavPanel": "var(--xmlui-style-border-vertical-NavPanel)",
      "color-border-left-NavPanel": "var(--xmlui-color-border-left-NavPanel)",
      "thickness-border-left-NavPanel": "var(--xmlui-thickness-border-left-NavPanel)",
      "style-border-left-NavPanel": "var(--xmlui-style-border-left-NavPanel)",
      "color-border-right-NavPanel": "var(--xmlui-color-border-right-NavPanel)",
      "thickness-border-right-NavPanel": "var(--xmlui-thickness-border-right-NavPanel)",
      "style-border-right-NavPanel": "var(--xmlui-style-border-right-NavPanel)",
      "color-border-top-NavPanel": "var(--xmlui-color-border-top-NavPanel)",
      "thickness-border-top-NavPanel": "var(--xmlui-thickness-border-top-NavPanel)",
      "style-border-top-NavPanel": "var(--xmlui-style-border-top-NavPanel)",
      "color-border-bottom-NavPanel": "var(--xmlui-color-border-bottom-NavPanel)",
      "thickness-border-bottom-NavPanel": "var(--xmlui-thickness-border-bottom-NavPanel)",
      "style-border-bottom-NavPanel": "var(--xmlui-style-border-bottom-NavPanel)",
      "color-border-NavPanel": "var(--xmlui-color-border-NavPanel)",
      "thickness-border-NavPanel": "var(--xmlui-thickness-border-NavPanel)",
      "style-border-NavPanel": "var(--xmlui-style-border-NavPanel)",
      "radius-NavPanel": "var(--xmlui-radius-NavPanel)",
      "color-bg-NavPanel": "var(--xmlui-color-bg-NavPanel)",
      "shadow-NavPanel": "var(--xmlui-shadow-NavPanel)",
      "height-AppHeader": "var(--xmlui-height-AppHeader)",
      "max-content-width-App": "var(--xmlui-max-content-width-App)",
      "padding-horizontal-NavPanel": "var(--xmlui-padding-horizontal-NavPanel)",
      "padding-horizontal-logo-NavPanel": "var(--xmlui-padding-horizontal-logo-NavPanel)",
      "padding-vertical-logo-NavPanel": "var(--xmlui-padding-vertical-logo-NavPanel)",
      "margin-bottom-logo-NavPanel": "var(--xmlui-margin-bottom-logo-NavPanel)",
      "padding-vertical-AppHeader": "var(--xmlui-padding-vertical-AppHeader)",
    },
    defaultThemeVars: {
      "color-bg-NavPanel": "transparent",
      "radius-NavPanel": "$radius",
      "color-border-left-NavPanel": "",
      "thickness-border-left-NavPanel": "",
      "style-border-left-NavPanel": "",
      "border-left-NavPanel":
        "$thickness-border-left-NavPanel $style-border-left-NavPanel $color-border-left-NavPanel",
      "color-border-right-NavPanel": "",
      "thickness-border-right-NavPanel": "",
      "style-border-right-NavPanel": "",
      "border-right-NavPanel":
        "$thickness-border-right-NavPanel $style-border-right-NavPanel $color-border-right-NavPanel",
      "color-border-top-NavPanel": "",
      "thickness-border-top-NavPanel": "",
      "style-border-top-NavPanel": "",
      "border-top-NavPanel":
        "$thickness-border-top-NavPanel $style-border-top-NavPanel $color-border-top-NavPanel",
      "color-border-bottom-NavPanel": "",
      "thickness-border-bottom-NavPanel": "",
      "style-border-bottom-NavPanel": "",
      "border-bottom-NavPanel":
        "$thickness-border-bottom-NavPanel $style-border-bottom-NavPanel $color-border-bottom-NavPanel",
      "color-border-horizontal-NavPanel": "",
      "thickness-border-horizontal-NavPanel": "",
      "style-border-horizontal-NavPanel": "",
      "border-horizontal-NavPanel":
        "$thickness-border-horizontal-NavPanel $style-border-horizontal-NavPanel $color-border-horizontal-NavPanel",
      "color-border-vertical-NavPanel": "",
      "thickness-border-vertical-NavPanel": "",
      "style-border-vertical-NavPanel": "",
      "border-vertical-NavPanel":
        "$thickness-border-vertical-NavPanel $style-border-vertical-NavPanel $color-border-vertical-NavPanel",
      "color-border-NavPanel": "",
      "thickness-border-NavPanel": "",
      "style-border-NavPanel": "",
      "border-NavPanel":
        "$thickness-border-NavPanel $style-border-NavPanel $color-border-NavPanel ",
      "padding-horizontal-NavPanel": "$space-4",
      "padding-vertical-logo-NavPanel": "$space-4",
      "padding-horizontal-logo-NavPanel": "$space-4",
      "margin-bottom-logo-NavPanel": "$space-4",
      light: {
        "shadow-NavPanel-vertical": "4px 0 4px 0 rgb(0 0 0 / 10%)",
      },
      dark: {
        "shadow-NavPanel-vertical": "4px 0 6px 0 rgba(0, 0, 0, 0.2)",
      },
    },
  },
  NoResult: {
    description:
      "`NoResult` is a component that displays a visual indication that some data query (search) resulted in no (zero) items.",
    props: {
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "NoResult/NoResult.mdx?label",
      },
      icon: {
        description: "This property defines the icon to display with the component.",
        descriptionRef: "NoResult/NoResult.mdx?icon",
      },
      hideIcon: {
        description: "This boolean property indicates if the icon should be hidden.",
        descriptionRef: "NoResult/NoResult.mdx?hideIcon",
      },
    },
    themeVars: {
      "padding-vertical-NoResult": "var(--xmlui-padding-vertical-NoResult)",
      "gap-icon-NoResult": "var(--xmlui-gap-icon-NoResult)",
      "size-icon-NoResult": "var(--xmlui-size-icon-NoResult)",
    },
    defaultThemeVars: {
      "padding-vertical-NoResult": "$space-2",
      "gap-icon-NoResult": "$space-2",
      "size-icon-NoResult": "$space-8",
      light: {},
      dark: {},
    },
  },
  NumberBox: {
    description:
      "A `NumberBox` component allows users to input numeric values: either integer or floating point numbers. It also accepts empty values, where the stored value will be of type `null`.",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "NumberBox/NumberBox.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "NumberBox/NumberBox.mdx?initialValue",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "NumberBox/NumberBox.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "NumberBox/NumberBox.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `NumberBox`.",
        descriptionRef: "NumberBox/NumberBox.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `NumberBox` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "NumberBox/NumberBox.mdx?labelBreak",
      },
      maxLength: {
        description: "This property sets the maximum length of the input it accepts.",
        descriptionRef: "NumberBox/NumberBox.mdx?maxLength",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "NumberBox/NumberBox.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "NumberBox/NumberBox.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "NumberBox/NumberBox.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "NumberBox/NumberBox.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "NumberBox/NumberBox.mdx?validationStatus",
      },
      startText: {
        description:
          "This property sets a text to appear at the start (left side when the left-to-right direction is set) of the input.",
        descriptionRef: "NumberBox/NumberBox.mdx?startText",
      },
      startIcon: {
        description:
          "This property sets an icon to appear at the start (left side when the left-to-right direction is set) of the input.",
        descriptionRef: "NumberBox/NumberBox.mdx?startIcon",
      },
      endText: {
        description:
          "This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.",
        descriptionRef: "NumberBox/NumberBox.mdx?endText",
      },
      endIcon: {
        description:
          "This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.",
        descriptionRef: "NumberBox/NumberBox.mdx?endIcon",
      },
      hasSpinBox: {
        description:
          "This boolean prop shows (`true`) or hides (`false`) the spinner buttons for the input field.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "NumberBox/NumberBox.mdx?hasSpinBox",
      },
      step: {
        description:
          "This prop governs how big the step when clicking on the spinner of the field.",
        availableValues: null,
        valueType: "number",
        descriptionRef: "NumberBox/NumberBox.mdx?step",
      },
      integersOnly: {
        description:
          "This boolean property signs whether the input field accepts integers only (`true`) or not (`false`).",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "NumberBox/NumberBox.mdx?integersOnly",
      },
      zeroOrPositive: {
        description:
          "This boolean property determines whether the input value can only be 0 or positive numbers (`true`) or also negative (`false`).",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "NumberBox/NumberBox.mdx?zeroOrPositive",
      },
      minValue: {
        description:
          "The minimum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.",
        descriptionRef: "NumberBox/NumberBox.mdx?minValue",
      },
      maxValue: {
        description:
          "The maximum value the input field allows. Can be a float or an integer if [`integersOnly`](#integersonly) is set to `false`, otherwise it can only be an integer.",
        descriptionRef: "NumberBox/NumberBox.mdx?maxValue",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the NumberBox has received the focus.",
        descriptionRef: "NumberBox/NumberBox.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the NumberBox has lost the focus.",
        descriptionRef: "NumberBox/NumberBox.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of NumberBox has changed.",
        descriptionRef: "NumberBox/NumberBox.mdx?didChange",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the NumberBox.",
        descriptionRef: "NumberBox/NumberBox.mdx?focus",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "NumberBox/NumberBox.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "NumberBox/NumberBox.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-NumberBox-default": "var(--xmlui-radius-NumberBox-default)",
      "Input:color-border-NumberBox-default": "var(--xmlui-color-border-NumberBox-default)",
      "Input:thickness-border-NumberBox-default": "var(--xmlui-thickness-border-NumberBox-default)",
      "Input:style-border-NumberBox-default": "var(--xmlui-style-border-NumberBox-default)",
      "Input:font-size-NumberBox-default": "var(--xmlui-font-size-NumberBox-default)",
      "Input:color-bg-NumberBox-default": "var(--xmlui-color-bg-NumberBox-default)",
      "Input:shadow-NumberBox-default": "var(--xmlui-shadow-NumberBox-default)",
      "Input:color-text-NumberBox-default": "var(--xmlui-color-text-NumberBox-default)",
      "Input:color-border-NumberBox-default--hover":
        "var(--xmlui-color-border-NumberBox-default--hover)",
      "Input:color-bg-NumberBox-default--hover": "var(--xmlui-color-bg-NumberBox-default--hover)",
      "Input:shadow-NumberBox-default--hover": "var(--xmlui-shadow-NumberBox-default--hover)",
      "Input:color-text-NumberBox-default--hover":
        "var(--xmlui-color-text-NumberBox-default--hover)",
      "Input:color-border-NumberBox-default--focus":
        "var(--xmlui-color-border-NumberBox-default--focus)",
      "Input:color-bg-NumberBox-default--focus": "var(--xmlui-color-bg-NumberBox-default--focus)",
      "Input:shadow-NumberBox-default--focus": "var(--xmlui-shadow-NumberBox-default--focus)",
      "Input:color-text-NumberBox-default--focus":
        "var(--xmlui-color-text-NumberBox-default--focus)",
      "Input:thickness-outline-NumberBox-default--focus":
        "var(--xmlui-thickness-outline-NumberBox-default--focus)",
      "Input:color-outline-NumberBox-default--focus":
        "var(--xmlui-color-outline-NumberBox-default--focus)",
      "Input:style-outline-NumberBox-default--focus":
        "var(--xmlui-style-outline-NumberBox-default--focus)",
      "Input:offset-outline-NumberBox-default--focus":
        "var(--xmlui-offset-outline-NumberBox-default--focus)",
      "Input:color-placeholder-NumberBox-default":
        "var(--xmlui-color-placeholder-NumberBox-default)",
      "Input:color-adornment-NumberBox-default": "var(--xmlui-color-adornment-NumberBox-default)",
      "Input:radius-NumberBox-error": "var(--xmlui-radius-NumberBox-error)",
      "Input:color-border-NumberBox-error": "var(--xmlui-color-border-NumberBox-error)",
      "Input:thickness-border-NumberBox-error": "var(--xmlui-thickness-border-NumberBox-error)",
      "Input:style-border-NumberBox-error": "var(--xmlui-style-border-NumberBox-error)",
      "Input:font-size-NumberBox-error": "var(--xmlui-font-size-NumberBox-error)",
      "Input:color-bg-NumberBox-error": "var(--xmlui-color-bg-NumberBox-error)",
      "Input:shadow-NumberBox-error": "var(--xmlui-shadow-NumberBox-error)",
      "Input:color-text-NumberBox-error": "var(--xmlui-color-text-NumberBox-error)",
      "Input:color-border-NumberBox-error--hover":
        "var(--xmlui-color-border-NumberBox-error--hover)",
      "Input:color-bg-NumberBox-error--hover": "var(--xmlui-color-bg-NumberBox-error--hover)",
      "Input:shadow-NumberBox-error--hover": "var(--xmlui-shadow-NumberBox-error--hover)",
      "Input:color-text-NumberBox-error--hover": "var(--xmlui-color-text-NumberBox-error--hover)",
      "Input:color-border-NumberBox-error--focus":
        "var(--xmlui-color-border-NumberBox-error--focus)",
      "Input:color-bg-NumberBox-error--focus": "var(--xmlui-color-bg-NumberBox-error--focus)",
      "Input:shadow-NumberBox-error--focus": "var(--xmlui-shadow-NumberBox-error--focus)",
      "Input:color-text-NumberBox-error--focus": "var(--xmlui-color-text-NumberBox-error--focus)",
      "Input:thickness-outline-NumberBox-error--focus":
        "var(--xmlui-thickness-outline-NumberBox-error--focus)",
      "Input:color-outline-NumberBox-error--focus":
        "var(--xmlui-color-outline-NumberBox-error--focus)",
      "Input:style-outline-NumberBox-error--focus":
        "var(--xmlui-style-outline-NumberBox-error--focus)",
      "Input:offset-outline-NumberBox-error--focus":
        "var(--xmlui-offset-outline-NumberBox-error--focus)",
      "Input:color-placeholder-NumberBox-error": "var(--xmlui-color-placeholder-NumberBox-error)",
      "Input:color-adornment-NumberBox-error": "var(--xmlui-color-adornment-NumberBox-error)",
      "Input:radius-NumberBox-warning": "var(--xmlui-radius-NumberBox-warning)",
      "Input:color-border-NumberBox-warning": "var(--xmlui-color-border-NumberBox-warning)",
      "Input:thickness-border-NumberBox-warning": "var(--xmlui-thickness-border-NumberBox-warning)",
      "Input:style-border-NumberBox-warning": "var(--xmlui-style-border-NumberBox-warning)",
      "Input:font-size-NumberBox-warning": "var(--xmlui-font-size-NumberBox-warning)",
      "Input:color-bg-NumberBox-warning": "var(--xmlui-color-bg-NumberBox-warning)",
      "Input:shadow-NumberBox-warning": "var(--xmlui-shadow-NumberBox-warning)",
      "Input:color-text-NumberBox-warning": "var(--xmlui-color-text-NumberBox-warning)",
      "Input:color-border-NumberBox-warning--hover":
        "var(--xmlui-color-border-NumberBox-warning--hover)",
      "Input:color-bg-NumberBox-warning--hover": "var(--xmlui-color-bg-NumberBox-warning--hover)",
      "Input:shadow-NumberBox-warning--hover": "var(--xmlui-shadow-NumberBox-warning--hover)",
      "Input:color-text-NumberBox-warning--hover":
        "var(--xmlui-color-text-NumberBox-warning--hover)",
      "Input:color-border-NumberBox-warning--focus":
        "var(--xmlui-color-border-NumberBox-warning--focus)",
      "Input:color-bg-NumberBox-warning--focus": "var(--xmlui-color-bg-NumberBox-warning--focus)",
      "Input:shadow-NumberBox-warning--focus": "var(--xmlui-shadow-NumberBox-warning--focus)",
      "Input:color-text-NumberBox-warning--focus":
        "var(--xmlui-color-text-NumberBox-warning--focus)",
      "Input:thickness-outline-NumberBox-warning--focus":
        "var(--xmlui-thickness-outline-NumberBox-warning--focus)",
      "Input:color-outline-NumberBox-warning--focus":
        "var(--xmlui-color-outline-NumberBox-warning--focus)",
      "Input:style-outline-NumberBox-warning--focus":
        "var(--xmlui-style-outline-NumberBox-warning--focus)",
      "Input:offset-outline-NumberBox-warning--focus":
        "var(--xmlui-offset-outline-NumberBox-warning--focus)",
      "Input:color-placeholder-NumberBox-warning":
        "var(--xmlui-color-placeholder-NumberBox-warning)",
      "Input:color-adornment-NumberBox-warning": "var(--xmlui-color-adornment-NumberBox-warning)",
      "Input:radius-NumberBox-success": "var(--xmlui-radius-NumberBox-success)",
      "Input:color-border-NumberBox-success": "var(--xmlui-color-border-NumberBox-success)",
      "Input:thickness-border-NumberBox-success": "var(--xmlui-thickness-border-NumberBox-success)",
      "Input:style-border-NumberBox-success": "var(--xmlui-style-border-NumberBox-success)",
      "Input:font-size-NumberBox-success": "var(--xmlui-font-size-NumberBox-success)",
      "Input:color-bg-NumberBox-success": "var(--xmlui-color-bg-NumberBox-success)",
      "Input:shadow-NumberBox-success": "var(--xmlui-shadow-NumberBox-success)",
      "Input:color-text-NumberBox-success": "var(--xmlui-color-text-NumberBox-success)",
      "Input:color-border-NumberBox-success--hover":
        "var(--xmlui-color-border-NumberBox-success--hover)",
      "Input:color-bg-NumberBox-success--hover": "var(--xmlui-color-bg-NumberBox-success--hover)",
      "Input:shadow-NumberBox-success--hover": "var(--xmlui-shadow-NumberBox-success--hover)",
      "Input:color-text-NumberBox-success--hover":
        "var(--xmlui-color-text-NumberBox-success--hover)",
      "Input:color-border-NumberBox-success--focus":
        "var(--xmlui-color-border-NumberBox-success--focus)",
      "Input:color-bg-NumberBox-success--focus": "var(--xmlui-color-bg-NumberBox-success--focus)",
      "Input:shadow-NumberBox-success--focus": "var(--xmlui-shadow-NumberBox-success--focus)",
      "Input:color-text-NumberBox-success--focus":
        "var(--xmlui-color-text-NumberBox-success--focus)",
      "Input:thickness-outline-NumberBox-success--focus":
        "var(--xmlui-thickness-outline-NumberBox-success--focus)",
      "Input:color-outline-NumberBox-success--focus":
        "var(--xmlui-color-outline-NumberBox-success--focus)",
      "Input:style-outline-NumberBox-success--focus":
        "var(--xmlui-style-outline-NumberBox-success--focus)",
      "Input:offset-outline-NumberBox-success--focus":
        "var(--xmlui-offset-outline-NumberBox-success--focus)",
      "Input:color-placeholder-NumberBox-success":
        "var(--xmlui-color-placeholder-NumberBox-success)",
      "Input:color-adornment-NumberBox-success": "var(--xmlui-color-adornment-NumberBox-success)",
      "Input:color-bg-NumberBox--disabled": "var(--xmlui-color-bg-NumberBox--disabled)",
      "Input:color-text-NumberBox--disabled": "var(--xmlui-color-text-NumberBox--disabled)",
      "Input:color-border-NumberBox--disabled": "var(--xmlui-color-border-NumberBox--disabled)",
    },
  },
  OffCanvas: {
    description:
      "(**NOT IMPLEMENTED YET**) The `OffCanvas` component is a hidden panel that slides into view from the side of the screen. It helps display additional content or navigation without disrupting the main interface.",
    status: "in progress",
    props: {
      enableBackdrop: {
        description:
          "This property indicates if the backdrop is enabled when the component is displayed. When the backdrop is not enabled, clicking outside `OffCanvas` will not close it.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
      },
      enableBodyScroll: {
        description:
          "This property indicates if the body scroll is enabled when the component is displayed.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
      },
      noCloseOnBackdropClick: {
        description:
          "When this property is set to `true`, the OffCanvas does not close when the user clicks on its backdrop.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
      },
      placement: {
        description:
          "This property indicates the position where the OffCanvas should be docked to.",
        availableValues: [
          {
            value: "start",
            description:
              "The left side of the window (left-to-right) or the right side of the window (right-to-left)",
          },
          {
            value: "end",
            description:
              "The right side of the window (left-to-right) or the left side of the window (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the window",
          },
          {
            value: "bottom",
            description: "The bottom of the window",
          },
        ],
      },
      autoCloseInMs: {
        description:
          "This property sets a timeout. When the timeout expires, the component gets hidden.",
      },
    },
    events: {
      didOpen: {
        description:
          "This event is triggered when the OffCanvas has been displayed. The event handler has a single boolean argument set to `true`, indicating that the user opened the component.",
      },
      didClose: {
        description:
          "This event is triggered when the OffCanvas has been closed. The event handler has a single boolean argument set to `true`, indicating that the user closed the component.",
      },
    },
    apis: {
      open: {
        description:
          "This method opens the component. It triggers the `didOpen` event  with the argument set to `false`.",
      },
      close: {
        description:
          "This method closes the component. It triggers the `didClose` event with the argument set to `false`.",
      },
    },
    themeVars: [],
    defaultThemeVars: {
      light: {},
      dark: {},
    },
  },
  Option: {
    description:
      "`Option` is a non-visual component describing a selection option. Other components (such as `Select`, `Combobox`, and others) may use nested `Option` instances from which the user can select.",
    props: {
      label: {
        description:
          "This property defines the text to display for the option. If `label` is not defined, `Option` will use the `value` as the label.",
        descriptionRef: "Option/Option.mdx?label",
      },
      value: {
        description:
          "This property defines the value of the option. If `value` is not defined, `Option` will use the `label` as the value.",
        descriptionRef: "Option/Option.mdx?value",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "Option/Option.mdx?enabled",
      },
    },
  },
  PageMetaTitle: {
    description:
      "A PageMetaTitle component allows setting up (or changing) the app title to display with the current browser tab.",
    props: {
      value: {
        description: "This property sets the page's title to display in the browser tab.",
        descriptionRef: "PageMetaTitle/PageMetaTitle.mdx?value",
      },
    },
  },
  Page: {
    description:
      "The `Page` component defines what content is displayed when the user navigates to a particular URL that is associated with the page.",
    status: "stable",
    props: {
      url: {
        description: "The URL of the route associated with the content.",
        descriptionRef: "Page/Page.mdx?url",
      },
    },
    docFolder: "Page",
  },
  PageHeader: {
    description:
      "The `PageHeader` component is a component that displays a title and an optional pre-title. The pre-title is displayed above the title.",
    status: "experimental",
    props: {
      preTitle: {
        description: "The pre-title to display above the title.",
        descriptionRef: "PageHeader/PageHeader.mdx?preTitle",
      },
      title: {
        description: "The title to display.",
        descriptionRef: "PageHeader/PageHeader.mdx?title",
      },
    },
    defaultThemeVars: {
      "gap-PageHeader": "$space-2",
    },
  },
  Pages: {
    description:
      "The `Pages` component is used as a container for [`Page`](./Page.mdx) components within an [`App`](./App.mdx).",
    props: {
      defaultRoute: {
        description: "The default route when displaying the app",
        descriptionRef: "Pages/Pages.mdx?defaultRoute",
      },
    },
  },
  Pdf: {
    description: "The `Pdf` component provides a read-only preview of a pdf document's contents.",
    status: "in progress",
    props: {
      src: {
        description: "This property defines the source URL of the pdf document stream to display.",
      },
    },
  },
  PieChart: {
    description: "(**OBSOLETE**) A pie chart component",
    status: "deprecated",
    props: {
      data: {
        description: "The data to be displayed in the pie chart",
      },
      isInteractive: {
        description: "Whether the chart is interactive",
      },
      showLabels: {
        description: "Whether to show labels",
      },
      showLegends: {
        description: "Whether to show legends",
      },
      legendPosition: {
        description: "The position of the legend",
      },
      legendDirection: {
        description: "The direction of the legend",
      },
    },
    themeVars: {
      "color-PieChart": "var(--xmlui-color-PieChart)",
    },
    defaultThemeVars: {
      "scheme-PieChart": "nivo",
      "color-text-PieChart": "$color-text-secondary",
      "color-ticks-PieChart": "$color-text-primary",
      "color-bg-tooltip-PieChart": "$color-bg-primary",
      "color-text-tooltip-PieChart": "$color-text-primary",
      "color-axis-PieChart": "$color-text-primary",
      "color-text-legend-PieChart": "$color-text-primary",
      light: {
        "scheme-PieChart": "set3",
      },
      dark: {
        "scheme-PieChart": "dark2",
      },
    },
  },
  PositionedContainer: {
    description: "(**OBSOLETE**) This component was created for the ChatEngine app.",
    status: "deprecated",
    props: {
      visibleOnHover: {
        description: "No description",
      },
    },
    themeVars: [],
  },
  ProgressBar: {
    description: "A `ProgressBar` component visually represents the progress of a task or process.",
    props: {
      value: {
        description: "This property defines the progress value with a number between 0 and 1.",
        descriptionRef: "ProgressBar/ProgressBar.mdx?value",
      },
    },
    themeVars: {
      "color-bg-ProgressBar": "var(--xmlui-color-bg-ProgressBar)",
      "color-indicator-ProgressBar": "var(--xmlui-color-indicator-ProgressBar)",
      "radius-ProgressBar": "var(--xmlui-radius-ProgressBar)",
      "radius-indicator-ProgressBar": "var(--xmlui-radius-indicator-ProgressBar)",
      "thickness-ProgressBar": "var(--xmlui-thickness-ProgressBar)",
    },
    defaultThemeVars: {
      "radius-ProgressBar": "$radius",
      "radius-indicator-ProgressBar": "0px",
      "thickness-ProgressBar": "$space-2",
      light: {
        "color-bg-ProgressBar": "$color-surface-200",
        "color-indicator-ProgressBar": "$color-primary-500",
      },
      dark: {
        "color-bg-ProgressBar": "$color-surface-700",
        "color-indicator-ProgressBar": "$color-primary-500",
      },
    },
  },
  Queue: {
    description:
      "The `Queue` component provides an API to enqueue elements and defines events to process queued elements in a FIFO order.",
    props: {
      progressFeedback: {
        description:
          "This property defines the component template of the UI that displays progress information whenever, the queue's `progressReport` function in invoked.",
        descriptionRef: "Queue/Queue.mdx?progressFeedback",
      },
      resultFeedback: {
        description:
          "This property defines the component template of the UI that displays result information when the queue becomes empty after processing all queued items.",
        descriptionRef: "Queue/Queue.mdx?resultFeedback",
      },
      clearAfterFinish: {
        description:
          "This property indicates the completed items (successful or error) should be removed from the queue after completion.",
        descriptionRef: "Queue/Queue.mdx?clearAfterFinish",
      },
    },
    events: {
      willProcess: {
        description: "This event is triggered to process a particular item.",
        descriptionRef: "Queue/Queue.mdx?willProcess",
      },
      process: {
        description:
          "This event is fired to process the next item in the queue. If the processing cannot proceed because of some error, raise an exception, and the queue will handle that.",
        descriptionRef: "Queue/Queue.mdx?process",
      },
      didProcess: {
        description:
          "This event is fired when the processing of a queued item has been successfully processed.",
        descriptionRef: "Queue/Queue.mdx?didProcess",
      },
      processError: {
        description:
          "This event is fired when processing an item raises an error. The event handler method receives two parameters. The first is the error raised during the processing of the item; the second is an object with these properties:",
        descriptionRef: "Queue/Queue.mdx?processError",
      },
      complete: {
        description:
          "The queue fires this event when the queue gets empty after processing all items. The event handler has no arguments.",
        descriptionRef: "Queue/Queue.mdx?complete",
      },
    },
    contextVars: {
      $completedItems: {
        description:
          "A list containing the queue items that have been completed (fully processed).",
        descriptionRef: "Queue/Queue.mdx?$completedItems",
      },
      $queuedItems: {
        description:
          "A list containing the items waiting in the queue, icluding the completed items.",
        descriptionRef: "Queue/Queue.mdx?$queuedItems",
      },
    },
    apis: {
      enqueueItem: {
        description:
          "This method enqueues the item passed in the method parameter. The new item will be processed after the current queue items have been handled. The method retrieves the unique ID of the newly added item; this ID can be used later in other methods, such as `remove`.",
        descriptionRef: "Queue/Queue.mdx?enqueueItem",
      },
      enqueueItems: {
        description:
          "This method enqueues the array of items passed in the method parameter. The new items will be processed after the current queue items have been handled. The method retrieves an array of unique IDs, one for each new item. An item ID can be used later in other methods, such as `remove`.",
        descriptionRef: "Queue/Queue.mdx?enqueueItems",
      },
      getQueuedItems: {
        description:
          "You can use this method to return the items in the queue. These items contain all entries not removed from the queue yet, including pending, in-progress, and completed items.",
        descriptionRef: "Queue/Queue.mdx?getQueuedItems",
      },
      getQueueLength: {
        description:
          "This method retrieves the current queue length. The queue contains only those items that are not fully processed yet.",
        descriptionRef: "Queue/Queue.mdx?getQueueLength",
      },
      remove: {
        description:
          "This method retrieves the current queue length. The queue contains only those items that are not fully processed yet.",
        descriptionRef: "Queue/Queue.mdx?remove",
      },
    },
    nonVisual: true,
  },
  RadioGroup: {
    description:
      "The `RadioGroup` input component is a group of radio buttons ([`RadioGroupOption`](./RadioGroupOption.mdx) components) that allow users to select only one option from the group at a time.",
    props: {
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?initialValue",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "RadioGroup/RadioGroup.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "RadioGroup/RadioGroup.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "RadioGroup/RadioGroup.mdx?validationStatus",
      },
      orientation: {
        description:
          "(*** NOT IMPLEMENTED YET ***) This property sets the orientation of the options within the radio group.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?orientation",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "RadioGroup/RadioGroup.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `RadioGroup`.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `RadioGroup` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "RadioGroup/RadioGroup.mdx?labelBreak",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the RadioGroup has received the focus.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the RadioGroup has lost the focus.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of RadioGroup has changed.",
        descriptionRef: "RadioGroup/RadioGroup.mdx?didChange",
      },
    },
    themeVars: {
      "gap-RadioGroupOption": "var(--xmlui-gap-RadioGroupOption)",
      "Input:color-bg-RadioGroupOption-default": "var(--xmlui-color-bg-RadioGroupOption-default)",
      "thickness-border-RadioGroupOption": "var(--xmlui-thickness-border-RadioGroupOption)",
      "Input:color-border-RadioGroupOption-default":
        "var(--xmlui-color-border-RadioGroupOption-default)",
      "Input:color-border-RadioGroupOption-default--hover":
        "var(--xmlui-color-border-RadioGroupOption-default--hover)",
      "Input:color-border-RadioGroupOption-default--active":
        "var(--xmlui-color-border-RadioGroupOption-default--active)",
      "Input:color-border-RadioGroupOption--disabled":
        "var(--xmlui-color-border-RadioGroupOption--disabled)",
      "Input:color-text-RadioGroupOption--disabled":
        "var(--xmlui-color-text-RadioGroupOption--disabled)",
      "Input:color-border-RadioGroupOption-error":
        "var(--xmlui-color-border-RadioGroupOption-error)",
      "Input:color-border-RadioGroupOption-warning":
        "var(--xmlui-color-border-RadioGroupOption-warning)",
      "Input:color-border-RadioGroupOption-success":
        "var(--xmlui-color-border-RadioGroupOption-success)",
      "color-bg-checked-RadioGroupOption-default":
        "var(--xmlui-color-bg-checked-RadioGroupOption-default)",
      "color-bg-checked-RadioGroupOption--disabled":
        "var(--xmlui-color-bg-checked-RadioGroupOption--disabled)",
      "color-bg-checked-RadioGroupOption-error":
        "var(--xmlui-color-bg-checked-RadioGroupOption-error)",
      "color-bg-checked-RadioGroupOption-warning":
        "var(--xmlui-color-bg-checked-RadioGroupOption-warning)",
      "color-bg-checked-RadioGroupOption-success":
        "var(--xmlui-color-bg-checked-RadioGroupOption-success)",
      "Input:font-size-RadioGroupOption": "var(--xmlui-font-size-RadioGroupOption)",
      "Input:font-weight-RadioGroupOption": "var(--xmlui-font-weight-RadioGroupOption)",
      "Input:color-text-RadioGroupOption-default":
        "var(--xmlui-color-text-RadioGroupOption-default)",
      "Input:color-text-RadioGroupOption-error": "var(--xmlui-color-text-RadioGroupOption-error)",
      "Input:color-text-RadioGroupOption-warning":
        "var(--xmlui-color-text-RadioGroupOption-warning)",
      "Input:color-text-RadioGroupOption-success":
        "var(--xmlui-color-text-RadioGroupOption-success)",
      "Input:thickness-outline-RadioGroupOption--focus":
        "var(--xmlui-thickness-outline-RadioGroupOption--focus)",
      "Input:color-outline-RadioGroupOption--focus":
        "var(--xmlui-color-outline-RadioGroupOption--focus)",
      "Input:style-outline-RadioGroupOption--focus":
        "var(--xmlui-style-outline-RadioGroupOption--focus)",
      "Input:offset-outline-RadioGroupOption--focus":
        "var(--xmlui-offset-outline-RadioGroupOption--focus)",
    },
    defaultThemeVars: {
      "gap-RadioGroupOption": "$space-1_5",
      "thickness-border-RadioGroupOption": "2px",
      "color-bg-checked-RadioGroupOption--disabled]": "$color-border-RadioGroupOption--disabled",
      "color-bg-checked-RadioGroupOption-error": "$color-border-RadioGroupOption-error",
      "color-bg-checked-RadioGroupOption-warning": "$color-border-RadioGroupOption-warning",
      "color-bg-checked-RadioGroupOption-success": "$color-border-RadioGroupOption-success",
      "font-size-RadioGroupOption": "$font-size-small",
      "font-weight-RadioGroupOption": "$font-weight-bold",
      "color-text-RadioGroupOption-error": "$color-border-RadioGroupOption-error",
      "color-text-RadioGroupOption-warning": "$color-border-RadioGroupOption-warning",
      "color-text-RadioGroupOption-success": "$color-border-RadioGroupOption-success",
      light: {
        "color-bg-checked-RadioGroupOption-default": "$color-primary-500",
        "color-border-RadioGroupOption-default": "$color-surface-500",
        "color-border-RadioGroupOption-default--hover": "$color-surface-700",
        "color-border-RadioGroupOption-default--active": "$color-primary-500",
      },
      dark: {
        "color-bg-checked-RadioGroupOption-default": "$color-primary-500",
        "color-border-RadioGroupOption-default": "$color-surface-500",
        "color-border-RadioGroupOption-default--hover": "$color-surface-300",
        "color-border-RadioGroupOption-default--active": "$color-primary-400",
      },
    },
  },
  RealTimeAdapter: {
    description:
      "`RealTimeAdapter` is a non-visual component that listens to real-time events through long-polling.",
    status: "experimental",
    props: {
      url: {
        description: "This property specifies the URL to use for long-polling.",
        descriptionRef: "RealTimeAdapter/RealTimeAdapter.mdx?url",
      },
    },
    events: {
      eventArrived: {
        description: "This event is raised when data arrives from the backend using long-polling.",
        descriptionRef: "RealTimeAdapter/RealTimeAdapter.mdx?eventArrived",
      },
    },
  },
  Redirect: {
    description:
      "`Redirect` is a component that immediately redirects the browser to the URL in its `to` property when it gets visible (its `when` property gets `true`). The redirection works only within the app.",
    props: {
      to: {
        description:
          "This property defines the URL to which this component is about to redirect requests.",
        descriptionRef: "Redirect/Redirect.mdx?to",
      },
    },
  },
  Select: {
    description: "Provides a dropdown with a list of options to choose from.",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "Select/Select.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "Select/Select.mdx?initialValue",
      },
      maxLength: {
        description: "This property sets the maximum length of the input it accepts.",
        descriptionRef: "Select/Select.mdx?maxLength",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Select/Select.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "Select/Select.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "Select/Select.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "Select/Select.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "Select/Select.mdx?validationStatus",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "Select/Select.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "Select/Select.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `Select`.",
        descriptionRef: "Select/Select.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `Select` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Select/Select.mdx?labelBreak",
      },
      optionLabelTemplate: {
        description:
          "This property allows replacing the default template to display an option in the dropdown list.",
        valueType: "ComponentDef",
        descriptionRef: "Select/Select.mdx?optionLabelTemplate",
      },
      valueTemplate: {
        description:
          "This property allows replacing the default template to display a selected value when multiple selections (`multiSelect` is `true`) are enabled.",
        valueType: "ComponentDef",
        descriptionRef: "Select/Select.mdx?valueTemplate",
      },
      dropdownHeight: {
        description: "This property sets the height of the dropdown list.",
        descriptionRef: "Select/Select.mdx?dropdownHeight",
      },
      emptyListTemplate: {
        description:
          "This optional property provides the ability to customize what is displayed when the list of options is empty.",
        descriptionRef: "Select/Select.mdx?emptyListTemplate",
      },
      multiSelect: {
        description:
          "The `true` value of the property indicates if the user can select multiple items.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Select/Select.mdx?multiSelect",
      },
      searchable: {
        description: "This property enables the search functionality in the dropdown list.",
        descriptionRef: "Select/Select.mdx?searchable",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the Select has received the focus.",
        descriptionRef: "Select/Select.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the Select has lost the focus.",
        descriptionRef: "Select/Select.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of Select has changed.",
        descriptionRef: "Select/Select.mdx?didChange",
      },
    },
    contextVars: {
      $item: {
        description: "This property represents the value of an item in the dropdown list.",
        descriptionRef: "Select/Select.mdx?$item",
      },
      $itemContext: {
        description:
          "This property provides a `removeItem` method to delete the particular value from the selection.",
        descriptionRef: "Select/Select.mdx?$itemContext",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the Select.",
        descriptionRef: "Select/Select.mdx?focus",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "Select/Select.mdx?setValue",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "Select/Select.mdx?value",
      },
    },
    themeVars: {
      "Input:font-size-Select-default": "var(--xmlui-font-size-Select-default)",
      "Input:color-placeholder-Select-default": "var(--xmlui-color-placeholder-Select-default)",
      "Input:color-text-Select-default": "var(--xmlui-color-text-Select-default)",
      "Input:font-size-Select-error": "var(--xmlui-font-size-Select-error)",
      "Input:color-placeholder-Select-error": "var(--xmlui-color-placeholder-Select-error)",
      "Input:color-text-Select-error": "var(--xmlui-color-text-Select-error)",
      "Input:font-size-Select-warning": "var(--xmlui-font-size-Select-warning)",
      "Input:color-placeholder-Select-warning": "var(--xmlui-color-placeholder-Select-warning)",
      "Input:color-text-Select-warning": "var(--xmlui-color-text-Select-warning)",
      "Input:font-size-Select-success": "var(--xmlui-font-size-Select-success)",
      "Input:color-placeholder-Select-success": "var(--xmlui-color-placeholder-Select-success)",
      "Input:color-text-Select-success": "var(--xmlui-color-text-Select-success)",
      "Input:radius-Select-default": "var(--xmlui-radius-Select-default)",
      "Input:color-border-Select-default": "var(--xmlui-color-border-Select-default)",
      "Input:thickness-border-Select-default": "var(--xmlui-thickness-border-Select-default)",
      "Input:style-border-Select-default": "var(--xmlui-style-border-Select-default)",
      "Input:color-bg-Select-default": "var(--xmlui-color-bg-Select-default)",
      "Input:shadow-Select-default": "var(--xmlui-shadow-Select-default)",
      "Input:color-border-Select-default--hover": "var(--xmlui-color-border-Select-default--hover)",
      "Input:color-bg-Select-default--hover": "var(--xmlui-color-bg-Select-default--hover)",
      "Input:shadow-Select-default--hover": "var(--xmlui-shadow-Select-default--hover)",
      "Input:color-text-Select-default--hover": "var(--xmlui-color-text-Select-default--hover)",
      "Input:thickness-outline-Select-default--focus":
        "var(--xmlui-thickness-outline-Select-default--focus)",
      "Input:color-outline-Select-default--focus":
        "var(--xmlui-color-outline-Select-default--focus)",
      "Input:style-outline-Select-default--focus":
        "var(--xmlui-style-outline-Select-default--focus)",
      "Input:offset-outline-Select-default--focus":
        "var(--xmlui-offset-outline-Select-default--focus)",
      "Input:radius-Select-error": "var(--xmlui-radius-Select-error)",
      "Input:color-border-Select-error": "var(--xmlui-color-border-Select-error)",
      "Input:thickness-border-Select-error": "var(--xmlui-thickness-border-Select-error)",
      "Input:style-border-Select-error": "var(--xmlui-style-border-Select-error)",
      "Input:color-bg-Select-error": "var(--xmlui-color-bg-Select-error)",
      "Input:shadow-Select-error": "var(--xmlui-shadow-Select-error)",
      "Input:color-border-Select-error--hover": "var(--xmlui-color-border-Select-error--hover)",
      "Input:color-bg-Select-error--hover": "var(--xmlui-color-bg-Select-error--hover)",
      "Input:shadow-Select-error--hover": "var(--xmlui-shadow-Select-error--hover)",
      "Input:color-text-Select-error--hover": "var(--xmlui-color-text-Select-error--hover)",
      "Input:thickness-outline-Select-error--focus":
        "var(--xmlui-thickness-outline-Select-error--focus)",
      "Input:color-outline-Select-error--focus": "var(--xmlui-color-outline-Select-error--focus)",
      "Input:style-outline-Select-error--focus": "var(--xmlui-style-outline-Select-error--focus)",
      "Input:offset-outline-Select-error--focus": "var(--xmlui-offset-outline-Select-error--focus)",
      "Input:radius-Select-warning": "var(--xmlui-radius-Select-warning)",
      "Input:color-border-Select-warning": "var(--xmlui-color-border-Select-warning)",
      "Input:thickness-border-Select-warning": "var(--xmlui-thickness-border-Select-warning)",
      "Input:style-border-Select-warning": "var(--xmlui-style-border-Select-warning)",
      "Input:color-bg-Select-warning": "var(--xmlui-color-bg-Select-warning)",
      "Input:shadow-Select-warning": "var(--xmlui-shadow-Select-warning)",
      "Input:color-border-Select-warning--hover": "var(--xmlui-color-border-Select-warning--hover)",
      "Input:color-bg-Select-warning--hover": "var(--xmlui-color-bg-Select-warning--hover)",
      "Input:shadow-Select-warning--hover": "var(--xmlui-shadow-Select-warning--hover)",
      "Input:color-text-Select-warning--hover": "var(--xmlui-color-text-Select-warning--hover)",
      "Input:thickness-outline-Select-warning--focus":
        "var(--xmlui-thickness-outline-Select-warning--focus)",
      "Input:color-outline-Select-warning--focus":
        "var(--xmlui-color-outline-Select-warning--focus)",
      "Input:style-outline-Select-warning--focus":
        "var(--xmlui-style-outline-Select-warning--focus)",
      "Input:offset-outline-Select-warning--focus":
        "var(--xmlui-offset-outline-Select-warning--focus)",
      "Input:radius-Select-success": "var(--xmlui-radius-Select-success)",
      "Input:color-border-Select-success": "var(--xmlui-color-border-Select-success)",
      "Input:thickness-border-Select-success": "var(--xmlui-thickness-border-Select-success)",
      "Input:style-border-Select-success": "var(--xmlui-style-border-Select-success)",
      "Input:color-bg-Select-success": "var(--xmlui-color-bg-Select-success)",
      "Input:shadow-Select-success": "var(--xmlui-shadow-Select-success)",
      "Input:color-border-Select-success--hover": "var(--xmlui-color-border-Select-success--hover)",
      "Input:color-bg-Select-success--hover": "var(--xmlui-color-bg-Select-success--hover)",
      "Input:shadow-Select-success--hover": "var(--xmlui-shadow-Select-success--hover)",
      "Input:color-text-Select-success--hover": "var(--xmlui-color-text-Select-success--hover)",
      "Input:thickness-outline-Select-success--focus":
        "var(--xmlui-thickness-outline-Select-success--focus)",
      "Input:color-outline-Select-success--focus":
        "var(--xmlui-color-outline-Select-success--focus)",
      "Input:style-outline-Select-success--focus":
        "var(--xmlui-style-outline-Select-success--focus)",
      "Input:offset-outline-Select-success--focus":
        "var(--xmlui-offset-outline-Select-success--focus)",
      "opacity-Select--disabled": "var(--xmlui-opacity-Select--disabled)",
      "Input:color-bg-Select--disabled": "var(--xmlui-color-bg-Select--disabled)",
      "Input:color-text-Select--disabled": "var(--xmlui-color-text-Select--disabled)",
      "Input:color-border-Select--disabled": "var(--xmlui-color-border-Select--disabled)",
      "padding-vertical-Select-badge": "var(--xmlui-padding-vertical-Select-badge)",
      "padding-horizontal-Select-badge": "var(--xmlui-padding-horizontal-Select-badge)",
      "Input:font-size-Select-badge": "var(--xmlui-font-size-Select-badge)",
      "Input:color-bg-Select-badge": "var(--xmlui-color-bg-Select-badge)",
      "Input:color-text-Select-badge": "var(--xmlui-color-text-Select-badge)",
      "Input:color-bg-Select-badge--hover": "var(--xmlui-color-bg-Select-badge--hover)",
      "Input:color-text-Select-badge--hover": "var(--xmlui-color-text-Select-badge--hover)",
      "Input:color-bg-Select-badge--active": "var(--xmlui-color-bg-Select-badge--active)",
      "Input:color-text-Select-badge--active": "var(--xmlui-color-text-Select-badge--active)",
      "Input:color-placeholder-Select": "var(--xmlui-color-placeholder-Select)",
      "Input:color-bg-menu-Select": "var(--xmlui-color-bg-menu-Select)",
      "Input:radius-menu-Select": "var(--xmlui-radius-menu-Select)",
      "Input:shadow-menu-Select": "var(--xmlui-shadow-menu-Select)",
      "Input:thickness-border-menu-Select": "var(--xmlui-thickness-border-menu-Select)",
      "Input:color-border-menu-Select": "var(--xmlui-color-border-menu-Select)",
      "color-bg-item-Select": "var(--xmlui-color-bg-item-Select)",
      "color-bg-item-Select--hover": "var(--xmlui-color-bg-item-Select--hover)",
      "opacity-text-item-Select--disabled": "var(--xmlui-opacity-text-item-Select--disabled)",
      "font-size-Select": "var(--xmlui-font-size-Select)",
      "color-bg-item-Select--active": "var(--xmlui-color-bg-item-Select--active)",
      "color-text-indicator-Select": "var(--xmlui-color-text-indicator-Select)",
    },
    defaultThemeVars: {
      "color-bg-menu-Select": "$color-bg-primary",
      "shadow-menu-Select": "$shadow-md",
      "radius-menu-Select": "$radius",
      "thickness-border-menu-Select": "1px",
      "color-border-menu-Select": "$color-border",
      "color-bg-item-Select": "$color-bg-dropdown-item",
      "color-bg-item-Select--hover": "$color-bg-dropdown-item--active",
      "color-bg-item-Select--active": "$color-bg-dropdown-item--active",
      "min-height-Input": "39px",
      "color-bg-Select-badge": "$color-primary-500",
      "font-size-Select-badge": "$font-size-small",
      "padding-horizontal-Select-badge": "$space-1",
      "padding-vertical-Select-badge": "$space-1",
      "opacity-text-item-Select--disabled": "0.5",
      "opacity-Select--disabled": "0.5",
      light: {
        "color-bg-Select-badge--hover": "$color-primary-400",
        "color-bg-Select-badge--active": "$color-primary-500",
        "color-text-item-Select--disabled": "$color-surface-200",
        "color-text-Select-badge": "$color-surface-50",
      },
      dark: {
        "color-bg-Select-badge--hover": "$color-primary-600",
        "color-bg-Select-badge--active": "$color-primary-500",
        "color-text-Select-badge": "$color-surface-50",
        "color-text-item-Select--disabled": "$color-surface-800",
      },
    },
  },
  SelectionStore: {
    description:
      "The `SelectionStore` is a non-visual component that may wrap components (items) and manage their selection state to accommodate the usage of other actions.",
    status: "deprecated",
    props: {
      idKey: {
        description:
          'The selected items in the selection store needs to have a unique ID to use as an unambiguous key for that particular item. This property uniquely identifies the selected object item via a given property. By default, the key attribute is `"id"`.',
      },
    },
  },
  SpaceFiller: {
    description:
      "The `SpaceFiller` is a component that works well in layout containers to fill the remaining (unused) space. Its behavior depends on the layout container in which it is used.",
    themeVars: [],
  },
  Spinner: {
    description:
      "The `Spinner` component is an animated indicator that represents a particular action in progress without a deterministic progress value.",
    props: {
      delay: {
        description: "The delay in milliseconds before the spinner is displayed.",
        descriptionRef: "Spinner/Spinner.mdx?delay",
      },
      fullScreen: {
        description: "If set to `true`, the component will be rendered in a full screen container.",
        descriptionRef: "Spinner/Spinner.mdx?fullScreen",
      },
      themeColor: {
        description: "(**NOT IMPLEMENTED YET**) The theme color of the component.",
        descriptionRef: "Spinner/Spinner.mdx?themeColor",
      },
    },
    themeVars: {
      "size-Spinner": "var(--xmlui-size-Spinner)",
      "thickness-Spinner": "var(--xmlui-thickness-Spinner)",
      "color-border-Spinner": "var(--xmlui-color-border-Spinner)",
    },
    defaultThemeVars: {
      "size-Spinner": "$space-10",
      "thickness-Spinner": "$space-0_5",
      light: {
        "color-border-Spinner": "$color-surface-400",
      },
      dark: {
        "color-border-Spinner": "$color-surface-600",
      },
    },
  },
  Splitter: {
    description:
      "The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections.",
    props: {
      swapped: {
        description:
          "This optional booelan property indicates whether the `Splitter` sections are layed out as primary and secondary (`false`) or secondary and primary (`true`) from left to right.",
        descriptionRef: "Splitter/VSplitter.mdx?swapped",
      },
      splitterTemplate: {
        description: "The divider can be customized using XMLUI components via this property.",
        valueType: "ComponentDef",
        descriptionRef: "Splitter/VSplitter.mdx?splitterTemplate",
      },
      initialPrimarySize: {
        description:
          "This optional number property sets the initial size of the primary section. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?initialPrimarySize",
      },
      minPrimarySize: {
        description:
          "This property sets the minimum size the primary section can have. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?minPrimarySize",
      },
      maxPrimarySize: {
        description:
          "This property sets the maximum size the primary section can have. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?maxPrimarySize",
      },
      floating: {
        description:
          "Toggles whether the resizer is visible (`false`) or not (`true`) when not hovered or dragged. The default value is `false`, meaning the resizer is visible all the time.",
        descriptionRef: "Splitter/VSplitter.mdx?floating",
      },
      orientation: {
        description:
          "Sets whether the `Splitter` divides the container horizontally and lays out the section on top of each other (`vertical`), or vertically by placing the sections next to each other (`horizontal`).",
        descriptionRef: "Splitter/Splitter.mdx?orientation",
      },
    },
    events: {
      resize: {
        description: "This event fires when the component is resized.",
        descriptionRef: "Splitter/VSplitter.mdx?resize",
      },
    },
    themeVars: {
      "padding-Splitter": "var(--xmlui-padding-Splitter)",
      "shadow-Splitter": "var(--xmlui-shadow-Splitter)",
      "color-bg-Splitter": "var(--xmlui-color-bg-Splitter)",
      "radius-Splitter": "var(--xmlui-radius-Splitter)",
      "color-border-Splitter": "var(--xmlui-color-border-Splitter)",
      "thickness-border-Splitter": "var(--xmlui-thickness-border-Splitter)",
      "style-border-Splitter": "var(--xmlui-style-border-Splitter)",
      "border-Splitter": "var(--xmlui-border-Splitter)",
      "color-bg-resizer-Splitter": "var(--xmlui-color-bg-resizer-Splitter)",
      "thickness-resizer-Splitter": "var(--xmlui-thickness-resizer-Splitter)",
      "cursor-resizer-horizontal-Splitter": "var(--xmlui-cursor-resizer-horizontal-Splitter)",
      "cursor-resizer-vertical-Splitter": "var(--xmlui-cursor-resizer-vertical-Splitter)",
    },
    defaultThemeVars: {
      "color-bg-resizer-Splitter": "$color-bg-Card",
      "thickness-resizer-Splitter": "5px",
      "cursor-resizer-horizontal-Splitter": "ew-resize",
      "cursor-resizer-vertical-Splitter": "ns-resize",
    },
  },
  HSplitter: {
    description:
      "The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections.",
    specializedFrom: "Splitter",
    props: {
      swapped: {
        description:
          "This optional booelan property indicates whether the `Splitter` sections are layed out as primary and secondary (`false`) or secondary and primary (`true`) from left to right.",
        descriptionRef: "Splitter/VSplitter.mdx?swapped",
      },
      splitterTemplate: {
        description: "The divider can be customized using XMLUI components via this property.",
        valueType: "ComponentDef",
        descriptionRef: "Splitter/VSplitter.mdx?splitterTemplate",
      },
      initialPrimarySize: {
        description:
          "This optional number property sets the initial size of the primary section. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?initialPrimarySize",
      },
      minPrimarySize: {
        description:
          "This property sets the minimum size the primary section can have. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?minPrimarySize",
      },
      maxPrimarySize: {
        description:
          "This property sets the maximum size the primary section can have. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?maxPrimarySize",
      },
      floating: {
        description:
          "Toggles whether the resizer is visible (`false`) or not (`true`) when not hovered or dragged. The default value is `false`, meaning the resizer is visible all the time.",
        descriptionRef: "Splitter/VSplitter.mdx?floating",
      },
    },
    events: {
      resize: {
        description: "This event fires when the component is resized.",
        descriptionRef: "Splitter/VSplitter.mdx?resize",
      },
    },
    themeVars: {
      "padding-Splitter": "var(--xmlui-padding-Splitter)",
      "shadow-Splitter": "var(--xmlui-shadow-Splitter)",
      "color-bg-Splitter": "var(--xmlui-color-bg-Splitter)",
      "radius-Splitter": "var(--xmlui-radius-Splitter)",
      "color-border-Splitter": "var(--xmlui-color-border-Splitter)",
      "thickness-border-Splitter": "var(--xmlui-thickness-border-Splitter)",
      "style-border-Splitter": "var(--xmlui-style-border-Splitter)",
      "border-Splitter": "var(--xmlui-border-Splitter)",
      "color-bg-resizer-Splitter": "var(--xmlui-color-bg-resizer-Splitter)",
      "thickness-resizer-Splitter": "var(--xmlui-thickness-resizer-Splitter)",
      "cursor-resizer-horizontal-Splitter": "var(--xmlui-cursor-resizer-horizontal-Splitter)",
      "cursor-resizer-vertical-Splitter": "var(--xmlui-cursor-resizer-vertical-Splitter)",
    },
    defaultThemeVars: {
      "color-bg-resizer-Splitter": "$color-bg-Card",
      "thickness-resizer-Splitter": "5px",
      "cursor-resizer-horizontal-Splitter": "ew-resize",
      "cursor-resizer-vertical-Splitter": "ns-resize",
    },
  },
  VSplitter: {
    description:
      "The `Splitter` component divides a container (such as a window, panel, pane, etc.) into two resizable sections.",
    specializedFrom: "Splitter",
    props: {
      swapped: {
        description:
          "This optional booelan property indicates whether the `Splitter` sections are layed out as primary and secondary (`false`) or secondary and primary (`true`) from left to right.",
        descriptionRef: "Splitter/VSplitter.mdx?swapped",
      },
      splitterTemplate: {
        description: "The divider can be customized using XMLUI components via this property.",
        valueType: "ComponentDef",
        descriptionRef: "Splitter/VSplitter.mdx?splitterTemplate",
      },
      initialPrimarySize: {
        description:
          "This optional number property sets the initial size of the primary section. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?initialPrimarySize",
      },
      minPrimarySize: {
        description:
          "This property sets the minimum size the primary section can have. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?minPrimarySize",
      },
      maxPrimarySize: {
        description:
          "This property sets the maximum size the primary section can have. The unit of the size value is in pixels or percentages.",
        descriptionRef: "Splitter/VSplitter.mdx?maxPrimarySize",
      },
      floating: {
        description:
          "Toggles whether the resizer is visible (`false`) or not (`true`) when not hovered or dragged. The default value is `false`, meaning the resizer is visible all the time.",
        descriptionRef: "Splitter/VSplitter.mdx?floating",
      },
    },
    events: {
      resize: {
        description: "This event fires when the component is resized.",
        descriptionRef: "Splitter/VSplitter.mdx?resize",
      },
    },
    themeVars: {
      "padding-Splitter": "var(--xmlui-padding-Splitter)",
      "shadow-Splitter": "var(--xmlui-shadow-Splitter)",
      "color-bg-Splitter": "var(--xmlui-color-bg-Splitter)",
      "radius-Splitter": "var(--xmlui-radius-Splitter)",
      "color-border-Splitter": "var(--xmlui-color-border-Splitter)",
      "thickness-border-Splitter": "var(--xmlui-thickness-border-Splitter)",
      "style-border-Splitter": "var(--xmlui-style-border-Splitter)",
      "border-Splitter": "var(--xmlui-border-Splitter)",
      "color-bg-resizer-Splitter": "var(--xmlui-color-bg-resizer-Splitter)",
      "thickness-resizer-Splitter": "var(--xmlui-thickness-resizer-Splitter)",
      "cursor-resizer-horizontal-Splitter": "var(--xmlui-cursor-resizer-horizontal-Splitter)",
      "cursor-resizer-vertical-Splitter": "var(--xmlui-cursor-resizer-vertical-Splitter)",
    },
    defaultThemeVars: {
      "color-bg-resizer-Splitter": "$color-bg-Card",
      "thickness-resizer-Splitter": "5px",
      "cursor-resizer-horizontal-Splitter": "ew-resize",
      "cursor-resizer-vertical-Splitter": "ns-resize",
    },
  },
  Stack: {
    description:
      "`Stack` is a layout container displaying children in a horizontal or vertical stack.",
    props: {
      gap: {
        description: "Optional size value indicating the gap between child elements.",
        descriptionRef: "Stack/VStack.mdx?gap",
      },
      reverse: {
        description: "Optional boolean property to reverse the order of child elements.",
        descriptionRef: "Stack/VStack.mdx?reverse",
      },
      wrapContent: {
        description:
          "Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.",
        descriptionRef: "Stack/VStack.mdx?wrapContent",
      },
      hoverContainer: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?hoverContainer",
      },
      visibleOnHover: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?visibleOnHover",
      },
      orientation: {
        description:
          "An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).",
        descriptionRef: "Stack/CVStack.mdx?orientation",
      },
      horizontalAlignment: {
        description:
          "Manages the horizontal content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?horizontalAlignment",
      },
      verticalAlignment: {
        description: "Manages the vertical content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?verticalAlignment",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Stack is clicked.",
        descriptionRef: "Stack/VStack.mdx?click",
      },
      mounted: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?mounted",
      },
    },
    themeVars: [],
  },
  CHStack: {
    description:
      "This component represents a stack that renders its contents horizontally and aligns that in the center along both axes.",
    specializedFrom: "Stack",
    props: {
      gap: {
        description: "Optional size value indicating the gap between child elements.",
        descriptionRef: "Stack/VStack.mdx?gap",
      },
      reverse: {
        description: "Optional boolean property to reverse the order of child elements.",
        descriptionRef: "Stack/VStack.mdx?reverse",
      },
      wrapContent: {
        description:
          "Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.",
        descriptionRef: "Stack/VStack.mdx?wrapContent",
      },
      hoverContainer: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?hoverContainer",
      },
      visibleOnHover: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?visibleOnHover",
      },
      orientation: {
        description:
          "An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).",
        descriptionRef: "Stack/CVStack.mdx?orientation",
      },
      horizontalAlignment: {
        description:
          "Manages the horizontal content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?horizontalAlignment",
      },
      verticalAlignment: {
        description: "Manages the vertical content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?verticalAlignment",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Stack is clicked.",
        descriptionRef: "Stack/VStack.mdx?click",
      },
      mounted: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?mounted",
      },
    },
    themeVars: [],
  },
  CVStack: {
    description:
      "This component represents a stack that renders its contents vertically and aligns that in the center along both axes.",
    specializedFrom: "Stack",
    props: {
      gap: {
        description: "Optional size value indicating the gap between child elements.",
        descriptionRef: "Stack/VStack.mdx?gap",
      },
      reverse: {
        description: "Optional boolean property to reverse the order of child elements.",
        descriptionRef: "Stack/VStack.mdx?reverse",
      },
      wrapContent: {
        description:
          "Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.",
        descriptionRef: "Stack/VStack.mdx?wrapContent",
      },
      hoverContainer: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?hoverContainer",
      },
      visibleOnHover: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?visibleOnHover",
      },
      orientation: {
        description:
          "An optional property that governs the Stack's orientation (whether the Stack lays out its children in a row or a column).",
        descriptionRef: "Stack/CVStack.mdx?orientation",
      },
      horizontalAlignment: {
        description:
          "Manages the horizontal content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?horizontalAlignment",
      },
      verticalAlignment: {
        description: "Manages the vertical content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?verticalAlignment",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Stack is clicked.",
        descriptionRef: "Stack/VStack.mdx?click",
      },
      mounted: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?mounted",
      },
    },
    themeVars: [],
  },
  HStack: {
    description: "This component represents a stack rendering its contents horizontally.",
    specializedFrom: "Stack",
    props: {
      gap: {
        description: "Optional size value indicating the gap between child elements.",
        descriptionRef: "Stack/VStack.mdx?gap",
      },
      reverse: {
        description: "Optional boolean property to reverse the order of child elements.",
        descriptionRef: "Stack/VStack.mdx?reverse",
      },
      wrapContent: {
        description:
          "Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.",
        descriptionRef: "Stack/VStack.mdx?wrapContent",
      },
      hoverContainer: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?hoverContainer",
      },
      visibleOnHover: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?visibleOnHover",
      },
      horizontalAlignment: {
        description:
          "Manages the horizontal content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?horizontalAlignment",
      },
      verticalAlignment: {
        description: "Manages the vertical content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?verticalAlignment",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Stack is clicked.",
        descriptionRef: "Stack/VStack.mdx?click",
      },
      mounted: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?mounted",
      },
    },
    themeVars: [],
  },
  VStack: {
    description: "This component represents a stack rendering its contents vertically.",
    specializedFrom: "Stack",
    props: {
      gap: {
        description: "Optional size value indicating the gap between child elements.",
        descriptionRef: "Stack/VStack.mdx?gap",
      },
      reverse: {
        description: "Optional boolean property to reverse the order of child elements.",
        descriptionRef: "Stack/VStack.mdx?reverse",
      },
      wrapContent: {
        description:
          "Optional boolean which wraps the content if set to true and the available space is not big enough. Works in all orientations.",
        descriptionRef: "Stack/VStack.mdx?wrapContent",
      },
      hoverContainer: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?hoverContainer",
      },
      visibleOnHover: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?visibleOnHover",
      },
      horizontalAlignment: {
        description:
          "Manages the horizontal content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?horizontalAlignment",
      },
      verticalAlignment: {
        description: "Manages the vertical content alignment for each child element in the Stack.",
        descriptionRef: "Stack/VStack.mdx?verticalAlignment",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Stack is clicked.",
        descriptionRef: "Stack/VStack.mdx?click",
      },
      mounted: {
        description: "Reserved for future use",
        descriptionRef: "Stack/VStack.mdx?mounted",
      },
    },
    themeVars: [],
  },
  StickyBox: {
    description:
      'The `StickyBox` is a component that "sticks" or remains fixed at the top or bottom position on the screen as the user scrolls.',
    status: "experimental",
    props: {
      to: {
        description:
          "This property determines whether the StickyBox should be anchored to the `top` or `bottom`.",
        descriptionRef: "StickyBox/StickyBox.mdx?to",
      },
    },
    themeVars: {
      "color-bg-StickyBox": "var(--xmlui-color-bg-StickyBox)",
    },
    defaultThemeVars: {
      "color-bg-StickyBox": "$color-bg",
    },
  },
  Switch: {
    description:
      "The `Switch` component is a user interface element that allows users to toggle between two states: on and off. It consists of a small rectangular or circular button that can be moved left or right to change its state.",
    props: {
      indeterminate: {
        description:
          "The `true` value of this property signals that the component is in an _intedeterminate state_.",
        descriptionRef: "Switch/Switch.mdx?indeterminate",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "Switch/Switch.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "right",
        descriptionRef: "Switch/Switch.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `Switch`.",
        descriptionRef: "Switch/Switch.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `Switch` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Switch/Switch.mdx?labelBreak",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "Switch/Switch.mdx?required",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        defaultValue: false,
        descriptionRef: "Switch/Switch.mdx?initialValue",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Switch/Switch.mdx?autoFocus",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "Switch/Switch.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "Switch/Switch.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "Switch/Switch.mdx?validationStatus",
      },
      description: {
        description:
          "(*** NOT IMPLEMENTED YET ***) This optional property displays an alternate description of the Switch besides its label.",
        descriptionRef: "Switch/Switch.mdx?description",
      },
    },
    events: {
      click: {
        description: "This event is triggered when the Switch is clicked.",
        descriptionRef: "Switch/Switch.mdx?click",
      },
      gotFocus: {
        description: "This event is triggered when the Switch has received the focus.",
        descriptionRef: "Switch/Switch.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the Switch has lost the focus.",
        descriptionRef: "Switch/Switch.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of Switch has changed.",
        descriptionRef: "Switch/Switch.mdx?didChange",
      },
    },
    apis: {
      value: {
        description:
          "You can query this read-only API property to query the component's current value (`true`: checked, `false`: unchecked).",
        descriptionRef: "Switch/Switch.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "Switch/Switch.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-Checkbox-default": "var(--xmlui-radius-Checkbox-default)",
      "Input:color-border-Checkbox-default": "var(--xmlui-color-border-Checkbox-default)",
      "Input:color-bg-Checkbox-default": "var(--xmlui-color-bg-Checkbox-default)",
      "Input:thickness-outline-Checkbox-default--focus":
        "var(--xmlui-thickness-outline-Checkbox-default--focus)",
      "Input:color-outline-Checkbox-default--focus":
        "var(--xmlui-color-outline-Checkbox-default--focus)",
      "Input:style-outline-Checkbox-default--focus":
        "var(--xmlui-style-outline-Checkbox-default--focus)",
      "Input:offset-outline-Checkbox-default--focus":
        "var(--xmlui-offset-outline-Checkbox-default--focus)",
      "Input:color-border-Checkbox-default--hover":
        "var(--xmlui-color-border-Checkbox-default--hover)",
      "Input:color-bg-Checkbox--disabled": "var(--xmlui-color-bg-Checkbox--disabled)",
      "Input:color-border-Checkbox--disabled": "var(--xmlui-color-border-Checkbox--disabled)",
      "Input:radius-Checkbox-error": "var(--xmlui-radius-Checkbox-error)",
      "Input:color-border-Checkbox-error": "var(--xmlui-color-border-Checkbox-error)",
      "Input:color-bg-Checkbox-error": "var(--xmlui-color-bg-Checkbox-error)",
      "Input:thickness-outline-Checkbox-error--focus":
        "var(--xmlui-thickness-outline-Checkbox-error--focus)",
      "Input:color-outline-Checkbox-error--focus":
        "var(--xmlui-color-outline-Checkbox-error--focus)",
      "Input:style-outline-Checkbox-error--focus":
        "var(--xmlui-style-outline-Checkbox-error--focus)",
      "Input:offset-outline-Checkbox-error--focus":
        "var(--xmlui-offset-outline-Checkbox-error--focus)",
      "Input:radius-Checkbox-warning": "var(--xmlui-radius-Checkbox-warning)",
      "Input:color-border-Checkbox-warning": "var(--xmlui-color-border-Checkbox-warning)",
      "Input:color-bg-Checkbox-warning": "var(--xmlui-color-bg-Checkbox-warning)",
      "Input:thickness-outline-Checkbox-warning--focus":
        "var(--xmlui-thickness-outline-Checkbox-warning--focus)",
      "Input:color-outline-Checkbox-warning--focus":
        "var(--xmlui-color-outline-Checkbox-warning--focus)",
      "Input:style-outline-Checkbox-warning--focus":
        "var(--xmlui-style-outline-Checkbox-warning--focus)",
      "Input:offset-outline-Checkbox-warning--focus":
        "var(--xmlui-offset-outline-Checkbox-warning--focus)",
      "Input:radius-Checkbox-success": "var(--xmlui-radius-Checkbox-success)",
      "Input:color-border-Checkbox-success": "var(--xmlui-color-border-Checkbox-success)",
      "Input:color-bg-Checkbox-success": "var(--xmlui-color-bg-Checkbox-success)",
      "Input:thickness-outline-Checkbox-success--focus":
        "var(--xmlui-thickness-outline-Checkbox-success--focus)",
      "Input:color-outline-Checkbox-success--focus":
        "var(--xmlui-color-outline-Checkbox-success--focus)",
      "Input:style-outline-Checkbox-success--focus":
        "var(--xmlui-style-outline-Checkbox-success--focus)",
      "Input:offset-outline-Checkbox-success--focus":
        "var(--xmlui-offset-outline-Checkbox-success--focus)",
      "color-bg-indicator-Checkbox": "var(--xmlui-color-bg-indicator-Checkbox)",
      "Input:color-border-checked-Checkbox": "var(--xmlui-color-border-checked-Checkbox)",
      "Input:color-bg-checked-Checkbox": "var(--xmlui-color-bg-checked-Checkbox)",
      "Input:color-border-checked-Checkbox-error":
        "var(--xmlui-color-border-checked-Checkbox-error)",
      "Input:color-bg-checked-Checkbox-error": "var(--xmlui-color-bg-checked-Checkbox-error)",
      "Input:color-border-checked-Checkbox-warning":
        "var(--xmlui-color-border-checked-Checkbox-warning)",
      "Input:color-bg-checked-Checkbox-warning": "var(--xmlui-color-bg-checked-Checkbox-warning)",
      "Input:color-border-checked-Checkbox-success":
        "var(--xmlui-color-border-checked-Checkbox-success)",
      "Input:color-bg-checked-Checkbox-success": "var(--xmlui-color-bg-checked-Checkbox-success)",
      "Input:color-border-Switch": "var(--xmlui-color-border-Switch)",
      "Input:color-bg-Switch": "var(--xmlui-color-bg-Switch)",
      "Input:color-border-Switch-default--hover": "var(--xmlui-color-border-Switch-default--hover)",
      "Input:color-bg-Switch--disabled": "var(--xmlui-color-bg-Switch--disabled)",
      "Input:color-border-Switch--disabled": "var(--xmlui-color-border-Switch--disabled)",
      "Input:color-border-Switch-error": "var(--xmlui-color-border-Switch-error)",
      "Input:color-border-Switch-warning": "var(--xmlui-color-border-Switch-warning)",
      "Input:color-border-Switch-success": "var(--xmlui-color-border-Switch-success)",
      "color-bg-indicator-Switch": "var(--xmlui-color-bg-indicator-Switch)",
      "Input:color-border-checked-Switch": "var(--xmlui-color-border-checked-Switch)",
      "Input:color-bg-checked-Switch": "var(--xmlui-color-bg-checked-Switch)",
      "Input:color-border-checked-Switch-error": "var(--xmlui-color-border-checked-Switch-error)",
      "Input:color-bg-checked-Switch-error": "var(--xmlui-color-bg-checked-Switch-error)",
      "Input:color-border-checked-Switch-warning":
        "var(--xmlui-color-border-checked-Switch-warning)",
      "Input:color-bg-checked-Switch-warning": "var(--xmlui-color-bg-checked-Switch-warning)",
      "Input:color-border-checked-Switch-success":
        "var(--xmlui-color-border-checked-Switch-success)",
      "Input:color-bg-checked-Switch-success": "var(--xmlui-color-bg-checked-Switch-success)",
      "Input:thickness-outline-Switch--focus": "var(--xmlui-thickness-outline-Switch--focus)",
      "Input:color-outline-Switch--focus": "var(--xmlui-color-outline-Switch--focus)",
      "Input:style-outline-Switch--focus": "var(--xmlui-style-outline-Switch--focus)",
      "Input:offset-outline-Switch--focus": "var(--xmlui-offset-outline-Switch--focus)",
    },
    defaultThemeVars: {
      "color-border-checked-Switch-error": "$color-border-Switch-error",
      "color-bg-checked-Switch-error": "$color-border-Switch-error",
      "color-border-checked-Switch-warning": "$color-border-Switch-warning",
      "color-bg-checked-Switch-warning": "$color-border-Switch-warning",
      "color-border-checked-Switch-success": "$color-border-Switch-success",
      "color-bg-checked-Switch-success": "$color-border-Switch-success",
      light: {
        "color-bg-Switch": "$color-surface-400",
        "color-border-Switch": "$color-surface-400",
        "color-bg-indicator-Switch": "$color-bg-primary",
        "color-border-checked-Switch": "$color-primary-500",
        "color-bg-checked-Switch": "$color-primary-500",
        "color-bg-Switch--disabled": "$color-surface-200",
      },
      dark: {
        "color-bg-Switch": "$color-surface-500",
        "color-border-Switch": "$color-surface-500",
        "color-bg-indicator-Switch": "$color-bg-primary",
        "color-border-checked-Switch": "$color-primary-400",
        "color-bg-checked-Switch": "$color-primary-400",
        "color-bg-Switch--disabled": "$color-surface-800",
      },
    },
  },
  Table: {
    description:
      "`Table` is a component that displays cells organized into rows and columns. The `Table` component is virtualized so it only renders visible cells.",
    props: {
      items: {
        description:
          "You can use `items` as an alias for the `data` property. When you bind the table to a data source (e.g. an API endpoint), the `data` acts as the property that accepts a URL to fetch information from an API. When both `items` and `data` are used, `items` has priority.",
        descriptionRef: "Table/Table.mdx?items",
      },
      data: {
        description:
          "The component receives data via this property. The `data` property is a list of items that the `Table` can display.",
        descriptionRef: "Table/Table.mdx?data",
      },
      isPaginated: {
        description: "This property adds pagination controls to the `Table`.",
        descriptionRef: "Table/Table.mdx?isPaginated",
      },
      loading: {
        description:
          "This boolean property indicates if the component is fetching (or processing) data. This property is useful when data is loaded conditionally or receiving it takes some time.",
        descriptionRef: "Table/Table.mdx?loading",
      },
      headerHeight: {
        description: "This optional property is used to specify the height of the table header.",
        descriptionRef: "Table/Table.mdx?headerHeight",
      },
      rowsSelectable: {
        description: "Indicates whether the rows are selectable (`true`) or not (`false`).",
        descriptionRef: "Table/Table.mdx?rowsSelectable",
      },
      pageSizes: {
        description: "Describes how big a page should be for pagination.",
        descriptionRef: "Table/Table.mdx?pageSizes",
      },
      rowDisabledPredicate: {
        description:
          "This property defines a predicate function with a return value that determines if the row should be disabled. The function retrieves the item to display and should return a Boolean-like value.",
        descriptionRef: "Table/Table.mdx?rowDisabledPredicate",
      },
      noDataTemplate: {
        description:
          "A property to customize what to display if the table does not contain any data.",
        valueType: "ComponentDef",
        descriptionRef: "Table/Table.mdx?noDataTemplate",
      },
      sortBy: {
        description: "This property is used to determine which data attributes to sort by.",
        descriptionRef: "Table/Table.mdx?sortBy",
      },
      sortDirection: {
        description:
          "This property determines the sort order to be `ascending` or `descending`. This property only works if the [`sortBy`](#sortby) property is also set.",
        descriptionRef: "Table/Table.mdx?sortDirection",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Table/Table.mdx?autoFocus",
      },
      hideHeader: {
        description:
          "Set the header visibility using this property. Set it to `true` to hide the header.",
        descriptionRef: "Table/Table.mdx?hideHeader",
      },
      iconNoSort: {
        description:
          "Allows the customization of the icon displayed in the Table column header when when sorting is enabled and sorting is not done according to the column.",
        descriptionRef: "Table/Table.mdx?iconNoSort",
      },
      iconSortAsc: {
        description:
          "Allows the customization of the icon displayed in the Table column header when sorting is enabled, sorting is done according to the column, and the column is sorted in ascending order.",
        descriptionRef: "Table/Table.mdx?iconSortAsc",
      },
      iconSortDesc: {
        description:
          "Allows the customization of the icon displayed in the Table column header when sorting is enabled, sorting is done according to the column, and the column is sorted in descending order.",
        descriptionRef: "Table/Table.mdx?iconSortDesc",
      },
      enableMultiRowSelection: {
        description:
          "This boolean property indicates whether you can select multiple rows in the table. This property only has an effect when the rowsSelectable property is set. Setting it to `false` limits selection to a single row.",
        descriptionRef: "Table/Table.mdx?enableMultiRowSelection",
      },
      alwaysShowSelectionHeader: {
        description:
          "This property indicates when the row selection header is displayed. When the value is `true,` the selection header is always visible. Otherwise, it is displayed only when hovered.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "Table/Table.mdx?alwaysShowSelectionHeader",
      },
    },
    events: {
      sortingDidChange: {
        description:
          "This event is fired when the table data sorting has changed. It has two arguments: the column's name and the sort direction. When the column name is empty, the table displays the data list as it received it.",
        descriptionRef: "Table/Table.mdx?sortingDidChange",
      },
      willSort: {
        description:
          "This event is fired before the table data is sorted. It has two arguments: the column's name and the sort direction. When the method returns a literal `false` value (and not any other falsy one), the method indicates that the sorting should be aborted.",
        descriptionRef: "Table/Table.mdx?willSort",
      },
      selectionDidChange: {
        description:
          "This event is triggered when the table's current selection (the rows selected) changes. Its parameter is an array of the selected table row items. ",
        descriptionRef: "Table/Table.mdx?selectionDidChange",
      },
    },
    apis: {
      clearSelection: {
        description: "This method clears the list of currently selected table rows.",
        descriptionRef: "Table/Table.mdx?clearSelection",
      },
      getSelectedItems: {
        description: "This method returns the list of currently selected table rows items.",
        descriptionRef: "Table/Table.mdx?getSelectedItems",
      },
      getSelectedIds: {
        description: "This method returns the list of currently selected table rows IDs.",
        descriptionRef: "Table/Table.mdx?getSelectedIds",
      },
      selectAll: {
        description:
          "This method selects all the rows in the table. This method has no effect if the rowsSelectable property is set to `false`.",
        descriptionRef: "Table/Table.mdx?selectAll",
      },
      selectId: {
        description:
          "This method selects the row with the specified ID. This method has no effect if the `rowsSelectable` property is set to `false`. The method argument can be a single id or an array of them.",
        descriptionRef: "Table/Table.mdx?selectId",
      },
    },
    themeVars: {
      "color-text-pagination-Table": "var(--xmlui-color-text-pagination-Table)",
      "color-bg-Table": "var(--xmlui-color-bg-Table)",
      "color-text-Table": "var(--xmlui-color-text-Table)",
      "color-bg-row-Table": "var(--xmlui-color-bg-row-Table)",
      "color-bg-row-Table--hover": "var(--xmlui-color-bg-row-Table--hover)",
      "color-bg-selected-Table": "var(--xmlui-color-bg-selected-Table)",
      "color-bg-selected-Table--hover": "var(--xmlui-color-bg-selected-Table--hover)",
      "color-bg-heading-Table": "var(--xmlui-color-bg-heading-Table)",
      "color-bg-heading-Table--hover": "var(--xmlui-color-bg-heading-Table--hover)",
      "color-bg-heading-Table--active": "var(--xmlui-color-bg-heading-Table--active)",
      "padding-horizontal-heading-Table": "var(--xmlui-padding-horizontal-heading-Table)",
      "padding-vertical-heading-Table": "var(--xmlui-padding-vertical-heading-Table)",
      "padding-heading-Table": "var(--xmlui-padding-heading-Table)",
      "padding-horizontal-cell-Table": "var(--xmlui-padding-horizontal-cell-Table)",
      "padding-horizontal-cell-first-Table": "var(--xmlui-padding-horizontal-cell-first-Table)",
      "padding-horizontal-cell-last-Table": "var(--xmlui-padding-horizontal-cell-last-Table)",
      "padding-vertical-cell-Table": "var(--xmlui-padding-vertical-cell-Table)",
      "padding-cell-Table": "var(--xmlui-padding-cell-Table)",
      "color-border-cell-Table": "var(--xmlui-color-border-cell-Table)",
      "thickness-border-cell-Table": "var(--xmlui-thickness-border-cell-Table)",
      "style-border-cell-Table": "var(--xmlui-style-border-cell-Table)",
      "border-cell-Table": "var(--xmlui-border-cell-Table)",
      "color-bg-pagination-Table": "var(--xmlui-color-bg-pagination-Table)",
      "color-text-heading-Table": "var(--xmlui-color-text-heading-Table)",
      "font-weight-row-Table": "var(--xmlui-font-weight-row-Table)",
      "font-size-row-Table": "var(--xmlui-font-size-row-Table)",
      "font-weight-heading-Table": "var(--xmlui-font-weight-heading-Table)",
      "font-size-heading-Table": "var(--xmlui-font-size-heading-Table)",
      "transform-text-heading-Table": "var(--xmlui-transform-text-heading-Table)",
      "thickness-outline-heading-Table--focus":
        "var(--xmlui-thickness-outline-heading-Table--focus)",
      "color-outline-heading-Table--focus": "var(--xmlui-color-outline-heading-Table--focus)",
      "style-outline-heading-Table--focus": "var(--xmlui-style-outline-heading-Table--focus)",
      "offset-outline-heading-Table--focus": "var(--xmlui-offset-outline-heading-Table--focus)",
    },
    defaultThemeVars: {
      "padding-horizontal-heading-Table": "$space-2",
      "padding-vertical-heading-Table": "$space-2",
      "padding-heading-Table": "$padding-vertical-heading-Table $padding-horizontal-heading-Table",
      "padding-horizontal-cell-Table": "$space-2",
      "padding-horizontal-cell-first-Table": "$space-5",
      "padding-horizontal-cell-last-Table": "$space-5",
      "padding-vertical-cell-Table": "$space-2",
      "padding-cell-Table": "$padding-vertical-cell-Table $padding-horizontal-cell-Table",
      "thickness-border-cell-Table": "1px",
      "style-border-cell-Table": "solid",
      "border-cell-Table":
        "$thickness-border-cell-Table $style-border-cell-Table $color-border-cell-Table",
      "thickness-outline-heading-Table--focus": "$thickness-outline--focus",
      "style-outline-heading-Table--focus": "$style-outline--focus",
      "offset-outline-heading-Table--focus": "$offset-outline--focus",
      "font-size-heading-Table": "$font-size-tiny",
      "font-weight-heading-Table": "$font-weight-bold",
      "transform-text-heading-Table": "uppercase",
      "font-size-row-Table": "$font-size-small",
      "color-bg-Table": "$color-bg",
      "color-bg-row-Table": "inherit",
      "color-border-cell-Table": "$color-border",
      "color-bg-selected-Table--hover": "$color-bg-row-Table--hover",
      "color-bg-pagination-Table": "$color-bg-Table",
      "color-outline-heading-Table--focus": "$color-outline--focus",
      "color-text-pagination-Table": "$color-secondary",
      light: {
        "color-bg-row-Table--hover": "$color-primary-50",
        "color-bg-selected-Table": "$color-primary-100",
        "color-bg-heading-Table--hover": "$color-surface-200",
        "color-bg-heading-Table--active": "$color-surface-300",
        "color-bg-heading-Table": "$color-surface-100",
        "color-text-heading-Table": "$color-surface-500",
      },
      dark: {
        "color-bg-row-Table--hover": "$color-primary-900",
        "color-bg-selected-Table": "$color-primary-800",
        "color-bg-heading-Table--hover": "$color-surface-800",
        "color-bg-heading-Table": "$color-surface-950",
        "color-bg-heading-Table--active": "$color-surface-700",
      },
    },
  },
  TableHeader: {
    description:
      "The `TableHeader` component can be used within a `Table` to define a particular table column's visual properties and data bindings.",
    status: "experimental",
    props: {
      title: {
        description: "The title of the table header.",
        descriptionRef: "TableHeader/TableHeader.mdx?title",
      },
    },
    defaultThemeVars: {
      "padding-vertical-TableHeader": "$space-4",
      "padding-horizontal-TableHeader": "$space-5",
    },
  },
  TableOfContents: {
    description:
      "The `TableOfContents` component collects headings and bookmarks within the current page and displays them in a tree representing their hierarchy. When you select an item in this tree, the component navigates the page to the selected position.",
    status: "experimental",
    props: {
      smoothScrolling: {
        description:
          "This property indicates that smooth scrolling is used while scrolling the selected table of contents items into view.",
        descriptionRef: "TableOfContents/TableOfContents.mdx?smoothScrolling",
      },
    },
    themeVars: {
      "padding-vertical-TableOfContentsItem": "var(--xmlui-padding-vertical-TableOfContentsItem)",
      "padding-horizontal-TableOfContentsItem":
        "var(--xmlui-padding-horizontal-TableOfContentsItem)",
      "padding-horizontal-TableOfContentsItem-level-1":
        "var(--xmlui-padding-horizontal-TableOfContentsItem-level-1)",
      "padding-horizontal-TableOfContentsItem-level-2":
        "var(--xmlui-padding-horizontal-TableOfContentsItem-level-2)",
      "padding-horizontal-TableOfContentsItem-level-3":
        "var(--xmlui-padding-horizontal-TableOfContentsItem-level-3)",
      "padding-horizontal-TableOfContentsItem-level-4":
        "var(--xmlui-padding-horizontal-TableOfContentsItem-level-4)",
      "padding-horizontal-TableOfContentsItem-level-5":
        "var(--xmlui-padding-horizontal-TableOfContentsItem-level-5)",
      "padding-horizontal-TableOfContentsItem-level-6":
        "var(--xmlui-padding-horizontal-TableOfContentsItem-level-6)",
      "color-bg-TableOfContents": "var(--xmlui-color-bg-TableOfContents)",
      "width-TableOfContents": "var(--xmlui-width-TableOfContents)",
      "height-TableOfContents": "var(--xmlui-height-TableOfContents)",
      "border-radius-TableOfContents": "var(--xmlui-border-radius-TableOfContents)",
      "color-border-TableOfContents": "var(--xmlui-color-border-TableOfContents)",
      "thickness-border-TableOfContents": "var(--xmlui-thickness-border-TableOfContents)",
      "style-border-TableOfContents": "var(--xmlui-style-border-TableOfContents)",
      "margin-top-TableOfContents": "var(--xmlui-margin-top-TableOfContents)",
      "margin-bottom-TableOfContents": "var(--xmlui-margin-bottom-TableOfContents)",
      "padding-vertical-TableOfContents": "var(--xmlui-padding-vertical-TableOfContents)",
      "padding-horizontal-TableOfContents": "var(--xmlui-padding-horizontal-TableOfContents)",
      "border-width-TableOfContentsItem": "var(--xmlui-border-width-TableOfContentsItem)",
      "border-style-TableOfContentsItem": "var(--xmlui-border-style-TableOfContentsItem)",
      "border-color-TableOfContentsItem": "var(--xmlui-border-color-TableOfContentsItem)",
      "color-TableOfContentsItem": "var(--xmlui-color-TableOfContentsItem)",
      "font-size-TableOfContentsItem": "var(--xmlui-font-size-TableOfContentsItem)",
      "font-weight-TableOfContentsItem": "var(--xmlui-font-weight-TableOfContentsItem)",
      "font-family-TableOfContentsItem": "var(--xmlui-font-family-TableOfContentsItem)",
      "transform-TableOfContentsItem": "var(--xmlui-transform-TableOfContentsItem)",
      "align-vertical-TableOfContentsItem": "var(--xmlui-align-vertical-TableOfContentsItem)",
      "letter-spacing-TableOfContentsItem": "var(--xmlui-letter-spacing-TableOfContentsItem)",
      "border-color-TableOfContentsItem--active":
        "var(--xmlui-border-color-TableOfContentsItem--active)",
      "color-TableOfContentsItem--active": "var(--xmlui-color-TableOfContentsItem--active)",
      "font-weight-TableOfContentsItem--active":
        "var(--xmlui-font-weight-TableOfContentsItem--active)",
    },
    defaultThemeVars: {
      "width-TableOfContents": "auto",
      "height-TableOfContents": "auto",
      "font-size-TableOfContentsItem": "$font-size-smaller",
      "font-weight-TableOfContentsItem": "$font-weight-normal",
      "font-family-TableOfContentsItem": "$font-family",
      "border-radius-TableOfContentsItem": "0",
      "border-width-TableOfContentsItem": "$space-0_5",
      "border-style-TableOfContentsItem": "solid",
      "border-radius-TableOfContentsItem--active": "0",
      "border-width-TableOfContentsItem--active": "$space-0_5",
      "border-style-TableOfContentsItem--active": "solid",
      "font-weight-TableOfContentsItem--active": "$font-weight-bold",
      "color-bg-TableOfContents": "transparent",
      "padding-horizontal-TableOfContents": "$space-8",
      "padding-vertical-TableOfContents": "$space-4",
      "padding-horizontal-TableOfContentsItem": "$space-2",
      "padding-vertical-TableOfContentsItem": "$space-2",
      "padding-horizontal-TableOfContentsItem-level-1": "unset",
      "padding-horizontal-TableOfContentsItem-level-2": "unset",
      "padding-horizontal-TableOfContentsItem-level-3": "unset",
      "padding-horizontal-TableOfContentsItem-level-4": "unset",
      "padding-horizontal-TableOfContentsItem-level-5": "unset",
      "padding-horizontal-TableOfContentsItem-level-6": "unset",
      "margin-top-TableOfContents": "0",
      "margin-bottom-TableOfContents": "0",
      "border-radius-TableOfContents": "0",
      "border-width-TableOfContents": "0",
      "border-color-TableOfContents": "transparent",
      "border-style-TableOfContents": "solid",
      "transform-TableOfContentsItem": "none",
      "align-vertical-TableOfContentsItem": "baseline",
      "letter-spacing-TableOfContentsItem": "0",
      light: {
        "color-TableOfContentsItem": "$color-text-primary",
        "border-color-TableOfContentsItem": "$color-border",
        "border-color-TableOfContentsItem--active": "$color-primary-500",
        "color-TableOfContentsItem--active": "$color-primary-500",
      },
      dark: {
        "color-TableOfContentsItem": "$color-text-primary",
        "border-color-TableOfContentsItem": "$color-border",
        "border-color-TableOfContentsItem--active": "$color-primary-500",
        "color-TableOfContentsItem--active": "$color-text-secondary",
      },
    },
  },
  TabItem: {
    description:
      "`TabItem` is a non-visual component describing a tab. Tabs component may use nested TabItem instances from which the user can select.",
    props: {
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "TabItem/TabItem.mdx?label",
      },
    },
  },
  Tabs: {
    description:
      "The `Tabs` component provides a tabbed layout where each tab has a clickable label and content.",
    status: "experimental",
    props: {
      activeTab: {
        description:
          "This property indicates the index of the active tab. The indexing starts from 0, representing the starting (leftmost) tab.",
        descriptionRef: "Tabs/Tabs.mdx?activeTab",
      },
      orientation: {
        description:
          "This property indicates the orientation of the component. In horizontal orientation, the tab sections are laid out on the left side of the content panel, while in vertical orientation, the buttons are at the top.",
        descriptionRef: "Tabs/Tabs.mdx?orientation",
      },
      tabTemplate: {
        description: "This property declares the template for the clickable tab area.",
        valueType: "ComponentDef",
        descriptionRef: "Tabs/Tabs.mdx?tabTemplate",
      },
    },
    themeVars: {
      "color-bg-Tabs": "var(--xmlui-color-bg-Tabs)",
      "color-border-Tabs": "var(--xmlui-color-border-Tabs)",
      "thickness-border-Tabs": "var(--xmlui-thickness-border-Tabs)",
      "color-border-active-Tabs": "var(--xmlui-color-border-active-Tabs)",
      "color-bg-trigger-Tabs": "var(--xmlui-color-bg-trigger-Tabs)",
      "color-bg-trigger-Tabs--hover": "var(--xmlui-color-bg-trigger-Tabs--hover)",
    },
    defaultThemeVars: {
      "color-bg-Tabs": "$color-bg-primary",
      "style-border-Tabs": "solid",
      "color-border-Tabs": "$color-border",
      "color-border-active-Tabs": "$color-primary",
      "thickness-border-Tabs": "2px",
      "color-bg-trigger-Tabs": "$color-bg-primary",
      light: {
        "color-bg-trigger-Tabs--hover": "$color-primary-50",
      },
      dark: {
        "color-bg-trigger-Tabs--hover": "$color-primary-800",
      },
    },
  },
  Text: {
    description:
      "The `Text` component displays textual information in a number of optional styles and variants.",
    props: {
      value: {
        description:
          "The text to be displayed. This value can also be set via nesting the text into the `Text` component.",
        descriptionRef: "Text/Text.mdx?value",
      },
      variant: {
        description:
          "Optional string value that provides named presets for text variants with a unique combination of font style, weight, size, color and other parameters.",
        availableValues: [
          {
            value: "abbr",
            description: "Represents an abbreviation or acronym",
          },
          {
            value: "caption",
            description: "Represents the caption (or title) of a table",
          },
          {
            value: "cite",
            description: "Is used to mark up the title of a cited work",
          },
          {
            value: "code",
            description: "Represents a line of code",
          },
          {
            value: "codefence",
            description: "Handles the display of code blocks if combined with a `code` variant",
          },
          {
            value: "deleted",
            description: "Represents text that has been deleted",
          },
          {
            value: "em",
            description: "Marks text to stress emphasis",
          },
          {
            value: "inserted",
            description: "Represents a range of text that has been added to a document",
          },
          {
            value: "keyboard",
            description:
              "Represents a span of text denoting textual user input from a keyboard or voice input",
          },
          {
            value: "marked",
            description: "Represents text which is marked or highlighted for reference or notation",
          },
          {
            value: "mono",
            description: "Text using a mono style font family",
          },
          {
            value: "paragraph",
            description: "Represents a paragraph",
          },
          {
            value: "placeholder",
            description: "Text that is mostly used as the placeholder style in input controls",
          },
          {
            value: "sample",
            description: "Represents sample (or quoted) output from a computer program",
          },
          {
            value: "secondary",
            description: "Represents a bit dimmed secondary text",
          },
          {
            value: "small",
            description: "Represents side-comments and small print",
          },
          {
            value: "sub",
            description: "Specifies inline text as subscript",
          },
          {
            value: "strong",
            description: "Contents have strong importance",
          },
          {
            value: "subheading",
            description: "Indicates that the text is the subtitle in a heading",
          },
          {
            value: "subtitle",
            description: "Indicates that the text is the subtitle of some other content",
          },
          {
            value: "sup",
            description: "Specifies inline text as superscript",
          },
          {
            value: "tableheading",
            description: "Indicates that the text is a table heading",
          },
          {
            value: "title",
            description: "Indicates that the text is the title of some other content",
          },
          {
            value: "var",
            description: "Represents the name of a variable in a mathematical expression",
          },
        ],
        descriptionRef: "Text/Text.mdx?variant",
      },
      maxLines: {
        description:
          "This property determines the maximum number of lines the component can wrap to. If there is no space to display all the contents, the component displays up to as many lines as specified in this property.",
        descriptionRef: "Text/Text.mdx?maxLines",
      },
      preserveLinebreaks: {
        description:
          "This property indicates if linebreaks should be preserved when displaying text.",
        descriptionRef: "Text/Text.mdx?preserveLinebreaks",
      },
      ellipses: {
        description:
          "This property indicates whether ellipses should be displayed when the text is cropped (`true`) or not (`false`).",
        descriptionRef: "Text/Text.mdx?ellipses",
      },
    },
    themeVars: {
      "font-family-Text-abbr": "var(--xmlui-font-family-Text-abbr)",
      "font-size-Text-abbr": "var(--xmlui-font-size-Text-abbr)",
      "font-weight-Text-abbr": "var(--xmlui-font-weight-Text-abbr)",
      "font-style-Text-abbr": "var(--xmlui-font-style-Text-abbr)",
      "font-stretch-Text-abbr": "var(--xmlui-font-stretch-Text-abbr)",
      "line-decoration-Text-abbr": "var(--xmlui-line-decoration-Text-abbr)",
      "color-decoration-Text-abbr": "var(--xmlui-color-decoration-Text-abbr)",
      "style-decoration-Text-abbr": "var(--xmlui-style-decoration-Text-abbr)",
      "thickness-decoration-Text-abbr": "var(--xmlui-thickness-decoration-Text-abbr)",
      "offset-decoration-Text-abbr": "var(--xmlui-offset-decoration-Text-abbr)",
      "line-height-Text-abbr": "var(--xmlui-line-height-Text-abbr)",
      "color-Text-abbr": "var(--xmlui-color-Text-abbr)",
      "color-bg-Text-abbr": "var(--xmlui-color-bg-Text-abbr)",
      "border-radius-Text-abbr": "var(--xmlui-border-radius-Text-abbr)",
      "color-border-Text-abbr": "var(--xmlui-color-border-Text-abbr)",
      "thickness-border-Text-abbr": "var(--xmlui-thickness-border-Text-abbr)",
      "style-border-Text-abbr": "var(--xmlui-style-border-Text-abbr)",
      "margin-top-Text-abbr": "var(--xmlui-margin-top-Text-abbr)",
      "margin-bottom-Text-abbr": "var(--xmlui-margin-bottom-Text-abbr)",
      "padding-horizontal-Text-abbr": "var(--xmlui-padding-horizontal-Text-abbr)",
      "padding-vertical-Text-abbr": "var(--xmlui-padding-vertical-Text-abbr)",
      "transform-Text-abbr": "var(--xmlui-transform-Text-abbr)",
      "align-vertical-Text-abbr": "var(--xmlui-align-vertical-Text-abbr)",
      "letter-spacing-Text-abbr": "var(--xmlui-letter-spacing-Text-abbr)",
      "font-family-Text-cite": "var(--xmlui-font-family-Text-cite)",
      "font-size-Text-cite": "var(--xmlui-font-size-Text-cite)",
      "font-weight-Text-cite": "var(--xmlui-font-weight-Text-cite)",
      "font-style-Text-cite": "var(--xmlui-font-style-Text-cite)",
      "font-stretch-Text-cite": "var(--xmlui-font-stretch-Text-cite)",
      "line-decoration-Text-cite": "var(--xmlui-line-decoration-Text-cite)",
      "color-decoration-Text-cite": "var(--xmlui-color-decoration-Text-cite)",
      "style-decoration-Text-cite": "var(--xmlui-style-decoration-Text-cite)",
      "thickness-decoration-Text-cite": "var(--xmlui-thickness-decoration-Text-cite)",
      "offset-decoration-Text-cite": "var(--xmlui-offset-decoration-Text-cite)",
      "line-height-Text-cite": "var(--xmlui-line-height-Text-cite)",
      "color-Text-cite": "var(--xmlui-color-Text-cite)",
      "color-bg-Text-cite": "var(--xmlui-color-bg-Text-cite)",
      "border-radius-Text-cite": "var(--xmlui-border-radius-Text-cite)",
      "color-border-Text-cite": "var(--xmlui-color-border-Text-cite)",
      "thickness-border-Text-cite": "var(--xmlui-thickness-border-Text-cite)",
      "style-border-Text-cite": "var(--xmlui-style-border-Text-cite)",
      "margin-top-Text-cite": "var(--xmlui-margin-top-Text-cite)",
      "margin-bottom-Text-cite": "var(--xmlui-margin-bottom-Text-cite)",
      "padding-horizontal-Text-cite": "var(--xmlui-padding-horizontal-Text-cite)",
      "padding-vertical-Text-cite": "var(--xmlui-padding-vertical-Text-cite)",
      "transform-Text-cite": "var(--xmlui-transform-Text-cite)",
      "align-vertical-Text-cite": "var(--xmlui-align-vertical-Text-cite)",
      "letter-spacing-Text-cite": "var(--xmlui-letter-spacing-Text-cite)",
      "font-family-Text-code": "var(--xmlui-font-family-Text-code)",
      "font-size-Text-code": "var(--xmlui-font-size-Text-code)",
      "font-weight-Text-code": "var(--xmlui-font-weight-Text-code)",
      "font-style-Text-code": "var(--xmlui-font-style-Text-code)",
      "font-stretch-Text-code": "var(--xmlui-font-stretch-Text-code)",
      "line-decoration-Text-code": "var(--xmlui-line-decoration-Text-code)",
      "color-decoration-Text-code": "var(--xmlui-color-decoration-Text-code)",
      "style-decoration-Text-code": "var(--xmlui-style-decoration-Text-code)",
      "thickness-decoration-Text-code": "var(--xmlui-thickness-decoration-Text-code)",
      "offset-decoration-Text-code": "var(--xmlui-offset-decoration-Text-code)",
      "line-height-Text-code": "var(--xmlui-line-height-Text-code)",
      "color-Text-code": "var(--xmlui-color-Text-code)",
      "color-bg-Text-code": "var(--xmlui-color-bg-Text-code)",
      "border-radius-Text-code": "var(--xmlui-border-radius-Text-code)",
      "color-border-Text-code": "var(--xmlui-color-border-Text-code)",
      "thickness-border-Text-code": "var(--xmlui-thickness-border-Text-code)",
      "style-border-Text-code": "var(--xmlui-style-border-Text-code)",
      "margin-top-Text-code": "var(--xmlui-margin-top-Text-code)",
      "margin-bottom-Text-code": "var(--xmlui-margin-bottom-Text-code)",
      "padding-horizontal-Text-code": "var(--xmlui-padding-horizontal-Text-code)",
      "padding-vertical-Text-code": "var(--xmlui-padding-vertical-Text-code)",
      "transform-Text-code": "var(--xmlui-transform-Text-code)",
      "align-vertical-Text-code": "var(--xmlui-align-vertical-Text-code)",
      "letter-spacing-Text-code": "var(--xmlui-letter-spacing-Text-code)",
      "font-family-Text-codefence": "var(--xmlui-font-family-Text-codefence)",
      "font-size-Text-codefence": "var(--xmlui-font-size-Text-codefence)",
      "font-weight-Text-codefence": "var(--xmlui-font-weight-Text-codefence)",
      "font-style-Text-codefence": "var(--xmlui-font-style-Text-codefence)",
      "font-stretch-Text-codefence": "var(--xmlui-font-stretch-Text-codefence)",
      "line-decoration-Text-codefence": "var(--xmlui-line-decoration-Text-codefence)",
      "color-decoration-Text-codefence": "var(--xmlui-color-decoration-Text-codefence)",
      "style-decoration-Text-codefence": "var(--xmlui-style-decoration-Text-codefence)",
      "thickness-decoration-Text-codefence": "var(--xmlui-thickness-decoration-Text-codefence)",
      "offset-decoration-Text-codefence": "var(--xmlui-offset-decoration-Text-codefence)",
      "line-height-Text-codefence": "var(--xmlui-line-height-Text-codefence)",
      "color-Text-codefence": "var(--xmlui-color-Text-codefence)",
      "color-bg-Text-codefence": "var(--xmlui-color-bg-Text-codefence)",
      "border-radius-Text-codefence": "var(--xmlui-border-radius-Text-codefence)",
      "color-border-Text-codefence": "var(--xmlui-color-border-Text-codefence)",
      "thickness-border-Text-codefence": "var(--xmlui-thickness-border-Text-codefence)",
      "style-border-Text-codefence": "var(--xmlui-style-border-Text-codefence)",
      "margin-top-Text-codefence": "var(--xmlui-margin-top-Text-codefence)",
      "margin-bottom-Text-codefence": "var(--xmlui-margin-bottom-Text-codefence)",
      "padding-horizontal-Text-codefence": "var(--xmlui-padding-horizontal-Text-codefence)",
      "padding-vertical-Text-codefence": "var(--xmlui-padding-vertical-Text-codefence)",
      "transform-Text-codefence": "var(--xmlui-transform-Text-codefence)",
      "align-vertical-Text-codefence": "var(--xmlui-align-vertical-Text-codefence)",
      "letter-spacing-Text-codefence": "var(--xmlui-letter-spacing-Text-codefence)",
      "font-family-Text-deleted": "var(--xmlui-font-family-Text-deleted)",
      "font-size-Text-deleted": "var(--xmlui-font-size-Text-deleted)",
      "font-weight-Text-deleted": "var(--xmlui-font-weight-Text-deleted)",
      "font-style-Text-deleted": "var(--xmlui-font-style-Text-deleted)",
      "font-stretch-Text-deleted": "var(--xmlui-font-stretch-Text-deleted)",
      "line-decoration-Text-deleted": "var(--xmlui-line-decoration-Text-deleted)",
      "color-decoration-Text-deleted": "var(--xmlui-color-decoration-Text-deleted)",
      "style-decoration-Text-deleted": "var(--xmlui-style-decoration-Text-deleted)",
      "thickness-decoration-Text-deleted": "var(--xmlui-thickness-decoration-Text-deleted)",
      "offset-decoration-Text-deleted": "var(--xmlui-offset-decoration-Text-deleted)",
      "line-height-Text-deleted": "var(--xmlui-line-height-Text-deleted)",
      "color-Text-deleted": "var(--xmlui-color-Text-deleted)",
      "color-bg-Text-deleted": "var(--xmlui-color-bg-Text-deleted)",
      "border-radius-Text-deleted": "var(--xmlui-border-radius-Text-deleted)",
      "color-border-Text-deleted": "var(--xmlui-color-border-Text-deleted)",
      "thickness-border-Text-deleted": "var(--xmlui-thickness-border-Text-deleted)",
      "style-border-Text-deleted": "var(--xmlui-style-border-Text-deleted)",
      "margin-top-Text-deleted": "var(--xmlui-margin-top-Text-deleted)",
      "margin-bottom-Text-deleted": "var(--xmlui-margin-bottom-Text-deleted)",
      "padding-horizontal-Text-deleted": "var(--xmlui-padding-horizontal-Text-deleted)",
      "padding-vertical-Text-deleted": "var(--xmlui-padding-vertical-Text-deleted)",
      "transform-Text-deleted": "var(--xmlui-transform-Text-deleted)",
      "align-vertical-Text-deleted": "var(--xmlui-align-vertical-Text-deleted)",
      "letter-spacing-Text-deleted": "var(--xmlui-letter-spacing-Text-deleted)",
      "font-family-Text-inserted": "var(--xmlui-font-family-Text-inserted)",
      "font-size-Text-inserted": "var(--xmlui-font-size-Text-inserted)",
      "font-weight-Text-inserted": "var(--xmlui-font-weight-Text-inserted)",
      "font-style-Text-inserted": "var(--xmlui-font-style-Text-inserted)",
      "font-stretch-Text-inserted": "var(--xmlui-font-stretch-Text-inserted)",
      "line-decoration-Text-inserted": "var(--xmlui-line-decoration-Text-inserted)",
      "color-decoration-Text-inserted": "var(--xmlui-color-decoration-Text-inserted)",
      "style-decoration-Text-inserted": "var(--xmlui-style-decoration-Text-inserted)",
      "thickness-decoration-Text-inserted": "var(--xmlui-thickness-decoration-Text-inserted)",
      "offset-decoration-Text-inserted": "var(--xmlui-offset-decoration-Text-inserted)",
      "line-height-Text-inserted": "var(--xmlui-line-height-Text-inserted)",
      "color-Text-inserted": "var(--xmlui-color-Text-inserted)",
      "color-bg-Text-inserted": "var(--xmlui-color-bg-Text-inserted)",
      "border-radius-Text-inserted": "var(--xmlui-border-radius-Text-inserted)",
      "color-border-Text-inserted": "var(--xmlui-color-border-Text-inserted)",
      "thickness-border-Text-inserted": "var(--xmlui-thickness-border-Text-inserted)",
      "style-border-Text-inserted": "var(--xmlui-style-border-Text-inserted)",
      "margin-top-Text-inserted": "var(--xmlui-margin-top-Text-inserted)",
      "margin-bottom-Text-inserted": "var(--xmlui-margin-bottom-Text-inserted)",
      "padding-horizontal-Text-inserted": "var(--xmlui-padding-horizontal-Text-inserted)",
      "padding-vertical-Text-inserted": "var(--xmlui-padding-vertical-Text-inserted)",
      "transform-Text-inserted": "var(--xmlui-transform-Text-inserted)",
      "align-vertical-Text-inserted": "var(--xmlui-align-vertical-Text-inserted)",
      "letter-spacing-Text-inserted": "var(--xmlui-letter-spacing-Text-inserted)",
      "font-family-Text-keyboard": "var(--xmlui-font-family-Text-keyboard)",
      "font-size-Text-keyboard": "var(--xmlui-font-size-Text-keyboard)",
      "font-weight-Text-keyboard": "var(--xmlui-font-weight-Text-keyboard)",
      "font-style-Text-keyboard": "var(--xmlui-font-style-Text-keyboard)",
      "font-stretch-Text-keyboard": "var(--xmlui-font-stretch-Text-keyboard)",
      "line-decoration-Text-keyboard": "var(--xmlui-line-decoration-Text-keyboard)",
      "color-decoration-Text-keyboard": "var(--xmlui-color-decoration-Text-keyboard)",
      "style-decoration-Text-keyboard": "var(--xmlui-style-decoration-Text-keyboard)",
      "thickness-decoration-Text-keyboard": "var(--xmlui-thickness-decoration-Text-keyboard)",
      "offset-decoration-Text-keyboard": "var(--xmlui-offset-decoration-Text-keyboard)",
      "line-height-Text-keyboard": "var(--xmlui-line-height-Text-keyboard)",
      "color-Text-keyboard": "var(--xmlui-color-Text-keyboard)",
      "color-bg-Text-keyboard": "var(--xmlui-color-bg-Text-keyboard)",
      "border-radius-Text-keyboard": "var(--xmlui-border-radius-Text-keyboard)",
      "color-border-Text-keyboard": "var(--xmlui-color-border-Text-keyboard)",
      "thickness-border-Text-keyboard": "var(--xmlui-thickness-border-Text-keyboard)",
      "style-border-Text-keyboard": "var(--xmlui-style-border-Text-keyboard)",
      "margin-top-Text-keyboard": "var(--xmlui-margin-top-Text-keyboard)",
      "margin-bottom-Text-keyboard": "var(--xmlui-margin-bottom-Text-keyboard)",
      "padding-horizontal-Text-keyboard": "var(--xmlui-padding-horizontal-Text-keyboard)",
      "padding-vertical-Text-keyboard": "var(--xmlui-padding-vertical-Text-keyboard)",
      "transform-Text-keyboard": "var(--xmlui-transform-Text-keyboard)",
      "align-vertical-Text-keyboard": "var(--xmlui-align-vertical-Text-keyboard)",
      "letter-spacing-Text-keyboard": "var(--xmlui-letter-spacing-Text-keyboard)",
      "font-family-Text-marked": "var(--xmlui-font-family-Text-marked)",
      "font-size-Text-marked": "var(--xmlui-font-size-Text-marked)",
      "font-weight-Text-marked": "var(--xmlui-font-weight-Text-marked)",
      "font-style-Text-marked": "var(--xmlui-font-style-Text-marked)",
      "font-stretch-Text-marked": "var(--xmlui-font-stretch-Text-marked)",
      "line-decoration-Text-marked": "var(--xmlui-line-decoration-Text-marked)",
      "color-decoration-Text-marked": "var(--xmlui-color-decoration-Text-marked)",
      "style-decoration-Text-marked": "var(--xmlui-style-decoration-Text-marked)",
      "thickness-decoration-Text-marked": "var(--xmlui-thickness-decoration-Text-marked)",
      "offset-decoration-Text-marked": "var(--xmlui-offset-decoration-Text-marked)",
      "line-height-Text-marked": "var(--xmlui-line-height-Text-marked)",
      "color-Text-marked": "var(--xmlui-color-Text-marked)",
      "color-bg-Text-marked": "var(--xmlui-color-bg-Text-marked)",
      "border-radius-Text-marked": "var(--xmlui-border-radius-Text-marked)",
      "color-border-Text-marked": "var(--xmlui-color-border-Text-marked)",
      "thickness-border-Text-marked": "var(--xmlui-thickness-border-Text-marked)",
      "style-border-Text-marked": "var(--xmlui-style-border-Text-marked)",
      "margin-top-Text-marked": "var(--xmlui-margin-top-Text-marked)",
      "margin-bottom-Text-marked": "var(--xmlui-margin-bottom-Text-marked)",
      "padding-horizontal-Text-marked": "var(--xmlui-padding-horizontal-Text-marked)",
      "padding-vertical-Text-marked": "var(--xmlui-padding-vertical-Text-marked)",
      "transform-Text-marked": "var(--xmlui-transform-Text-marked)",
      "align-vertical-Text-marked": "var(--xmlui-align-vertical-Text-marked)",
      "letter-spacing-Text-marked": "var(--xmlui-letter-spacing-Text-marked)",
      "font-family-Text-mono": "var(--xmlui-font-family-Text-mono)",
      "font-size-Text-mono": "var(--xmlui-font-size-Text-mono)",
      "font-weight-Text-mono": "var(--xmlui-font-weight-Text-mono)",
      "font-style-Text-mono": "var(--xmlui-font-style-Text-mono)",
      "font-stretch-Text-mono": "var(--xmlui-font-stretch-Text-mono)",
      "line-decoration-Text-mono": "var(--xmlui-line-decoration-Text-mono)",
      "color-decoration-Text-mono": "var(--xmlui-color-decoration-Text-mono)",
      "style-decoration-Text-mono": "var(--xmlui-style-decoration-Text-mono)",
      "thickness-decoration-Text-mono": "var(--xmlui-thickness-decoration-Text-mono)",
      "offset-decoration-Text-mono": "var(--xmlui-offset-decoration-Text-mono)",
      "line-height-Text-mono": "var(--xmlui-line-height-Text-mono)",
      "color-Text-mono": "var(--xmlui-color-Text-mono)",
      "color-bg-Text-mono": "var(--xmlui-color-bg-Text-mono)",
      "border-radius-Text-mono": "var(--xmlui-border-radius-Text-mono)",
      "color-border-Text-mono": "var(--xmlui-color-border-Text-mono)",
      "thickness-border-Text-mono": "var(--xmlui-thickness-border-Text-mono)",
      "style-border-Text-mono": "var(--xmlui-style-border-Text-mono)",
      "margin-top-Text-mono": "var(--xmlui-margin-top-Text-mono)",
      "margin-bottom-Text-mono": "var(--xmlui-margin-bottom-Text-mono)",
      "padding-horizontal-Text-mono": "var(--xmlui-padding-horizontal-Text-mono)",
      "padding-vertical-Text-mono": "var(--xmlui-padding-vertical-Text-mono)",
      "transform-Text-mono": "var(--xmlui-transform-Text-mono)",
      "align-vertical-Text-mono": "var(--xmlui-align-vertical-Text-mono)",
      "letter-spacing-Text-mono": "var(--xmlui-letter-spacing-Text-mono)",
      "font-family-Text-sample": "var(--xmlui-font-family-Text-sample)",
      "font-size-Text-sample": "var(--xmlui-font-size-Text-sample)",
      "font-weight-Text-sample": "var(--xmlui-font-weight-Text-sample)",
      "font-style-Text-sample": "var(--xmlui-font-style-Text-sample)",
      "font-stretch-Text-sample": "var(--xmlui-font-stretch-Text-sample)",
      "line-decoration-Text-sample": "var(--xmlui-line-decoration-Text-sample)",
      "color-decoration-Text-sample": "var(--xmlui-color-decoration-Text-sample)",
      "style-decoration-Text-sample": "var(--xmlui-style-decoration-Text-sample)",
      "thickness-decoration-Text-sample": "var(--xmlui-thickness-decoration-Text-sample)",
      "offset-decoration-Text-sample": "var(--xmlui-offset-decoration-Text-sample)",
      "line-height-Text-sample": "var(--xmlui-line-height-Text-sample)",
      "color-Text-sample": "var(--xmlui-color-Text-sample)",
      "color-bg-Text-sample": "var(--xmlui-color-bg-Text-sample)",
      "border-radius-Text-sample": "var(--xmlui-border-radius-Text-sample)",
      "color-border-Text-sample": "var(--xmlui-color-border-Text-sample)",
      "thickness-border-Text-sample": "var(--xmlui-thickness-border-Text-sample)",
      "style-border-Text-sample": "var(--xmlui-style-border-Text-sample)",
      "margin-top-Text-sample": "var(--xmlui-margin-top-Text-sample)",
      "margin-bottom-Text-sample": "var(--xmlui-margin-bottom-Text-sample)",
      "padding-horizontal-Text-sample": "var(--xmlui-padding-horizontal-Text-sample)",
      "padding-vertical-Text-sample": "var(--xmlui-padding-vertical-Text-sample)",
      "transform-Text-sample": "var(--xmlui-transform-Text-sample)",
      "align-vertical-Text-sample": "var(--xmlui-align-vertical-Text-sample)",
      "letter-spacing-Text-sample": "var(--xmlui-letter-spacing-Text-sample)",
      "font-family-Text-sup": "var(--xmlui-font-family-Text-sup)",
      "font-size-Text-sup": "var(--xmlui-font-size-Text-sup)",
      "font-weight-Text-sup": "var(--xmlui-font-weight-Text-sup)",
      "font-style-Text-sup": "var(--xmlui-font-style-Text-sup)",
      "font-stretch-Text-sup": "var(--xmlui-font-stretch-Text-sup)",
      "line-decoration-Text-sup": "var(--xmlui-line-decoration-Text-sup)",
      "color-decoration-Text-sup": "var(--xmlui-color-decoration-Text-sup)",
      "style-decoration-Text-sup": "var(--xmlui-style-decoration-Text-sup)",
      "thickness-decoration-Text-sup": "var(--xmlui-thickness-decoration-Text-sup)",
      "offset-decoration-Text-sup": "var(--xmlui-offset-decoration-Text-sup)",
      "line-height-Text-sup": "var(--xmlui-line-height-Text-sup)",
      "color-Text-sup": "var(--xmlui-color-Text-sup)",
      "color-bg-Text-sup": "var(--xmlui-color-bg-Text-sup)",
      "border-radius-Text-sup": "var(--xmlui-border-radius-Text-sup)",
      "color-border-Text-sup": "var(--xmlui-color-border-Text-sup)",
      "thickness-border-Text-sup": "var(--xmlui-thickness-border-Text-sup)",
      "style-border-Text-sup": "var(--xmlui-style-border-Text-sup)",
      "margin-top-Text-sup": "var(--xmlui-margin-top-Text-sup)",
      "margin-bottom-Text-sup": "var(--xmlui-margin-bottom-Text-sup)",
      "padding-horizontal-Text-sup": "var(--xmlui-padding-horizontal-Text-sup)",
      "padding-vertical-Text-sup": "var(--xmlui-padding-vertical-Text-sup)",
      "transform-Text-sup": "var(--xmlui-transform-Text-sup)",
      "align-vertical-Text-sup": "var(--xmlui-align-vertical-Text-sup)",
      "letter-spacing-Text-sup": "var(--xmlui-letter-spacing-Text-sup)",
      "font-family-Text-sub": "var(--xmlui-font-family-Text-sub)",
      "font-size-Text-sub": "var(--xmlui-font-size-Text-sub)",
      "font-weight-Text-sub": "var(--xmlui-font-weight-Text-sub)",
      "font-style-Text-sub": "var(--xmlui-font-style-Text-sub)",
      "font-stretch-Text-sub": "var(--xmlui-font-stretch-Text-sub)",
      "line-decoration-Text-sub": "var(--xmlui-line-decoration-Text-sub)",
      "color-decoration-Text-sub": "var(--xmlui-color-decoration-Text-sub)",
      "style-decoration-Text-sub": "var(--xmlui-style-decoration-Text-sub)",
      "thickness-decoration-Text-sub": "var(--xmlui-thickness-decoration-Text-sub)",
      "offset-decoration-Text-sub": "var(--xmlui-offset-decoration-Text-sub)",
      "line-height-Text-sub": "var(--xmlui-line-height-Text-sub)",
      "color-Text-sub": "var(--xmlui-color-Text-sub)",
      "color-bg-Text-sub": "var(--xmlui-color-bg-Text-sub)",
      "border-radius-Text-sub": "var(--xmlui-border-radius-Text-sub)",
      "color-border-Text-sub": "var(--xmlui-color-border-Text-sub)",
      "thickness-border-Text-sub": "var(--xmlui-thickness-border-Text-sub)",
      "style-border-Text-sub": "var(--xmlui-style-border-Text-sub)",
      "margin-top-Text-sub": "var(--xmlui-margin-top-Text-sub)",
      "margin-bottom-Text-sub": "var(--xmlui-margin-bottom-Text-sub)",
      "padding-horizontal-Text-sub": "var(--xmlui-padding-horizontal-Text-sub)",
      "padding-vertical-Text-sub": "var(--xmlui-padding-vertical-Text-sub)",
      "transform-Text-sub": "var(--xmlui-transform-Text-sub)",
      "align-vertical-Text-sub": "var(--xmlui-align-vertical-Text-sub)",
      "letter-spacing-Text-sub": "var(--xmlui-letter-spacing-Text-sub)",
      "font-family-Text-var": "var(--xmlui-font-family-Text-var)",
      "font-size-Text-var": "var(--xmlui-font-size-Text-var)",
      "font-weight-Text-var": "var(--xmlui-font-weight-Text-var)",
      "font-style-Text-var": "var(--xmlui-font-style-Text-var)",
      "font-stretch-Text-var": "var(--xmlui-font-stretch-Text-var)",
      "line-decoration-Text-var": "var(--xmlui-line-decoration-Text-var)",
      "color-decoration-Text-var": "var(--xmlui-color-decoration-Text-var)",
      "style-decoration-Text-var": "var(--xmlui-style-decoration-Text-var)",
      "thickness-decoration-Text-var": "var(--xmlui-thickness-decoration-Text-var)",
      "offset-decoration-Text-var": "var(--xmlui-offset-decoration-Text-var)",
      "line-height-Text-var": "var(--xmlui-line-height-Text-var)",
      "color-Text-var": "var(--xmlui-color-Text-var)",
      "color-bg-Text-var": "var(--xmlui-color-bg-Text-var)",
      "border-radius-Text-var": "var(--xmlui-border-radius-Text-var)",
      "color-border-Text-var": "var(--xmlui-color-border-Text-var)",
      "thickness-border-Text-var": "var(--xmlui-thickness-border-Text-var)",
      "style-border-Text-var": "var(--xmlui-style-border-Text-var)",
      "margin-top-Text-var": "var(--xmlui-margin-top-Text-var)",
      "margin-bottom-Text-var": "var(--xmlui-margin-bottom-Text-var)",
      "padding-horizontal-Text-var": "var(--xmlui-padding-horizontal-Text-var)",
      "padding-vertical-Text-var": "var(--xmlui-padding-vertical-Text-var)",
      "transform-Text-var": "var(--xmlui-transform-Text-var)",
      "align-vertical-Text-var": "var(--xmlui-align-vertical-Text-var)",
      "letter-spacing-Text-var": "var(--xmlui-letter-spacing-Text-var)",
      "font-family-Text-title": "var(--xmlui-font-family-Text-title)",
      "font-size-Text-title": "var(--xmlui-font-size-Text-title)",
      "font-weight-Text-title": "var(--xmlui-font-weight-Text-title)",
      "font-style-Text-title": "var(--xmlui-font-style-Text-title)",
      "font-stretch-Text-title": "var(--xmlui-font-stretch-Text-title)",
      "line-decoration-Text-title": "var(--xmlui-line-decoration-Text-title)",
      "color-decoration-Text-title": "var(--xmlui-color-decoration-Text-title)",
      "style-decoration-Text-title": "var(--xmlui-style-decoration-Text-title)",
      "thickness-decoration-Text-title": "var(--xmlui-thickness-decoration-Text-title)",
      "offset-decoration-Text-title": "var(--xmlui-offset-decoration-Text-title)",
      "line-height-Text-title": "var(--xmlui-line-height-Text-title)",
      "color-Text-title": "var(--xmlui-color-Text-title)",
      "color-bg-Text-title": "var(--xmlui-color-bg-Text-title)",
      "border-radius-Text-title": "var(--xmlui-border-radius-Text-title)",
      "color-border-Text-title": "var(--xmlui-color-border-Text-title)",
      "thickness-border-Text-title": "var(--xmlui-thickness-border-Text-title)",
      "style-border-Text-title": "var(--xmlui-style-border-Text-title)",
      "margin-top-Text-title": "var(--xmlui-margin-top-Text-title)",
      "margin-bottom-Text-title": "var(--xmlui-margin-bottom-Text-title)",
      "padding-horizontal-Text-title": "var(--xmlui-padding-horizontal-Text-title)",
      "padding-vertical-Text-title": "var(--xmlui-padding-vertical-Text-title)",
      "transform-Text-title": "var(--xmlui-transform-Text-title)",
      "align-vertical-Text-title": "var(--xmlui-align-vertical-Text-title)",
      "letter-spacing-Text-title": "var(--xmlui-letter-spacing-Text-title)",
      "font-family-Text-subtitle": "var(--xmlui-font-family-Text-subtitle)",
      "font-size-Text-subtitle": "var(--xmlui-font-size-Text-subtitle)",
      "font-weight-Text-subtitle": "var(--xmlui-font-weight-Text-subtitle)",
      "font-style-Text-subtitle": "var(--xmlui-font-style-Text-subtitle)",
      "font-stretch-Text-subtitle": "var(--xmlui-font-stretch-Text-subtitle)",
      "line-decoration-Text-subtitle": "var(--xmlui-line-decoration-Text-subtitle)",
      "color-decoration-Text-subtitle": "var(--xmlui-color-decoration-Text-subtitle)",
      "style-decoration-Text-subtitle": "var(--xmlui-style-decoration-Text-subtitle)",
      "thickness-decoration-Text-subtitle": "var(--xmlui-thickness-decoration-Text-subtitle)",
      "offset-decoration-Text-subtitle": "var(--xmlui-offset-decoration-Text-subtitle)",
      "line-height-Text-subtitle": "var(--xmlui-line-height-Text-subtitle)",
      "color-Text-subtitle": "var(--xmlui-color-Text-subtitle)",
      "color-bg-Text-subtitle": "var(--xmlui-color-bg-Text-subtitle)",
      "border-radius-Text-subtitle": "var(--xmlui-border-radius-Text-subtitle)",
      "color-border-Text-subtitle": "var(--xmlui-color-border-Text-subtitle)",
      "thickness-border-Text-subtitle": "var(--xmlui-thickness-border-Text-subtitle)",
      "style-border-Text-subtitle": "var(--xmlui-style-border-Text-subtitle)",
      "margin-top-Text-subtitle": "var(--xmlui-margin-top-Text-subtitle)",
      "margin-bottom-Text-subtitle": "var(--xmlui-margin-bottom-Text-subtitle)",
      "padding-horizontal-Text-subtitle": "var(--xmlui-padding-horizontal-Text-subtitle)",
      "padding-vertical-Text-subtitle": "var(--xmlui-padding-vertical-Text-subtitle)",
      "transform-Text-subtitle": "var(--xmlui-transform-Text-subtitle)",
      "align-vertical-Text-subtitle": "var(--xmlui-align-vertical-Text-subtitle)",
      "letter-spacing-Text-subtitle": "var(--xmlui-letter-spacing-Text-subtitle)",
      "font-family-Text-small": "var(--xmlui-font-family-Text-small)",
      "font-size-Text-small": "var(--xmlui-font-size-Text-small)",
      "font-weight-Text-small": "var(--xmlui-font-weight-Text-small)",
      "font-style-Text-small": "var(--xmlui-font-style-Text-small)",
      "font-stretch-Text-small": "var(--xmlui-font-stretch-Text-small)",
      "line-decoration-Text-small": "var(--xmlui-line-decoration-Text-small)",
      "color-decoration-Text-small": "var(--xmlui-color-decoration-Text-small)",
      "style-decoration-Text-small": "var(--xmlui-style-decoration-Text-small)",
      "thickness-decoration-Text-small": "var(--xmlui-thickness-decoration-Text-small)",
      "offset-decoration-Text-small": "var(--xmlui-offset-decoration-Text-small)",
      "line-height-Text-small": "var(--xmlui-line-height-Text-small)",
      "color-Text-small": "var(--xmlui-color-Text-small)",
      "color-bg-Text-small": "var(--xmlui-color-bg-Text-small)",
      "border-radius-Text-small": "var(--xmlui-border-radius-Text-small)",
      "color-border-Text-small": "var(--xmlui-color-border-Text-small)",
      "thickness-border-Text-small": "var(--xmlui-thickness-border-Text-small)",
      "style-border-Text-small": "var(--xmlui-style-border-Text-small)",
      "margin-top-Text-small": "var(--xmlui-margin-top-Text-small)",
      "margin-bottom-Text-small": "var(--xmlui-margin-bottom-Text-small)",
      "padding-horizontal-Text-small": "var(--xmlui-padding-horizontal-Text-small)",
      "padding-vertical-Text-small": "var(--xmlui-padding-vertical-Text-small)",
      "transform-Text-small": "var(--xmlui-transform-Text-small)",
      "align-vertical-Text-small": "var(--xmlui-align-vertical-Text-small)",
      "letter-spacing-Text-small": "var(--xmlui-letter-spacing-Text-small)",
      "font-family-Text-caption": "var(--xmlui-font-family-Text-caption)",
      "font-size-Text-caption": "var(--xmlui-font-size-Text-caption)",
      "font-weight-Text-caption": "var(--xmlui-font-weight-Text-caption)",
      "font-style-Text-caption": "var(--xmlui-font-style-Text-caption)",
      "font-stretch-Text-caption": "var(--xmlui-font-stretch-Text-caption)",
      "line-decoration-Text-caption": "var(--xmlui-line-decoration-Text-caption)",
      "color-decoration-Text-caption": "var(--xmlui-color-decoration-Text-caption)",
      "style-decoration-Text-caption": "var(--xmlui-style-decoration-Text-caption)",
      "thickness-decoration-Text-caption": "var(--xmlui-thickness-decoration-Text-caption)",
      "offset-decoration-Text-caption": "var(--xmlui-offset-decoration-Text-caption)",
      "line-height-Text-caption": "var(--xmlui-line-height-Text-caption)",
      "color-Text-caption": "var(--xmlui-color-Text-caption)",
      "color-bg-Text-caption": "var(--xmlui-color-bg-Text-caption)",
      "border-radius-Text-caption": "var(--xmlui-border-radius-Text-caption)",
      "color-border-Text-caption": "var(--xmlui-color-border-Text-caption)",
      "thickness-border-Text-caption": "var(--xmlui-thickness-border-Text-caption)",
      "style-border-Text-caption": "var(--xmlui-style-border-Text-caption)",
      "margin-top-Text-caption": "var(--xmlui-margin-top-Text-caption)",
      "margin-bottom-Text-caption": "var(--xmlui-margin-bottom-Text-caption)",
      "padding-horizontal-Text-caption": "var(--xmlui-padding-horizontal-Text-caption)",
      "padding-vertical-Text-caption": "var(--xmlui-padding-vertical-Text-caption)",
      "transform-Text-caption": "var(--xmlui-transform-Text-caption)",
      "align-vertical-Text-caption": "var(--xmlui-align-vertical-Text-caption)",
      "letter-spacing-Text-caption": "var(--xmlui-letter-spacing-Text-caption)",
      "font-family-Text-placeholder": "var(--xmlui-font-family-Text-placeholder)",
      "font-size-Text-placeholder": "var(--xmlui-font-size-Text-placeholder)",
      "font-weight-Text-placeholder": "var(--xmlui-font-weight-Text-placeholder)",
      "font-style-Text-placeholder": "var(--xmlui-font-style-Text-placeholder)",
      "font-stretch-Text-placeholder": "var(--xmlui-font-stretch-Text-placeholder)",
      "line-decoration-Text-placeholder": "var(--xmlui-line-decoration-Text-placeholder)",
      "color-decoration-Text-placeholder": "var(--xmlui-color-decoration-Text-placeholder)",
      "style-decoration-Text-placeholder": "var(--xmlui-style-decoration-Text-placeholder)",
      "thickness-decoration-Text-placeholder": "var(--xmlui-thickness-decoration-Text-placeholder)",
      "offset-decoration-Text-placeholder": "var(--xmlui-offset-decoration-Text-placeholder)",
      "line-height-Text-placeholder": "var(--xmlui-line-height-Text-placeholder)",
      "color-Text-placeholder": "var(--xmlui-color-Text-placeholder)",
      "color-bg-Text-placeholder": "var(--xmlui-color-bg-Text-placeholder)",
      "border-radius-Text-placeholder": "var(--xmlui-border-radius-Text-placeholder)",
      "color-border-Text-placeholder": "var(--xmlui-color-border-Text-placeholder)",
      "thickness-border-Text-placeholder": "var(--xmlui-thickness-border-Text-placeholder)",
      "style-border-Text-placeholder": "var(--xmlui-style-border-Text-placeholder)",
      "margin-top-Text-placeholder": "var(--xmlui-margin-top-Text-placeholder)",
      "margin-bottom-Text-placeholder": "var(--xmlui-margin-bottom-Text-placeholder)",
      "padding-horizontal-Text-placeholder": "var(--xmlui-padding-horizontal-Text-placeholder)",
      "padding-vertical-Text-placeholder": "var(--xmlui-padding-vertical-Text-placeholder)",
      "transform-Text-placeholder": "var(--xmlui-transform-Text-placeholder)",
      "align-vertical-Text-placeholder": "var(--xmlui-align-vertical-Text-placeholder)",
      "letter-spacing-Text-placeholder": "var(--xmlui-letter-spacing-Text-placeholder)",
      "font-family-Text-paragraph": "var(--xmlui-font-family-Text-paragraph)",
      "font-size-Text-paragraph": "var(--xmlui-font-size-Text-paragraph)",
      "font-weight-Text-paragraph": "var(--xmlui-font-weight-Text-paragraph)",
      "font-style-Text-paragraph": "var(--xmlui-font-style-Text-paragraph)",
      "font-stretch-Text-paragraph": "var(--xmlui-font-stretch-Text-paragraph)",
      "line-decoration-Text-paragraph": "var(--xmlui-line-decoration-Text-paragraph)",
      "color-decoration-Text-paragraph": "var(--xmlui-color-decoration-Text-paragraph)",
      "style-decoration-Text-paragraph": "var(--xmlui-style-decoration-Text-paragraph)",
      "thickness-decoration-Text-paragraph": "var(--xmlui-thickness-decoration-Text-paragraph)",
      "offset-decoration-Text-paragraph": "var(--xmlui-offset-decoration-Text-paragraph)",
      "line-height-Text-paragraph": "var(--xmlui-line-height-Text-paragraph)",
      "color-Text-paragraph": "var(--xmlui-color-Text-paragraph)",
      "color-bg-Text-paragraph": "var(--xmlui-color-bg-Text-paragraph)",
      "border-radius-Text-paragraph": "var(--xmlui-border-radius-Text-paragraph)",
      "color-border-Text-paragraph": "var(--xmlui-color-border-Text-paragraph)",
      "thickness-border-Text-paragraph": "var(--xmlui-thickness-border-Text-paragraph)",
      "style-border-Text-paragraph": "var(--xmlui-style-border-Text-paragraph)",
      "margin-top-Text-paragraph": "var(--xmlui-margin-top-Text-paragraph)",
      "margin-bottom-Text-paragraph": "var(--xmlui-margin-bottom-Text-paragraph)",
      "padding-horizontal-Text-paragraph": "var(--xmlui-padding-horizontal-Text-paragraph)",
      "padding-vertical-Text-paragraph": "var(--xmlui-padding-vertical-Text-paragraph)",
      "transform-Text-paragraph": "var(--xmlui-transform-Text-paragraph)",
      "align-vertical-Text-paragraph": "var(--xmlui-align-vertical-Text-paragraph)",
      "letter-spacing-Text-paragraph": "var(--xmlui-letter-spacing-Text-paragraph)",
      "font-family-Text-subheading": "var(--xmlui-font-family-Text-subheading)",
      "font-size-Text-subheading": "var(--xmlui-font-size-Text-subheading)",
      "font-weight-Text-subheading": "var(--xmlui-font-weight-Text-subheading)",
      "font-style-Text-subheading": "var(--xmlui-font-style-Text-subheading)",
      "font-stretch-Text-subheading": "var(--xmlui-font-stretch-Text-subheading)",
      "line-decoration-Text-subheading": "var(--xmlui-line-decoration-Text-subheading)",
      "color-decoration-Text-subheading": "var(--xmlui-color-decoration-Text-subheading)",
      "style-decoration-Text-subheading": "var(--xmlui-style-decoration-Text-subheading)",
      "thickness-decoration-Text-subheading": "var(--xmlui-thickness-decoration-Text-subheading)",
      "offset-decoration-Text-subheading": "var(--xmlui-offset-decoration-Text-subheading)",
      "line-height-Text-subheading": "var(--xmlui-line-height-Text-subheading)",
      "color-Text-subheading": "var(--xmlui-color-Text-subheading)",
      "color-bg-Text-subheading": "var(--xmlui-color-bg-Text-subheading)",
      "border-radius-Text-subheading": "var(--xmlui-border-radius-Text-subheading)",
      "color-border-Text-subheading": "var(--xmlui-color-border-Text-subheading)",
      "thickness-border-Text-subheading": "var(--xmlui-thickness-border-Text-subheading)",
      "style-border-Text-subheading": "var(--xmlui-style-border-Text-subheading)",
      "margin-top-Text-subheading": "var(--xmlui-margin-top-Text-subheading)",
      "margin-bottom-Text-subheading": "var(--xmlui-margin-bottom-Text-subheading)",
      "padding-horizontal-Text-subheading": "var(--xmlui-padding-horizontal-Text-subheading)",
      "padding-vertical-Text-subheading": "var(--xmlui-padding-vertical-Text-subheading)",
      "transform-Text-subheading": "var(--xmlui-transform-Text-subheading)",
      "align-vertical-Text-subheading": "var(--xmlui-align-vertical-Text-subheading)",
      "letter-spacing-Text-subheading": "var(--xmlui-letter-spacing-Text-subheading)",
      "font-family-Text-tableheading": "var(--xmlui-font-family-Text-tableheading)",
      "font-size-Text-tableheading": "var(--xmlui-font-size-Text-tableheading)",
      "font-weight-Text-tableheading": "var(--xmlui-font-weight-Text-tableheading)",
      "font-style-Text-tableheading": "var(--xmlui-font-style-Text-tableheading)",
      "font-stretch-Text-tableheading": "var(--xmlui-font-stretch-Text-tableheading)",
      "line-decoration-Text-tableheading": "var(--xmlui-line-decoration-Text-tableheading)",
      "color-decoration-Text-tableheading": "var(--xmlui-color-decoration-Text-tableheading)",
      "style-decoration-Text-tableheading": "var(--xmlui-style-decoration-Text-tableheading)",
      "thickness-decoration-Text-tableheading":
        "var(--xmlui-thickness-decoration-Text-tableheading)",
      "offset-decoration-Text-tableheading": "var(--xmlui-offset-decoration-Text-tableheading)",
      "line-height-Text-tableheading": "var(--xmlui-line-height-Text-tableheading)",
      "color-Text-tableheading": "var(--xmlui-color-Text-tableheading)",
      "color-bg-Text-tableheading": "var(--xmlui-color-bg-Text-tableheading)",
      "border-radius-Text-tableheading": "var(--xmlui-border-radius-Text-tableheading)",
      "color-border-Text-tableheading": "var(--xmlui-color-border-Text-tableheading)",
      "thickness-border-Text-tableheading": "var(--xmlui-thickness-border-Text-tableheading)",
      "style-border-Text-tableheading": "var(--xmlui-style-border-Text-tableheading)",
      "margin-top-Text-tableheading": "var(--xmlui-margin-top-Text-tableheading)",
      "margin-bottom-Text-tableheading": "var(--xmlui-margin-bottom-Text-tableheading)",
      "padding-horizontal-Text-tableheading": "var(--xmlui-padding-horizontal-Text-tableheading)",
      "padding-vertical-Text-tableheading": "var(--xmlui-padding-vertical-Text-tableheading)",
      "transform-Text-tableheading": "var(--xmlui-transform-Text-tableheading)",
      "align-vertical-Text-tableheading": "var(--xmlui-align-vertical-Text-tableheading)",
      "letter-spacing-Text-tableheading": "var(--xmlui-letter-spacing-Text-tableheading)",
      "font-family-Text-secondary": "var(--xmlui-font-family-Text-secondary)",
      "font-size-Text-secondary": "var(--xmlui-font-size-Text-secondary)",
      "font-weight-Text-secondary": "var(--xmlui-font-weight-Text-secondary)",
      "font-style-Text-secondary": "var(--xmlui-font-style-Text-secondary)",
      "font-stretch-Text-secondary": "var(--xmlui-font-stretch-Text-secondary)",
      "line-decoration-Text-secondary": "var(--xmlui-line-decoration-Text-secondary)",
      "color-decoration-Text-secondary": "var(--xmlui-color-decoration-Text-secondary)",
      "style-decoration-Text-secondary": "var(--xmlui-style-decoration-Text-secondary)",
      "thickness-decoration-Text-secondary": "var(--xmlui-thickness-decoration-Text-secondary)",
      "offset-decoration-Text-secondary": "var(--xmlui-offset-decoration-Text-secondary)",
      "line-height-Text-secondary": "var(--xmlui-line-height-Text-secondary)",
      "color-Text-secondary": "var(--xmlui-color-Text-secondary)",
      "color-bg-Text-secondary": "var(--xmlui-color-bg-Text-secondary)",
      "border-radius-Text-secondary": "var(--xmlui-border-radius-Text-secondary)",
      "color-border-Text-secondary": "var(--xmlui-color-border-Text-secondary)",
      "thickness-border-Text-secondary": "var(--xmlui-thickness-border-Text-secondary)",
      "style-border-Text-secondary": "var(--xmlui-style-border-Text-secondary)",
      "margin-top-Text-secondary": "var(--xmlui-margin-top-Text-secondary)",
      "margin-bottom-Text-secondary": "var(--xmlui-margin-bottom-Text-secondary)",
      "padding-horizontal-Text-secondary": "var(--xmlui-padding-horizontal-Text-secondary)",
      "padding-vertical-Text-secondary": "var(--xmlui-padding-vertical-Text-secondary)",
      "transform-Text-secondary": "var(--xmlui-transform-Text-secondary)",
      "align-vertical-Text-secondary": "var(--xmlui-align-vertical-Text-secondary)",
      "letter-spacing-Text-secondary": "var(--xmlui-letter-spacing-Text-secondary)",
    },
    defaultThemeVars: {
      "border-radius-Text": "$radius",
      "style-border-Text": "solid",
      "font-size-Text": "$font-size-small",
      "thickness-border-Text": "$space-0",
      "font-weight-Text-abbr": "$font-weight-bold",
      "transform-Text-abbr": "uppercase",
      "font-size-Text-secondary": "$font-size-small",
      "font-style-Text-cite": "italic",
      "color-Text": "$color-text-primary",
      "font-family-Text": "$font-family",
      "font-weight-Text": "$font-weight-normal",
      "font-family-Text-code": "$font-family-monospace",
      "font-size-Text-code": "$font-size-small",
      "thickness-border-Text-code": "1px",
      "padding-horizontal-Text-code": "$space-1",
      "line-decoration-Text-deleted": "line-through",
      "line-decoration-Text-inserted": "underline",
      "font-family-Text-keyboard": "$font-family-monospace",
      "font-size-Text-keyboard": "$font-size-small",
      "font-weight-Text-keyboard": "$font-weight-bold",
      "thickness-border-Text-keyboard": "1px",
      "padding-horizontal-Text-keyboard": "$space-1",
      "font-family-Text-sample": "$font-family-monospace",
      "font-size-Text-sample": "$font-size-small",
      "font-size-Text-sup": "$font-size-smaller",
      "align-vertical-Text-sup": "super",
      "font-size-Text-sub": "$font-size-smaller",
      "align-vertical-Text-sub": "sub",
      "font-style-Text-var": "italic",
      "font-family-Text-mono": "$font-family-monospace",
      "font-size-Text-title": "$font-size-large",
      "font-size-Text-subtitle": "$font-size-medium",
      "font-size-Text-small": "$font-size-small",
      "line-height-Text-small": "$line-height-tight",
      "letter-spacing-Text-caption": "0.05rem",
      "font-size-Text-placeholder": "$font-size-small",
      "font-family-Text-codefence": "$font-family-monospace",
      "padding-horizontal-Text-codefence": "$space-3",
      "padding-vertical-Text-codefence": "$space-2",
      "padding-vertical-Text-paragraph": "$space-1",
      "font-size-Text-subheading": "$font-size-H6",
      "font-weight-Text-subheading": "$font-weight-bold",
      "letter-spacing-Text-subheading": "0.04em",
      "transform-Text-subheading": "uppercase",
      "margin-top-Text-tableheading": "$space-1",
      "margin-bottom-Text-tableheading": "$space-4",
      "padding-horizontal-Text-tableheading": "$space-1",
      "font-weight-Text-tableheading": "$font-weight-bold",
      light: {
        "color-bg-Text-code": "$color-surface-100",
        "color-border-Text-code": "$color-surface-200",
        "color-bg-Text-keyboard": "$color-surface-200",
        "color-border-Text-keyboard": "$color-surface-300",
        "color-bg-Text-marked": "yellow",
        "color-Text-placeholder": "$color-surface-500",
        "color-bg-Text-codefence": "$color-primary-100",
        "color-Text-codefence": "$color-surface-900",
        "color-Text-subheading": "$color-text-secondary",
        "color-Text-secondary": "$color-text-secondary",
      },
      dark: {
        "color-bg-Text-code": "$color-surface-800",
        "color-border-Text-code": "$color-surface-700",
        "color-bg-Text-keyboard": "$color-surface-800",
        "color-border-Text-keyboard": "$color-surface-700",
        "color-bg-Text-marked": "orange",
        "color-Text-placeholder": "$color-surface-500",
        "color-bg-Text-codefence": "$color-primary-800",
        "color-Text-codefence": "$color-surface-200",
        "color-Text-subheading": "$color-text-secondary",
        "color-Text-secondary": "$color-text-secondary",
      },
    },
  },
  TextArea: {
    description: "`TextArea` is a component that provides a multiline text input area.",
    status: "experimental",
    props: {
      enterSubmits: {
        description:
          "This optional boolean property indicates whether pressing the `Enter` key on the keyboard prompts the parent `Form` component to submit. The default value is is `true`.",
        descriptionRef: "TextArea/TextArea.mdx?enterSubmits",
      },
      escResets: {
        description:
          "This boolean property indicates whether the TextArea contents should be reset when pressing the ESC key.",
        descriptionRef: "TextArea/TextArea.mdx?escResets",
      },
      maxRows: {
        description:
          "This optional number property maximizes the number of lines the `TextArea` can grow to.",
        descriptionRef: "TextArea/TextArea.mdx?maxRows",
      },
      minRows: {
        description:
          "This optional number property indicates the minimum number of lines the `TextArea` has and specifies its size accordingly.",
        descriptionRef: "TextArea/TextArea.mdx?minRows",
      },
      rows: {
        description:
          "Specifies the number of lines or rows (and thus, its size) the component has.",
        descriptionRef: "TextArea/TextArea.mdx?rows",
      },
      autoSize: {
        description:
          "If set to `true`, this boolean property enables the `TextArea` to resize automatically based on the number of lines inside it.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "TextArea/TextArea.mdx?autoSize",
      },
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "TextArea/TextArea.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "TextArea/TextArea.mdx?initialValue",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "TextArea/TextArea.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "TextArea/TextArea.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `TextArea`.",
        descriptionRef: "TextArea/TextArea.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `TextArea` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "TextArea/TextArea.mdx?labelBreak",
      },
      maxLength: {
        description: "This property sets the maximum length of the input it accepts.",
        descriptionRef: "TextArea/TextArea.mdx?maxLength",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "TextArea/TextArea.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "TextArea/TextArea.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "TextArea/TextArea.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "TextArea/TextArea.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "TextArea/TextArea.mdx?validationStatus",
      },
      resize: {
        description:
          "This optional property specifies in which dimensions can the `TextArea` be resized by the user.",
        availableValues: [
          {
            value: "undefined",
            description: "No resizing",
          },
          {
            value: "horizontal",
            description: "Can only resize horizontally",
          },
          {
            value: "vertical",
            description: "Can only resize vertically",
          },
          {
            value: "both",
            description: "Can resize in both dimensions",
          },
        ],
        descriptionRef: "TextArea/TextArea.mdx?resize",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the TextArea has received the focus.",
        descriptionRef: "TextArea/TextArea.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the TextArea has lost the focus.",
        descriptionRef: "TextArea/TextArea.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of TextArea has changed.",
        descriptionRef: "TextArea/TextArea.mdx?didChange",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the TextArea.",
        descriptionRef: "TextArea/TextArea.mdx?focus",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "TextArea/TextArea.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "TextArea/TextArea.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-Textarea-default": "var(--xmlui-radius-Textarea-default)",
      "Input:color-border-Textarea-default": "var(--xmlui-color-border-Textarea-default)",
      "Input:thickness-border-Textarea-default": "var(--xmlui-thickness-border-Textarea-default)",
      "Input:style-border-Textarea-default": "var(--xmlui-style-border-Textarea-default)",
      "Input:font-size-Textarea-default": "var(--xmlui-font-size-Textarea-default)",
      "Input:color-bg-Textarea-default": "var(--xmlui-color-bg-Textarea-default)",
      "Input:shadow-Textarea-default": "var(--xmlui-shadow-Textarea-default)",
      "Input:color-text-Textarea-default": "var(--xmlui-color-text-Textarea-default)",
      "Input:color-border-Textarea-default--hover":
        "var(--xmlui-color-border-Textarea-default--hover)",
      "Input:color-bg-Textarea-default--hover": "var(--xmlui-color-bg-Textarea-default--hover)",
      "Input:shadow-Textarea-default--hover": "var(--xmlui-shadow-Textarea-default--hover)",
      "Input:color-text-Textarea-default--hover": "var(--xmlui-color-text-Textarea-default--hover)",
      "Input:color-border-Textarea-default--focus":
        "var(--xmlui-color-border-Textarea-default--focus)",
      "Input:color-bg-Textarea-default--focus": "var(--xmlui-color-bg-Textarea-default--focus)",
      "Input:shadow-Textarea-default--focus": "var(--xmlui-shadow-Textarea-default--focus)",
      "Input:color-text-Textarea-default--focus": "var(--xmlui-color-text-Textarea-default--focus)",
      "Input:thickness-outline-Textarea-default--focus":
        "var(--xmlui-thickness-outline-Textarea-default--focus)",
      "Input:color-outline-Textarea-default--focus":
        "var(--xmlui-color-outline-Textarea-default--focus)",
      "Input:style-outline-Textarea-default--focus":
        "var(--xmlui-style-outline-Textarea-default--focus)",
      "Input:offset-outline-Textarea-default--focus":
        "var(--xmlui-offset-outline-Textarea-default--focus)",
      "Input:color-placeholder-Textarea-default": "var(--xmlui-color-placeholder-Textarea-default)",
      "Input:radius-Textarea-error": "var(--xmlui-radius-Textarea-error)",
      "Input:color-border-Textarea-error": "var(--xmlui-color-border-Textarea-error)",
      "Input:thickness-border-Textarea-error": "var(--xmlui-thickness-border-Textarea-error)",
      "Input:style-border-Textarea-error": "var(--xmlui-style-border-Textarea-error)",
      "Input:font-size-Textarea-error": "var(--xmlui-font-size-Textarea-error)",
      "Input:color-bg-Textarea-error": "var(--xmlui-color-bg-Textarea-error)",
      "Input:shadow-Textarea-error": "var(--xmlui-shadow-Textarea-error)",
      "Input:color-text-Textarea-error": "var(--xmlui-color-text-Textarea-error)",
      "Input:color-border-Textarea-error--hover": "var(--xmlui-color-border-Textarea-error--hover)",
      "Input:color-bg-Textarea-error--hover": "var(--xmlui-color-bg-Textarea-error--hover)",
      "Input:shadow-Textarea-error--hover": "var(--xmlui-shadow-Textarea-error--hover)",
      "Input:color-text-Textarea-error--hover": "var(--xmlui-color-text-Textarea-error--hover)",
      "Input:color-border-Textarea-error--focus": "var(--xmlui-color-border-Textarea-error--focus)",
      "Input:color-bg-Textarea-error--focus": "var(--xmlui-color-bg-Textarea-error--focus)",
      "Input:shadow-Textarea-error--focus": "var(--xmlui-shadow-Textarea-error--focus)",
      "Input:color-text-Textarea-error--focus": "var(--xmlui-color-text-Textarea-error--focus)",
      "Input:thickness-outline-Textarea-error--focus":
        "var(--xmlui-thickness-outline-Textarea-error--focus)",
      "Input:color-outline-Textarea-error--focus":
        "var(--xmlui-color-outline-Textarea-error--focus)",
      "Input:style-outline-Textarea-error--focus":
        "var(--xmlui-style-outline-Textarea-error--focus)",
      "Input:offset-outline-Textarea-error--focus":
        "var(--xmlui-offset-outline-Textarea-error--focus)",
      "Input:color-placeholder-Textarea-error": "var(--xmlui-color-placeholder-Textarea-error)",
      "Input:radius-Textarea-warning": "var(--xmlui-radius-Textarea-warning)",
      "Input:color-border-Textarea-warning": "var(--xmlui-color-border-Textarea-warning)",
      "Input:thickness-border-Textarea-warning": "var(--xmlui-thickness-border-Textarea-warning)",
      "Input:style-border-Textarea-warning": "var(--xmlui-style-border-Textarea-warning)",
      "Input:font-size-Textarea-warning": "var(--xmlui-font-size-Textarea-warning)",
      "Input:color-bg-Textarea-warning": "var(--xmlui-color-bg-Textarea-warning)",
      "Input:shadow-Textarea-warning": "var(--xmlui-shadow-Textarea-warning)",
      "Input:color-text-Textarea-warning": "var(--xmlui-color-text-Textarea-warning)",
      "Input:color-border-Textarea-warning--hover":
        "var(--xmlui-color-border-Textarea-warning--hover)",
      "Input:color-bg-Textarea-warning--hover": "var(--xmlui-color-bg-Textarea-warning--hover)",
      "Input:shadow-Textarea-warning--hover": "var(--xmlui-shadow-Textarea-warning--hover)",
      "Input:color-text-Textarea-warning--hover": "var(--xmlui-color-text-Textarea-warning--hover)",
      "Input:color-border-Textarea-warning--focus":
        "var(--xmlui-color-border-Textarea-warning--focus)",
      "Input:color-bg-Textarea-warning--focus": "var(--xmlui-color-bg-Textarea-warning--focus)",
      "Input:shadow-Textarea-warning--focus": "var(--xmlui-shadow-Textarea-warning--focus)",
      "Input:color-text-Textarea-warning--focus": "var(--xmlui-color-text-Textarea-warning--focus)",
      "Input:thickness-outline-Textarea-warning--focus":
        "var(--xmlui-thickness-outline-Textarea-warning--focus)",
      "Input:color-outline-Textarea-warning--focus":
        "var(--xmlui-color-outline-Textarea-warning--focus)",
      "Input:style-outline-Textarea-warning--focus":
        "var(--xmlui-style-outline-Textarea-warning--focus)",
      "Input:offset-outline-Textarea-warning--focus":
        "var(--xmlui-offset-outline-Textarea-warning--focus)",
      "Input:color-placeholder-Textarea-warning": "var(--xmlui-color-placeholder-Textarea-warning)",
      "Input:radius-Textarea-success": "var(--xmlui-radius-Textarea-success)",
      "Input:color-border-Textarea-success": "var(--xmlui-color-border-Textarea-success)",
      "Input:thickness-border-Textarea-success": "var(--xmlui-thickness-border-Textarea-success)",
      "Input:style-border-Textarea-success": "var(--xmlui-style-border-Textarea-success)",
      "Input:font-size-Textarea-success": "var(--xmlui-font-size-Textarea-success)",
      "Input:color-bg-Textarea-success": "var(--xmlui-color-bg-Textarea-success)",
      "Input:shadow-Textarea-success": "var(--xmlui-shadow-Textarea-success)",
      "Input:color-text-Textarea-success": "var(--xmlui-color-text-Textarea-success)",
      "Input:color-border-Textarea-success--hover":
        "var(--xmlui-color-border-Textarea-success--hover)",
      "Input:color-bg-Textarea-success--hover": "var(--xmlui-color-bg-Textarea-success--hover)",
      "Input:shadow-Textarea-success--hover": "var(--xmlui-shadow-Textarea-success--hover)",
      "Input:color-text-Textarea-success--hover": "var(--xmlui-color-text-Textarea-success--hover)",
      "Input:color-border-Textarea-success--focus":
        "var(--xmlui-color-border-Textarea-success--focus)",
      "Input:color-bg-Textarea-success--focus": "var(--xmlui-color-bg-Textarea-success--focus)",
      "Input:shadow-Textarea-success--focus": "var(--xmlui-shadow-Textarea-success--focus)",
      "Input:color-text-Textarea-success--focus": "var(--xmlui-color-text-Textarea-success--focus)",
      "Input:thickness-outline-Textarea-success--focus":
        "var(--xmlui-thickness-outline-Textarea-success--focus)",
      "Input:color-outline-Textarea-success--focus":
        "var(--xmlui-color-outline-Textarea-success--focus)",
      "Input:style-outline-Textarea-success--focus":
        "var(--xmlui-style-outline-Textarea-success--focus)",
      "Input:offset-outline-Textarea-success--focus":
        "var(--xmlui-offset-outline-Textarea-success--focus)",
      "Input:color-placeholder-Textarea-success": "var(--xmlui-color-placeholder-Textarea-success)",
      "Input:color-bg-Textarea--disabled": "var(--xmlui-color-bg-Textarea--disabled)",
      "Input:color-text-Textarea--disabled": "var(--xmlui-color-text-Textarea--disabled)",
      "Input:color-border-Textarea--disabled": "var(--xmlui-color-border-Textarea--disabled)",
    },
  },
  TextBox: {
    description:
      "The `TextBox` is an input component that allows users to input and edit textual data.",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?initialValue",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "PasswordInput/PasswordInput.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `TextBox`.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `TextBox` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "PasswordInput/PasswordInput.mdx?labelBreak",
      },
      maxLength: {
        description: "This property sets the maximum length of the input it accepts.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?maxLength",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "PasswordInput/PasswordInput.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "PasswordInput/PasswordInput.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "PasswordInput/PasswordInput.mdx?validationStatus",
      },
      startText: {
        description:
          "This property sets a text to appear at the start (left side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?startText",
      },
      startIcon: {
        description:
          "This property sets an icon to appear at the start (left side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?startIcon",
      },
      endText: {
        description:
          "This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?endText",
      },
      endIcon: {
        description:
          "This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?endIcon",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the TextBox has received the focus.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the TextBox has lost the focus.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of TextBox has changed.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?didChange",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the TextBox.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?focus",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "PasswordInput/PasswordInput.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-TextBox-default": "var(--xmlui-radius-TextBox-default)",
      "Input:color-border-TextBox-default": "var(--xmlui-color-border-TextBox-default)",
      "Input:thickness-border-TextBox-default": "var(--xmlui-thickness-border-TextBox-default)",
      "Input:style-border-TextBox-default": "var(--xmlui-style-border-TextBox-default)",
      "Input:font-size-TextBox-default": "var(--xmlui-font-size-TextBox-default)",
      "Input:color-bg-TextBox-default": "var(--xmlui-color-bg-TextBox-default)",
      "Input:shadow-TextBox-default": "var(--xmlui-shadow-TextBox-default)",
      "Input:color-text-TextBox-default": "var(--xmlui-color-text-TextBox-default)",
      "Input:color-border-TextBox-default--hover":
        "var(--xmlui-color-border-TextBox-default--hover)",
      "Input:color-bg-TextBox-default--hover": "var(--xmlui-color-bg-TextBox-default--hover)",
      "Input:shadow-TextBox-default--hover": "var(--xmlui-shadow-TextBox-default--hover)",
      "Input:color-text-TextBox-default--hover": "var(--xmlui-color-text-TextBox-default--hover)",
      "Input:color-border-TextBox-default--focus":
        "var(--xmlui-color-border-TextBox-default--focus)",
      "Input:color-bg-TextBox-default--focus": "var(--xmlui-color-bg-TextBox-default--focus)",
      "Input:shadow-TextBox-default--focus": "var(--xmlui-shadow-TextBox-default--focus)",
      "Input:color-text-TextBox-default--focus": "var(--xmlui-color-text-TextBox-default--focus)",
      "Input:thickness-outline-TextBox-default--focus":
        "var(--xmlui-thickness-outline-TextBox-default--focus)",
      "Input:color-outline-TextBox-default--focus":
        "var(--xmlui-color-outline-TextBox-default--focus)",
      "Input:style-outline-TextBox-default--focus":
        "var(--xmlui-style-outline-TextBox-default--focus)",
      "Input:offset-outline-TextBox-default--focus":
        "var(--xmlui-offset-outline-TextBox-default--focus)",
      "Input:color-placeholder-TextBox-default": "var(--xmlui-color-placeholder-TextBox-default)",
      "Input:color-adornment-TextBox-default": "var(--xmlui-color-adornment-TextBox-default)",
      "Input:radius-TextBox-error": "var(--xmlui-radius-TextBox-error)",
      "Input:color-border-TextBox-error": "var(--xmlui-color-border-TextBox-error)",
      "Input:thickness-border-TextBox-error": "var(--xmlui-thickness-border-TextBox-error)",
      "Input:style-border-TextBox-error": "var(--xmlui-style-border-TextBox-error)",
      "Input:font-size-TextBox-error": "var(--xmlui-font-size-TextBox-error)",
      "Input:color-bg-TextBox-error": "var(--xmlui-color-bg-TextBox-error)",
      "Input:shadow-TextBox-error": "var(--xmlui-shadow-TextBox-error)",
      "Input:color-text-TextBox-error": "var(--xmlui-color-text-TextBox-error)",
      "Input:color-border-TextBox-error--hover": "var(--xmlui-color-border-TextBox-error--hover)",
      "Input:color-bg-TextBox-error--hover": "var(--xmlui-color-bg-TextBox-error--hover)",
      "Input:shadow-TextBox-error--hover": "var(--xmlui-shadow-TextBox-error--hover)",
      "Input:color-text-TextBox-error--hover": "var(--xmlui-color-text-TextBox-error--hover)",
      "Input:color-border-TextBox-error--focus": "var(--xmlui-color-border-TextBox-error--focus)",
      "Input:color-bg-TextBox-error--focus": "var(--xmlui-color-bg-TextBox-error--focus)",
      "Input:shadow-TextBox-error--focus": "var(--xmlui-shadow-TextBox-error--focus)",
      "Input:color-text-TextBox-error--focus": "var(--xmlui-color-text-TextBox-error--focus)",
      "Input:thickness-outline-TextBox-error--focus":
        "var(--xmlui-thickness-outline-TextBox-error--focus)",
      "Input:color-outline-TextBox-error--focus": "var(--xmlui-color-outline-TextBox-error--focus)",
      "Input:style-outline-TextBox-error--focus": "var(--xmlui-style-outline-TextBox-error--focus)",
      "Input:offset-outline-TextBox-error--focus":
        "var(--xmlui-offset-outline-TextBox-error--focus)",
      "Input:color-placeholder-TextBox-error": "var(--xmlui-color-placeholder-TextBox-error)",
      "Input:color-adornment-TextBox-error": "var(--xmlui-color-adornment-TextBox-error)",
      "Input:radius-TextBox-warning": "var(--xmlui-radius-TextBox-warning)",
      "Input:color-border-TextBox-warning": "var(--xmlui-color-border-TextBox-warning)",
      "Input:thickness-border-TextBox-warning": "var(--xmlui-thickness-border-TextBox-warning)",
      "Input:style-border-TextBox-warning": "var(--xmlui-style-border-TextBox-warning)",
      "Input:font-size-TextBox-warning": "var(--xmlui-font-size-TextBox-warning)",
      "Input:color-bg-TextBox-warning": "var(--xmlui-color-bg-TextBox-warning)",
      "Input:shadow-TextBox-warning": "var(--xmlui-shadow-TextBox-warning)",
      "Input:color-text-TextBox-warning": "var(--xmlui-color-text-TextBox-warning)",
      "Input:color-border-TextBox-warning--hover":
        "var(--xmlui-color-border-TextBox-warning--hover)",
      "Input:color-bg-TextBox-warning--hover": "var(--xmlui-color-bg-TextBox-warning--hover)",
      "Input:shadow-TextBox-warning--hover": "var(--xmlui-shadow-TextBox-warning--hover)",
      "Input:color-text-TextBox-warning--hover": "var(--xmlui-color-text-TextBox-warning--hover)",
      "Input:color-border-TextBox-warning--focus":
        "var(--xmlui-color-border-TextBox-warning--focus)",
      "Input:color-bg-TextBox-warning--focus": "var(--xmlui-color-bg-TextBox-warning--focus)",
      "Input:shadow-TextBox-warning--focus": "var(--xmlui-shadow-TextBox-warning--focus)",
      "Input:color-text-TextBox-warning--focus": "var(--xmlui-color-text-TextBox-warning--focus)",
      "Input:thickness-outline-TextBox-warning--focus":
        "var(--xmlui-thickness-outline-TextBox-warning--focus)",
      "Input:color-outline-TextBox-warning--focus":
        "var(--xmlui-color-outline-TextBox-warning--focus)",
      "Input:style-outline-TextBox-warning--focus":
        "var(--xmlui-style-outline-TextBox-warning--focus)",
      "Input:offset-outline-TextBox-warning--focus":
        "var(--xmlui-offset-outline-TextBox-warning--focus)",
      "Input:color-placeholder-TextBox-warning": "var(--xmlui-color-placeholder-TextBox-warning)",
      "Input:color-adornment-TextBox-warning": "var(--xmlui-color-adornment-TextBox-warning)",
      "Input:radius-TextBox-success": "var(--xmlui-radius-TextBox-success)",
      "Input:color-border-TextBox-success": "var(--xmlui-color-border-TextBox-success)",
      "Input:thickness-border-TextBox-success": "var(--xmlui-thickness-border-TextBox-success)",
      "Input:style-border-TextBox-success": "var(--xmlui-style-border-TextBox-success)",
      "Input:font-size-TextBox-success": "var(--xmlui-font-size-TextBox-success)",
      "Input:color-bg-TextBox-success": "var(--xmlui-color-bg-TextBox-success)",
      "Input:shadow-TextBox-success": "var(--xmlui-shadow-TextBox-success)",
      "Input:color-text-TextBox-success": "var(--xmlui-color-text-TextBox-success)",
      "Input:color-border-TextBox-success--hover":
        "var(--xmlui-color-border-TextBox-success--hover)",
      "Input:color-bg-TextBox-success--hover": "var(--xmlui-color-bg-TextBox-success--hover)",
      "Input:shadow-TextBox-success--hover": "var(--xmlui-shadow-TextBox-success--hover)",
      "Input:color-text-TextBox-success--hover": "var(--xmlui-color-text-TextBox-success--hover)",
      "Input:color-border-TextBox-success--focus":
        "var(--xmlui-color-border-TextBox-success--focus)",
      "Input:color-bg-TextBox-success--focus": "var(--xmlui-color-bg-TextBox-success--focus)",
      "Input:shadow-TextBox-success--focus": "var(--xmlui-shadow-TextBox-success--focus)",
      "Input:color-text-TextBox-success--focus": "var(--xmlui-color-text-TextBox-success--focus)",
      "Input:thickness-outline-TextBox-success--focus":
        "var(--xmlui-thickness-outline-TextBox-success--focus)",
      "Input:color-outline-TextBox-success--focus":
        "var(--xmlui-color-outline-TextBox-success--focus)",
      "Input:style-outline-TextBox-success--focus":
        "var(--xmlui-style-outline-TextBox-success--focus)",
      "Input:offset-outline-TextBox-success--focus":
        "var(--xmlui-offset-outline-TextBox-success--focus)",
      "Input:color-placeholder-TextBox-success": "var(--xmlui-color-placeholder-TextBox-success)",
      "Input:color-adornment-TextBox-success": "var(--xmlui-color-adornment-TextBox-success)",
      "Input:color-bg-TextBox--disabled": "var(--xmlui-color-bg-TextBox--disabled)",
      "Input:color-text-TextBox--disabled": "var(--xmlui-color-text-TextBox--disabled)",
      "Input:color-border-TextBox--disabled": "var(--xmlui-color-border-TextBox--disabled)",
    },
    defaultThemeVars: {
      "radius-Input": "$radius",
      "color-text-Input": "$color-text-primary",
      "color-bg-Input--disabled": "$color-bg--disabled",
      "thickness-border-Input": "1px",
      "min-height-Input": "39px",
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
      light: {},
      dark: {},
    },
  },
  PasswordInput: {
    description:
      "The `Password` component is a specialized version of the `TextBox` component that allows users to input and edit passwords.",
    status: "experimental",
    props: {
      placeholder: {
        description: "A placeholder text that is visible in the input field when its empty.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?placeholder",
      },
      initialValue: {
        description: "This property sets the component's initial value.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?initialValue",
      },
      label: {
        description: "This property sets the label of the component.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?label",
      },
      labelPosition: {
        description: "Places the label at the given position of the component.",
        availableValues: [
          {
            value: "left",
            description:
              "The left side of the input (left-to-right) or the right side of the input (right-to-left)",
          },
          {
            value: "right",
            description:
              "The right side of the input (left-to-right) or the left side of the input (right-to-left)",
          },
          {
            value: "top",
            description: "The top of the input",
          },
          {
            value: "bottom",
            description: "The bottom of the input",
          },
        ],
        defaultValue: "top",
        descriptionRef: "PasswordInput/PasswordInput.mdx?labelPosition",
      },
      labelWidth: {
        description: "This property sets the width of the `TextBox`.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?labelWidth",
      },
      labelBreak: {
        description:
          "This boolean value indicates if the `TextBox` labels can be split into multiple lines if it would overflow the available label width.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "PasswordInput/PasswordInput.mdx?labelBreak",
      },
      maxLength: {
        description: "This property sets the maximum length of the input it accepts.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?maxLength",
      },
      autoFocus: {
        description:
          "If this property is set to `true`, the component gets the focus automatically when displayed.",
        valueType: "boolean",
        defaultValue: false,
        descriptionRef: "PasswordInput/PasswordInput.mdx?autoFocus",
      },
      required: {
        description:
          "Set this property to `true` to indicate it must have a value before submitting the containing form.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?required",
      },
      readOnly: {
        description: "Set this property to `true` to disallow changing the component value.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?readOnly",
      },
      enabled: {
        description:
          "This boolean property value indicates whether the component responds to user events (`true`) or not (`false`).",
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "PasswordInput/PasswordInput.mdx?enabled",
      },
      validationStatus: {
        description:
          "This property allows you to set the validation status of the input component.",
        availableValues: [
          {
            value: "valid",
            description: "Visual indicator for an input that is accepted",
          },
          {
            value: "warning",
            description: "Visual indicator for an input that produced a warning",
          },
          {
            value: "error",
            description: "Visual indicator for an input that produced an error",
          },
        ],
        descriptionRef: "PasswordInput/PasswordInput.mdx?validationStatus",
      },
      startText: {
        description:
          "This property sets a text to appear at the start (left side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?startText",
      },
      startIcon: {
        description:
          "This property sets an icon to appear at the start (left side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?startIcon",
      },
      endText: {
        description:
          "This property sets a text to appear on the end (right side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?endText",
      },
      endIcon: {
        description:
          "This property sets an icon to appear on the end (right side when the left-to-right direction is set) of the input.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?endIcon",
      },
    },
    events: {
      gotFocus: {
        description: "This event is triggered when the TextBox has received the focus.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?gotFocus",
      },
      lostFocus: {
        description: "This event is triggered when the TextBox has lost the focus.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?lostFocus",
      },
      didChange: {
        description: "This event is triggered when value of TextBox has changed.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?didChange",
      },
    },
    apis: {
      focus: {
        description: "This method sets the focus on the TextBox.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?focus",
      },
      value: {
        description:
          "You can query the component's value. If no value is set, it will retrieve `undefined`.",
        descriptionRef: "PasswordInput/PasswordInput.mdx?value",
      },
      setValue: {
        description:
          "You can use this method to set the component's current value programmatically (`true`: checked, `false`: unchecked).",
        descriptionRef: "PasswordInput/PasswordInput.mdx?setValue",
      },
    },
    themeVars: {
      "Input:radius-TextBox-default": "var(--xmlui-radius-TextBox-default)",
      "Input:color-border-TextBox-default": "var(--xmlui-color-border-TextBox-default)",
      "Input:thickness-border-TextBox-default": "var(--xmlui-thickness-border-TextBox-default)",
      "Input:style-border-TextBox-default": "var(--xmlui-style-border-TextBox-default)",
      "Input:font-size-TextBox-default": "var(--xmlui-font-size-TextBox-default)",
      "Input:color-bg-TextBox-default": "var(--xmlui-color-bg-TextBox-default)",
      "Input:shadow-TextBox-default": "var(--xmlui-shadow-TextBox-default)",
      "Input:color-text-TextBox-default": "var(--xmlui-color-text-TextBox-default)",
      "Input:color-border-TextBox-default--hover":
        "var(--xmlui-color-border-TextBox-default--hover)",
      "Input:color-bg-TextBox-default--hover": "var(--xmlui-color-bg-TextBox-default--hover)",
      "Input:shadow-TextBox-default--hover": "var(--xmlui-shadow-TextBox-default--hover)",
      "Input:color-text-TextBox-default--hover": "var(--xmlui-color-text-TextBox-default--hover)",
      "Input:color-border-TextBox-default--focus":
        "var(--xmlui-color-border-TextBox-default--focus)",
      "Input:color-bg-TextBox-default--focus": "var(--xmlui-color-bg-TextBox-default--focus)",
      "Input:shadow-TextBox-default--focus": "var(--xmlui-shadow-TextBox-default--focus)",
      "Input:color-text-TextBox-default--focus": "var(--xmlui-color-text-TextBox-default--focus)",
      "Input:thickness-outline-TextBox-default--focus":
        "var(--xmlui-thickness-outline-TextBox-default--focus)",
      "Input:color-outline-TextBox-default--focus":
        "var(--xmlui-color-outline-TextBox-default--focus)",
      "Input:style-outline-TextBox-default--focus":
        "var(--xmlui-style-outline-TextBox-default--focus)",
      "Input:offset-outline-TextBox-default--focus":
        "var(--xmlui-offset-outline-TextBox-default--focus)",
      "Input:color-placeholder-TextBox-default": "var(--xmlui-color-placeholder-TextBox-default)",
      "Input:color-adornment-TextBox-default": "var(--xmlui-color-adornment-TextBox-default)",
      "Input:radius-TextBox-error": "var(--xmlui-radius-TextBox-error)",
      "Input:color-border-TextBox-error": "var(--xmlui-color-border-TextBox-error)",
      "Input:thickness-border-TextBox-error": "var(--xmlui-thickness-border-TextBox-error)",
      "Input:style-border-TextBox-error": "var(--xmlui-style-border-TextBox-error)",
      "Input:font-size-TextBox-error": "var(--xmlui-font-size-TextBox-error)",
      "Input:color-bg-TextBox-error": "var(--xmlui-color-bg-TextBox-error)",
      "Input:shadow-TextBox-error": "var(--xmlui-shadow-TextBox-error)",
      "Input:color-text-TextBox-error": "var(--xmlui-color-text-TextBox-error)",
      "Input:color-border-TextBox-error--hover": "var(--xmlui-color-border-TextBox-error--hover)",
      "Input:color-bg-TextBox-error--hover": "var(--xmlui-color-bg-TextBox-error--hover)",
      "Input:shadow-TextBox-error--hover": "var(--xmlui-shadow-TextBox-error--hover)",
      "Input:color-text-TextBox-error--hover": "var(--xmlui-color-text-TextBox-error--hover)",
      "Input:color-border-TextBox-error--focus": "var(--xmlui-color-border-TextBox-error--focus)",
      "Input:color-bg-TextBox-error--focus": "var(--xmlui-color-bg-TextBox-error--focus)",
      "Input:shadow-TextBox-error--focus": "var(--xmlui-shadow-TextBox-error--focus)",
      "Input:color-text-TextBox-error--focus": "var(--xmlui-color-text-TextBox-error--focus)",
      "Input:thickness-outline-TextBox-error--focus":
        "var(--xmlui-thickness-outline-TextBox-error--focus)",
      "Input:color-outline-TextBox-error--focus": "var(--xmlui-color-outline-TextBox-error--focus)",
      "Input:style-outline-TextBox-error--focus": "var(--xmlui-style-outline-TextBox-error--focus)",
      "Input:offset-outline-TextBox-error--focus":
        "var(--xmlui-offset-outline-TextBox-error--focus)",
      "Input:color-placeholder-TextBox-error": "var(--xmlui-color-placeholder-TextBox-error)",
      "Input:color-adornment-TextBox-error": "var(--xmlui-color-adornment-TextBox-error)",
      "Input:radius-TextBox-warning": "var(--xmlui-radius-TextBox-warning)",
      "Input:color-border-TextBox-warning": "var(--xmlui-color-border-TextBox-warning)",
      "Input:thickness-border-TextBox-warning": "var(--xmlui-thickness-border-TextBox-warning)",
      "Input:style-border-TextBox-warning": "var(--xmlui-style-border-TextBox-warning)",
      "Input:font-size-TextBox-warning": "var(--xmlui-font-size-TextBox-warning)",
      "Input:color-bg-TextBox-warning": "var(--xmlui-color-bg-TextBox-warning)",
      "Input:shadow-TextBox-warning": "var(--xmlui-shadow-TextBox-warning)",
      "Input:color-text-TextBox-warning": "var(--xmlui-color-text-TextBox-warning)",
      "Input:color-border-TextBox-warning--hover":
        "var(--xmlui-color-border-TextBox-warning--hover)",
      "Input:color-bg-TextBox-warning--hover": "var(--xmlui-color-bg-TextBox-warning--hover)",
      "Input:shadow-TextBox-warning--hover": "var(--xmlui-shadow-TextBox-warning--hover)",
      "Input:color-text-TextBox-warning--hover": "var(--xmlui-color-text-TextBox-warning--hover)",
      "Input:color-border-TextBox-warning--focus":
        "var(--xmlui-color-border-TextBox-warning--focus)",
      "Input:color-bg-TextBox-warning--focus": "var(--xmlui-color-bg-TextBox-warning--focus)",
      "Input:shadow-TextBox-warning--focus": "var(--xmlui-shadow-TextBox-warning--focus)",
      "Input:color-text-TextBox-warning--focus": "var(--xmlui-color-text-TextBox-warning--focus)",
      "Input:thickness-outline-TextBox-warning--focus":
        "var(--xmlui-thickness-outline-TextBox-warning--focus)",
      "Input:color-outline-TextBox-warning--focus":
        "var(--xmlui-color-outline-TextBox-warning--focus)",
      "Input:style-outline-TextBox-warning--focus":
        "var(--xmlui-style-outline-TextBox-warning--focus)",
      "Input:offset-outline-TextBox-warning--focus":
        "var(--xmlui-offset-outline-TextBox-warning--focus)",
      "Input:color-placeholder-TextBox-warning": "var(--xmlui-color-placeholder-TextBox-warning)",
      "Input:color-adornment-TextBox-warning": "var(--xmlui-color-adornment-TextBox-warning)",
      "Input:radius-TextBox-success": "var(--xmlui-radius-TextBox-success)",
      "Input:color-border-TextBox-success": "var(--xmlui-color-border-TextBox-success)",
      "Input:thickness-border-TextBox-success": "var(--xmlui-thickness-border-TextBox-success)",
      "Input:style-border-TextBox-success": "var(--xmlui-style-border-TextBox-success)",
      "Input:font-size-TextBox-success": "var(--xmlui-font-size-TextBox-success)",
      "Input:color-bg-TextBox-success": "var(--xmlui-color-bg-TextBox-success)",
      "Input:shadow-TextBox-success": "var(--xmlui-shadow-TextBox-success)",
      "Input:color-text-TextBox-success": "var(--xmlui-color-text-TextBox-success)",
      "Input:color-border-TextBox-success--hover":
        "var(--xmlui-color-border-TextBox-success--hover)",
      "Input:color-bg-TextBox-success--hover": "var(--xmlui-color-bg-TextBox-success--hover)",
      "Input:shadow-TextBox-success--hover": "var(--xmlui-shadow-TextBox-success--hover)",
      "Input:color-text-TextBox-success--hover": "var(--xmlui-color-text-TextBox-success--hover)",
      "Input:color-border-TextBox-success--focus":
        "var(--xmlui-color-border-TextBox-success--focus)",
      "Input:color-bg-TextBox-success--focus": "var(--xmlui-color-bg-TextBox-success--focus)",
      "Input:shadow-TextBox-success--focus": "var(--xmlui-shadow-TextBox-success--focus)",
      "Input:color-text-TextBox-success--focus": "var(--xmlui-color-text-TextBox-success--focus)",
      "Input:thickness-outline-TextBox-success--focus":
        "var(--xmlui-thickness-outline-TextBox-success--focus)",
      "Input:color-outline-TextBox-success--focus":
        "var(--xmlui-color-outline-TextBox-success--focus)",
      "Input:style-outline-TextBox-success--focus":
        "var(--xmlui-style-outline-TextBox-success--focus)",
      "Input:offset-outline-TextBox-success--focus":
        "var(--xmlui-offset-outline-TextBox-success--focus)",
      "Input:color-placeholder-TextBox-success": "var(--xmlui-color-placeholder-TextBox-success)",
      "Input:color-adornment-TextBox-success": "var(--xmlui-color-adornment-TextBox-success)",
      "Input:color-bg-TextBox--disabled": "var(--xmlui-color-bg-TextBox--disabled)",
      "Input:color-text-TextBox--disabled": "var(--xmlui-color-text-TextBox--disabled)",
      "Input:color-border-TextBox--disabled": "var(--xmlui-color-border-TextBox--disabled)",
    },
    defaultThemeVars: {
      "radius-Input": "$radius",
      "color-text-Input": "$color-text-primary",
      "color-bg-Input--disabled": "$color-bg--disabled",
      "thickness-border-Input": "1px",
      "min-height-Input": "39px",
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
      light: {},
      dark: {},
    },
  },
  Toolbar: {
    description: "This component is a container for a toolbar.",
    status: "experimental",
    props: {
      alignment: {
        description: "The alignment of the toolbar.",
        descriptionRef: "Toolbar/Toolbar.mdx?alignment",
      },
    },
    defaultThemeVars: {
      "gap-Toolbar": "$space-2",
    },
  },
  ToolbarButton: {
    description: "This component is a button that is used in a toolbar.",
    status: "experimental",
    props: {
      label: {
        description: "The label to display on the button.",
        descriptionRef: "ToolbarButton/ToolbarButton.mdx?label",
      },
      icon: {
        description: "The icon to display on the button.",
        descriptionRef: "ToolbarButton/ToolbarButton.mdx?icon",
      },
    },
    defaultThemeVars: {
      "padding-horizontal-ToolbarButton": "$space-1",
      "padding-vertical-ToolbarButton": "$space-1",
    },
  },
  TrendLabel: {
    description: "This component displays a trend label.",
    status: "experimental",
    props: {
      change: {
        description: "The change percentage.",
        descriptionRef: "TrendLabel/TrendLabel.mdx?change",
      },
    },
  },
  Theme: {
    description:
      "The `Theme` component provides a way to define a particular theming context for its nested components. The XMLUI framework uses `Theme` to define the default theming context for all of its child components. Theme variables and theme settings only work in this context.",
    props: {
      themeId: {
        description: "This property specifies which theme to use by setting the theme's id.",
        descriptionRef: "Theme/Theme.mdx?themeId",
      },
      tone: {
        description:
          "This property allows the setting of the current theme's tone. Tone is either `light` or `dark`.",
        descriptionRef: "Theme/Theme.mdx?tone",
      },
      root: {
        description:
          "This property indicates whether the component is at the root of the application.",
        descriptionRef: "Theme/Theme.mdx?root",
      },
    },
    opaque: true,
    allowArbitraryProps: true,
  },
  ThemeChangerButton: {
    description:
      "The `ThemeChangerButton` component is a component that allows the user to change the theme of the app.",
    status: "experimental",
    props: {
      showSettings: {
        description:
          "This property indicates if the Settings function of this component is displayed.",
        availableValues: null,
        valueType: "boolean",
        defaultValue: true,
        descriptionRef: "ThemeChanger/ThemeChangerButton.mdx?showSettings",
      },
    },
    docFolder: "ThemeChanger",
  },
  ToneChangerButton: {
    description:
      "The `ToneChangerButton` component is a component that allows the user to change the tone of the app.",
    status: "experimental",
    props: {},
    docFolder: "ThemeChanger",
  },
  Tree: {
    description:
      "The `Tree` component is a virtualized tree component that displays hierarchical data.",
    status: "in progress",
    props: {
      data: {
        description: "The data source of the tree.",
        required: true,
      },
      selectedUid: {
        description: "The ID (optional) of the selected tree row.",
      },
      itemTemplate: {
        description: "The template for each item in the tree.",
        valueType: "ComponentDef",
      },
    },
  },
};
