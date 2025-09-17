# Theme Variables

The appearance of an xmlui app can be quickly customized with themes. The basic unit of a theme is a *theme variable*, which sets a particular visual trait of the app or a specific component, such as the background color, text weight, vertical padding, and others.

Theme variables follow a naming convention: They compose identifier-like segments separated by a simple or double dash. Here are a few examples:

```text
maxWidth-content 
borderColor-Card
backgroundColor-checked-Switch
outlineStyle-Checkbox-error--focus
borderColor-Button-secondary-outlined--hover--active
```

Most theme variables are composed of two segments, like the first two examples. However, more extended theme variables exist with multiple segments, such as the last three above.

The following pattern summarizes formally the name of a theme variable:

```text
<propertyName>-<part-or-aspect>-<ComponentId>-<variant>--<state>
```

**`propertyName`**

Each theme variable starts with a name, identifying the visual attribute the particular theme property defines. This segment uses camel-casing, the counterpart of CSS style names with kebab-casing.

For example, the `maxWidth` property name has the same semantics as the `max-width` CSS style.

>[!INFO]
> Though there are exceptions, most theme variables are projected to the counterpart CSS style at the end of the day (using the same syntax and semantics). Also, only about one-tenth of CSS style names have their pair in xmlui.

**`ComponentId`**

Most theme variables belong to a specific component (we call them *component-bound theme variables*). A `ComponentId` always starts with an uppercase letter and follows Pascal-casing. If no `ComponentId` is in the variable name, we call it an *app-bound theme variable*.

For example, the `borderColor-Card` name uses the `Card` as `ComponentId`, suggesting that it sets the border color of the `Card` component.

>[!INFO]
> We call theme variables without a `ComponentId` segment *app-bound* variables, as they do not belong to a particular component. They set some visual traits that belong to the entire app or multiple components.


**`aspect-or-part`**

When a particular theme variable belongs to a part (or specific visual aspect) of the component we name in `ComponentId`, this variable name segment refers to that part or aspect. For example, `backgroundColor-checked-Switch` refers to the background color to use when a `Switch` component is checked (turned on).

**`variant`**

Some components may have visual variants that use different style attributes. For example, a button has three different variants: `solid` (with background), `outlined` (with a border), and `ghost` (no border or background unless hovered). Adding the *variant* segment after `ComponentId` specifies the theme variable's particular variant.

For example, the `borderColor-Button-outlined` theme variable sets the border color only for the `outlined` variant of buttons and keeps the border color of others intact.

>[!INFO]
> Some components (such as `Button`) have multiple properties representing a variant (it also has a `themeColor`). In this case, you can add multiple `variant` segments to the theme variable.


**`state`**

Components may have different visual traits according to their state in the UI. For example, a button may have a different background color when the mouse hovers over it.

The `state` segment of a theme variable specifies the particular state of the component the theme variable affects; it starts with a double dash. For example, the `backgroundColor-Button-primary-solid--hover` theme variable sets the background color of a button with the `primary` theme color and `solid` variant when the mouse hovers over it.

This table summarizes the states you can use with theme variables:

|Name|Description|
|-|-|
|`‑‑active`|The component is active. For example, the left mouse button is pressed while the pointer is over the component.|
|`‑‑disabled`|The component is disabled; it does not accept user actions|
|`‑‑focus`|The component has the keyboard focus and processes keypress-related events|
|`‑‑hover`|Indicates the state when the mouse (pointer) hovers above the component's client area|

You can add multiple state segments to a theme variable to define a combined state. For example, the `‑‑active‑‑hover` combination defines a visual trait when the component is activated and hovered.

>[!INFO]
> You can use your custom state names for your components.

## Theme Property Names [#property-names]

You can refer to numerous visual properties via the `propertyName` segment. The following table summarizes their names and descriptions:

