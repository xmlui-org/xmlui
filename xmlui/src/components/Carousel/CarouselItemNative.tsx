import type * as React from "react";
import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, useEffect, useId } from "react";
import { useCarousel } from "@components/Carousel/CarouselContext";
import classnames from "@components-core/utils/classnames";
import styles from "@components/Carousel/Carousel.module.scss";

type Props = {
  children: ReactNode;
  style?: React.CSSProperties;
};

export const CarouselItemComponent = forwardRef(function CarouselItemComponent(
  { children, style }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { register, unRegister } = useCarousel();

  useEffect(() => {
    register({
      id,
    });
  }, [id, children, style, register, forwardedRef]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);

  return (
    <div
      key={id}
      role="group"
      aria-roledescription="slide"
      className={classnames(styles.carouselItem)}
    >
      <div className={styles.innerWrapper} ref={forwardedRef} style={style}>
        {children}
      </div>
    </div>
  );
});
