import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { AvatarMd } from "./Avatar";
import { defaultProps } from "./Avatar.defaults";
import { Avatar } from "./AvatarReact";

export const avatarRenderer = wrapComponent({
  name: "Avatar",
  metadata: AvatarMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const hasClick = Object.prototype.hasOwnProperty.call(adapter.node.events, "click");
    const hasContextMenu = Object.prototype.hasOwnProperty.call(adapter.node.events, "contextMenu");
    const rootAttrs = adapter.rootAttrs();
    const { className, ...attrs } = rootAttrs;
    return (
      <Avatar
        {...attrs}
        size={adapter.stringProp("size", defaultProps.size)}
        name={adapter.stringProp("name")}
        url={normalizeAvatarUrl(adapter.resourceUrl(adapter.prop("url")))}
        classes={{ [COMPONENT_PART_KEY]: typeof className === "string" ? className : "" }}
        onClick={hasClick ? (event) => void adapter.event("click")(event) : undefined}
        onContextMenu={hasContextMenu ? (event) => void adapter.event("contextMenu")(event) : undefined}
      />
    );
  },
});

function normalizeAvatarUrl(url: string | undefined): string | undefined {
  if (!url) {
    return undefined;
  }
  if (/^https?:\/\//.test(url)) {
    return url;
  }
  return `/${url}`;
}
