import * as React from "react";
import { ReactNode } from "react";
import classnames from "@components-core/utils/classnames";
import styles from "@components/Carousel/Carousel.module.scss";

type Props = {
  content?: ReactNode;
};

export const CarouselItemComponent = ({ content }: Props) => {
  return (
    <div
      role="group"
      aria-roledescription="slide"
      className={classnames(styles.carouselItem)}
    >
      {content}
    </div>
  );
};
