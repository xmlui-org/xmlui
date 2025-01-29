import * as React from "react";
import { ForwardedRef, forwardRef, ReactNode, useEffect, useId } from "react";
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
      children,
      style,
      ref: forwardedRef,
      id,
    });
  }, [id, children, style, register, forwardedRef]);

  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);

  return null;
});
