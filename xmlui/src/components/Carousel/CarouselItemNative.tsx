import type { ForwardedRef, ReactNode } from "react";
import { forwardRef, useEffect, useId } from "react";
import classnames from "classnames";

import styles from "./Carousel.module.scss";

import { useCarousel } from "./CarouselContext";

type Props = {
  children: ReactNode;
  style?: React.CSSProperties;
};

export const CarouselItemComponent = forwardRef(function CarouselItemComponent(
  { children, style, ...rest }: Props,
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
      {...rest}
    >
      <div className={styles.innerWrapper} ref={forwardedRef} style={style}>
        {children}
      </div>
    </div>
  );
});
