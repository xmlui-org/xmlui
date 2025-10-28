In the mid-1990s you could create useful software without being an ace coder. You had Visual Basic, you had a rich ecosystem of components, you could wire them together to create apps, standing on the shoulders of the coders who built those components. If you're younger than 45 you may not know what that was like, nor realize web components have never worked the same way. The project we're announcing today, [XMLUI](https://xmlui.org), brings the VB model to the modern web and its React-based component ecosystem. XMLUI wraps React and CSS and provides a suite of components that you compose with XML markup. Here's a little app to check the status of London tube lines.

```xml
<App>
  <Select id="lines" initialValue="bakerloo">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
    </Items>
  </Select>
  <DataSource
    id="tubeStations"
    url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
    resultSelector="stations"/>
  <Table data="{tubeStations}" height="280px">
    <Column bindTo="name" />
    <Column bindTo="modes" />
  </Table>
</App>
```

![XMLUI Demo](https://jonudell.net/xmlui/xmlui2.gif)

A dozen lines of XML is enough to:

- Define a [Select](https://docs.xmlui.org/components/Select) and fill its [Items](https://docs.xmlui.org/components/Items) with data from an API call.
- Define a [DataSource](https://docs.xmlui.org/components/DataSource) to fetch data from another API call.
- Use the value of the `Select` to dynamically form the URL of the `DataSource`.
- Use a [resultSelector](https://docs.xmlui.org/components/DataSource#resultselector) to drill into the result of the second API call.
- Bind that result to a [Table](https://docs.xmlui.org/components/Table).
- Bind fields in the result to [Columns](https://docs.xmlui.org/components/Column).

This is a clean, modern, component-based app that's [reactive](https://docs.xmlui.org/reactive-intro) and [themed](https://docs.xmlui.org/themes-intro) without requiring any knowledge of React or CSS. That's powerful leverage. And it's code you can read and maintain, no matter if it was you or an LLM assistant who wrote it. I'm consulting for the project so you should judge for yourself, but to me this feels like an alternative to the JavaScript industrial complex that ticks all the right boxes.

## Components

My most-cited BYTE article was a 1994 cover story called [Componentware](https://web.archive.org/web/19961220155530/http://www.byte.com/art/9405/sec5/art1.htm). Many of us had assumed that the engine of widespread software reuse would be libraries of low-level objects linked into programs written by skilled coders. What actually gained traction were components built by professional developers and used by business developers.

There were Visual Basic components for charting, network communication, data access, audio/video playback, and image scanning/editing. UI controls included buttons, dialog boxes, sliders, grids for displaying and editing tabular data, text editors, tree and list and tab views. People used these controls to build point-of-sale systems, scheduling and project management tools, systems for medical and legal practice management, sales and inventory reporting, and much more.

That ecosystem of component producers and consumers didn't carry forward to the web. I'm a fan of web components but it's the React flavor that dominate and they are not accessible to the kind of developer who could productively use Visual Basic components back in the day. You have to be a skilled coder not only to create a React component but also to use one. XMLUI wraps React components so solution builders can use them.

### User-defined components

XMLUI provides a deep [catalog of components](https://docs.xmlui.org/components/_overview) including all the interactive ones you'd expect as well as behind-the-scenes ones like `DataSource`, [APICall](https://docs.xmlui.org/components/APICall), and [Queue](https://docs.xmlui.org/components/Queue). You can easily define your own components that interop with the native set and with one another. Here's the markup for a `TubeStops` component.

```xml
<Component name="TubeStops">
  <DataSource
    id="stops"
    url="https://api.tfl.gov.uk/Line/{$props.line}/StopPoints"
    transformResult="{window.transformStops}"
  />
  <Text variant="strong">{$props.line}</Text>
  <Table data="{stops}">
    <Column width="3*" bindTo="name" />
    <Column bindTo="zone" />
    <Column bindTo="wifi" >
      <Fragment when="{$item.wifi === 'yes'}">
        <Icon name="checkmark"/>
      </Fragment>
    </Column>
    <Column bindTo="toilets" >
      <Fragment when="{$item.toilets === 'yes'}">
        <Icon name="checkmark"/>
      </Fragment>
    </Column>
  </Table>
</Component>
```

Here's markup that uses the component twice in a side-by-side layout.

```xml
<HStack>
  <Stack width="50%">
    <TubeStops line="victoria" />
  </Stack>
  <Stack width="50%">
    <TubeStops line="waterloo-city" />
  </Stack>
</HStack>
```

It's easy to read and maintain short snippets of XMLUI markup. When the markup grows to a hundred lines or more, not so much. But I never need to look at that much code; when components grow too large I refactor them. In any programming environment that maneuver entails overhead: you have to create and name files, identify which things to pass as properties from one place, and unpack them in another. But the rising LLM tide lifts all boats. Because I can delegate the refactoring to my team of AI assistants I'm able to do it fluidly and continuously. LLMs don't "know" about XMLUI out of the box but they do know about XML, and with the help of MCP (see below) they can "know" a lot about XMLUI specifically.

## Reactivity

If you've never been a React programmer, as I have not, the biggest challenge with XMLUI-style reactivity isn't what you need to learn but rather what you need to unlearn. Let's take another look at the code for the app shown at the top of this post.

```xml
<App>
  <Select id="lines" initialValue="bakerloo">
    <Items data="https://api.tfl.gov.uk/line/mode/tube/status">
        <Option value="{$item.id}" label="{$item.name}" />
    </Items>
  </Select>
  <DataSource
    id="tubeStations"
    url="https://api.tfl.gov.uk/Line/{lines.value}/Route/Sequence/inbound"
    resultSelector="stations"/>
  <Table data="{tubeStations}" height="280px">
    <Column bindTo="name" />
    <Column bindTo="modes" />
  </Table>
</App>
```

Note how the `Select` declares the property `id="lines"`. That makes `lines` a reactive variable.

Now look at the `url` property of the `DataSource`. It embeds a reference to `lines.value`. Changing the selection changes `lines.value`. The `DataSource` reacts by fetching a new batch of details. Likewise the `Table`'s `data` property refers to `tubeStations` (the `DataSource`) so it automatically displays the new data.

There's a name for this pattern: reactive data binding. It's what spreadsheets do when a change in one cell propagates to others that refer to it. And it's what React enables for web apps. React is a complex beast that only expert programmers can tame. Fortunately the expert programmers who build XMLUI have done that for you. As an XMLUI developer you may need to unlearn imperative habits in order to go with the declarative flow. It's a different mindset but if you keep the spreadsheet analogy in mind you'll soon get the hang of it. Along the way you'll likely discover happy surprises. For example, here's the search feature in our demo app, [XMLUI Invoice](https://github.com/xmlui-org/xmlui-invoice/).

![Search demo](https://jonudell.net/xmlui/search2.gif)

Initially I wrote it in a conventional way, with a search button. Then I realized there was no need for a button. The `DataSource` URL that drives the query can react to keystrokes in the `TextBox`, and the `Table` can in turn react when the `DataSource` refreshes.

```xml
<Component name="SearchEverything">
    <VStack paddingTop="$space-4">
        <TextBox
            placeholder="Enter search term..."
            width="25rem"
            id="searchTerm"
        />
        <Card when="{searchTerm.value}">
            <DataSource
              id="search"
              url="/api/search/{searchTerm.value}"
            />
            <Text>Found {search.value ? search.value.length : 0} results for
                "{searchTerm.value}":</Text>
            <Table data="{search}">
                <Column  bindTo="table_name" header="Type" width="100px" />
                <Column  bindTo="title" header="Title" width="*" />
                <Column  bindTo="snippet" header="Match Details" width="3*" />
            </Table>
        </Card>
    </VStack>
</Component>
```

## Themes

When the team first showed me the XMLUI [theme system](https://docs.xmlui.org/themes-intro) I wasn't too excited. I am not a designer so I appreciate a nice default theme that doesn't require me to make color choices I'm not qualified to make. The ability to switch themes has never felt that important to me, and I've never quite understood why developer are so obsessed with dark mode. I have wrestled with CSS, though, to achieve both style and layout effects, and the results have not been impressive. XMLUI aims to make everything you build look good, and behave gracefully, without requiring you to write any CSS or CSS-like style and layout directives.

You can apply inline styles but for the most part you won't need them and shouldn't use them. For me this was another unlearning exercise. I know enough CSS to be dangerous and in the early going I abused inline styles. That was partly my fault and partly because LLMs think inline styles are catnip and will abuse them on your behalf. If you look at the code snippets here, though, you'll see almost no explicit style or layout directives. Each component provides an extensive set of theme variables that influence its text color and font, background color, margins, borders, paddings, and more. They follow a naming convention that enables a setting to control appearance globally or in progressively more granular ways. For example, here are the variables that can control the border color of a solid button using the primary color when the mouse hovers over it.

```
color-primary
backgroundColor-Button
backgroundColor-Button-solid
backgroundColor-Button-primary
backgroundColor-Button-primary-solid
backgroundColor-Button-primary-solid--hover
```

When it renders a button, XMLUI works up the chain from the most specific setting to the most general. This arrangement gives designers many degrees of freedom to craft exquisitely detailed themes. But almost all the settings are optional, and those that are defined by default use logical names instead of hardcoded values. So, for example, the default setting for `backgroundColor-Button-primary` is `$color-primary-500`. That's the midpoint in a range of colors that play a primary role in the UI. There's a set of such semantic roles, each associated with a color palette. The key roles are:

**Surface**: creates neutral backgrounds and containers.

**Primary**: draws attention to important elements and actions.

**Secondary**: provides visual support without competing with primary elements.

What's more, you can generate complete palettes from single midpoint value for each.

```yaml
name: Earthtone
id: earthtone
themeVars:
  color-primary: "hsl(30, 50%, 30%)"
  color-secondary: "hsl(120, 40%, 25%)"
  color-surface: "hsl(39, 43%, 97%)"
```

![Earthtone theme](https://jonudell.info/xmlui/earthtone.png)

Themes aren't just about colors, though. XMLUI components work hard to provide default layout settings that yield good spacing, padding, and margins both within individual components and across a canvas that composes sets of them. I am, again, not a designer, so not really qualified to make a professional judgement about how it all works. But the effects I can achieve look pretty good to me.

## Scripting

As a Visual Basic developer you weren't expected to be an ace coder but were expected to be able to handle a bit of scripting. It's the same with XMLUI. The language is JavaScript and you can go a long way with tiny snippets like this one in `TubeStops`.

```xml
<Fragment when="{$item.wifi === 'yes'}"></Fragment>
```

`TubeStops` does also use the `transformResult` property of its `DataSource` to invoke a more ambitious chunk of code.

```javascript
function transformStops(stops) {
  return stops.map(stop => {
    // Helper to extract a value from additionalProperties by key
    const getProp = (key) => {
      const prop = stop.additionalProperties && stop.additionalProperties.find(p => p.key === key);
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

This is not trivial, but it's not rocket science either. And of course you don't need to write stuff like this nowadays, you can have an LLM assistant do it for you. So we can't claim that XMLUI is 100% declarative. But I think it's fair to say that the imperative parts are well-scoped and accessible to a solution builder who doesn't know, or want to know, anything about the JavaScript industrial complex.

## Model Context Protocol

In the age of AI, who needs XMLUI when you can just have LLMs write React apps for you? It's a valid question and I think I have a pretty good answer. The first version of XMLUI Invoice was a React app that Claude wrote in 30 seconds. It was shockingly complete and functional. But I wasn't an equal partner in the process. I'm aware that React has things like `useEffect` and `useContext` but I don't really know what they are or how to use them properly, and am not competent to review or maintain JavaScript code that uses these patterns. The same disadvantage applies to the CSS that Claude wrote. If you're a happy vibe coder who never expects to look at or work with the code that LLMs generate, then maybe XMLUI isn't for you.

If you need to be able review and maintain your app, though, XMLUI levels the playing field. I can read, evaluate, and competently adjust the XMLUI code that LLMs write. In [a recent talk](https://www.youtube.com/watch?v=LCEmiRjPEtQ) Andrej Karpathy argues that the sweet spot for LLMS is a collaborative partnership in which we can dynamically adjust how much control we give them. The "autonomy slider" he envisions requires that we and our assistants operate in the same conceptual/semantic space. That isn't true for me, nor for the developers XMLUI aims to empower, if the space is React+CSS. It can be true if the space is XMLUI.

To enhance the collaboration we provide [an MCP server](https://github.com/xmlui-org/xmlui-mcp) that helps you direct agents' attention as you work with them on XMLUI apps. In [MCP is RSS for AI](https://thenewstack.io/mcp-is-rss-for-ai-more-use-cases-for-model-context-protocol/) I described the kinds of questions that agents like Claude and Cursor can use xmlui-mcp to ask and answer:

- Is there a component that does [X]?
- What do the docs for [X] say about topic [Y]?
- How does the source code implement [X]?
- How is [X] is used in other apps?

You place the xmlui-mcp server alongside the xmlui repo which includes docs and source code. And the repo in which you are developing an XMLUI app. And, ideally, other repos that contain reference apps like XMLUI Invoice.

### Working with LLMs

This arrangement has mostly exceeded my expectations. As I build out a suite of apps that exemplify best practices and patterns, the agentic collaboration improves. This flywheel effect is, of course, still subject to the peculiar habits of LLM assistants who constantly need to be reminded of the rules.

> 1. don't write any code without my permission, always preview proposed changes, discuss, and only proceed with approval.
>
> 2. don't add any xmlui styling, let the theme and layout engine do its job
>
> 3. proceed in small increments, write the absolute minimum amount of xmlui markup necessary and no script if possible
>
> 4. do not invent any xmlui syntax. only use constructs for which you can find examples in the docs and sample apps. cite your sources.
>
> 5. never touch the dom. we only use xmlui abstractions inside the App realm, with help from vars and functions defined on the window variable in index.html
>
> 6. keep complex functions and expressions out of xmlui, they can live in index.html or (if scoping requires) in code-behind
>
> 7. use the xmlui mcp server to list and show component docs but also search xmlui source, docs, and examples
>
> 8. always do the simplest thing possible

It's like working with 2-year-old savants. Crazy, but it can be effective!

To increase the odds that you'll collaborate effectively, we added a [How To](https://docs.xmlui.org/howto) section to the docs site. The MCP server makes these articles visible to agents by providing tools that list and search them. This was inspired by a friend who asked: "For a Select, suppose you don't have a static default first item but you want to fetch data and choose the first item from data as the default selected, how'd you do that in xmlui?" It took me a few minutes to put together an example. Then I realized that's the kind of question LLMs should be able to ask and answer autonomously. When an agent uses one of these tools, it is anchored to ground truth: an article found this way has a citable URL that points to a working example.

It's way easier for me to do things with XMLUI than with React and CSS, but I've also climbed a learning curve and absorbed a lot of tacit knowledge. Will the LLM-friendly documentation flatten the learning curve for newcomers and their AI assistants? I'm eager to find out.

## Content management

We say XMLUI is for building apps, but what are apps really? Nowadays websites are often apps too, built on frameworks like Vercel's [Next.js](https://en.wikipedia.org/wiki/Next.js). I've used publishing systems built that way and I am not a fan. You shouldn't need a React-savvy front-end developer to help you make routine changes to your site. And with XMLUI you don't. Our [demo site](https://demo.xmlui.org), [docs site](https://docs.xmlui.org), and [landing page](https://xmlui.org) are all XMLUI apps that are much easier for me to write and maintain than the Next.js sites I've worked on.

"Eating the dogfood" is an ugly name for a beautiful idea: Builders should use and depend on the things they build. We do, but there's more to the story of XMLUI as a CMS. When you build an app with XMLUI you are going to want to document it. There's a nice synergy available: the app and its documentation can be made of [the same stuff](https://demo.coressh.com/ui/help). You can even showcase live demos of your app in your docs as we do in [component documentation](https://docs.xmlui.org/components/_overview), [tutorials](https://docs.xmlui.org/tutorial-01), and [How To](https://docs.xmlui.org/howto) articles.

I was an early proponent of screencasts for software demos, and it can certainly be better to show than tell, but it's infuriating to search for the way to do something and find only a video. Ideally you show and tell. Documenting software with a mix of code, narrative, and live interaction brings all the modalities together.

## Extensibility

Out of the box, XMLUI wraps a bunch of React components. What happens when the one you need isn't included? This isn't my first rodeo. In a [previous effort](https://blog.jonudell.net/2023/06/14/radical-just-in-time-learning/) I leaned heavily on LLMs to dig through layers of React code but was still unable to achieve the wrapping I was aiming for.

For XMLUI the component I most wanted to include was the [Tiptap](https://tiptap.dev/) editor which is itself a wrapper around the foundational [ProseMirror](https://prosemirror.net/) toolkit. Accomplishing that was a stretch goal that I honestly didn't expect to achieve before release. But I was pleasantly surprised, and here is the proof.

![Tiptap editor demo](https://jonudell.info/xmlui/tiptap.gif)

This XMLUI `TableEditor` is the subject of our [guide](https://docs.xmlui.org/build-editor-component) for developers who want to understand how to create an XMLUI component that wraps a React component. And isn't just a toy example. When you use XMLUI for publishing, the foundation is [Markdown](http://docs.xmlui.org/working-with-markdown) which is wonderful for writing and editing headings, paragraphs, lists, and code blocks, but awful for writing and editing tables. In that situation I always resort to a visual editor to produce Markdown table syntax. Now I have that visual editor as an XMLUI component that I can embed anywhere.

The React idioms that appear in that guide were produced by LLMs, not by me, and I can't fully explain how they work, but I am now confident it will be straightforward for React-savvy developers to extend XMLUI. What's more, I can now see the boundary between component builders and solution builders begin to blur. I am mainly a solution builder who has always depended on component builders to accomplish anything useful at that level. The fact that I was able to accomplish this useful thing myself feels significant.

## Deployment

Here's the minimal XMLUI deployment footprint for the `TableEditor`.

```
TableEditor
├── Main.xmlui
├── index.html
└── xmlui
    └── 0.9.67.js
```

The `index.html` just sources the latest [standalone build](https://docs.xmlui.org/change-log) of XMLUI.

```html
<script src="xmlui/0.9.67.js"></script>
```

Here's `Main.xmlui`.

```xml
<App var.markdown="">
  <Card>
    <TableEditor
      id="tableEditor"
      size="xs"
      onDidChange="{(e) => { markdown = e.markdown }}"
    />
  </Card>
<Card>
  <HStack>
    <Text variant="codefence" preserveLinebreaks="{true}">
      { markdown }
    </Text>
    <SpaceFiller />
    <Button
      icon="copy"
      variant="ghost"
      size="xs"
      onClick="navigator.clipboard.writeText(markdown)"
    />
  </HStack>
</Card>
</App>
```

You can use any static webserver to host the app. You can even run it [from an AWS bucket](http://xmlui-table-editor.s3-website-us-east-1.amazonaws.com/).

For XMLUI Invoice we provide a [test server](https://github.com/xmlui-org/xmlui-invoice) that includes a localhost-only static server, embeds sqlite, and adds a CORS proxy for apps that need that support when talking to APIs (like Hubspot's) that require CORS. You may need to wrap similar capabilities around your XMLUI apps but the minimal deployment is dead simple.

## Web development for the rest of us

XMLUI was conceived by Gent Hito who founded [/n software](https://www.nsoftware.com/) and [CData](https://cdata.com). The mission of /n software: make network communication easy for developers. For CData: make data access easy for developers. And now for XMLUI: make UI easy for developers.

"We are backend people," Gent says. "All our components are invisible, and when we tried to build simple business UIs we were surprised to find how hard and frustrating that was."

Those of us who remember the Visual Basic era know it wasn't always that way. But the web platform has never been friendly to solution builders who need to create user interfaces. That's become a game for specialists who can wrap their heads around an ongoing explosion of complexity.

It shouldn't be that way. Some apps do require special expertise. But many shouldn't. If you are /n software, and you need to give your customers an interface to monitor and control the [CoreSSH Server](https://www.nsoftware.com/coresshserver), you shouldn't need to hire React and CSS pros to make that happen. Your team should be able to do it for themselves and [now they can](https://demo.coressh.com/).

I'm having a blast creating interfaces that would otherwise be out of my reach. Will you have the same experience? Give it a try and [let us know](mailto:team@xmlui.org) how it goes!