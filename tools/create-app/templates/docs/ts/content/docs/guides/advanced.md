# Advanced Usage

## Scripting

You can add JavaScript logic to any component using a `<script>` block:

```xml
<Component name="UserGreeting">
  <script>
  function greeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }
  </script>
  <Text value="{greeting()}, {$props.name}!" />
</Component>
```

Use it like this:

```xml
<UserGreeting name="Alice" />
```

## Props

Components receive data through props via `$props`:

```xml
<Component name="PostCard">
  <VStack padding="1rem" gap="0.5rem">
    <H2>{$props.title}</H2>
    <Text>{$props.description}</Text>
    <Text variant="secondary">{$props.author} · {$props.date}</Text>
  </VStack>
</Component>
```

## Conditional Rendering

Show or hide elements with the `when` property:

```xml
<Text when="{user !== null}" value="Welcome back, {user.name}!" />
<Text when="{user === null}" value="Please log in." />
```

## Event Handling

Respond to user interactions with `on*` event handlers:

```xml
<Button
  label="Save"
  onClick="
    isSaving = true;
    await apiCall.invoke();
    isSaving = false;
  "
/>
```

## API Integration

### GET request

```xml
<DataSource id="postsData" url="https://api.example.com/posts" />
<List data="{postsData.result}">
  <property name="itemTemplate">
    <Card title="{$item.title}" />
  </property>
</List>
```

### POST / mutation

```xml
<APICall
  id="createPost"
  method="POST"
  url="https://api.example.com/posts"
  body="{{ title: newTitle, content: newContent }}"
/>
<Button label="Publish" onClick="createPost.invoke()" />
```

## Theme Variables

Override design tokens at any level of the component tree:

```xml
<Theme
  fontSize-H1="2.5rem"
  fontWeight-H1="800"
  color-primary-500="#6366f1"
>
  <MySection />
</Theme>
```

## Responsive Layout

Show or hide content based on screen size using responsive modifiers:

```xml
<Text when-sm="false" when="true">Full navigation</Text>
<Text when-sm="true" when="false">Mobile menu</Text>
```

Available breakpoints: `sm` (≥640px), `md` (≥768px), `lg` (≥1024px), `xl` (≥1280px).
