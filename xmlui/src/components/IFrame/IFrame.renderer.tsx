import type { HTMLAttributeReferrerPolicy } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { IFrameMd } from "./IFrame";
import { IFrame } from "./IFrameReact";

export const iframeRenderer = wrapComponent({
  name: "IFrame",
  metadata: IFrameMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    return (
      <IFrame
        {...adapter.rootAttrs()}
        id={adapter.stringProp("id")}
        src={adapter.resourceUrl(adapter.prop("src"))}
        srcdoc={normalizeSrcDoc(safeOptionalString(adapter.prop("srcdoc")))}
        allow={safeOptionalString(adapter.prop("allow"))}
        name={safeOptionalString(adapter.prop("name"))}
        referrerPolicy={safeOptionalString(adapter.prop("referrerPolicy")) as HTMLAttributeReferrerPolicy | undefined}
        sandbox={safeOptionalString(adapter.prop("sandbox"))}
        registerApi={adapter.registerApi}
        onLoad={(event) => void adapter.event("load")(event)}
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
