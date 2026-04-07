# Lazy-load images for performance

Set `lazyLoad` on `Image` to defer offscreen images and improve initial load time.

When a page contains many images, loading them all at once slows down the initial render. Setting `lazyLoad="{true}"` tells the browser to skip fetching offscreen images until the user scrolls near them. The attribute maps directly to the native `loading="lazy"` behaviour — no JavaScript observer code needed.

```xmlui-pg copy display name="Scroll down to lazy-load images" height="350px"
---app display
<App scrollWholePage="false">
  <ScrollViewer height="100%">
    <VStack>
      <H4>Team gallery</H4>
      <Text variant="caption" marginBottom="$space-2">
        Scroll down — images below the fold load on demand.
      </Text>

      <HStack wrapContent>
        <Card width="220px">
          <Image
            src="https://picsum.photos/seed/a/400/300"
            alt="Photo A"
            aspectRatio="4/3"
            lazyLoad="{true}" />
          <Text variant="strong">Alice</Text>
        </Card>
        <Card width="220px">
          <Image
            src="https://picsum.photos/seed/b/400/300"
            alt="Photo B"
            aspectRatio="4/3"
            lazyLoad="{true}" />
          <Text variant="strong">Bob</Text>
        </Card>
        <Card width="220px">
          <Image
            src="https://picsum.photos/seed/c/400/300"
            alt="Photo C"
            aspectRatio="4/3"
            lazyLoad="{true}" />
          <Text variant="strong">Charlie</Text>
        </Card>
        <Card width="220px">
          <Image
            src="https://picsum.photos/seed/d/400/300"
            alt="Photo D"
            aspectRatio="4/3"
            lazyLoad="{true}" />
          <Text variant="strong">Diana</Text>
        </Card>
        <Card width="220px">
          <Image
            src="https://picsum.photos/seed/e/400/300"
            alt="Photo E"
            aspectRatio="4/3"
            lazyLoad="{true}" />
          <Text variant="strong">Eve</Text>
        </Card>
        <Card width="220px">
          <Image
            src="https://picsum.photos/seed/f/400/300"
            alt="Photo F"
            aspectRatio="4/3"
            lazyLoad="{true}" />
          <Text variant="strong">Frank</Text>
        </Card>
      </HStack>
    </VStack>
  </ScrollViewer>
</App>
```

## Key points

**`lazyLoad="{true}"` defers offscreen images**: The browser skips the network request for images that are not visible in the viewport. As the user scrolls down and an image comes into view, the browser fetches it automatically. This reduces the initial page weight and speeds up the first paint.

**`aspectRatio` prevents layout shift**: Set `aspectRatio="4/3"` (or any ratio) so the browser reserves the correct space before the image loads. Without it the layout jumps when the image arrives — especially noticeable with lazy-loaded images.

**`fit` controls how the image fills its box**: Use `fit="cover"` to crop the image to fill the entire area, or `fit="contain"` (the default) to scale it down so the whole image is visible. This works the same as CSS `object-fit`.

**`alt` is required for accessibility**: Every `Image` should have an `alt` attribute describing the content. Screen readers rely on it, and the text is displayed when the image fails to load.

**Do not lazy-load above-the-fold images**: Images visible on the initial viewport (hero banners, logos) should load immediately. Apply `lazyLoad` only to images below the fold — otherwise the user sees a blank space before the browser decides to fetch them.

---

## See also

- [Build a responsive card grid](/docs/howto/build-a-responsive-card-grid) — arrange image cards that reflow across breakpoints
- [Embed an external site in an IFrame](/docs/howto/embed-an-external-site-in-an-iframe) — embed external media content securely
- [Add entrance animations to content](/docs/howto/add-entrance-animations-to-content) — fade images in as they scroll into view
