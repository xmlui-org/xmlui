import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Image.defaults";
import { ImageMd } from "./Image";
import { Image } from "./ImageReact";

export const imageRenderer = wrapComponent({
  name: "Image",
  metadata: ImageMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rawAlt = adapter.node.props.alt;
    const evaluatedAlt = adapter.prop("alt");
    return (
      <Image
        {...adapter.rootAttrs()}
        src={adapter.resourceUrl(adapter.prop("src"))}
        imageData={adapter.prop("data")}
        alt={rawAlt === "" ? "" : evaluatedAlt}
        fit={adapter.stringProp("fit", defaultProps.fit)}
        lazyLoad={adapter.booleanProp("lazyLoad", defaultProps.lazyLoad)}
        aspectRatio={adapter.stringProp("aspectRatio")}
        inline={adapter.booleanProp("inline", defaultProps.inline)}
        grayscale={adapter.booleanProp("grayscale", defaultProps.grayscale)}
        onClick={(event) => void adapter.event("click")(event)}
      />
    );
  },
});
