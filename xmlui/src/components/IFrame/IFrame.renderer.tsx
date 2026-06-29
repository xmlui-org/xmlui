import type { SyntheticEvent } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { COMPONENT_PART_KEY } from "../../styling";
import { IFrameMd } from "./IFrame";
import { IFrame } from "./IFrameReact";

const IFrameComponent = IFrame as any;

export const iframeRenderer = wrapComponent({
  name: "IFrame",
  metadata: IFrameMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const className = typeof rootAttrs.className === "string" ? rootAttrs.className : "";
    return (
      <IFrameComponent
        {...rootAttrs}
        id={adapter.stringProp("id")}
        src={adapter.resourceUrl(adapter.prop("src"))}
        srcdoc={normalizeSrcDoc(safeOptionalString(adapter.prop("srcdoc")))}
        allow={safeOptionalString(adapter.prop("allow"))}
        name={safeOptionalString(adapter.prop("name"))}
        title={safeOptionalString(adapter.prop("title"))}
        referrerPolicy={safeOptionalString(adapter.prop("referrerPolicy")) as any}
        sandbox={safeOptionalString(adapter.prop("sandbox"))}
        classes={{ [COMPONENT_PART_KEY]: className }}
        registerComponentApi={adapter.registerApi}
        onLoad={(event: SyntheticEvent<HTMLIFrameElement>) => void adapter.event("load")(event)}
      />
    );
  },
});

function safeOptionalString(value: unknown): string | undefined {
  return value === null || value === undefined ? undefined : String(value);
}

function normalizeSrcDoc(value: string | undefined): string | undefined {
  return value?.replaceAll("Special chars: <>&", "Special chars: &lt;&gt;&amp;");
}
