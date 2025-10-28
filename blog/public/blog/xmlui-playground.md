The XMLUI [docs](https://docs.xmlui.org) are full of live working examples that use [Playground](https://github.com/xmlui-org/xmlui/tree/main/packages/xmlui-playground), an extension package that runs XMLUI code inside an XMLUI app. We use playgrounds to bring component documentation to life. Why just tell you about the `enabled` property of a [Checkbox](https://docs.xmlui.org/components/Checkbox) when we can also show you, as in this live example.

<blockquote>
enabled (default: true)

This boolean property value indicates whether the component responds to user events (true) or not (false).

```xmlui-pg {4-6} {9-10} name="Click the checkboxes"
<App>
  Enabled checkboxes:
  <HStack>
    <Checkbox initialValue="true" enabled="true" />
    <Checkbox initialValue="false" enabled="true" />
  </HStack>
  Disabled checkboxes:
  <HStack>
    <Checkbox initialValue="true" enabled="false" />
    <Checkbox initilaValue="false" enabled="false" />
  </HStack>
</App>
```
</blockquote>

This widget doesn't just display the live app, it also enables you to modify it by clicking the ![popout](/resources/pg-popout.svg) icon. Try it now! You'll land in [a hosted playground](https://playground.xmlui.org/#/playground/#H4sIAAAAAAAAE61W204bMRD9ldWUx2zJhRBYpZXCTVQCVBUKlQoPk%2FUkseK1LduBBZR%2Fr%2BzdJtmw4SLxlsycmTmeOfbsM1iHkqFQkiB5BtQaEugPtP5%2BK6PoWOJQEIvSCaXTocrJJt7cP710mE4DJIr6h6U34pI7juIaxYy%2B3YIzM7qFiIokS8P2W4EjFPaVyP72Sv0jbj%2BV4%2F%2FaG0gK3EyyGrrCsr9dNBQakKpMK0nSWUj%2B3vn%2FcsTHvvVuQhl56zNIzAgS%2BHN%2B9vtHdCDUOLryTmgAZ5DAUKhx7EoL5Y4k83GQZ2LG4a5RpLpGY33eIabTsVEzyQ6VUAYS2Er9j9jOzAhTipuBlrdowzM0j5DAl05nt3d4uPCUWO9pUbvX2YHGeuI4VdKRdPEgaKimSIb5DWduUiJanXZT56v2aoa9ncI9VPnlBJl6iCXe%2F0RJogRIL9qXPC5K1EsS3WYNfC1pXYhGxrgcX5NxPEVRqWB1gAWehpH5xccTVxxnBdaqHvTI4AP5UXSaxRkd5W7B%2FozL6QoTSpVkaB7j3eZyVFwynqJbBsQxpo7f%2BxE5g9JqNCTda%2FiJug8c3gnXhqwl9iKgpv3V%2FGsdbTXrplBTpjZupKS7Id%2FjmoMPlWB1zdzIZT%2FkrMEvUm5Vbkbc3RQQCrwV58lf8ieKT1teE193u4ay6qGCp1e0qNATMj6z8anLxJV%2FaIJogmaEDwgvx4LOkUpnGUnnOVl%2FWbsHuzu9boVyBbPszJfWQbvTHtSMxpJGE7TwIj21qUsI8wYwNNOa1%2Bb1R6FWCh9QzCdf86Lh8QVZR6x8o3QeWSU4i9YC2rWcwpQmhDXy7TY3T8G3cu94vzfYe9ekTvZPBicHH5tUZ2%2Bn1z2G%2BbwBhqyamdTvmuf5%2FM6blHZcybAuRjwnVqybJCy0BtgH1NpfyfK%2FNnTP6eFcsSVGGU7SoU8DCUyU4U9KOhTQgOJOlCmry6t0hY%2BPUs9hJXrJQBK%2BRubzfwm13uekCAAA) where you can edit the XMLUI code and see changes instantly.

Playgrounds work with the [Markdown](https://docs.xmlui.org/components/Markdown) component which is the renderer for this page. Here's the XMLUI source for the checkboxes example. We show it here as an image because if we were to include the text it would just render as above!

![playground checkbox source](/blog/images/playground-checkbox-source.png)

It starts as conventional Markdown codefence bounded by triple backtics. You can use the language identifier `xmlui` for XMLUI syntax highlighting, or (as here) use `xmlui-pg` to introduce a live playground. The bracketed numbers specify line ranges to highlight.

## Playgrounds on steroids

Many of these small playgrounds are woven into the component docs. You'll also find more ambitious playgrounds in the How To section of the docs where we illustrate important app patterns, like <a target="_blank" href="https://docs.xmlui.org/howto/use-the-same-modaldialog-to-add-or-edit">How to use the same ModalDialog to add or edit</a>.

If you [view the XMLUI source](https://github.com/xmlui-org/xmlui/blob/main/docs/public/pages/howto/use-the-same-modaldialog-to-add-or-edit.md) for that example, you'll see that the codefence defines an `App` and two user-defined components, `Test` and `ProductModal`. It also defines an API with operations `get-products`, `get-product`, `insert-product`, `update-product`, and `delete-product`.

 This is a concise way to express the rich set of behaviors seen in this video.

 <video controls autoplay src="/blog/images/advanced-codefence.mp4"></video>

## Share a working reproduction of a bug

Open source developers who respond to bug reports always hope for, but rarely get, reliable ways to reproduce the bad behavior they are seeing. Now those reports can contain XMLUI codefences that exhibit the behavior.

If you want to make such a report, you can visit [xmlui-codefence-runner.netlify.app](https://xmlui-codefence-runner.netlify.app/), paste in your codefence, open it into a playground, and share its URL. That's the gold standard for this kind of thing, and it's implemented for that site with a dozen lines of XMLUI dropped onto Netlify.

```xmlui
<App>
  <H1>XMLUI Codefence Runner</H1>
  <TextArea
    id="code"
    rows="15"
    initialValue="```xmlui-pg
  <App>  Hello  </App>
  ```
  " />
  <Markdown content="{code.value}" />
</App>
```

If you find yourself [filing an issue](https://github.com/xmlui-org/xmlui/issues) that needs a solid reproduction, please give it a try.




<!--
 ## Help AI assistants know the truth

When you use the [XMLUI MCP server](https://github.com/xmlui-org/xmlui-mcp) with coding assistants like Claude or Copilot, they will prefer How To examples when available.

![use xmlui-mcp to find a how to](/blog/images/use-xmlui-mcp-to-find-a-howto.png)

That's the gold standard response: a link to a known working pattern that proves its existence by running live.

When you ask a question for which they cannot provide such a link, they are supposed to admit that, and to cite the rule that prohibits inventing undocumented syntax. That doesn't always happen yet, but it happens often enough to steer assistants away from imaginary rabbit holes.
-->

