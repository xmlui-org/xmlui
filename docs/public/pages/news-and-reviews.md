# News and reviews

```xmlui-pg
<Table data="/resources/files/news-and-reviews.json" sortBy="date" sortDirection="descending">
  <Column bindTo="date" />
  <Column header="title">
    <Link target="_blank" to="{$item.url}">
      { $item.title }
    </Link>
  </Column>
  <Column bindTo="source" />
</Table>
```