# XMLUI Scripting

With XMLUI you can go a long way without coding anything more than small JavaScript snippets like those we've seen in the [Markup](/docs/guides/markup) chapter.

An expression:

```xmlui !/{ 6 * 7 }/
<Text value="Life, the universe, and everything: { 6 * 7 }" />
```

A statement:

```xmlui !/{ count++ }/
<Button label="Click to increment the count">
  <event name="click">
    { count++ }
  </event>
</Button>
```

An object literal:

```xmlui !/{ station: "Brixton", wifi: true, toilets: false }/
<Form
  data='{{ station: "Brixton", wifi: true, toilets: false }}'
  onSubmit="() => { preview.setValue(JSON.stringify($data)) }"
>
```

A function call:

```xmlui !/() => { preview.setValue(JSON.stringify($data)) }/
<Form
  data='{{ station: "Brixton", wifi: true, toilets: false }}'
  onSubmit="() => { preview.setValue(JSON.stringify($data)) }"
>
```

A function call with an argument:

```xmlui !/(newTheme) => setTheme(newTheme)/
<Select
  id="pickTheme"
  initialValue="xmlui"
  onDidChange="(newTheme) => setTheme(newTheme)">
</Select>
```

> [!INFO]
> The JavaScript [arrow function expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions), `=>`, is a concise way to define and use a function in an XMLUI attribute.

## Writing longer functions

The most elaborate function we've seen so far was this one, used in [Components](/docs/components-intro) chapter to extract data from a complex API response.

```js copy
window.transformStops = function(stops) {
  return stops.map(function(stop) {
  // Helper to extract a value from additionalProperties by key
    function getProp(key) {
      if (!stop.additionalProperties) return '';
      var propObj = stop.additionalProperties.find(function(p) {
        return p.key === key;
      });
      return propObj ? propObj.value : '';
    }
    return {
      name: stop.commonName,
      zone: getProp('Zone'),
      wifi: getProp('WiFi'),
      toilets: getProp('Toilets'),
      // A comma-separated list of line names that serve this stop
      lines: stop.lines
        ? stop.lines.map(function(line) { return line.name; }).join(', ')
        : ''
    };
  });
}
```

Here's how it works.

- `transformStops` receives a `stops` argument which is an array of JavaScript objects created by a `DataSource`. Each is a complex object representing a London tube stop.
- `map` is a method on an array object like `stops`. It takes an anonymous function as an argument, runs it for each item in the array, and returns a new array with each item transformed by a call to the function.
- `function(stop) { ... }` is the anonymous function passed to `map`. It defines a nested helper function, `getProp`, to extract property values.
- `getProp` calls `find`, another method on an array object. In this case the array is `stop.additionalProperties`. Like `map` it receives an anonymous function (`function(p)`) that receives an `additionalProperties` object. It  returns true if the name passed to `getProp` matches the value of `p.key`.

It helps to see the structure of a single object in the `stops` array.

```json
{
  "commonName": "Baker Street Underground Station",
  "placeType": "StopPoint",
  "additionalProperties": [
    {
      "$type": "Tfl.Api.Presentation.Entities.AdditionalProperties, Tfl.Api.Presentation.Entities",
      "category": "ServiceInfo",
      "key": "WiFi",
      "sourceSystemKey": "StaticObjects",
      "value": "yes"
    },
    {
      "$type": "Tfl.Api.Presentation.Entities.AdditionalProperties, Tfl.Api.Presentation.Entities",
      "category": "Facility",
      "key": "Car park",
      "sourceSystemKey": "StaticObjects",
      "value": "no"
    },
  ]
}
```

Here's an example of the transformed output.

```json
{
  "value": [
    {
      "name": "Bank Underground Station",
      "zone": "1",
      "wifi": "yes",
      "toilets": "yes",
      "lines": "Central, Northern, Waterloo & City"
    },
    {
      "name": "Waterloo Underground Station",
      "zone": "1",
      "wifi": "yes",
      "toilets": "no",
      "lines": "Bakerloo, Jubilee, Northern, Waterloo & City"
    }
  ]
}
```

## Deploying the transform function

We defined the function in XMLUI's `index.html` like so:

```html
<script>
  window.transformStops = function(stops) {
    ...
  }
</script>
```

When you define functions in `index.html` you can keep everything in one place for easy reference, and debug your functions in the browser's devtools environment.


## Code-Behind files

You can alternatively put functions into XMLUI *code-behind* files. In this case, for the `TubeStops` component which lives in the file `TubeStops.xmlui`, you would create a parallel file called `TubeStops.xmlui.xs`. In that context, arrow functions are required, so the function would look like this.

```js
function transformStops(stops) {
  return stops.map(stop => {
    // Helper to extract a value from additionalProperties by key
    const getProp = (key) => {
      const prop = stop.additionalProperties &&
        stop.additionalProperties.find(p => p.key === key);
      return prop ? prop.value : '';
    };
    return {
      name: stop.commonName,
      zone: getProp('Zone'),
      wifi: getProp('WiFi'),
      toilets: getProp('Toilets'),
      // A comma-separated list of line names that serve this stop
      lines: stop.lines ? stop.lines.map(line => line.name).join(', ') : ''
    };
  });
}
```

> [!INFO] The code-behind file for the application root, `Main.xmlui.xs`, is special. All variables and functions declared here are [global variables](/docs/guides/markup#global-variables).

## index.html vs code-behind

You can use either or both of these strategies in an XMLUI app. Use `index.html` if:

- Your function will be reused across components
- You like keeping all your functions in one place for convenient review
- You need to debug your function
- Your function interacts with JavaScript libraries you load via `index.html`
- You are unfamiliar with "modern" JavaScript features like arrow functions

Use code-behind if:

- You prefer to organize functions by component
- Your function works with variables scoped to a component
- Your function works with XMLUI [globals](/docs/globals)

## Inline code

When you write JavaScript expressions in XMLUI attributes you typically write single expressions, not multiline code blocks. But you can write multiline code blocks in some event handlers, for example click handlers.

```xmlui copy
<Button label="onClick" onClick="{
  console.log('clicked');
  count++;
  toast('count now' + count)
}" />
```

```xmlui copy
<Button label="event tag">
  <event name="click">
  {
    console.log('clicked');
    count++;
    toast('count now' + count)
  }
  </event>
</Button>
```