|Name|Description|
|-|-|
| **`backgroundColor`** | This property sets the [background color](/styles-and-themes/common-units#color) of an element. | 
| **`borderBottom`** | This property is a shorthand to set an element's bottom border. It sets the values of `borderBottomWidth`, `borderBottomStyle` and `borderBottomColor`. | 
| **`borderBottomColor`** | Sets the [color](/styles-and-themes/common-units#color) of an element's bottom border. | 
| **`borderBottomStyle`** | Sets the line [style](/styles-and-themes/common-units#border-style) of an element's bottom border. | 
| **`borderBottomWidth`** | Sets the width of an element's bottom border. | 
| **`borderColor`** | This property sets the [color](/styles-and-themes/common-units#color) of an element's border. | 
| **`borderEndEndRadius`** | This property defines a logical border radius on an element, which maps to the bottom-right radius with a left-to-right rendering direction and to the bottom-left radius with a right-to-left. | 
| **`borderEndStartRadius`** | This property defines a logical border radius on an element, which maps to the bottom-left radius with a left-to-right rendering direction and to the bottom-right radius with a right-to-left. | 
| **`borderHorizontal`** | This property sets the traits of the left and right borders. | 
| **`borderHorizontalColor`** | This property sets the [color](/styles-and-themes/common-units#color) of the left and right borders. | 
| **`borderHorizontalStyle`** | This property sets the [style](/styles-and-themes/common-units#border-style) of the left and right borders. | 
| **`borderHorizontalWidth`** | This property sets the [width](/styles-and-themes/common-units#size) of the left and right borders. | 
| **`borderRadius`** | This property property [rounds](/styles-and-themes/common-units#border-rounding) the corners of an element's outer border edge. You can set a single radius to make circular corners, or two radii to make elliptical corners. | 
| **`borderLeft`** | This property is a shorthand to set an element's left border. It sets the values of `borderLeftWidth`, `borderLeftStyle` and `borderLeftColor`. | 
| **`borderLeftColor`** | Sets the [color](/styles-and-themes/common-units#color) of an element's left border. | 
| **`borderLeftStyle`** | Sets the line [style](/styles-and-themes/common-units#border-style) of an element's left border. | 
| **`borderLeftWidth`** | Sets the [width](/styles-and-themes/common-units#size) of an element's left border. | 
| **`borderRight`** | This property is a shorthand to set an element's right border. It sets the values of `borderRightWidth`, `borderRightStyle` and `borderRightColor`. | 
| **`borderRightColor`** | Sets the [color](/styles-and-themes/common-units#color) of an element's right border. | 
| **`borderRightStyle`** | Sets the line [style](/styles-and-themes/common-units#border-style) of an element's right border. | 
| **`borderRightWidth`** | Sets the [width](/styles-and-themes/common-units#size) of an element's right border. | 
| **`borderStartEndRadius`** | This property defines a logical border radius on an element, which maps to the top-right radius with a left-to-right rendering direction and to the top-left radius with a right-to-left. | 
| **`borderStartStartRadius`** | This property defines a logical border radius on an element, which maps to the top-left radius with a left-to-right rendering direction and to the top-right radius with a right-to-left. | 
| **`borderStyle`** | This property sets the [style](/styles-and-themes/common-units#border-style) of an element's border. | 
| **`borderTop`** | This property is a shorthand to set an element's top border. It sets the values of `borderTopWidth`, `borderTopStyle` and `borderTopColor`. | 
| **`borderTopColor`** | Sets the [color](/styles-and-themes/common-units#color) of an element's top border. | 
| **`borderTopStyle`** | Sets the line [style](/styles-and-themes/common-units#border-style) of an element's top border. | 
| **`borderTopWidth`** | Sets the width of an element's top border. | 
| **`borderVertical`** | This property sets the traits of the top and bottom borders. | 
| **`borderVerticalColor`** | This property sets the [color](/styles-and-themes/common-units#color) of the top and bottom borders. | 
| **`borderVerticalStyle`** | This property sets the [style](/styles-and-themes/common-units#border-style) of the top and bottom borders. | 
| **`borderVerticalWidth`** | This property sets the [width](/styles-and-themes/common-units#size) of the top and bottom borders. | 
| **`borderWidth`** | This property sets the width of an element's border. | 
| **`boxShadow`** | This property adds shadow effects around an element's frame. | 
| **`fontFamily`** | Specifies a prioritized list of one or more [font family](/styles-and-themes/common-units#font-family) names and/or generic family names for the selected element. | 
| **`fontSize`** | This property sets the size of the font. | 
| **`fontStyle`** | This property sets whether a font should be styled with a normal, italic, or oblique face from its `fontFamily`. | 
| **`fontWeight`** | Sets the [weight](/styles-and-themes/common-units#font-weight) (or boldness) of the font. | 
| **`fontStretch`** | This property selects a normal, condensed, or expanded face from a font. | 
| **`letterSpacing`** | This property sets the horizontal spacing behavior between text characters. This value is added to the natural spacing between characters while rendering the text. Positive values cause characters to spread farther apart, while negative values bring characters closer together. | 
| **`lineHeight`** | Sets the [height](/styles-and-themes/common-units#size) of a line box in which the text is displayed. | 
| **`marginBottom`** | This property sets the [height](/styles-and-themes/common-units#size) of the margin area on the bottom of an element. | 
| **`marginHorizontal`** | This property combines setting the values of the `marginLeft` and `marginRight` properties. | 
| **`marginLeft`** | This property sets the [width](/styles-and-themes/common-units#size) of the margin area on the left of an element. | 
| **`marginRight`** | This property sets the [width](/styles-and-themes/common-units#size) of the margin area on the right of an element. | 
| **`marginTop`** | This property sets the [height](/styles-and-themes/common-units#size) of the margin area on the top of an element. | 
| **`marginVertical`** | This property combines setting the values of the `marginTop` and `marginBottom` properties. | 
| **`maxHeight`** | This property sets the maximum [height](/styles-and-themes/common-units#size) of an element. It prevents the used value of the height property from becoming larger than the value specified for `maxHeight`. | 
| **`maxWidth`** | This property sets the maximum [width](/styles-and-themes/common-units#size) of an element. It prevents the used value of the width property from becoming larger than the value specified for `maxWidth`. | 
| **`minHeight`** | This property sets the minimum [height](/styles-and-themes/common-units#size) of an element. It prevents the used value of the height property from becoming smaller than the value specified for `minHeight`. | 
| **`minWidth`** | This property sets the minimum [width](/styles-and-themes/common-units#size) of an element. It prevents the used value of the width property from becoming smaller than the value specified for `minWidth`. | 
| **`outlineColor`** | This property sets the [color](/styles-and-themes/common-units#color) of an element's outline. An outline is a line that is drawn around an element, outside the border. | 
| **`outlineOffset`** | This property sets the space between an outline and the edge or border of a focused element. | 
| **`outlineStyle`** | This property sets the style of an element's outline. | 
| **`outlineWidth`** | property sets the [width](/styles-and-themes/common-units#size) of an element's outline. | 
| **`overflowX`** | This property sets what shows when content overflows an element's left and right edges. This may be nothing, a scroll bar, or the overflow content. | 
| **`overflowY`** | This property sets what shows when content overflows an element's top and bottom edges. This may be nothing, a scroll bar, or the overflow content. | 
| **`paddingBottom`** | This property sets the [height](/styles-and-themes/common-units#size) of the padding area on the bottom of an element. | 
| **`paddingHorizontal`** | This property combines setting the values of the `paddingLeft` and `paddingRight` properties. | 
| **`paddingLeft`** | This property sets the [width](/styles-and-themes/common-units#size) of the padding area on the left of an element. | 
| **`paddingRight`** | This property sets the [width](/styles-and-themes/common-units#size) of the padding area on the right of an element. | 
| **`paddingTop`** | This property sets the [height](/styles-and-themes/common-units#size) of the padding area on the top of an element. | 
| **`paddingVertical`** | This property combines setting the values of the `paddingTop` and `paddingBottom` properties. | 
| **`textColor`** | This property sets the [color](/styles-and-themes/common-units#color) of the text used for rendering a component. |
| **`textDecoration`** | This is a shorthand property that sets the appearance of decorative lines on text combining the `textDecorationLine`, `textDecorationColor`, `textDecorationStyle`, and `textDecorationThickness` properties. |
| **`textDecorationColor`** | Sets the [color](/styles-and-themes/common-units#color) of decorations added to text by `textDecorationLine`. |
| **`textDecorationLine`** | Sets the [kind](/styles-and-themes/common-units#text-decoration) of decoration that is used on text in an element, such as an underline or overline. |
| **`textDecorationStyle`** | Sets the style of the decoration line that is used on text in an element, such as a line-through, underline, or overline. |
| **`textDecorationThickness`** | Sets the stroke [thickness](/styles-and-themes/common-units#size) of the decoration line that is used on text in an element, such as a line-through, underline, or overline. |
| **`textTransform`** | This property specifies how to capitalize an element's text. |
| **`textUnderlineOffset`** | The offset [distance](/styles-and-themes/common-units#size) of an underlined text decoration line from its original position. |

## App-bound Traits [#app-bound-traits]

You can use these app-bound theme variables within an app:

| Theme Variable | Description |
|-|-|
| **`backgroundColor`** | This theme variable sets the background color of the xmlui app. |
| **`backgroundColor‑dropdown‑item‑‑active`** | This property sets the background color of active elements of the items in dropdown components. |
| **`backgroundColor‑dropdown‑item‑‑active‑‑hover`** | This property sets the background color of active, hovered elements of the items in dropdown components. |
| **`backgroundColor‑dropdown‑item‑‑hover`** | This property sets the background color of hovered elements of the items in dropdown components. |
| **`backgroundColor‑overlay`** | This property sets the background color of elements used as an overlay. |
| **`backgroundColor‑attention`** | This theme variable sets the background color of components using the "attention" background color. |
| **`backgroundColor‑‑disabled`** | This theme variable sets the background color of color of disabled compopnents. |
| **`backgroundColor‑primary`** | This theme variable sets the background color of components using the "primary" background color. |
| **`backgroundColor‑secondary`** | This theme variable sets the background color of components using the "secondary" background color. |
| **`backgroundColor‑subtitle`** | This theme variable sets the background color of components using the "subtitle" variant. |
| **`borderColor`** | This property sets the default border color of elements. |
| **`borderColor‑‑disabled`** | This property sets the default border color of disabled elements. |
| **`borderColor‑dropdown‑item`** | This property sets the default background color of items in dropdown components. |
| **`borderRadius`** | You can specify the default rounding for all components that use border rounding. |
| **`boxShadow‑md`** | A medium-size box shadow that gives an elevated look to a component. |
| **`boxShadow‑spread`** | A box shadow that spreads around all edges of a component. |
| **`boxShadow‑spread‑2‑xl`** | A box shadow that spreads around all edges of a component (more extended than `boxShadow‑spread‑2`). |
| **`boxShadow‑spread‑2`** | A box shadow that spreads around all edges of a component (more extended than `boxShadow‑spread`). |
| **`boxShadow‑xl`** | A box shadow that gives an elevated look to a component (bigger than `boxShadow-md`). |
| **`boxShadow‑xxl`** | A box shadow that gives an elevated look to a component (bigger than `boxShadow-xl`). |
| **`color-danger`** | This theme variable sets the base color shade for components using the "danger" color. |
| **`color-info`** | This theme variable sets the base color shade for components using the "info" color. |
| **`color-primary`** | This theme variable sets the base color shade for components using the primary color. |
| **`color-secondary`** | This theme variable sets the base color shade for components using the secondary color. |
| **`color-success`** | This theme variable sets the base color shade for components using the "success" color. |
| **`color-surface`** | This theme variable sets the base color shade for surface areas (component backgrounds). |
| **`color-warn`** | This theme variable sets the base color shade for components using the "warning" color. |
| **`fontFamily‑monospace`** | This theme variable specifies the font family for text elements marked with "monospace". |
| **`fontFamily‑sans‑serif`** | This theme variable specifies the font family for text elements marked with "sans-serif". |
| **`fontSize`** | This theme variable sets the default font size of text elements. |
| **`fontSize‑tiny`** | The smallest font size available in the XMLUI styling system. |
| **`fontSize‑xs`** | A font size between `fontSize-tiny` and `fonstSize‑sm`. |
| **`fontSize‑sm`** | A font size between `fontSize-xs` and `fonstSize-base`. |
| **`fontSize‑base`** | A font size between `fontSize-sm` and `fonstSize-lg`. |
| **`fontSize‑lg`** | A font size between `fontSize-base` and `fonstSize-xl`. |
| **`fontSize‑xl`** | A font size between `fontSize-lg` and `fonstSize-2xl`. |
| **`fontSize‑2xl`** | A font size between `fontSize-xl` and `fonstSize-3xl`. |
| **`fontSize‑3xl`** | A font size between `fontSize-2xl` and `fonstSize-4xl`. |
| **`fontSize‑4xl`** | A font size between `fontSize-3xl` and `fonstSize-5xl`. |
| **`fontSize‑5xl`** | A font size between `fontSize-4xl` and `fonstSize-6xl`. |
| **`fontSize‑6xl`** | A font size between `fontSize-5l` and `fonstSize-7xl`. |
| **`fontSize‑7xl`** | A font size between `fontSize-6l` and `fonstSize-8xl`. |
| **`fontSize‑8xl`** | A font size between `fontSize-7xl` and `fonstSize-9xl`. |
| **`fontSize‑9xl`** | The tallest font size available in the XMLUI styling system. |
| **`fontWeight`** | This theme variable sets the weight of the default font. |
| **`fontWeight‑bold`** | This theme variable sets the font's weight marked as bold (when using any text variant with a weight set to `bold`). |
| **`fontWeight‑extra‑bold`** | This theme variable sets the font's weight marked as extra-bold (when using any text variant with a weight set to `extra-bold`). |
| **`fontWeight‑light`** | This theme variable sets the font's weight marked as light (when using any text variant with a weight set to `light`). |
| **`fontWeight‑normal`** | This theme variable sets the font's weight marked as normal (when using any text variant with a weight set to `normal`). |
| **`fontWeight‑medium`** | This theme variable sets the font's weight marked as medium (when using any text variant with a weight set to `medium`). |
| **`lineHeight‑tiny`** | The suggested line height for text with `fontSize-tiny`. |
| **`lineHeight‑xs`** | The suggested line height for text with `fontSize-xs`. |
| **`lineHeight‑sm`** | The suggested line height for text with `fontSize-sm`. |
| **`lineHeight‑base`** | The suggested line height for text with `fontSize-base`. |
| **`lineHeight‑lg`** | The suggested line height for text with `fontSize-lg`. |
| **`lineHeight‑xl`** | The suggested line height for text with `fontSize-xl`. |
| **`lineHeight‑2xl`** | The suggested line height for text with `fontSize-2xl`. |
| **`lineHeight‑3xl`** | The suggested line height for text with `fontSize-3xl`. |
| **`lineHeight‑4xl`** | The suggested line height for text with `fontSize-4xl`. |
| **`lineHeight‑5xl`** | The suggested line height for text with `fontSize-5xl`. |
| **`lineHeight‑6xl`** | The suggested line height for text with `fontSize-6xl`. |
| **`lineHeight‑7xl`** | The suggested line height for text with `fontSize-7xl`. |
| **`lineHeight‑8xl`** | The suggested line height for text with `fontSize-8xl`. |
| **`lineHeight‑9xl`** | The suggested line height for text with `fontSize-9xl`. |
| **`maxWidth‑desktop`** | This theme variable sets the maximum width of the app's viewport, which makes it appear like a desktop. When the viewport width is larger than `maxWidth-tablet` and smaller than or equal to this value, the app considers the current view as `desktop`. |
| **`maxWidth‑content`** | This theme variable sets the maximum width of the app's content. If the viewport is broader, the content will have margins to the left and right, keeping the width at the specified maximum. |
| **`maxWidth‑desktop`** | This theme variable sets the maximum width of the app's viewport, which makes it appear like a desktop. When the viewport width is larger than `maxWidth-tablet` and smaller than or equal to this value, the app considers the current view as `desktop`. |
| **`maxWidth‑desktop‑large`** | This theme variable sets the maximum width of the app's viewport, which makes it appear like a large desktop. When the viewport width is larger than `maxWidth-desktop` and smaller than or equal to this value, the app considers the current view as `large-desktop`. |
| **`maxWidth‑landscape‑phone`** | This theme variable sets the maximum width of the app's viewport, which makes it appear like a phone in landscape mode. When the viewport width is larger than `maxWidth-phone` and smaller than or equal to this value, the app considers the current view as `landscape-phone`. |
| **`maxWidth‑phone`** | This theme variable sets the maximum width of the app's viewport, which makes it appear like a phone in portrait mode. When the viewport width is smaller than or equal to this value, the app considers the current view as `phone`. |
| **`maxWidth‑tablet`** | This theme variable sets the maximum width of the app's viewport, which makes it appear like a tablet (either in portrait or landscape mode). When the viewport width is larger than `maxWidth-landscape-phone` and smaller than or equal to this value, the app considers the current view as `tablet`. |
| **`outlineColor‑‑focus`** | Set the color of the outline used for focused components. |
| **`outlineOffset‑‑focus`** | Set the width of the outline used for focused components. |
| **`outlineStyle‑‑focus`** | Set the style of the outline used for focused components. |
| **`outlineWidth‑‑focus`** | Set the width of the outline used for focused components. |
| **`textColor‑attention`** | This theme variable sets the color of text elements using the "attention" color. |
| **`textColor‑‑disabled`** | This theme variable sets the color of disabled text elements. |
| **`textColor‑primary`** | This theme variable sets the color of text elements using the "primary" color. |
| **`textColor‑secondary`** | This theme variable sets the color of text elements using the "secondary" color. |
| **`textColor‑subtitle`** | This theme variable sets the color of text elements using the "subtitle" variant. |

## Colors in Themes

XMLUI provides a palette of 77 colors for each theme out of the box. These colors are combinations of seven colors with 11 shades for each. 

These theme variables represent the base colors:

- `color-surface`: The color for the surface (background) areas
- `color-primary`: The primary color of the app (buttons, badges, checkboxes, etc.)
- `color-secondary`: The secondary color of the app (buttons, badges, checkboxes, etc.)
- `color-warn`: The color to use for warnings
- `color-danger`: The color for signing dangerous situations (for example, the color of a Delete button)
- `color-success`: The color for signing success
- `color-info`: The color for signing information

When you set a particular base color, xmlui creates several shade variants (using 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, and 950 as prefixes) from the lightest to the darkest. It uses the specified base color for shade 500 and calculates five darker shades (400, 300, 200, 100, and 50, from lighter to darker) plus five lighter shades (600, 700, 800, 900, and 950, from darker to lighter).

For example, when you set the the `color-primary` variable to `#008000`, XMLUI creates these shades:

```xmlui-pg name="Custom primary color shades"
---app
<App>
  <Theme color-primary="#008000">
    <Palette name="primary" />
  </Theme>
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

When selecting the primary color, choose one representing the middle shade (500). Otherwise, you may end up with an unuseful set of shades. For example, setting `surface-color` to `#001000` will create too many dark shades.

```xmlui-pg name="Unuseful primary color shades"
---app
<App>
  <Theme color-primary="#001000">
    <Palette name="primary" />
  </Theme>
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

### Default Color Shade Sets

XMLUI declares these default color shade sets:

**Surface**:

```xmlui-pg name="Surface Colors"
---app
<App>
  <Palette name="surface" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

**Primary**:

```xmlui-pg name="Primary Colors"
---app
<App>
  <Palette name="primary" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

**Secondary**:

```xmlui-pg name="Secondary Colors"
---app
<App>
  <Palette name="secondary" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

**Warn**:

```xmlui-pg name="Warn Colors"
---app
<App>
  <Palette name="warn" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

**Danger**:

```xmlui-pg name="Danger Colors"
---app
<App>
  <Palette name="danger" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

**Success**:

```xmlui-pg name="Success Colors"
---app
<App>
  <Palette name="success" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

**Info**:

```xmlui-pg name="Info Colors"
---app
<App>
  <Palette name="info" />
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
---comp
<Component name="Palette">
  <FlowLayout>
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-50" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-100" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-200" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-300" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-400" textColor="$color-surface-950" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-500" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-600" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-700" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-800" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-900" textColor="$color-surface-50" />
    <Swatch width="25%" color="$color-{$props.name || 'surface'}-950" textColor="$color-surface-50" />
  </FlowLayout>
</Component>
```

### Default Text Colors

- `textColor-primary`: The text color used by components that build on the primary color
- `textColor-secondary`: The text color used by components that build on the secondary color
- `textColor-attention`: Accented text color
- `textColor-subtitle`: Text color of text with the "subtitle" variant
- `textColor--disabled`: Text color representing the disabled state of a component

```xmlui-pg name="Default Text Colors"
<App>
  <HStack>
    <Text width="180px" variant="strong">textColor-primary:</Text>
    <Text color="$textColor-primary">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="180px" variant="strong">textColor-secondary:</Text>
    <Text color="$textColor-secondary">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="180px" variant="strong">textColor-attention:</Text>
    <Text color="$textColor-attention">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="180px" variant="strong">textColor-subtitle:</Text>
    <Text color="$textColor-subtitle">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="180px" variant="strong">textColor--disabled:</Text>
    <Text color="$textColor--disabled">This is an example text</Text>
  </HStack>
</App>
```

### Default Background Colors

- `backgroundColor`: The default background color for all components
- `backgroundColor-primary`: The background color used by components that build on the primary color
- `backgroundColor-secondary`: The background color used by components that build on the secondary color
- `backgroundColor-attention`: The background color used by components that build on the attention color
- `backgroundColor--disabled`: The background color representing the disabled state of a component
- `backgroundColor--selected`: The background color representing the selected state of a component
- `backgroundColor-overlay`: The background color of overlaid components
- `backgroundColor-dropdown-item--hover`: The background color of hovered items in dropdown containers
- `backgroundColor-dropdown-item--active`: The background color of active items in dropdown containers

```xmlui-pg name="Default Background Colors"
---app
<App>
  <FlowLayout>
      <Swatch color="$backgroundColor" width="50%" />
      <Swatch color="$backgroundColor-primary" width="50%" />
      <Swatch color="$backgroundColor-secondary" width="50%" />
      <Swatch color="$backgroundColor-attention" width="50%" />
      <Swatch color="$backgroundColor--disabled" width="50%" />
      <Swatch color="$backgroundColor--selected" width="50%" />
      <Swatch color="$backgroundColor-overlay" width="50%" />
      <Swatch color="$backgroundColor-dropdown-item--hover" width="50%" />
      <Swatch color="$backgroundColor-dropdown-item--active" width="50%" />
  </FlowLayout>
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
```

### Validation Colors

These colors represent validation states:
- `color-info`: Color of components with informational messages
- `color-valid`: Color signing valid state
- `color-warning`: Color of warning
- `color-error`: Color signing some error

```xmlui-pg name="Validation Colors"
---app
<App>
  <FlowLayout>
    <Swatch color="$color-info" width="25%" textColor="$color-surface-50" />
    <Swatch color="$color-valid" width="25%" textColor="$color-surface-50" />
    <Swatch color="$color-warning" width="25%" textColor="$color-surface-50" />
    <Swatch color="$color-error" width="25%" textColor="$color-surface-50" />
  </FlowLayout>
</App>
---comp
<Component name="Swatch">
  <VStack gap="0.25rem">
    <Stack
      height="50px"
      border="1px solid black"
      backgroundColor="{$props.color}"
      horizontalAlignment="center"
      verticalAlignment="center">
      <Text value="{$props.color.substring(1) || 'color token'}" color="{$props.textColor}" />
    </Stack>    
  </VStack>
</Component>
```

## Fonts

You can influence the default font settings of a particular theme with the following theme variables:

### Font Family

These theme variables set the default font styles:
- `fontFamily`: The default font family used in the app
- `fontFamily-sans-serif`: The default sans-serif font family used in the app
- `fontFamily-monospace`: The default monospace font family used in the app

```xmlui-pg name="Font Family"
<App>
  <HStack>
    <Text width="200px" variant="strong">Default font family:</Text>
    <Text fontFamily="$fontFamily-sans-serif">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="200px" variant="strong">Sans serif font family:</Text>
    <Text fontFamily="$fontFamily-sans-serif">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="200px" variant="strong">Monospace font family:</Text>
    <Text fontFamily="$fontFamily-monospace">This is an example text</Text>
  </HStack>
</App>
```

### Line Height

These theme variables define a set of line heights relative to the font size:

```xmlui-pg name="Line Height" height="400px"
<App>
  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-tiny:</Text>
    <Text 
      fontSize="$fontSize-tiny"
      lineHeight="lineHeight-tiny"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-xs:</Text>
    <Text 
      fontSize="$fontSize-xs"
      lineHeight="lineHeight-xs"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-sm:</Text>
    <Text 
      fontSize="$fontSize-sm"
      lineHeight="lineHeight-sm"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-base:</Text>
    <Text 
      fontSize="$fontSize-base"
      lineHeight="lineHeight-base"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-xl:</Text>
    <Text 
      fontSize="$fontSize-xl"
      lineHeight="lineHeight-xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-2xl:</Text>
    <Text 
      fontSize="$fontSize-2xl"
      lineHeight="lineHeight-2xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-3xl:</Text>
    <Text 
      fontSize="$fontSize-3xl"
      lineHeight="lineHeight-3xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-4xl:</Text>
    <Text 
      fontSize="$fontSize-4xl"
      lineHeight="lineHeight-4xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-5xl:</Text>
    <Text 
      fontSize="$fontSize-5xl"
      lineHeight="lineHeight-5xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-6xl:</Text>
    <Text 
      fontSize="$fontSize-6xl"
      lineHeight="lineHeight-6xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-7xl:</Text>
    <Text 
      fontSize="$fontSize-7xl"
      lineHeight="lineHeight-7xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-8xl:</Text>
    <Text 
      fontSize="$fontSize-8xl"
      lineHeight="lineHeight-8xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">lineHeight-9xl:</Text>
    <Text 
      fontSize="$fontSize-9xl"
      lineHeight="lineHeight-9xl"
      backgroundColor="lightblue" 
      paddingHorizontal="$space-2"
    >Example</Text>
  </HStack>
</App>
```

### Font Size

The `fontSize` theme variables allow you to set your themes' normal font size (`fontSize-base`). You can use this set of theme variables to define font sizes relative to `fontSize`:

```xmlui-pg name="Font Size" height="400px"
<App>
  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-tiny:</Text>
    <Text fontSize="$fontSize-tiny">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-xs:</Text>
    <Text fontSize="$fontSize-xs">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-sm:</Text>
    <Text fontSize="$fontSize-sm">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-base:</Text>
    <Text fontSize="$fontSize-base">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-xl:</Text>
    <Text fontSize="$fontSize-xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-2xl:</Text>
    <Text fontSize="$fontSize-2xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-3xl:</Text>
    <Text fontSize="$fontSize-3xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-4xl:</Text>
    <Text fontSize="$fontSize-4xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-5xl:</Text>
    <Text fontSize="$fontSize-5xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-6xl:</Text>
    <Text fontSize="$fontSize-6xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-7xl:</Text>
    <Text fontSize="$fontSize-7xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-8xl:</Text>
    <Text fontSize="$fontSize-8xl">Example</Text>
  </HStack>

  <HStack verticalAlignment="center">
    <Text width="160px" variant="strong">fontSize-9xl:</Text>
    <Text fontSize="$fontSize-9xl">Example</Text>
  </HStack>
</App>
```

### Font Weight

The `fontWeight` theme variables allow you to set your themes' normal font weight (`fontWeight-normal`). You can use this set of theme variables to define font sizes relative to `fontWeight`:

```xmlui-pg name="Font Weight"
<App>
  <HStack>
    <Text width="200px" variant="strong">fontWeight-light:</Text>
    <Text fontWeight="$fontWeight-light">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="200px" variant="strong">fontWeight-normal:</Text>
    <Text fontWeight="$fontWeight-normal">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="200px" variant="strong">fontWeight-medium:</Text>
    <Text fontWeight="$fontWeight-medium">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="200px" variant="strong">fontWeight-bold:</Text>
    <Text fontWeight="$fontWeight-bold">This is an example text</Text>
  </HStack>

  <HStack>
    <Text width="200px" variant="strong">fontWeight-extra-bold:</Text>
    <Text fontWeight="$fontWeight-extra-bold">This is an example text</Text>
  </HStack>
</App>
```

## Shadows

XMLUI defines a few stock shadow resources:

```xmlui-pg name="Shadows" height="320px"
<App>
  <HStack padding="1.5rem" gap="1.5rem">
    <Stack minWidth="36px" minHeight="36px" padding="8px" width="30%" boxShadow="$boxShadow" >
      boxShadow
    </Stack>
    <Stack minWidth="36px" minHeight="36px" padding="8px" width="30%" boxShadow="$boxShadow-md">
      boxShadow-md
    </Stack>
    <Stack minWidth="36px" minHeight="36px" padding="8px" width="30%" boxShadow="$boxShadow-xxl">
      boxShadow-xxl
    </Stack>
  </HStack>
  <HStack padding="1.5rem" gap="1.5rem">
    <Stack minWidth="36px" minHeight="36px" padding="8px" width="30%" boxShadow="$boxShadow-spread">
      boxShadow-spread
    </Stack>
    <Stack minWidth="36px" minHeight="36px" padding="8px" width="30%" boxShadow="$boxShadow-spread-2">
      boxShadow-spread-2
    </Stack>
    <Stack minWidth="36px" minHeight="36px" padding="8px" width="30%" boxShadow="$boxShadow-spread-2-xl">
      boxShadow-spread-2-xl
    </Stack>
  </HStack>
</App>
```

## Spacing

XMLUI uses a relative scale with spacing (paddings, margins, gaps, etc.). This scale uses a unit defined with `space-base`, which you can set in your theme. When referring to a particular spacing, you can use values like `space-0`, `space-1`, ..., `space-12`, ..., and `space-96`, as the following example shows:

```xmlui-pg name="Spacing"
<App gap="$gap-tight">
  <Text value="The base value is: 0.25rem" variant="strong" />
  
  <HStack>
    <Text value="space-0" width="$space-20" />
    <Stack width="$space-0" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-0_5" width="$space-20" />
    <Stack width="$space-0_5" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-1" width="$space-20" />
    <Stack width="$space-1" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-1_5" width="$space-20" />
    <Stack width="$space-1_5" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-2" width="$space-20" />
    <Stack width="$space-2" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-2_5" width="$space-20" />
    <Stack width="$space-2_5" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-3" width="$space-20" />
    <Stack width="$space-3" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-3_5" width="$space-20" />
    <Stack width="$space-3_5" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-4" width="$space-20" />
    <Stack width="$space-4" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-5" width="$space-20" />
    <Stack width="$space-5" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-6" width="$space-20" />
    <Stack width="$space-6" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-7" width="$space-20" />
    <Stack width="$space-7" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-8" width="$space-20" />
    <Stack width="$space-8" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-9" width="$space-20" />
    <Stack width="$space-9" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-10" width="$space-20" />
    <Stack width="$space-10" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-11" width="$space-20" />
    <Stack width="$space-11" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-12" width="$space-20" />
    <Stack width="$space-12" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-14" width="$space-20" />
    <Stack width="$space-14" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-16" width="$space-20" />
    <Stack width="$space-16" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-20" width="$space-20" />
    <Stack width="$space-20" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-24" width="$space-20" />
    <Stack width="$space-24" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-28" width="$space-20" />
    <Stack width="$space-28" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-32" width="$space-20" />
    <Stack width="$space-32" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-36" width="$space-20" />
    <Stack width="$space-36" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-40" width="$space-20" />
    <Stack width="$space-40" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-44" width="$space-20" />
    <Stack width="$space-44" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-48" width="$space-20" />
    <Stack width="$space-48" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-52" width="$space-20" />
    <Stack width="$space-52" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-56" width="$space-20" />
    <Stack width="$space-56" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-60" width="$space-20" />
    <Stack width="$space-60" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-64" width="$space-20" />
    <Stack width="$space-64" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-72" width="$space-20" />
    <Stack width="$space-72" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-80" width="$space-20" />
    <Stack width="$space-80" backgroundColor="$color-info" />
  </HStack>

  <HStack>
    <Text value="space-96" width="$space-20" />
    <Stack width="$space-96" backgroundColor="$color-info" />
  </HStack>
</App>
```

## Spacing in Layout Containers [#spacing-in-layout-containers]

Besides the spacing theme variables, layout containers provide a few others that can be themed. Use these theme variables to provide consistent spacing with layout containers.

**Gaps**:
- `gap-none`: No gap
- `gap-tight`: Less gap than the normal (layout container defaults)
- `gap-normal`: Default layout container gap
- `gap-loose`: More gap than the normal

**Padding**:
- `padding-none`: No padding
- `padding-tight`: Less padding than the normal (layout container defaults)
- `padding-normal`: Default layout container padding
- `padding-loose`: More padding than the normal

**General spacing** (padding, gaps, other spacing):
- `padding-none`: No spacing
- `padding-tight`: Less spacing than the normal
- `padding-normal`: Default spacing
- `padding-loose`: More spacing than the normal
