import styles from "./Image.module.scss";
import {CSSProperties, HTMLAttributes, useEffect} from "react";
import { forwardRef } from "react";
import classnames from "@components-core/utils/classnames";
import { animated, useSpring } from '@react-spring/web'

// =====================================================================================================================
// React Image component implementation

type Props = {
  src?: string;
  alt?: string;
  fit?: "cover" | "contain";
  layout?: CSSProperties;
  lazyLoad?: boolean;
  aspectRatio?: string;
  animation?: object;
} & Pick<HTMLAttributes<HTMLImageElement>, "onClick">;

export const Image = forwardRef(function Img(
  { src, alt, fit = "contain", layout, onClick, aspectRatio, lazyLoad, animation }: Props,
  ref,
) {

  const [animationStyles, api] = useSpring(() => animation);

  useEffect(() => {
    api.start(animation);
    return () => {
      api.stop();
    };
  }, [animation, api]);
  return (
    <animated.img
      src={src}
      ref={ref as any}
      alt={alt}
      loading={lazyLoad ? "lazy" : "eager"}
      className={classnames(styles.img, {
        [styles.clickable]: !!onClick,
      })}
      style={{ objectFit: fit, boxShadow: "none", ...layout, aspectRatio: aspectRatio, ...animationStyles }}
      onClick={onClick}
    />
  );
});
