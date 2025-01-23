import * as React from "react";
import { ForwardedRef, forwardRef, ReactNode } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "@components/Carousel/Carousel.module.scss";

type Props = {
  content?: ReactNode;
  style?: React.CSSProperties;
};

export const CarouselItemComponent = forwardRef(function CarouselItemComponent(
  { content, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  return (
    <div
      style={style}
      ref={forwardedRef}
      role="group"
      aria-roledescription="slide"
      className={classnames(styles.carouselItem)}
    >
      <div className={styles.innerWrapper}>{content}</div>
    </div>
  );
});
