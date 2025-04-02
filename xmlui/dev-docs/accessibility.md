# Accessibility

This document outlines the basic notion of web accessibility. It also provides further reading material to digest.
Finally, it details some current issues regarding our component design in terms of accessible functionality.

>
> **NOTE:** This is a living document that will be updated as we work with accessibility guidelines.
> How deep we wish to get into accessibility is yet to be limited.
>

When the browser parses HTML & associated files, it builds up the DOM tree. Parallel to this, it also builds an Accessibility Tree. The browser uses assessible properties and names to identify the element (ARIA properties). ARIA can be thought of as a contract, e.g. the developers ensure that a particular element the screen reader finds is labeled as a "button", so it must act like a button (instead of being just a div with the aria role of a button without any functionality).

Aspects of creating accessible components:

1. Semantic HTML: use proper html elements (e.g., <header>, <main>, <footer>, <nav>) to provide meaningful structure to assistive technologies like screen readers. For non-semantic elements, use appropriate ARIA roles (e.g., role="navigation") to convey their purpose. (i.e. in cases where there are no HTML elements available yet)

2. ARIA roles need to be used sparingly, since it's easy to mess up the implementation: websites using custom ARIA roles have 34% more ARIA-related problems than those who do not use them

3. Keyboard navigation:
	- Use the Tab key for focus traversal.
	- Implement Enter, Esc, and arrow keys for component-specific interactions (e.g., opening modals or navigating menus)

4. Focus Management: provide clear focus indicators (e.g. outlines, but other indicators work too) for focused elements. Automatically shift focus to modals or alerts when they appear and return focus to the triggering element upon closure.

5. Support responsive layout principles for different screen sizes

6. Support reduced motion preferences by respecting user settings for reduced animations

7. Ensure sufficient color contrast between text and background (WCAG recommends a ratio of at least 4.5:1). Also provide themes for reduced color & high contrast situations

8. Screen Reader Compatibility: Test components with screen readers to verify that they convey accurate roles, states, and descriptions. Use live regions (role="alert") to notify users of dynamic updates like form validation errors.

9. Form: provide input controls with clear labeling & provide labels with `aria-label` and `aria-describedby` roles. Also show feedback to the user when indicating validation errors.

## Tools

- Use Accessibility Tool in Chrome Dev Tools to visualize Accessibility Tree (Ctrl+Shift+P -> type Accessibility, click "Enable full page accessibility", click on little figure button)
- [Generate accessible color palettes](https://toolness.github.io/accessible-color-matrix/)
- [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/) - uses axe-core

## Reading Material

- [Dip into a11y in React](https://www.youtube.com/watch?v=UHjt2A6CS6A)
- [Article about Button Accessibility](https://jessijokes.medium.com/one-button-to-rule-them-all-465e294cba82)
- [Huge Guide on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Most Comprehensive Guide from W3C](https://www.w3.org/TR/WCAG22/)
- [How to write alt text](https://www.a11y-collective.com/blog/how-to-write-great-alt-text/)
- [Dropdown a11y](https://www.a11y-collective.com/blog/mastering-web-accessibility-making-drop-down-menus-user-friendly/)
- [Intro to a11y with examples from Web Dev Simplified](https://www.youtube.com/watch?v=1A6SrPwmGpg)
- [Checklist for text input](https://www.magentaa11y.com/checklist-web/text-input/)
- [Checklist for number input](https://www.magentaa11y.com/checklist-web/number-input/)

## Current Situation in XMLUI

- Radix-ui supports assistive tech, focus handling, semantic elements, keyboard nav and accessible labels; HOWEVER, we do not use their labels -> some accessibility issues may come from that
- Not all elements display focus indicators
- Need to check whether our modals and dropdowns properly handle focus states and keyboard navigation
- Need to check focus states for all input components
- Need to see how accessible is our main theme (review with Gábor?)
- Test our sites with screenreaders?

---

## A11y Component Review

### Reviewed So Far

- Button
- List
- Link
- NavGroup & NavLink
- TextBox
- Form
- FormItem
- Text
- Heading
- Select

### Most Gains

This section touches upon the aspects of a11y that require the least amount of effort for the most amount of features.

- Color contrast: label readability, background color and visual identification of certain emphasized elements
- Keyboard navigation: can the website/webapp be navigable with only tabs, arrow keys & the Enter/Space keys
- Visual hierarchy:
	- elements which belong together are correctly grouped together
	- headings follow a continous order of precedence (Only one H1 on the page, H1 us succeeded by an H2 not an H3, etc.)

### Issues Found

#### Button

- Pressing ENTER or SPACE does not give visual feedback on Button firing
- Need to evaluate when to add 'aria-label' to component
- Button size must be at least 44x44px (because of touchscreens and human finger sizes)
- Icon & Label:
	1. If label & icon: make icon aria-hidden
	2. If only icon: aria-hidden on icon, add "visually-hidden" CSS style to a span with a text (which would have been aria-label) (Visually hidden CSS is really common, it might worth the effort to extract it to a separate component)

#### Icon

- Provide an accessible name by adding 'role' and 'title' to icon svg element
- Decorative icons need to be hidden from screen readers ('aria-hidden')

#### Image

- Need to provide an alt text IN CONTEXT OF THE WEBPAGE

#### App

- Provide a clever way to generate landmarks for screen readers: <header>, <footer>, <main> (must be only 1 for the main content); alternatively, roles can also be provided for elements

#### Link

- Cannot be focused in any way
- Don't respond to ENTER or SPACE
- Incorrect role in Accessibility Tree (Static Text instead of link), empty "image" node if icon is present
(- There's a nice-to-have use of links in the form of the [skipnav or Skip Link](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Accessibility/HTML#skip_links))

#### Heading

Component looks good.
- Paddings/margins need to be set when filling out content on website (visual hierarchy)

#### Text

Component looks good.
- Need to take semantic html into account when creating site content with variants (user's responsibility?)

#### TextBox

Using the following [checklist by WCAG](https://www.magentaa11y.com/checklist-web/text-input/).

- Has generic div inside that should not be visible in tree
- Label is not linked to the input element
- Border is a bit too light when not hovered
- Click area is slightly smaller then 44px
- Contrast not big enough between default state and both focus and disabled states
- Need to handle `disabled` & `readonly` accessible states in context (what is our intention with the control?)
- We may need to add `aria-disabled="true"` if a control is `readonly`
- Way may need to add `autocomplete` and `spellcheck` attributes (not strictly a11y, but can help with patterns such as email & url)

#### FormItem

- Helper text that provide hints need to have `id="hint-{input-id}"` set on it. Plus, the input control needs an `aria-describedby="hint-{input-id}"` attribute as well.
- Multiple _related_ input controls need to be in a `<fieldset>` element that has a `<legend>` at the top. (this is visual hierarchy, not strictly a11y)
