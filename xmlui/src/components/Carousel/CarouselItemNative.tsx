import * as React from "react";
import { ForwardedRef, forwardRef, ReactNode } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "@components/Carousel/Carousel.module.scss";
import { useIsSlideActive } from "@components/Carousel/CarouselContext";

type Props = {
  content?: ReactNode;
  style?: React.CSSProperties;
  index: number;
};

export const CarouselItemComponent = forwardRef(function CarouselItemComponent(
  { content, style, index }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const isActive = useIsSlideActive(index);
  return (
    <div role="group" aria-roledescription="slide" className={classnames(styles.carouselItem)}>
      <div className={styles.innerWrapper} ref={forwardedRef} style={style}>
        {isActive ? content : null}
      </div>
    </div>
  );
});
