# Masonry layout

The `Masonry` component arranges children in a responsive multi-column layout. Items flow top-to-bottom, then left-to-right, with columns automatically adapting to container width.

**Props:**
- `columns` -- maximum number of columns (default: 3)
- `gap` -- space between columns and items; accepts CSS lengths or theme tokens like `$space-3` (default: "16px")
- `columnGap` -- overrides `gap` for horizontal spacing between columns
- `rowGap` -- overrides `gap` for vertical spacing between items
- `minColumnWidth` -- minimum column width before reducing columns (default: "250px")

## Basic: colored boxes with varying heights

```xmlui-pg
---app display
<App>
  <Masonry columns="4" gap="$space-3" minColumnWidth="150px">
    <Card padding="$space-2" backgroundColor="$color-primary-100" height="120px">
      <Text>Card 1 -- short</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-success-100" height="200px">
      <Text>Card 2 -- tall</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-warn-100" height="160px">
      <Text>Card 3 -- medium</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-danger-100" height="100px">
      <Text>Card 4 -- short</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-info-100" height="240px">
      <Text>Card 5 -- very tall</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-secondary-100" height="140px">
      <Text>Card 6 -- medium</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-primary-200" height="180px">
      <Text>Card 7 -- tall</Text>
    </Card>
    <Card padding="$space-2" backgroundColor="$color-success-200" height="110px">
      <Text>Card 8 -- short</Text>
    </Card>
  </Masonry>
</App>
```

## Content cards: simulated event listings

```xmlui-pg
---app display
<App>
  <Masonry columns="3" gap="$space-4" rowGap="0" minColumnWidth="250px">
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Jazz in the Park</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">March 22, 2026 · 7:00 PM</Text>
        <Text>Enjoy an evening of live jazz under the stars at Juilliard Park. Bring a blanket and a picnic.</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Farmers Market Opening Day</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">April 1, 2026 · 9:00 AM</Text>
        <Text>The weekly farmers market kicks off its spring season with over 50 local vendors, live music, and cooking demonstrations featuring seasonal produce.</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Art Walk</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">March 28, 2026 · 5:00 PM</Text>
        <Text>Downtown galleries open their doors for a self-guided art walk.</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Community Cleanup Day</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">April 5, 2026 · 8:00 AM</Text>
        <Text>Join neighbors for a morning of park cleanup and trail maintenance. Gloves and bags provided. Coffee and donuts afterwards.</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Spring Concert Series</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">April 12, 2026 · 6:30 PM</Text>
        <Text>The beloved local band returns for the first show of the spring concert series at the amphitheater.</Text>
      </VStack>
    </Card>
    <Card padding="$space-3">
      <VStack gap="$space-1">
        <Text fontWeight="bold">Book Sale</Text>
        <Text fontSize="$fontSize-small" color="$textColor-secondary">March 30, 2026 · 10:00 AM</Text>
        <Text>Library book sale -- thousands of used books, DVDs, and vinyl records. All proceeds support library programs.</Text>
      </VStack>
    </Card>
  </Masonry>
</App>
```
