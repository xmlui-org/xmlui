import {
  forwardRef,
  memo,
  useEffect,
  useRef,
  type CSSProperties,
  type ForwardedRef,
  type HTMLAttributes,
} from "react";

type IFrameProps = {
  src?: string;
  srcdoc?: string;
  allow?: string;
  name?: string;
  referrerPolicy?: string;
  sandbox?: string;
  style?: CSSProperties;
  registerApi?: (api: Record<string, unknown>) => void;
} & Pick<HTMLAttributes<HTMLIFrameElement>, "onLoad"> &
  Omit<HTMLAttributes<HTMLIFrameElement>, "src" | "srcDoc" | "name" | "onLoad">;

export const IFrame = memo(forwardRef(function IFrame(
  {
    src,
    srcdoc,
    allow,
    name,
    referrerPolicy,
    sandbox,
    style,
    registerApi,
    onLoad,
    ...rest
  }: IFrameProps,
  ref: ForwardedRef<HTMLIFrameElement>,
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    registerApi?.({
      postMessage: (message: unknown, targetOrigin = "*") => {
        iframeRef.current?.contentWindow?.postMessage(message, String(targetOrigin));
      },
      getContentWindow: () => iframeRef.current?.contentWindow ?? null,
      getContentDocument: () => iframeRef.current?.contentDocument ?? null,
    });
  }, [registerApi]);

  return (
    <iframe
      {...rest}
      ref={(node) => {
        iframeRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      }}
      src={src}
      srcDoc={srcdoc}
      allow={allow}
      name={name}
      referrerPolicy={referrerPolicy}
      sandbox={sandbox}
      className={cx("xmlui-iframeRoot", rest.className)}
      style={style}
      onLoad={onLoad}
    />
  );
}));

function cx(...classes: Array<string | undefined | false>): string {
  return classes.filter(Boolean).join(" ");
}
