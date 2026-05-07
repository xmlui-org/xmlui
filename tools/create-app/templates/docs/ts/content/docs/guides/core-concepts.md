# Core Concepts

Understanding how XMLUI works will help you get the most out of the framework.

## Components

Everything in XMLUI is a component. The framework ships with a rich library of built-in
components — `Button`, `Card`, `List`, `Form`, and many more.

You can also define your own reusable components:

```xml
<Component name="AlertBanner">
  <VStack
    backgroundColor="$color-warning-100"
    padding="1rem"
    borderRadius="0.5rem"
  >
    <Slot />
  </VStack>
</Component>
```

Use it anywhere in your app:

```xml
<AlertBanner>
  This is an important notice.
</AlertBanner>
```

## Expressions

Curly braces `{...}` evaluate JavaScript expressions:

```xml
<Text value="{2 + 2}" />
<Text value="{'Hello, ' + user.name + '!'}" />
<Button label="{isLoggedIn ? 'Log out' : 'Log in'}" />
```

## Reactive State

Declare reactive variables with `var.*`:

```xml
<App var.count="{0}">
  <Button label="Clicked {count} times" onClick="count++" />
</App>
```

When `count` changes, every binding that references it updates automatically.

## Data Binding

Fetch and display data with `DataSource` or `APICall`:

```xml
<List data="https://api.example.com/posts">
  <property name="itemTemplate">
    <Card title="{$item.title}" subtitle="{$item.author}" />
  </property>
</List>
```

The `$item` variable holds the current list element.

## Routing

Multi-page apps use `Pages` and `Page`:

```xml
<Pages fallbackPath="/">
  <Page url="/">
    <HomePage />
  </Page>
  <Page url="/post/:slug">
    <PostPage />
  </Page>
</Pages>
```

Access route parameters with `$routeParams.slug`.

## Slots

`<Slot />` inside a component definition marks where child content is injected:

```xml
<Component name="Card">
  <VStack borderRadius="0.5rem" padding="1rem">
    <Slot />
  </VStack>
</Component>
```
