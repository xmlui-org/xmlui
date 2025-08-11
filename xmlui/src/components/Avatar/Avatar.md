%-DESC-START

**Key features:**
- **Automatic fallback**: Shows initials when no image URL is provided or image fails to load
- **Multiple sizes**: From `xs` (extra small) to `lg` (large) to fit different contexts
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

```xmlui-pg copy display name="Example: size"
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
