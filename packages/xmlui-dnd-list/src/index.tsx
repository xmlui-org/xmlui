import { dndItemsComponentRenderer } from "./DndList";

// Namespace matches the other wrapped extension packages. Bare `<DndItems>`
// resolves too; users can disambiguate a name collision with
// `xmlns:Ext="component-ns:XMLUIExtensions"` on <App>.
export default {
  namespace: "XMLUIExtensions",
  components: [dndItemsComponentRenderer],
};
