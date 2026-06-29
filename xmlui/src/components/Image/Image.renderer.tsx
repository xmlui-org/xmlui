import { useEffect, useState, type MouseEvent } from "react";

import type { ComponentMetadata } from "../../component-core/metadata/types";
import { wrapComponent } from "../../runtime/rendering/adapter";
import { defaultProps } from "./Image.defaults";
import { ImageMd } from "./Image";
import { Image } from "./ImageReact";

const ImageComponent = Image as any;

export const imageRenderer = wrapComponent({
  name: "Image",
  metadata: ImageMd as ComponentMetadata,
  renderer: ({ adapter }) => {
    const rootAttrs = adapter.rootAttrs();
    const rawAlt = adapter.node.props.alt;
    const evaluatedAlt = adapter.prop("alt");
    const imageData = useImageData(adapter.resourceUrl(adapter.prop("data")), adapter.prop("data"));
    const inline = booleanImageProp(adapter.prop("inline"), defaultProps.inline);
    const lazyLoad = booleanImageProp(adapter.prop("lazyLoad"), defaultProps.lazyLoad);
    const grayscale = booleanImageProp(adapter.prop("grayscale"), defaultProps.grayscale);
    const clickHandler = Object.prototype.hasOwnProperty.call(adapter.node.events, "click")
      ? (event: MouseEvent<HTMLImageElement>) => void adapter.event("click")(event)
      : undefined;
    const imageStyle = {
      ...(rootAttrs.style as Record<string, unknown> | undefined),
      ...(inline ? { display: "inline" } : {}),
    };
    const image = (
      <ImageComponent
        {...rootAttrs}
        src={adapter.resourceUrl(adapter.prop("src"))}
        imageData={imageData}
        alt={rawAlt === "" ? "" : evaluatedAlt}
        fit={adapter.stringProp("fit", defaultProps.fit)}
        style={imageStyle}
        lazyLoad={lazyLoad}
        aspectRatio={adapter.stringProp("aspectRatio")}
        inline={inline}
        grayscale={grayscale}
        onClick={clickHandler}
      />
    );
    return inline ? <span style={{ display: "inline" }}>{image}</span> : image;
  },
});

function booleanImageProp(value: unknown, fallback: boolean): boolean {
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value === "true";
  }
  return value === undefined || value === null ? fallback : Boolean(value);
}

function useImageData(dataUrl: string | undefined, rawData: unknown): unknown {
  const [blob, setBlob] = useState<Blob | undefined>();

  useEffect(() => {
    if (rawData instanceof Blob) {
      setBlob(rawData);
      return;
    }
    if (!dataUrl) {
      setBlob(undefined);
      return;
    }

    const abortController = new AbortController();
    setBlob(undefined);
    void fetch(dataUrl, { signal: abortController.signal })
      .then((response) => response.ok ? response.blob() : undefined)
      .then((nextBlob) => {
        if (!abortController.signal.aborted) {
          setBlob(nextBlob);
        }
      })
      .catch((error) => {
        if (!abortController.signal.aborted && error?.name !== "AbortError") {
          setBlob(undefined);
        }
      });

    return () => abortController.abort();
  }, [dataUrl, rawData]);

  return rawData instanceof Blob ? rawData : blob;
}
