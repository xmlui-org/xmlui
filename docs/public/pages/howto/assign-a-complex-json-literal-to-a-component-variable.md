# Assign a complex JSON literal to a component variable

```xmlui-pg noHeader
---app
<App>
  <Test />
</App>
---api
{}
---comp display
<Component name="Test"
  <!-- double curly braces inside double quote -->
  var.appConfig="{{
    name: 'Photo Gallery',
    version: '1.2.0',
    isPublic: true,
    photos: [
      { id: 1, title: 'Sunset Beach', likes: 42 },
      { id: 2, title: 'Mountain View', likes: 38 },
      { id: 3, title: 'City Lights', likes: 55 }
    ],
    authors: [
      { name: 'Alice Johnson', role: 'Photographer' },
      { name: 'Bob Smith', role: 'Editor' }
    ]
  }}">
  <!-- double curly braces inside double quote -->

  <Text>{appConfig.name} v{appConfig.version}</Text>

  <Text>Photos ({appConfig.photos.length})</Text>
  <Items data="{appConfig.photos}">
    <Text>{$item.title} - {$item.likes} likes</Text>
  </Items>

  <Text>Team</Text>
  <Items data="{appConfig.authors}">
    <Text>{$item.name} ({$item.role})</Text>
  </Items>

</Component>
```
