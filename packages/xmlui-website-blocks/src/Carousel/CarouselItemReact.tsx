import type { ForwardedRef, HTMLAttributes } from "react";
import { forwardRef, memo, useEffect, useId } from "react";
import classnames from "classnames";

import styles from "./Carousel.module.scss";

import { useCarousel } from "./CarouselContext";

type Props = HTMLAttributes<HTMLDivElement>;

export const CarouselItemComponent = memo(
  forwardRef(function CarouselItemComponent(
  { children, style, ...rest }: Props,
  forwardedRef: ForwardedRef<HTMLDivElement>,
) {
  const id = useId();
  const { register, unRegister, itemProps } = useCarousel();

  useEffect(() => {
    register({
      id,
    });
  }, [id, register]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);

  return (
    <div
      {...rest}
      key={id}
      {...itemProps}
      className={classnames(styles.carouselItem)}
    >
      <div className={styles.innerWrapper} ref={forwardedRef} style={style}>
        {children}
      </div>
    </div>
  );
}),
);
