%-DESC-START

**Key features:**
- **Simple iteration**: Maps data arrays to components using `$item`, `$itemIndex`, `$isFirst`, and `$isLast` context
- **Layout agnostic**: No built-in styling or container; children determine the visual presentation
- **Reverse ordering**: Optional `reverse` property to display data in opposite order
- **Performance**: Lightweight alternative to `List` when you do not need virtualization or grouping

>[!INFO]
> `Items` is not a container. It does not wrap its items into a container; it merely renders its children.

The `Items` component does not use virtualization; it maps each data item into a component.
Passing many items to a component instance will use many resources and slow down your app.
If you plan to work with many items, use the `List` and `Table` components instead.

%-DESC-END

%-PROP-START reverse

Reverses the order in which data is mapped to template components.

%-PROP-END

%-STYLE-START

The `Items` component does not support styling.
Style the container component that wraps `Items`, or style the individual items through the template component.

%-STYLE-END
