%-DESC-START

**Key features:**
- **Automatic fallback**: Shows initials when no image URL is provided or image fails to load
- **Multiple sizes**: Predefined sizes (xs, sm, md, lg) scale with font size, or use custom CSS values for precise control
- **Clickable**: Supports click events for profile actions, modals, or navigation
- **Accessible**: Automatically generates appropriate alt text from the name

%-DESC-END

%-PROP-START name

```xmlui-pg copy display name="Example: name"
<App>
  <Avatar name="John, Doe" />
</App>
```
%-PROP-END

%-PROP-START size

Predefined sizes scale with the current font size:

```xmlui-pg copy display name="Example: Predefined sizes"
<App>
  <HStack>
    <Avatar name="Dorothy Ellen Fuller" />
    <Avatar name="Xavier Schiller" size="xs" />
    <Avatar name="Sebastien Moore" size="sm" />
    <Avatar name="Molly Dough" size="md" />
    <Avatar name="Lynn Gilbert" size="lg" />
  </HStack>
</App>
```

Custom CSS values can be used for precise sizing:

```xmlui-pg copy display name="Example: Custom sizes"
<App>
  <HStack verticalAlignment="center">
    <Avatar name="John Doe" size="40px" />
    <Avatar name="Jane Smith" size="60px" />
    <Avatar name="Bob Wilson" size="80px" />
    <Avatar name="Alice Brown" size="6rem" />
  </HStack>
</App>
```

%-PROP-END

%-PROP-START url

```xmlui-pg copy display name="Example: url"
<App>
  <Avatar url="https://i.pravatar.cc/100" size="md" />
</App>
```

%-PROP-END

%-EVENT-START click

```xmlui-pg copy display name="Example: click"
<App>
  <HStack verticalAlignment="center">
    <Avatar name="Molly Dough" size="md" onClick="toast('Avatar clicked')" />
    Click the avatar!
  </HStack>
</App>
```

%-EVENT-END
