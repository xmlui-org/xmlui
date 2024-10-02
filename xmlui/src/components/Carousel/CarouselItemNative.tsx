import * as React from "react";
import { useCarousel } from "@components/Carousel/CarouselContext";
import { ReactNode, useEffect, useId } from "react";

type Props = {
  content?: ReactNode;
};

export const CarouselItemComponent = ({content}: Props) => {
  const id = useId();
  const { register, unRegister } = useCarousel();

  useEffect(() => {
    register({
      content,
      id,
    });
  }, [id, content, register]);
  useEffect(() => {
    return () => {
      unRegister(id);
    };
  }, [id, unRegister]);
  return null;
};
